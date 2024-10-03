require("../bootstrap");

module.exports = {
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_bin"
  },
  dialect: process.env.DB_DIALECT || "mysql",
  timezone: "-03:00",
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  logging: false,
  pool: {
    max: 15,        // Aumentar número máximo de conexões
    min: 0,
    acquire: 60000, // Aumentar o tempo de aquisição para 1 minuto
    idle: 30000     // Aumentar tempo ocioso para 30 segundos
  }
};
