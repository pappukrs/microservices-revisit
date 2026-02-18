"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publish = publish;
const rabbitmq_connection_1 = require("../connection/rabbitmq.connection");
async function publish(exchange, message, routingKey = "") {
    const channel = await (0, rabbitmq_connection_1.getChannel)();
    await channel.assertExchange(exchange, "fanout", { durable: true });
    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
    console.log("Message published to exchange:", exchange, message);
}
//# sourceMappingURL=publisher.js.map