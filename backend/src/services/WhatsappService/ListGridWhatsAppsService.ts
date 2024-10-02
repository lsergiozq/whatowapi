import Whatsapp from "../../models/Whatsapp";

const ListGridWhatsAppsService = async (): Promise<Whatsapp[]> => {

  //verifica se process.env.API_ID possui valor, caso não atribui 1
  if(!process.env.API_ID){
    process.env.API_ID = '1';
  }

  //converte process.env.API_ID para inteiro
  const apiId = parseInt(process.env.API_ID || '1', 10);

  //retornar os atributos que eu quero
  //id, qrcode, status, battery, plugged, createdAt, updatedAt, idclient, retries, description, name, idapi
  const whatsapps = await Whatsapp.findAll(
    {
      attributes: ['id', 'qrcode', 'status', 'battery', 'plugged', 'createdAt', 'updatedAt', 'idclient', 'retries', 'description', 'name', 'idapi'],
      where:{ idapi: apiId }
    }
  );

  return whatsapps;
};

export default ListGridWhatsAppsService;