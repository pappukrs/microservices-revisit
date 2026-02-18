import { Channel } from "amqplib";

export async function setupDLQ(channel: Channel, queue: string, dlq: string) {
    await channel.assertQueue(dlq, { durable: true });

    await channel.assertQueue(queue, {
        durable: true,
        deadLetterExchange: "",
        deadLetterRoutingKey: dlq
    });
}
