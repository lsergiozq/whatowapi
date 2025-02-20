import { IntegerDataType } from "sequelize/types";
import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  idclient: string;
  status?: string;
  description?: string;
  imagebase64?: string;
  idapi?: Number;
}

interface Response {
  whatsapp: Whatsapp;
}

const CreateWhatsAppService = async ({
  idclient,
  status = "OPENING",
  description,
  imagebase64,
  idapi
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    idclient: Yup.string()
      .required()
      .min(2)
      .test(
        "Check-idclient",
        "This whatsapp idclient is already used.",
        async value => {
          if (!value) return false;
          const idclientExists = await Whatsapp.findOne({
            where: { idclient: value }
          });
          return !idclientExists;
        }
      )
  });

  try {
    await schema.validate({ idclient, status });
  } catch (err) {
    throw new AppError(err.message);
  }

  //const whatsappFound = await Whatsapp.findOne();

  const whatsapp = await Whatsapp.create(
    {
      idclient,
      status,
      description,
      imagebase64,
      idapi
    }
  );

  return { whatsapp };
};

export default CreateWhatsAppService;
