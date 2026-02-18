import { Channel, ConsumeMessage } from "amqplib";

export function handleRetry(channel: Channel, msg: ConsumeMessage) {
    const retries = msg.properties.headers?.["x-retries"] || 0;

    if (retries >= 3) {
        channel.nack(msg, false, false); // send to DLQ
        console.log("Moved to DLQ");
    } else {
        channel.nack(msg, false, true); // retry
    }
}
