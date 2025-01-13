import type {
  AuthenticationCreds,
  AuthenticationState,
  SignalDataTypeMap,
} from "@WhiskeysSockets/baileys";
import { BufferJSON, initAuthCreds, proto } from "@WhiskeysSockets/baileys";
import Redis from "ioredis";
import sessionQueue from "../bull/sessionQueue";
import Whatsapp from "../models/Whatsapp";

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT) || 6379,
});

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

  const sessionKey = `session:${whatsapp.id}`;

  // Recuperar sessão do Redis
  const cachedSession = await redis.get(sessionKey);
  if (cachedSession) {
    const result = JSON.parse(cachedSession, BufferJSON.reviver);
    creds = result.creds;
    keys = result.keys;
  } else if (whatsapp.session) {
    const result = JSON.parse(whatsapp.session, BufferJSON.reviver);
    creds = result.creds;
    keys = result.keys;
  } else {
    creds = initAuthCreds();
    keys = {};
  }

  // Salvar sessão no Redis e na Fila
  const saveState = async () => {
    const sessionData = { creds, keys };
    await redis.set(sessionKey, JSON.stringify(sessionData, BufferJSON.replacer), "EX", 3600);

    // Adiciona job na fila para persistir no banco
    await sessionQueue.add({ sessionId: whatsapp.id, sessionData });
  };

  return {
    state: {
      creds,
      keys: {
        get: (type, ids) => {
          const key = KEY_MAP[type];
          return ids.reduce((dict: any, id) => {
            let value = keys[key]?.[id];
            if (value) {
              if (type === "app-state-sync-key") {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              dict[id] = value;
            }
            return dict;
          }, {});
        },
        set: (data: any) => {
          Object.keys(data).forEach((key) => {
            const keyNew = KEY_MAP[key as keyof SignalDataTypeMap];
            keys[keyNew] = keys[keyNew] || {};
            Object.assign(keys[keyNew], data[key]);
          });
          saveState();
        },
      },
    },
    saveState,
  };
};

export default authState;
