import { connect } from "amqplib";
import { RABBIT_CONFIG } from "../config/rabbitmq.config";

let channel: any;

export async function getChannel(): Promise<any> {
    if (channel) return channel;

    const connection: any = await connect(RABBIT_CONFIG.url);
    channel = await connection.createChannel();

    return channel;
}
