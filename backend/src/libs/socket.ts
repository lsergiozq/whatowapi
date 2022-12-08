import { Server as SocketIO } from "socket.io";
import { Server } from "http";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";

let io: SocketIO;

declare var process : {
  env: {
    FRONTEND_URL: string,
    SENTRY_DSN: string
  }
}

export const initIO = (httpServer: Server): SocketIO => {


  var whitelist = ['',''];

  if (process.env.FRONTEND_URL !== ""){
    whitelist = process.env.FRONTEND_URL.split(',');
  }


  var corsOptions = {    
    origin: function (origin, callback) {
      if (whitelist?.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    }
  }
  io = new SocketIO(httpServer, {
    cors: corsOptions
    
  });

  io.on("connection", socket => {
    logger.info("Client Connected");
    socket.on("joinChatBox", (ticketId: string) => {
      logger.info("A client joined a ticket channel");
      socket.join(ticketId);
    });

    socket.on("joinNotification", () => {
      logger.info("A client joined notification channel");
      socket.join("notification");
    });

    // socket.on("joinTickets", (status: string) => {
      // logger.info(`A client joined to ${status} tickets channel.`);
      // socket.join(status);
    // });

    socket.on("disconnect", () => {
      logger.info("Client disconnected");
    });
  });
  return io;
};

export const getIO = (): SocketIO => {
  if (!io) {
    throw new AppError("Socket IO not initialized");
  }
  return io;
};
