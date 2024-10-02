import Whatsapp from "../../models/Whatsapp";

const ListGridWhatsAppsService = async (): Promise<Whatsapp[]> => {

  //retornar os atributos que eu quero
  //id, qrcode, status, battery, plugged, createdAt, updatedAt, idclient, retries, description, name, idapi
  const whatsapps = await Whatsapp.findAll(
    {
      attributes: ['id', 'qrcode', 'status', 'battery', 'plugged', 'createdAt', 'updatedAt', 'idclient', 'retries', 'description', 'name', 'idapi'],
      order: [
        ['description', 'ASC']
    }
  );

  return whatsapps;
};

export default ListGridWhatsAppsService;