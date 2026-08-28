#!/usr/bin/env node

import http from "node:http";
import https from "node:https";
import tls from "node:tls";

const listenHost = "127.0.0.1";
const listenPort = Number.parseInt(process.env.MEMORAX_BRIDGE_PORT ?? "3081", 10);
const upstreamHost = "221.194.152.171";
const upstreamCertificateName = "deepseek-flash-api.memorax.space";

const server = http.createServer((request, response) => {
  const headers = { ...request.headers, host: upstreamHost };
  delete headers.connection;

  const upstream = https.request(
    {
      host: upstreamHost,
      port: 443,
      method: request.method,
      path: request.url,
      headers,
      servername: upstreamHost,
      checkServerIdentity: (_host, certificate) =>
        tls.checkServerIdentity(upstreamCertificateName, certificate),
    },
    (upstreamResponse) => {
      response.writeHead(upstreamResponse.statusCode ?? 502, upstreamResponse.headers);
      upstreamResponse.pipe(response);
    },
  );

  upstream.on("error", (error) => {
    console.error(`memorax bridge: ${error.code ?? error.name}: ${error.message}`);
    if (!response.headersSent) response.writeHead(502, { "content-type": "text/plain" });
    response.end("Memorax upstream transport failed\n");
  });

  request.pipe(upstream);
});

server.listen(listenPort, listenHost, () => {
  console.log(`memorax bridge: http://${listenHost}:${listenPort} -> https://${upstreamHost}`);
});

const stop = () => server.close(() => process.exit(0));
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
