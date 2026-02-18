"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRetry = handleRetry;
function handleRetry(channel, msg) {
    const retries = msg.properties.headers?.["x-retries"] || 0;
    if (retries >= 3) {
        channel.nack(msg, false, false); // send to DLQ
        console.log("Moved to DLQ");
    }
    else {
        channel.nack(msg, false, true); // retry
    }
}
//# sourceMappingURL=retry.handler.js.map