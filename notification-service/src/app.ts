import express from "express";


import { startNotificationConsumer } from "./messaging/loanEventConsumer";

startNotificationConsumer();


const app = express();

app.use(express.json());

export default app;