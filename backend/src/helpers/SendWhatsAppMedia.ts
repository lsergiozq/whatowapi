import { WAMessage, AnyMessageContent } from "@WhiskeysSockets/baileys";

import GetWhatsappWbot from "./GetWhatsappWbot";
import Whatsapp from "../models/Whatsapp";
import fs from "fs";
import { exec } from "child_process";
import path from "path";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import AppError from "../errors/AppError"
import SendMessage from  "../helpers/SendMessage";

interface Request {
  whatsapp: Whatsapp;
  imagebase64: string;
  body?: string;
  number: string;
}

export const SendWhatsAppMedia = async (
    {
        whatsapp,
        imagebase64,        
        body,
        number
    }: Request): Promise<WAMessage> => {
  try {

    const wbot = await GetWhatsappWbot(whatsapp);

    const imageData = imagebase64.replace(/^data:image\/\w+;base64,/, ''); // Remover o prefixo
    const buffer = Buffer.from(imageData, 'base64');

    let options: AnyMessageContent;

    options = {
      image: buffer,
      caption: body
    };

    var jid = `${number}@s.whatsapp.net`;
	
    var verify9Number = await wbot.onWhatsApp(jid);

    if (verify9Number == null || verify9Number.length == 0 || verify9Number[0].exists == false)
    {
      if (number.length == 13)
      {
        const numberWA = number.substring(0,4) + number.substring(5);
        jid = `${numberWA}@s.whatsapp.net`;
        verify9Number = await wbot.onWhatsApp(jid);
      }
    }

    if (verify9Number != null && verify9Number.length > 0 && verify9Number[0].exists == true)
    {
      const message = await wbot.sendMessage(verify9Number[0].jid, {
        ...options
      });
        
      return message;
    }
    else
    {
      return null;
    }
    

  } catch (err) {
    //console.log(err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMedia;