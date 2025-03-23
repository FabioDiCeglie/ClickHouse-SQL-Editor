const mockRows = [{ id: 1, name: "Test" }];

const mockResultSet = {
  json: jest.fn().mockResolvedValue(mockRows),
  format: "JSON",
  query_id: "123",
  response_headers: {},
  log_error: jest.fn(),
  text: jest.fn().mockResolvedValue(""),
  stream: jest.fn(),
  close: jest.fn(),
  _stream: null,
};

const mockClient = {
  command: jest.fn().mockResolvedValue(undefined),
  query: jest.fn().mockResolvedValue(mockResultSet),
  insert: jest.fn().mockResolvedValue(undefined),
};

jest.mock("@clickhouse/client", () => ({
  createClient: jest.fn().mockReturnValue(mockClient),
}));

jest.mock("fs", () => ({
  createReadStream: jest.fn(),
}));

global.mockResultSet = mockResultSet;
global.mockClient = mockClient;