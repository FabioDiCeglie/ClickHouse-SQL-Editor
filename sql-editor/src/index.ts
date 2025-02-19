import { createClient } from "@clickhouse/client";
import bodyParser from "body-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import helmet, { crossOriginResourcePolicy } from "helmet";
import { initialMigration, processHeaders } from "./utils/helpers";
import { config } from 'dotenv';

config();

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

export const app = express();
const port = 8080;

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:4173",
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "x-clickhouse-*"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(jsonParser);
app.use(urlencodedParser);

// This line of code is a security middleware that helps protect the application
// from common vulnerabilities such as cross-site scripting (XSS), content sniffing, clickjacking, etc.
app.use(helmet());

// This line of code sets a Cross-Origin Resource Policy (CORP) header to allow cross-origin requests.
// This middleware helps to prevent attackers
// from exploiting vulnerabilities in the application by sending malicious requests from other domains.
app.use(crossOriginResourcePolicy({ policy: "cross-origin" }));

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.get("/api/health", (req: Request, res: Response) => {
  res.sendStatus(204);
});

app.post("/query", async (req: Request, res: Response) => {
  try {
    const clickhouseHeaders = processHeaders(req);
    const client = createClient({
      url: process.env.CLICKHOUSE_URL || "http://localhost:8123",
      http_headers: clickhouseHeaders,
    });

    if (!req.body.query) {
      res.status(400).send({
        error: "'query' is required",
      });
      return;
    }

    const dangerousKeywords = [
      "DROP",
      "DELETE",
      "TRUNCATE",
      "ALTER",
      "RENAME",
      "INSERT",
      "UPDATE",
      "REPLACE",
      "CREATE",
    ];
    const query = req.body.query.toUpperCase();
    const hasDangerousKeyword = dangerousKeywords.some((keyword) =>
      query.includes(keyword)
    );

    if (hasDangerousKeyword) {
      res.status(403).send({
        error: "Invalid SQL syntax: Query contains forbidden keywords",
      });
      return;
    }

    const resultSet = await client.query({
      query: req.body.query,
      format: "JSONEachRow",
    });
    const rows = await resultSet.json();
    res.status(200).send({
      rows,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).send({
      error: message,
    });
  }
});

export const main = async () => {
  try {
    const initClient = createClient({ url: process.env.CLICKHOUSE_URL || "http://localhost:8123" });
    await initialMigration(initClient);

    // start the Express server
    app.listen(port, () => {
      console.log(`server started at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start the application:", error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== "test") {
  main();
}
