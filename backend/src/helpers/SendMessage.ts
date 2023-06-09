import Whatsapp from "../models/Whatsapp";
import GetWhatsappWbot from "./GetWhatsappWbot";
import mime from "mime-types";
import fs from "fs";
import { AnyMessageContent } from "@WhiskeysSockets/baileys";

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
    //var jid = `${messageData.number}@s.whatsapp.net`;
	
	
    var numberWA = messageData.number.toString();

    var jid = `${numberWA}@s.whatsapp.net`;

    var verify9Number = await wbot.onWhatsApp(jid);

    if (verify9Number == null || verify9Number.length == 0 || verify9Number[0].exists == false)
    {
      if (numberWA.length == 13)
      {
        numberWA = messageData.number.toString().substring(0,4) + messageData.number.toString().substring(5);
        jid = `${numberWA}@s.whatsapp.net`;

        verify9Number = await wbot.onWhatsApp(jid);
      }
    }

    if (verify9Number != null && verify9Number.length > 0 && verify9Number[0].exists == true)
    {
      let message: any;
      const body = `\u200e${messageData.body}`;

      message = await wbot.sendMessage(verify9Number[0].jid, {
        text: body
      });
      
      return message;
    }
    else
    {
      return null;
    }
    
  } catch (err: any) {
    console.log(err)
    throw new Error(err);
  }
};

export default SendMessage;
