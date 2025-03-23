import { createClient, ResultSet } from "@clickhouse/client";
import { NodeClickHouseClient } from "@clickhouse/client/dist/client";
import request from "supertest";
import { app } from "./index";

declare global {
  var mockClient: jest.Mocked<NodeClickHouseClient>;
  var mockResultSet: ResultSet<unknown>;
}

describe("Express Server", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /", () => {
    it("should return hello world message", async () => {
      const response = await request(app).get("/");
      expect(response.status).toBe(200);
      expect(response.text).toBe("Hello world!");
    });
  });

  describe("GET /api/health", () => {
    it("should return 204 status", async () => {
      const response = await request(app).get("/api/health");
      expect(response.status).toBe(204);
    });
  });

  describe("POST /query", () => {
    it("should execute valid SELECT query", async () => {
      mockClient.query.mockResolvedValueOnce(mockResultSet);

      const response = await request(app)
        .post("/query")
        .send({ query: "SELECT * FROM test" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ rows: [{ id: 1, name: "Test" }] });
    });

    it("should reject dangerous queries", async () => {
      const response = await request(app)
        .post("/query")
        .send({ query: "DROP TABLE test" });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe(
        "Invalid SQL syntax: Query contains forbidden keywords"
      );
    });

    it("should handle missing query parameter", async () => {
      const response = await request(app).post("/query").send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("'query' is required");
    });

    it("should forward ClickHouse headers correctly", async () => {
      mockClient.query.mockResolvedValueOnce(mockResultSet);

      const response = await request(app)
        .post("/query")
        .set({
          "x-clickhouse-format": "JSONEachRow",
          "x-clickhouse-database": "test_db",
          "some-other-header": "should-not-be-forwarded",
          "x-clickhouse-multiple": ["value1", "value2", "value3"],
        })
        .send({ query: "SELECT * FROM test" });

      expect(response.status).toBe(200);
      expect(createClient).toHaveBeenCalledWith({
        url: "http://localhost:8123",
        http_headers: {
          "x-clickhouse-format": "JSONEachRow",
          "x-clickhouse-database": "test_db",
          "x-clickhouse-multiple": "value1, value2, value3",
        },
      });
    });

    it("should handle empty headers", async () => {
      mockClient.query.mockResolvedValueOnce(mockResultSet);

      const response = await request(app)
        .post("/query")
        .send({ query: "SELECT * FROM test" });

      expect(response.status).toBe(200);
      expect(createClient).toHaveBeenCalledWith({
        url: "http://localhost:8123",
        http_headers: {},
      });
    });

    it("should handle numeric header values correctly", async () => {
      mockClient.query.mockResolvedValueOnce(mockResultSet);

      const response = await request(app)
        .post("/query")
        .set({
          "x-clickhouse-format": "JSONEachRow",
          "x-clickhouse-database": {} as unknown as string,
          "x-clickhouse-numeric": 12345 as unknown as string,
          "x-clickhouse-multiple": null,
        })
        .send({ query: "SELECT * FROM test" });

      expect(response.status).toBe(200);
      expect(createClient).toHaveBeenCalledWith({
        url: "http://localhost:8123",
        http_headers: {
          "x-clickhouse-format": "JSONEachRow",
          "x-clickhouse-database": "[object Object]",
          "x-clickhouse-numeric": "12345",
          "x-clickhouse-multiple": "null",
        },
      });
    });

    it("should handle empty array headers", async () => {
      mockClient.query.mockResolvedValueOnce(mockResultSet);

      const response = await request(app)
        .post("/query")
        .set({
          "x-clickhouse-settings": [],
        })
        .send({ query: "SELECT 1" });

      expect(response.status).toBe(200);
      expect(createClient).toHaveBeenCalledWith(
        expect.objectContaining({
          http_headers: {},
        })
      );
    });

    it("should handle ClickHouse errors", async () => {
      mockClient.query.mockRejectedValueOnce(new Error("Database error"));

      const response = await request(app)
        .post("/query")
        .send({ query: "SELECT * FROM nonexistent_table" });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });

    it("should handle non-Error objects in catch block", async () => {
      mockClient.query.mockRejectedValueOnce("String error");

      const response = await request(app)
        .post("/query")
        .send({ query: "SELECT * FROM test" });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Internal server error");
    });
  });
});
