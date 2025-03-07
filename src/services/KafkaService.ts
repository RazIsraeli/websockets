import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';

class KafkaService {
    private kafka: Kafka;
    private producer: Producer;
    private consumer: Consumer;

    constructor() {
        this.kafka = new Kafka({
            clientId: 'node-js-server',
            brokers: [process.env.KAFKA_BROKER ?? 'localhost:9092'],
        });

        this.producer = this.kafka.producer();
        this.consumer = this.kafka.consumer({ groupId: 'my-consumer-group' });
    }

    async connectProducer(): Promise<void> {
        try {
            await this.producer.connect();
            console.log('Kafka producer connected!');
        } catch (error) {
            console.log('Could not connect Kafka producer', error);
        }
    }

    async sendMessage(topic: string, message: string): Promise<void> {
        try {
            await this.producer.send({
                topic,
                messages: [{ value: message }]
            });
            console.log(`Message sent to topic '${topic}': ${message}`);
        } catch (error) {
            console.log('Kafka producer error!', error);
        }
    }

    async startConsumer(topic: string, messageHandler: (message: string) => void): Promise<void> {
        try {
            await this.consumer.connect();
            console.log('Kafka consumer connected!');

            await this.consumer.subscribe({ topic, fromBeginning: true });

            await this.consumer.run({
                eachMessage: async ({ message }: EachMessagePayload) => {
                    if (message.value) {
                        const receivedMessage = message.value.toString();
                        console.log(`Received from topic '${topic}': ${receivedMessage}`);
                        try {
                            const parsedMessage = this.isValidJson(receivedMessage) ? JSON.parse(receivedMessage) : receivedMessage;
                            messageHandler(parsedMessage);
                        } catch (error) {
                            console.log('Error parsing message!', error);
                            messageHandler(receivedMessage);
                        }
                    }
                },
            });
        } catch (error) {
            console.log('Could not start Kafka consumer!', error);
        }
    }

    async disconnect(): Promise<void> {
        try {
            await this.producer.disconnect();
            await this.consumer.disconnect();
            console.log('Kafka connections were closed!')
        } catch (error) {
            console.log('Could not disconnect Kafka connetions!');
        }
    }

    private isValidJson(str: string): boolean {
        try {
            JSON.parse(str);
            return true;
        } catch (error) {
            return false;
        }
    }

}

export const kafkaService = new KafkaService();