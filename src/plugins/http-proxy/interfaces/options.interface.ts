import { HTTPMethods } from "fastify";

export interface Options {
  prefix?: string | string[]; // ["/api/service", "/api/ignore", "/api/query"]
  defaultPathRewrite?: string; // "/api"
  proxies: {
    [serviceName: string]: {
      target: string;
      pathRewrite?: { [key: string]: string };
      limit?: string; // 1mb
      headers?: [string, string][];
      methods?: HTTPMethods[];
    };
  };
}
