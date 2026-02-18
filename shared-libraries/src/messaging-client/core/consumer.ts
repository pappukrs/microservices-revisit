import { getChannel } from "../connection/rabbitmq.connection";
import { handleRetry } from "./retry.handler";

export async function consume(
    queue: string,
    handler: (data: any) => Promise<void>,
    exchange?: string,
    routingKey: string = ""
) {
    const channel = await getChannel();

    await channel.assertQueue(queue, { durable: true });

    if (exchange) {
        await channel.assertExchange(exchange, "fanout", { durable: true });
        await channel.bindQueue(queue, exchange, routingKey);
    }


    channel.consume(queue, async (msg: any) => {
        if (!msg) return;

        try {
            const data = JSON.parse(msg.content.toString());
            await handler(data);

            channel.ack(msg);
        } catch (error) {
            console.log("Processing failed → retrying");
            handleRetry(channel, msg);
        }
    });
}
