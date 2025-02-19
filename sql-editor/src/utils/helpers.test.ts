import { ResultSet } from "@clickhouse/client";
import { NodeClickHouseClient } from "@clickhouse/client/dist/client";
import { initialMigration, processHeaders } from "./helpers";

declare global {
  var mockClient: jest.Mocked<NodeClickHouseClient>;
  var mockResultSet: ResultSet<unknown>;
}

describe("Helpers functions", () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe("processHeaders", () => {
    it("should extract clickhouse headers from request", () => {
      const mockRequest = {
        headers: {
          "x-clickhouse-format": "JSON",
          "x-clickhouse-user": "default",
          "content-type": "application/json",
          "x-clickhouse-quota": ["quota1", "quota2"],
        },
      } as unknown as Request;

      const result = processHeaders(mockRequest);

      expect(result).toEqual({
        "x-clickhouse-format": "JSON",
        "x-clickhouse-user": "default",
        "x-clickhouse-quota": "quota1, quota2",
      });
    });

    it("should return empty object when no clickhouse headers present", () => {
      const mockRequest = {
        headers: {
          "content-type": "application/json",
          "x-test": "test",
        },
      } as unknown as Request;

      const result = processHeaders(mockRequest);

      expect(result).toEqual({});
    });
  });

  describe("initialMigration", () => {
    it("should initialize database with sample data", async () => {
      await initialMigration(mockClient);

      expect(mockClient.command).toHaveBeenCalledTimes(2);
      expect(mockClient.insert).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Database initialized with sample data"
      );
    });

    it("should handle initialization errors", async () => {
      mockClient.command.mockRejectedValueOnce(new Error("Init failed"));

      await initialMigration(mockClient);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error initializing database:",
        expect.any(Error)
      );
    });
  });
});
