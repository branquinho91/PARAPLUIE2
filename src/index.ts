require("dotenv").config();

import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";
import cors from "cors";
import userRouter from "./routes/user.routes";
import { handleError } from "./middlewares/handleError";
import authRouter from "./routes/auth.routes";
import logger from "./config/winston";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/users", userRouter);
app.use("/login", authRouter);

app.use(handleError);

app.get("/env", (_req, res) => {
  res.json({
    port: process.env.PORT,
    node_env: process.env.NODE_ENV,
  });
});

AppDataSource.initialize()
  .then(() => {
    app.listen(process.env.PORT, () => {
      logger.info(`O servidor está rodando em http://localhost:${process.env.PORT}`);
    });
  })
  .catch((error) => console.log(error));
