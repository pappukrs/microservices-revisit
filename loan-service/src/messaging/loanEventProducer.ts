import { publish } from "shared-libraries";

export async function sendLoanApprovedEvent() {
    const event = {
        loanId: "L123",
        userId: "U456",
        amount: 50000
    };

    await publish("loan.fanout.exchange", event);

}
