import express from "express";
import multer from "multer";
import uploadConfig from "../config/upload";

import * as ApiMessagesController from "../controllers/ApiMessagesController";
import isAuthApi from "../middleware/isAuthApi";

const upload = multer(uploadConfig);
const ApiRoutes = express.Router();

ApiRoutes.post("/sendtext", isAuthApi, ApiMessagesController.sendtext);
ApiRoutes.post("/sendimage", isAuthApi, ApiMessagesController.sendimage);

export default ApiRoutes;
