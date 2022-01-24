import { HTTPMethods } from "fastify";

export interface ProxyOptions {
  url?: string;
  target: string;
  pathRewrite?: { [key: string]: string };
  bodyLimit?: number;
  headers?: [string, string][];
  methods?: HTTPMethods[];
}

export interface PrefixOptions {
  [prefix: string]: {
    pathRewrite?: string;
    methods?: HTTPMethods[];
  };
}

export interface Options {
  defaultPrefix?: string | PrefixOptions;
  proxies?: {
    [serviceName: string]: ProxyOptions;
  };
}
