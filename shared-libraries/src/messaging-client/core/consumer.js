"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consume = consume;
const rabbitmq_connection_1 = require("../connection/rabbitmq.connection");
const retry_handler_1 = require("./retry.handler");
async function consume(queue, handler, exchange, routingKey = "") {
    const channel = await (0, rabbitmq_connection_1.getChannel)();
    await channel.assertQueue(queue, { durable: true });
    if (exchange) {
        await channel.assertExchange(exchange, "fanout", { durable: true });
        await channel.bindQueue(queue, exchange, routingKey);
    }
    channel.consume(queue, async (msg) => {
        if (!msg)
            return;
        try {
            const data = JSON.parse(msg.content.toString());
            await handler(data);
            channel.ack(msg);
        }
        catch (error) {
            console.log("Processing failed → retrying");
            (0, retry_handler_1.handleRetry)(channel, msg);
        }
    });
}
//# sourceMappingURL=consumer.js.map