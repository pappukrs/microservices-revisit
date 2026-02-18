"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChannel = getChannel;
const amqplib_1 = require("amqplib");
const rabbitmq_config_1 = require("../config/rabbitmq.config");
let channel;
async function getChannel() {
    if (channel)
        return channel;
    const connection = await (0, amqplib_1.connect)(rabbitmq_config_1.RABBIT_CONFIG.url);
    channel = await connection.createChannel();
    return channel;
}
//# sourceMappingURL=rabbitmq.connection.js.map