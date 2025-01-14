import * as Yup from "yup";
import { Op } from "sequelize";

import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";
import ShowWhatsAppService from "./ShowWhatsAppService";
import zlib from "zlib";

// Funções para compressão
const compress = (data: string): Buffer => zlib.gzipSync(data, { level: 6 });

interface WhatsappData {
  idclient?: string;
  status?: string;
  session?: string;
  description?: string;
}

interface Request {
  whatsappData: WhatsappData;
  whatsappId: string;
}

interface Response {
  whatsapp: Whatsapp;
}

const UpdateWhatsAppService = async ({
  whatsappData,
  whatsappId
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    idclient: Yup.string().min(2),
    status: Yup.string()
  });

  const { idclient, status, session, description } = whatsappData;

  try {
    await schema.validate({ idclient, status, description });
  } catch (err) {
    throw new AppError(err.message);
  }

  const whatsapp = await ShowWhatsAppService(whatsappId);

  const updateData: Partial<Whatsapp> = {
    idclient,
    status,
    description
  };

  // Se o campo `session` for fornecido, migra para `compressed_session`
  if (session) {
    const compressedSession = compress(session).toString("base64");
    updateData.compressedsession = compressedSession;
  }

  await whatsapp.update(updateData);

  return { whatsapp };
};

export default UpdateWhatsAppService;
