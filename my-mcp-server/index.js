import fs from "fs";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  {
    name: "local-mcp",
    version: "1.0.0",
    tools: [
      {
        name: "hello",
        description: "Renvoie un message de bienvenue",
        parameters: { who: { type: "string" } },
        execute: async ({ who }) => `Salut ${who}, MCP fonctionne 🔥`,
      },
      {
        name: "list-files",
        description: "Liste les fichiers du dossier courant",
        parameters: {},
        execute: async () => JSON.stringify(await fs.promises.readdir(".")),
      },
    ],
  },
  new StdioServerTransport()
);

server.connect();



