import Whatsapp from "../models/Whatsapp";
import GetWhatsappWbot from "./GetWhatsappWbot";
import mime from "mime-types";
import fs from "fs";
import { AnyMessageContent } from "@adiwajshing/baileys";

export type MessageData = {
  number: number | string;
  body: string;
  mediaPath?: string;
};

export const SendMessage = async (
  whatsapp: Whatsapp,
  messageData: MessageData
): Promise<any> => {
  try {
    const wbot = await GetWhatsappWbot(whatsapp);
    const jid = `${messageData.number}@s.whatsapp.net`;
    let message: any;
    const body = `\u200e${messageData.body}`;

    message = await wbot.sendMessage(jid, {
      text: body
    });
    
    return message;
    
  } catch (err: any) {
    console.log(err)
    throw new Error(err);
  }
};

export default SendMessage;
