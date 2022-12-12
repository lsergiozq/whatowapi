import { Router } from "express";
import isAuth from "../middleware/isAuth";
import isAuthApi from "../middleware/isAuthApi";

import WhatsAppSessionController from "../controllers/WhatsAppSessionController";

const whatsappSessionRoutes = Router();

whatsappSessionRoutes.post(
  "/whatsappsession/:whatsappId",
  isAuth,
  WhatsAppSessionController.store
);

whatsappSessionRoutes.put(
  "/whatsappsession/:whatsappId",
  isAuth,
  WhatsAppSessionController.update
);

whatsappSessionRoutes.put(
  "/whatsappsessionApi/:whatsappIdClient",
  isAuthApi,
  WhatsAppSessionController.updateApi
);

whatsappSessionRoutes.get(
  "/whatsappsessionApi/:whatsappIdClient",
  isAuthApi,
  WhatsAppSessionController.show
);

whatsappSessionRoutes.delete(
  "/whatsappsessionApi/:whatsappIdClient",
  isAuthApi,
  WhatsAppSessionController.removeApi
);

whatsappSessionRoutes.delete(
  "/whatsappsession/:whatsappId",
  isAuth,
  WhatsAppSessionController.remove
);

export default whatsappSessionRoutes;
