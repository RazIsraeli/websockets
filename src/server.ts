import express, { Request, Response } from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';

const app = express();
const PORT = 3000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: ['http://127.0.0.1:4200', 'http://localhost:4200'],
        credentials: true
    },
});

let clientIdx = 0;
const connectedClients = new Map<string, Socket>();

// const __fileName = fileURLToPath(import.meta.url);
// const __dirName = dirname(__fileName);
// const client = path.join(__dirName, 'client', 'browser');
// console.log("🚀 ~ client:", client)

app.use(express.json());
// app.use(express.static(client));


if (process.env.ENVIRONMENT === 'development') {
    const corsOptions = {
        origin: ['http://127.0.0.1:4200', 'http://localhost:4200'],
        credentials: true,
    }
    app.use(cors(corsOptions));
} else {
    const __fileName = fileURLToPath(import.meta.url);
    const __dirName = dirname(__fileName);
    const client = path.join(__dirName, 'client', 'browser');
    console.log("🚀 ~ client:", client)
    app.use(express.static(client));
}

io.on('connection', (socket: Socket) => {
    const clientId = `client_${++clientIdx}`;
    connectedClients.set(clientId, socket);

    console.log(`Client connected: ${clientId}`);

    //Notify all clients of the new connection
    io.emit('client-connected', { clientId, totalClients: connectedClients.size });

    // Handle custom event
    socket.on('button-clicked', (data) => {
        console.log("🚀 ~ socket.on ~ data:", data)
        console.log(`Message from client: ${data.message}`);

        io.emit('broadcast-message', { message: data.message, senderId: socket.id });
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

httpServer.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});