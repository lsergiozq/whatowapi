import Whatsapp from "../../models/Whatsapp";

const ListDisconnectedWhatsAppsService = async (): Promise<Whatsapp[]> => {

  const whatsapps = await Whatsapp.findAll(
    {
      attributes: ['idclient'],
      where: { status: "DISCONNECTED" },
      order: [
        ['description', 'ASC']
      ]});

  return whatsapps;
};

export default ListDisconnectedWhatsAppsService;