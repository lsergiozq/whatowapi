import { Router } from "express";
import apiMessagesRoutes from "./apiMessagesRoutes";
import apiSessionRoutes from "./apiSessionRoutes";
import authRoutes from "./authRoutes";
import settingMessageRoutes from "./settingMessageRoutes";
import settingRoutes from "./settingRoutes";
import userRoutes from "./userRoutes";
import whatsappRoutes from "./whatsappRoutes";
import whatsappSessionRoutes from "./whatsappSessionRoutes";

const routes = Router();

routes.use(userRoutes);
routes.use("/auth", authRoutes);
routes.use(settingRoutes);
routes.use(whatsappRoutes);
routes.use(whatsappSessionRoutes);
routes.use("/api/messages", apiMessagesRoutes);
routes.use("/api/session", apiSessionRoutes);
routes.use(settingMessageRoutes);

export default routes;
