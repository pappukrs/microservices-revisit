"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RABBIT_CONFIG = void 0;
exports.RABBIT_CONFIG = {
    url: "amqp://localhost",
    exchange: "loan.exchange",
    queue: "loan.queue",
    dlq: "loan.dlq",
    routingKey: "loan.approved"
};
//# sourceMappingURL=rabbitmq.config.js.map