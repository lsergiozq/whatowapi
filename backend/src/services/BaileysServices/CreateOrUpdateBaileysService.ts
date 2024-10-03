  import { Chat, Contact } from "@WhiskeysSockets/baileys";
  import Baileys from "../../models/Baileys";

  interface Request {
    whatsappId: number;
    contacts?: Contact[];
    chats?: Chat[];
  }

  const createOrUpdateBaileysService = async ({
    whatsappId,
    contacts,
    chats
  }: Request): Promise<Baileys> => {
    const baileysExists = await Baileys.findOne({
      where: { whatsappId }
    });

    //se não existir, cria
    if (!baileysExists) {
      const baileys = await Baileys.create({
        whatsappId    
      });

      return baileys;
    }
    else{
      return baileysExists;
    }
  
  };

  export default createOrUpdateBaileysService;
