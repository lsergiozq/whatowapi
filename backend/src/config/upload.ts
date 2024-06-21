import path from "path";
import multer from "multer";
import { v4 as uuidv4 } from 'uuid';

const publicFolder = path.resolve(__dirname, "..", "..", "public");
export default {
  directory: publicFolder,

  storage: multer.diskStorage({
    destination: publicFolder,
    filename(req, file, cb) {

      const fileName = uuidv4() + path.extname(file.originalname); 

      return cb(null, fileName);
    }
  })
};
