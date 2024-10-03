import Whatsapp from "../../models/Whatsapp";

const ListWhatsAppsService = async (): Promise<Whatsapp[]> => {

  //verifica se process.env.API_ID possui valor, caso não atribui 1
  if(!process.env.API_ID){
    process.env.API_ID = '1';
  }

  //converte process.env.API_ID para inteiro
  const apiId = parseInt(process.env.API_ID || '1', 10);

  console.log('apiId', apiId);  
  
  const whatsapps = await Whatsapp.findAll({
    where:{ idapi: apiId }
  });

  console.log('whatsapps', whatsapps.length);

  return whatsapps;
};

export default ListWhatsAppsService;
