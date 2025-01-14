import { getIO } from "../../libs/socket";
import { initWbot } from "../../libs/wbot";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import wbotMonitor from "./wbotMonitor";
import zlib from "zlib";

// Funções para compressão
const compress = (data: string): Buffer => zlib.gzipSync(data, { level: 6 });

export const StartWhatsAppSession = async (
  whatsapp: Whatsapp
): Promise<void> => {
  // Atualiza o status para "OPENING"
  await whatsapp.update({ status: "OPENING" });

  const io = getIO();
  io.emit("whatsappSession", {
    action: "update",
    session: whatsapp
  });

  try {
    // Inicia a sessão do WhatsApp
    const wbot = await initWbot(whatsapp);

    // Monitora a sessão do WhatsApp
    wbotMonitor(wbot, whatsapp);

    // Atualiza a sessão compactada após inicialização bem-sucedida
    if (wbot.authState?.creds && wbot.authState?.keys) {
      const sessionData = JSON.stringify(
        { creds: wbot.authState.creds, keys: wbot.authState.keys },
        null,
        0
      );
      const compressedSession = compress(sessionData).toString("base64");

      await whatsapp.update({
        compressedsession: compressedSession
      });
    }
  } catch (err) {
    logger.error(err);
    // Atualiza o status para "DISCONNECTED" em caso de erro
    await whatsapp.update({ status: "DISCONNECTED" });
    io.emit("whatsappSession", {
      action: "update",
      session: whatsapp
    });
  }
};
