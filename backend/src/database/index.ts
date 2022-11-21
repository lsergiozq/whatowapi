import { Sequelize } from "sequelize-typescript";
import Baileys from "../models/Baileys";
// import dbConfig from "../config/database";
import Setting from "../models/Setting";
import SettingMessage from "../models/SettingMessage";
import User from "../models/User";
import UserQueue from "../models/UserQueue";
import Whatsapp from "../models/Whatsapp";

// eslint-disable-next-line
const dbConfig = require("../config/database");

const sequelize = new Sequelize(dbConfig);

const models = [
  User,
  Whatsapp,
  Setting,
  UserQueue,
  Baileys,
  SettingMessage,
];

sequelize.addModels(models);

export default sequelize;
