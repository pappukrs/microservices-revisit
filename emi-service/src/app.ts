import express from "express";

import { startEmiConsumer } from "./messaging/loanEventConsumer";





const app = express();


startEmiConsumer();

app.use(express.json());

export default app;