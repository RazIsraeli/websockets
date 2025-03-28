import express, { Request, Response } from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';

import { kafkaService } from './services/KafkaService.js';

const app = express();
const PORT = 3000;

const httpServer = createServer(app);

let clientIdx = 0;
const connectedClients = new Map<string, Socket>();

let io: Server;

app.use(express.json());

kafkaService.startConsumer("client-msg", (message) => {
    console.log("📥 Processing message:", message);
});

if (process.env.ENVIRONMENT === 'development') {
    console.log('Running on development mode');
    const corsOptions = {
        origin: ['http://127.0.0.1:4200', 'http://localhost:4200'],
        credentials: true,
    }
    app.use(cors(corsOptions));
    // Init socket connection for development config
    io = new Server(httpServer, {
        cors: {
            origin: ['http://127.0.0.1:4200', 'http://localhost:4200'],
            credentials: true
        },
    });
} else {
    console.log('Running on production mode');
    const __fileName = fileURLToPath(import.meta.url);
    const __dirName = dirname(__fileName);
    const client = path.join(__dirName, 'client', 'browser');
    console.log("🚀 ~ client:", client)
    app.use(express.static(client));
    // Init socket connection for production config
    io = new Server(httpServer);
}

io.on('connection', (socket: Socket) => {
    const clientId = `client_${++clientIdx}`;
    connectedClients.set(clientId, socket);

    console.log(`Client connected: ${clientId}`);

    //Notify all clients of the new connection
    io.emit('client-connected', { clientId, totalClients: connectedClients.size });

    // Handle custom event
    socket.on('button-clicked', async (data) => {
        console.log("🚀 ~ socket.on ~ data:", data)
        console.log(`Message from client: ${data.message}`);

        io.emit('broadcast-message', { message: data.message, senderId: socket.id });

        // Send a message to Kafka
        try {
            await kafkaService.sendMessage('kafka-client-server-topic', `{"from_client": "${clientId}", "message": "${data.message}"}`);
        } catch (error) {
            console.log('Could not write to kafka topic! ', error);
        }
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
        connectedClients.delete(clientId);
        console.log(`Client disconnected: ${clientId}`);
        clientIdx--;

        io.emit('client-disconnected', { clientId, totalClient: connectedClients.size });
    });
});

app.get('/', (req: Request, res: Response) => {
    res.send('Hello from websocket server!');
});

httpServer.listen(PORT, async () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    try {
        await kafkaService.connectProducer();
        console.log('Server connected to Kafka');
    } catch (error) {
        console.error('Server could not connect to Kafka!', error);
    }
});