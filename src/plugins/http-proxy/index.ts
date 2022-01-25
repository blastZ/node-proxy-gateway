import fp from "fastify-plugin";
import replyFrom from "fastify-reply-from";
import { IncomingHttpHeaders } from "http";
import { HTTP_METHODS } from "./constants/http-methods.constant";
import { Options, PrefixOptions } from "./interfaces/options.interface";
import { parseHeaders } from "./utils/parse-headers.util";

export const httpProxy = fp<Options>(async (fastify, options) => {
  fastify.register(replyFrom);

  const logger = fastify.log.child({
    stage: "@blastz/fastify-plugin-http-proxy",
  });

  let { defaultPrefix = { "/api": {} }, proxies = {} } = options;

  const prefixOptions: PrefixOptions =
    typeof defaultPrefix === "string" ? { [defaultPrefix]: {} } : defaultPrefix;

  const prefixList = Object.keys(prefixOptions);

  Object.keys(proxies).map((serviceName) => {
    const serviceOptions = proxies[serviceName];

    const {
      target,
      pathRewrite,
      headers = [],
      methods,
      bodyLimit = 1 * 1024 * 1024,
    } = serviceOptions;

    prefixList.map((prefix) => {
      const {
        methods: defaultMethods = HTTP_METHODS,
        pathRewrite: defaultPathRewrite = "",
      } = prefixOptions[prefix];

      const url = `${prefix}/${serviceName}/*`;

      logger.debug(`mount api route "${url}"`);

      fastify.route({
        url,
        method: methods || defaultMethods,
        bodyLimit,
        handler: function handler(request, reply) {
          let path = request.raw.url || "";

          logger.debug(`origin path is ${path}`);

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

          logger.debug(`rewrite path is ${path}`);

          reply.from(`${target}${path}`, {
            rewriteRequestHeaders: function (originReq, originHeaders) {
              logger.child({ originHeaders }).debug("log origin headers");

              const rewriteHeaders = headers.map((o) => o[0]);
              const newHeaders = Object.keys(originHeaders).reduce(
                (result, key) => {
                  if (rewriteHeaders.includes(key)) {
                    return result;
                  }

                  result[key] = originHeaders[key];

                  return result;
                },
                {} as IncomingHttpHeaders
              );

              const appendHeaders = parseHeaders(headers, undefined);

              const customHeaders = {
                ...newHeaders,
                ...appendHeaders,
              };

              logger.child({ customHeaders }).debug("log custom headers");

              return customHeaders;
            },
          });
        },
      });
    });
  });
});

export * from "./constants/http-methods.constant";
export * from "./interfaces/auth-info.interface";
export * from "./interfaces/options.interface";
