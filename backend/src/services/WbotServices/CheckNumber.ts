import GetWhatsAppByIdClient from "../../helpers/GetWhatsAppByIdClient";
import { getWbot } from "../../libs/wbot";

interface IOnWhatsapp {
  jid: string;
  exists: boolean;
}


const CheckContactNumber = async (idclient: string, number: string): Promise<string> => {
  const defaultWhatsapp = await GetWhatsAppByIdClient(idclient);

  const wbot = getWbot(defaultWhatsapp.id);
  let isGroup = number.endsWith("@g.us")
  let numberArray
  if (isGroup) {
    const grupoMeta = await wbot.groupMetadata(number);
    numberArray = [{
      jid: grupoMeta.id,
      exists: true
    }]
  } else {
    numberArray = await wbot.onWhatsApp(`${number}@s.whatsapp.net`);
  }

  const isNumberExit = numberArray

  if (!isNumberExit[0]?.exists) {
    throw new Error("ERR_CHECK_NUMBER");
  }

  return isGroup ? number.split('@')[0] : isNumberExit[0].jid.replace(/[^\d]/g, "");
};

export default CheckContactNumber;
