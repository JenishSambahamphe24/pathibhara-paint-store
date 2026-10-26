import "reflect-metadata";
import "dotenv/config";

import { container } from "tsyringe";

import { LoggerService } from "@repo/http-kit";

import { ConfigService, EnvHolder, envSchema } from "#config";

import { Bootstrap } from "./bootstrap";

EnvHolder.init(envSchema.parse(process.env));

const app = await Bootstrap.init();

const config = container.resolve(ConfigService);
const logger = container.resolve(LoggerService);

app.listen(config.app.port, () => {
  logger.info(`API server running on http://localhost:${config.app.port}`);
});

// pino-pretty's worker thread otherwise keeps the process alive on restart
// (`node --watch`) and Ctrl+C, orphaning the listener and holding the port.
const forceExit = () => process.kill(process.pid, "SIGKILL");
process.on("SIGTERM", forceExit);
process.on("SIGINT", forceExit);
