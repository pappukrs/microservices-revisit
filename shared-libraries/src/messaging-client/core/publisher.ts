import { getChannel } from "../connection/rabbitmq.connection";

export async function publish(exchange: string, message: any, routingKey: string = "") {
    const channel = await getChannel();

    await channel.assertExchange(exchange, "fanout", { durable: true });

    channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(message))
    );

    console.log("Message published to exchange:", exchange, message);
}
