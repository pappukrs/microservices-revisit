import express from "express";

import { startEmiConsumer } from "./messaging/loanEventConsumer";

import { startEmiServer } from "./grpc/emiServer";







const app = express();


startEmiConsumer();


startEmiServer();

app.use(express.json());

export default app;