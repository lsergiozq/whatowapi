import AppError from "../../errors/AppError";
import GetWhatsAppByIdClient from "../../helpers/GetWhatsAppByIdClient";
import { getWbot } from "../../libs/wbot";

const GetProfilePicUrl = async (idclient: string, number: string): Promise<string> => {
  const defaultWhatsapp = await GetWhatsAppByIdClient(idclient);
  const wbot = getWbot(defaultWhatsapp.id);
  let profilePicUrl: string

  try {
    profilePicUrl = await wbot.profilePictureUrl(`${number}@s.whatsapp.net`);
  } catch (err) {
     profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
  }

  return profilePicUrl;
};

export default GetProfilePicUrl;
