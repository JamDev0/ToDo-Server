import { IncomingMessage, ServerResponse } from "node:http";
import { Req } from "../server";

export async function jsonMiddleware(req: Req, res: ServerResponse<IncomingMessage>) {
  const buffers = [];

  for await (const chunk of req) {
    buffers.push(chunk);
  }

  const buffer = Buffer.concat(buffers).toString();
  
  req.body = buffer ? JSON.parse(buffer) : {};

  res.setHeader("Content-type", "application/json");
}