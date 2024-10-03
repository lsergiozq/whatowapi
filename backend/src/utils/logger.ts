import pino from "pino";
import PinoPretty from "pino-pretty";

const logger = pino({
  // Configurações de nível de log e outras opções
  level: 'info', // ou o nível que você preferir
}, PinoPretty({
  ignore: "pid,hostname",
  // Você pode adicionar mais opções de configuração se necessário
}));

export { logger };
