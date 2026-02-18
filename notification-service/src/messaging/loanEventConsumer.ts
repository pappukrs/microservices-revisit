import { consume } from "shared-libraries";

export function startNotificationConsumer() {
    consume("notification.fanout.queue", async (data) => {
        console.log("Notification sent to user:", data.userId);
    }, "loan.fanout.exchange");

}
