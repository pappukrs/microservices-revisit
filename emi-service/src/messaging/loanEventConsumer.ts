import { consume } from "shared-libraries";

export function startEmiConsumer() {
    consume("emi.fanout.queue", async (data) => {
        console.log("EMI schedule created for loan:", data.loanId);
    }, "loan.fanout.exchange");

}
