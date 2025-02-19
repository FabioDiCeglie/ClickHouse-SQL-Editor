import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import App from "./App";

describe("App Component", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mock("axios", () => ({
      default: {
        post: vi.fn(),
        get: vi.fn(),
      },
      AxiosError: vi.fn().mockImplementation((message) => {
        const error = new Error(message);
        return error;
      }),
    }));
  });

  afterEach(() => {
    vi.spyOn(console, "error").mockRestore();
  });

  const mockedAxios = axios as unknown as {
    post: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
  };

  test("renders SQL editor title", () => {
    render(<App />);
    expect(screen.getByText("ClickHouse SQL Editor")).toBeInTheDocument();
  });

  test("run query button should be disabled when textarea is empty", () => {
    render(<App />);
    const runButton = screen.getByText("Run Query");
    expect(runButton).toBeDisabled();
  });

  test("run query button should be enabled when textarea has content", async () => {
    render(<App />);
    const textarea = screen.getByPlaceholderText(
      /Enter your SQL queries here/i
    );
    await userEvent.type(textarea, "SELECT * FROM test");

    const runButton = screen.getByText("Run Query");
    expect(runButton).toBeEnabled();
  });

  test("should execute query and display results", async () => {
    const mockResponse = {
      data: {
        rows: [
          { id: 1, name: "Test" },
          { id: 2, name: "Test 2" },
        ],
      },
    };
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    render(<App />);
    const textarea = screen.getByPlaceholderText(
      /Enter your SQL queries here/i
    );
    await userEvent.type(textarea, "SELECT * FROM test;");

    const runButton = screen.getByText("Run Query");
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByText("1 Query")).toBeInTheDocument();
      expect(screen.getByText("Test")).toBeInTheDocument();
      expect(screen.getByText("Test 2")).toBeInTheDocument();
      expect(textarea).toHaveValue("");
    });
  });

  test("should execute query and display: Query executed successfully (0 rows returned)", async () => {
    const mockResponse = {
      data: {
        rows: [],
      },
    };
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    render(<App />);
    const textarea = screen.getByPlaceholderText(
      /Enter your SQL queries here/i
    );
    await userEvent.type(textarea, "SELECT * FROM test;");

    const runButton = screen.getByText("Run Query");
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByText("1 Query")).toBeInTheDocument();
      expect(
        screen.getByText("Query executed successfully (0 rows returned)")
      ).toBeInTheDocument();
      expect(textarea).toHaveValue("");
    });
  });

  test("should display error for SQL query without semicolon", async () => {
    render(<App />);
    const textarea = screen.getByPlaceholderText(
      /Enter your SQL queries here/i
    );
    await userEvent.type(textarea, "SELECT * FROM test");

    const runButton = screen.getByText("Run Query");
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Invalid SQL syntax: Each SQL statement must end with a semicolon (;)"
        )
      ).toBeInTheDocument();
    });
  });

  test("should display error for SQL query without valid command", async () => {
    render(<App />);
    const textarea = screen.getByPlaceholderText(
      /Enter your SQL queries here/i
    );
    await userEvent.type(textarea, "TEST * FROM test;");

    const runButton = screen.getByText("Run Query");
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          `Invalid SQL syntax: "TEST * FROM test". Query must start with a valid SQL command.`
        )
      ).toBeInTheDocument();
    });
  });

  test("should handle API error response via data property", async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { error: "Some network error" } },
    });

    render(<App />);
    const textarea = screen.getByPlaceholderText(
      /Enter your SQL queries here/i
    );
    await userEvent.type(textarea, "SELECT * FROM test;");

    const runButton = screen.getByText("Run Query");
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByText("Some network error")).toBeInTheDocument();
    });
  });

  test("should handle API error response via message property", async () => {
    mockedAxios.post.mockRejectedValueOnce({ message: "Some network error" });

    render(<App />);
    const textarea = screen.getByPlaceholderText(
      /Enter your SQL queries here/i
    );
    await userEvent.type(textarea, "SELECT * FROM test;");

    const runButton = screen.getByText("Run Query");
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByText("Some network error")).toBeInTheDocument();
    });
  });

  test("should handle unknown error", async () => {
    mockedAxios.post.mockRejectedValueOnce({});

    render(<App />);
    const textarea = screen.getByPlaceholderText(
      /Enter your SQL queries here/i
    );
    await userEvent.type(textarea, "SELECT * FROM test;");

    const runButton = screen.getByText("Run Query");
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByText("An unknown error occurred")).toBeInTheDocument();
    });
  });

  test("should handle missing API URL configuration", async () => {
    const originalEnv = import.meta.env.VITE_API_URL;
    import.meta.env.VITE_API_URL = "";

    render(<App />);
    const textarea = screen.getByPlaceholderText(
      /Enter your SQL queries here/i
    );
    await userEvent.type(textarea, "SELECT * FROM test;");

    const runButton = screen.getByText("Run Query");
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Unable to connect to the server. Please try again later or contact support."
        )
      ).toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalledWith(
        "API URL is not configured. Please set VITE_API_URL environment variable."
      );
    });
    import.meta.env.VITE_API_URL = originalEnv;
  });
});
