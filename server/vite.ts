import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createLogger, createServer as createViteServer } from "vite";
import viteConfig from "../vite.config";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: ["localhost", "127.0.0.1"] as string[],
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    // Try alternate path - sometimes build outputs to different location
    const altDistPath = path.resolve(process.cwd(), "dist", "public");
    if (fs.existsSync(altDistPath)) {
      console.log(`Using alternate dist path: ${altDistPath}`);
      
      // Set correct MIME types BEFORE serving static files
      app.use('/assets', (req, res, next) => {
        if (req.path.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript');
        } else if (req.path.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css');
        }
        next();
      });
      
      app.use(express.static(altDistPath));
      app.use("*", (_req, res) => {
        console.log(`Fallback to index.html for: ${_req.originalUrl}`);
        res.sendFile(path.resolve(altDistPath, "index.html"));
      });
      return;
    }
    
    throw new Error(
      `Could not find the build directory: ${distPath} or ${altDistPath}, make sure to build the client first`,
    );
  }

  console.log(`Serving static files from: ${distPath}`);
  
  // Set correct MIME types BEFORE serving static files
  app.use('/assets', (req, res, next) => {
    if (req.path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (req.path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    next();
  });
  
  // Static file middleware
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    console.log(`Fallback to index.html for: ${_req.originalUrl}`);
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
