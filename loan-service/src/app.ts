import express from "express";
// import { startNotificationConsumer } from "./messaging/loanEventConsumer";

import { sendLoanApprovedEvent } from './messaging/loanEventProducer'

import { createEmi } from "./grpc/emiClient";




const app = express();




console.log("Loan approved → calling EMI service");
createEmi({ loanId: "L123", amount: 50000 })
    .then((res) => console.log("EMI created:", res.message))
    .catch((err) => console.error("EMI creation failed:", err.message));


// startNotificationConsumer();
async function test() {
    await sendLoanApprovedEvent()
}
test()


app.use(express.json());

export default app;