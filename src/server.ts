import dotenv from "dotenv";

dotenv.config();

import { createServer, IncomingMessage } from "node:http";
import { jsonMiddleware } from "./middlewares/jsonMiddleware";
import { routes } from "./routes";

export interface Req extends IncomingMessage {
  body: any;
  parms: any;
}

//@ts-ignore
const server = createServer(async (req: Req, res) => {
  const { method, url: route, headers: { host } } = req;

  const url = new URL(`http://${host}${route}`);

  const currentRoute = routes.find(route => {
    return route.method === method && route.path.test(url.pathname);
  });
  
  if(!!currentRoute) {
    await jsonMiddleware(req, res);

    const routeParms = url.pathname.match(currentRoute.path)!.groups;

    req.parms = { ...routeParms };

    return currentRoute.handler(req, res);
  }

  return res.writeHead(404).end(JSON.stringify({ message: "Invalid Route or method" }));
})

const serverPort = process.env.SERVER_PORT;

server.listen(serverPort);

console.log(`Running on port ${serverPort} boyyyy 🏃‍♂️🏃‍♂️`);