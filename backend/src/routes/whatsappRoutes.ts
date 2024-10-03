import express from "express";
import isAuth from "../middleware/isAuth";
import isAuthApi from "../middleware/isAuthApi";

import * as WhatsAppController from "../controllers/WhatsAppController";

const whatsappRoutes = express.Router();

whatsappRoutes.get("/whatsapp/", isAuth, WhatsAppController.index);

whatsappRoutes.get("/whatsappgrid/", isAuth, WhatsAppController.indexGrid);

whatsappRoutes.get(
  "/whatsappdisconnected/", 
  isAuthApi,
  WhatsAppController.indexDisconnected
);

whatsappRoutes.post("/whatsapp/", isAuth, WhatsAppController.store);

whatsappRoutes.get("/whatsapp/:whatsappId", isAuth, WhatsAppController.show);

whatsappRoutes.put("/whatsapp/:whatsappId", isAuth, WhatsAppController.update);

whatsappRoutes.delete(
  "/whatsapp/:whatsappId",
  isAuth,
  WhatsAppController.remove
);

export default whatsappRoutes;
