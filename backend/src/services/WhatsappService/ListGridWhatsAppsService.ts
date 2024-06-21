import Whatsapp from "../../models/Whatsapp";

const ListGridWhatsAppsService = async (): Promise<Whatsapp[]> => {
  const whatsapps = await Whatsapp.findAll(
    {attributes: ['description', 'idclient', 'id', 'status', 'updatedAt']}
  );

  return whatsapps;
};

export default ListGridWhatsAppsService;