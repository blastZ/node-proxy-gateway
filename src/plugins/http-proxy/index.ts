import fp from "fastify-plugin";
import replyFrom from "fastify-reply-from";
import { HTTP_METHODS } from "./constants/http-methods.constant";
import { Options, PrefixOptions } from "./interfaces/options.interface";

export const httpProxy = fp<Options>(async (fastify, options) => {
  fastify.register(replyFrom);

  let { defaultPrefix = { "/api": {} }, proxies = {} } = options;

  const prefixOptions: PrefixOptions =
    typeof defaultPrefix === "string" ? { [defaultPrefix]: {} } : defaultPrefix;

  const prefixList = Object.keys(prefixOptions);

  Object.keys(proxies).map((serviceName) => {
    const serviceOptions = proxies[serviceName];

    const {
      target,
      pathRewrite,
      headers,
      methods,
      bodyLimit = 1 * 1024 * 1024,
    } = serviceOptions;

    prefixList.map((prefix) => {
      const {
        methods: defaultMethods = HTTP_METHODS,
        pathRewrite: defaultPathRewrite = "",
      } = prefixOptions[prefix];

      const url = `${prefix}/${serviceName}/*`;

      fastify.log.debug(`http-proxy: mount api route "${url}"`);

      fastify.route({
        url,
        method: methods || defaultMethods,
        bodyLimit,
        handler: function handler(request, reply) {
          let path = request.raw.url || "";

          fastify.log.debug(`http-proxy: originPath is ${path}`);

          if (pathRewrite) {
            const matched = Object.entries(pathRewrite).find(([oldPath]) =>
              path.startsWith(oldPath)
            );

            if (matched) {
              path = matched[1] + path.slice(matched[0].length);
            }
          } else {
            path = path.replace(prefix, defaultPathRewrite);
          }

          fastify.log.debug(`http-proxy: rewritePath is ${path}`);

          reply.from(`${target}${path}`, {});
        },
      });
    });
  });
});

export * from "./constants/http-methods.constant";
export * from "./interfaces/options.interface";
