import express from "express";
import multer from "multer";
import uploadConfig from "../config/upload";

import * as ApiController from "../controllers/ApiSessionController";
import isAuthApi from "../middleware/isAuthApi";

const upload = multer(uploadConfig);
const ApiRoutes = express.Router();

ApiRoutes.post("/insert", isAuthApi, ApiController.insert);
ApiRoutes.post("/remove", isAuthApi, ApiController.remove);
ApiRoutes.post("/update", isAuthApi, ApiController.update);

export default ApiRoutes;
