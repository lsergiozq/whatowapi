import { WASocket } from "@adiwajshing/baileys";
import AppError from "../../errors/AppError";
import GetWhatsAppByIdClient from "../../helpers/GetWhatsAppByIdClient";
import { getWbot } from "../../libs/wbot";

const CheckIsValidContact = async (idclient: string, number: string): Promise<void> => {
const defaultWhatsapp = await GetWhatsAppByIdClient(idclient);

const wbot = getWbot(defaultWhatsapp.id);

  try {
    const [result] = await (wbot as WASocket).onWhatsApp(
      `${number}@s.whatsapp.net`
    );

    if (!result.exists) {
      throw new AppError("invalidNumber");
    }
  } catch (err) {
    if (err.message === "invalidNumber") {
      throw new AppError("ERR_WAPP_INVALID_CONTACT");
    }
    throw new AppError("ERR_WAPP_CHECK_CONTACT");
  }
};

export default CheckIsValidContact;
