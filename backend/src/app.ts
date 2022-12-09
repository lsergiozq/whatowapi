import "./bootstrap";
import "reflect-metadata";
import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as Sentry from "@sentry/node";

import "./database";
import uploadConfig from "./config/upload";
import AppError from "./errors/AppError";
import routes from "./routes";
import { logger } from "./utils/logger";

declare var process : {
  env: {
    FRONTEND_URL: string,
    SENTRY_DSN: string
  }
}

Sentry.init({ dsn: process.env.SENTRY_DSN });

const app = express();

var whitelist = ['',''];

if (process.env.FRONTEND_URL !== ""){
  whitelist = process.env.FRONTEND_URL.split(',');
}


var corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    if (whitelist?.indexOf(origin) !== -1 || origin === undefined) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(
  cors(corsOptions)
);

app.use(express.json({
  limit: '50mb'
}));

app.use(cookieParser());

app.use(
  express.urlencoded({
    limit: "250mb",
    parameterLimit: 200000,
    extended: true
  })
);

app.use(Sentry.Handlers.requestHandler());
app.use("/public", express.static(uploadConfig.directory));
app.use(routes);

app.use(Sentry.Handlers.errorHandler());

app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(err);
    return res.status(err.statusCode).json({ error: err.message });
  }

  logger.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

export default app;
