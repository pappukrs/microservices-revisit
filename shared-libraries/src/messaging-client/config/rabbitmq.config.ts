export const RABBIT_CONFIG = {
    url: "amqp://localhost",
    exchange: "loan.exchange",
    queue: "loan.queue",
    dlq: "loan.dlq",
    routingKey: "loan.approved"
};
