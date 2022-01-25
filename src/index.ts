import fp from "fastify-plugin";
import { Options } from "./interfaces/options.interface";
import { httpProxy } from "./plugins/http-proxy";

export const nodeProxyGateway = fp<Options>(async (fastify, options) => {
  fastify.register(httpProxy, options.httpProxy);
});
