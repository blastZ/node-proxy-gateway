import fp from "fastify-plugin";
import replyFrom from "fastify-reply-from";
import { HTTP_METHODS } from "./constants/http-methods.constant";
import { Options } from "./interfaces/options.interface";

export const httpProxy = fp<Options>(async (fastify, options) => {
  fastify.register(replyFrom, {
    logLevel: "debug",
  });

  let {
    prefix = ["/api/service", "/api/ignore", "/api/query"],
    defaultPathRewrite = "/api",
    proxies,
  } = options;

  if (!Array.isArray(prefix)) {
    prefix = [prefix];
  }

  Object.keys(options.proxies).map((serviceName) => {
    const serviceOptions = options.proxies[serviceName];

    const { target, pathRewrite, headers, methods } = serviceOptions;

    (prefix as string[]).map((pre) => {
      const url = `${pre}/${serviceName}/*`;

      fastify.log.debug(`mount api route: ${url}`);

      fastify.route({
        url,
        method: methods || HTTP_METHODS,
        bodyLimit: 1 * 1024 * 1024,
        handler: function handler(request, reply) {
          let path = request.raw.url || "";

          fastify.log.debug(`originPath: ${path}`);

          if (pathRewrite) {
            const matched = Object.entries(pathRewrite).find(([oldPath]) =>
              path.startsWith(oldPath)
            );

            if (matched) {
              path = matched[1] + path.slice(matched[0].length);
            }
          } else {
            path = path.replace(pre, defaultPathRewrite);
          }

          fastify.log.debug(`rewritePath: ${path}`);

          reply.from(`${target}${path}`, {});
        },
      });
    });
  });
});

export * from "./constants/http-methods.constant";
export * from "./interfaces/options.interface";
