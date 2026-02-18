import express from "express";
// import { startNotificationConsumer } from "./messaging/loanEventConsumer";

import { sendLoanApprovedEvent } from './messaging/loanEventProducer'

const app = express();


// startNotificationConsumer();
async function test() {
    await sendLoanApprovedEvent()
}
test()


app.use(express.json());

export default app;