import { NodeClickHouseClient } from "@clickhouse/client/dist/client";
import { cwd } from "node:process";
import Fs from "fs";
import Path from "path";

export const processHeaders = (
  req: Record<string, any>
): Record<string, string> => {
  return Object.keys(req.headers).reduce((acc, key) => {
    if (key.startsWith("x-clickhouse-")) {
      const value = req.headers[key];
      acc[key] = Array.isArray(value) ? value.join(", ") : value;
    }
    return acc;
  }, {} as Record<string, string>);
};

export const initialMigration = async (client: NodeClickHouseClient) => {
  try {
    const tableName = "example_data_csv";
    await client.command({
      query: `DROP TABLE IF EXISTS ${tableName}`,
    });
    await client.command({
      query: `
        CREATE TABLE ${tableName}
        (id UInt32, name String, age UInt32, city String)
        ENGINE MergeTree()
        ORDER BY (id)
      `,
    });

    const filename = Path.resolve(cwd(), "./src/data/example.csv");
    const fileStream = Fs.createReadStream(filename);

    await client.insert({
      table: tableName,
      values: fileStream,
      format: "CSV",
    });

    console.log("Database initialized with sample data");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};
