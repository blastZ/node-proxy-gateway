# Node Proxy Gateway

Node proxy gateway based on fastify.

## Installation

```bash
npm install @blastz/node-proxy-gateway
```

## Examples

```ts
import Fastify from "fastify";
import { httpProxy } from "@blastz/node-proxy-gateway";

const fastify = Fastify();

fastify.register(httpProxy, {
  proxies: {
    test: {
      target: "http://localhost:3001",
    },
  },
});

fastify.listen(3000);
```
