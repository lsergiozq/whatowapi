import type {
  AuthenticationCreds,
  AuthenticationState,
  SignalDataTypeMap,
} from "@WhiskeysSockets/baileys";
import { BufferJSON, initAuthCreds, proto } from "@WhiskeysSockets/baileys";
import * as Sentry from "@sentry/node";
import zlib from "zlib";
import Whatsapp from "../models/Whatsapp";

// Funções para compressão e descompressão
const compress = (data: string): Buffer => zlib.gzipSync(data, { level: 6 });
const decompress = (data: Buffer): string => zlib.gunzipSync(data).toString();

const KEY_MAP: { [T in keyof SignalDataTypeMap]: string } = {
  "pre-key": "preKeys",
  session: "sessions",
  "sender-key": "senderKeys",
  "app-state-sync-key": "appStateSyncKeys",
  "app-state-sync-version": "appStateVersions",
  "sender-key-memory": "senderKeyMemory",
};

const authState = async (
  whatsapp: Whatsapp
): Promise<{ state: AuthenticationState; saveState: () => void }> => {
  let creds: AuthenticationCreds;
  let keys: any = {};

  try {
    // Tenta carregar a sessão compactada primeiro
    if (whatsapp.compressedsession) {
      const decompressedData = decompress(Buffer.from(whatsapp.compressedsession, "base64"));
      const result = JSON.parse(decompressedData, BufferJSON.reviver);
      creds = result.creds;
      keys = result.keys;
    } else {
      // Inicializa novos dados caso nenhuma sessão exista
      creds = initAuthCreds();
      keys = {};
    }
  } catch (error) {
    Sentry.captureException(error);
    console.error("Erro ao carregar ou migrar sessão:", error);
    creds = initAuthCreds();
    keys = {};
  }

  const saveState = async () => {
    try {
      const sessionData = JSON.stringify({ creds, keys }, BufferJSON.replacer, 0);
      const compressedData = compress(sessionData).toString("base64");

      // Salva os dados no campo compactado
      await whatsapp.update({ compressedsession: compressedData });
    } catch (error) {
      Sentry.captureException(error);
      console.error("Erro ao salvar sessão compactada:", error);
    }
  };

  return {
    state: {
      creds,
      keys: {
        get: (type: keyof SignalDataTypeMap, ids: string[]) => {
          const key = KEY_MAP[type];
          if (!keys[key]) {
            return {};
          }

          return ids.reduce((result, id) => {
            if (keys[key][id]) {
              result[id] =
                type === "app-state-sync-key"
                  ? proto.Message.AppStateSyncKeyData.fromObject(keys[key][id])
                  : keys[key][id];
            }
            return result;
          }, {} as Record<string, any>);
        },
        set: (data: Partial<Record<keyof SignalDataTypeMap, Record<string, any>>>) => {
          for (const type in data) {
            const key = KEY_MAP[type as keyof SignalDataTypeMap];
            keys[key] = keys[key] || {};

            for (const id in data[type]) {
              if (!keys[key][id] || JSON.stringify(keys[key][id]) !== JSON.stringify(data[type][id])) {
                keys[key][id] = data[type][id];
              }
            }
          }

          // Salva após atualizações
          saveState();
        },
      },
    },
    saveState,
  };
};

export default authState;
