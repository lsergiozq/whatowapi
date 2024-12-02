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
  media: Express.Multer.File;
  body?: string;
  number: string;
}

const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");

export const processAudio = async (audio: string): Promise<string> => {
  const outputAudio = `${publicFolder}/${new Date().getTime()}.mp3`;
  return new Promise((resolve, reject) => {
    exec(
      `${ffmpegPath.path} -i ${audio} -vn -ab 128k -ar 44100 -f ipod ${outputAudio} -y`,
      (error, _stdout, _stderr) => {
        if (error) reject(error);
        fs.unlinkSync(audio);
        resolve(outputAudio);
      }
    );
  });
};

export const processAudioFile = async (audio: string): Promise<string> => {
  const outputAudio = `${publicFolder}/${new Date().getTime()}.mp3`;
  return new Promise((resolve, reject) => {
    exec(
      `${ffmpegPath.path} -i ${audio} -vn -ar 44100 -ac 2 -b:a 192k ${outputAudio}`,
      (error, _stdout, _stderr) => {
        if (error) reject(error);
        fs.unlinkSync(audio);
        resolve(outputAudio);
      }
    );
  });
};

export const SendWhatsAppMedia = async (
    {
        whatsapp,
        media,        
        body,
        number
    }: Request): Promise<WAMessage> => {
  try {

    const pathMedia = media.path;
    const typeMessage = media.mimetype.split("/")[0];
    const wbot = await GetWhatsappWbot(whatsapp);

    let options: AnyMessageContent;

    if (typeMessage === "video") {
      options = {
        video: fs.readFileSync(pathMedia),
        caption: body,
        fileName: media.originalname
        // gifPlayback: true
      };
    } else if (typeMessage === "audio") {
      const typeAudio = media.originalname.includes("audio-record-site");
      if (typeAudio) {
        const convert = await processAudio(media.path);
        options = {
          audio: fs.readFileSync(convert),
          mimetype: typeAudio ? "audio/mp4" : media.mimetype,
          ptt: true
        };
      } else {
        const convert = await processAudioFile(media.path);
        options = {
          audio: fs.readFileSync(convert),
          mimetype: typeAudio ? "audio/mp4" : media.mimetype
        };
      }
    } else if (typeMessage === "document") {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: body,
        fileName: media.originalname,
        mimetype: media.mimetype
      };
    } else if (typeMessage === "application") {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: body,
        fileName: media.originalname,
        mimetype: media.mimetype
      };
    } else {
      options = {
        image: fs.readFileSync(pathMedia),
        caption: body
      };
    }

    

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