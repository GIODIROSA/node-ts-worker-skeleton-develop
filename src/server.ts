import express from "express";
import {ENV} from "@config/constants"
import Logger from "@config/logger";
import emailRoutes from "./routes/email.routes";


const app = express();

app.use(express.json());

app.use('/api/emails', emailRoutes); 

const PORT = ENV.NODE_ENV === 'production' ? 80 : 3000;


app.listen(PORT, () => {
  Logger.info(`🚀 Servidor API (Productor) iniciado`);
  Logger.info(`🌍 Entorno: ${ENV.NODE_ENV}`); 
  Logger.info(`🔗 URL: http://localhost:${PORT}/api/emails`);
  Logger.info(`📦 Conectado a Redis para colas en: ${ENV.REDIS_URL}`); 
});

