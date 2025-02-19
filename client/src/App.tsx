import {
  Button,
  ClickUIProvider,
  CodeBlock,
  TextAreaField,
  Title,
  Separator,
  Table,
  GridContainer,
} from "@clickhouse/click-ui";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import { splitQueries, validateSQL } from "../utils/helpers";
import { QueryState, ExecutionState } from "../utils/types";

function App() {
  const [queryState, setQueryState] = useState<QueryState>({
    current: "",
    executed: [],
  });

  const [executionState, setExecutionState] = useState<ExecutionState>({
    results: [],
    isLoading: false,
    error: null,
  });

  const executeQuery = async () => {
    const validationError = validateSQL(queryState.current);
    if (validationError) {
      setExecutionState((prev) => ({
        ...prev,
        error: validationError,
        results: [],
      }));
      return;
    }

    setExecutionState((prev) => ({ ...prev, isLoading: true }));
    try {
      const queries = splitQueries(queryState.current);
      setQueryState((prev) => ({ ...prev, executed: queries, current: "" }));

      if (!import.meta.env.VITE_API_URL) {
        console.error(
          "API URL is not configured. Please set VITE_API_URL environment variable."
        );
        setExecutionState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            "Unable to connect to the server. Please try again later or contact support.",
          results: [],
        }));
        return;
      }

      const queryPromises = queries.map((singleQuery) =>
        axios.post(`${import.meta.env.VITE_API_URL}/query`, {
          query: singleQuery,
        })
      );

      const responses = await Promise.all(queryPromises);
      const results = responses.map((response) => response.data.rows);
      setExecutionState({ results, isLoading: false, error: null });
    } catch (error) {
      console.error("Query execution failed:", error);
      const errorMessage =
        (error as AxiosError<{ error: string }>).response?.data?.error ??
        (error as Error).message ??
        "An unknown error occurred";
      setExecutionState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        results: [],
      }));
    }
  };

  return (
    <ClickUIProvider theme={"dark"}>
      <div className="main_container">
        <GridContainer isResponsive gap="xl">
          <Title type="h1">ClickHouse SQL Editor</Title>

          <TextAreaField
            value={queryState.current}
            onChange={(e: string) =>
              setQueryState((prev) => ({ ...prev, current: e }))
            }
            placeholder="Enter your SQL queries here. Use semicolons to separate multiple statements. 
          Example: SELECT * FROM example_table; SELECT age FROM example_table;"
            rows={10}
            orientation="vertical"
            dir="start"
          />

          <Button
            onClick={executeQuery}
            loading={executionState.isLoading}
            disabled={queryState.current === ""}
          >
            Run Query
          </Button>

          {executionState.error ? (
            <Title type="h2" color="muted">
              {executionState.error}
            </Title>
          ) : (
            executionState.results.length > 0 && (
              <>
                {executionState.results.map((resultSet, index) => (
                  <div key={index}>
                    <Title type="h2">{`${index + 1} Query`}</Title>
                    <Separator size="xl" />
                    {queryState.executed[index] && (
                      <CodeBlock>{`${queryState.executed[index]};`}</CodeBlock>
                    )}
                    <Separator size="xl" />
                    {resultSet.length > 0 ? (
                      <Table
                        headers={Object.keys(resultSet[0]).map((key) => ({
                          label: key.charAt(0).toUpperCase() + key.slice(1),
                        }))}
                        rows={resultSet.map((row, index) => ({
                          id: index,
                          items: Object.values(row).map((value) => ({
                            label: String(value),
                          })),
                        }))}
                        loading={executionState.isLoading}
                      />
                    ) : (
                      <Title type="h2">
                        Query executed successfully (0 rows returned)
                      </Title>
                    )}
                  </div>
                ))}
              </>
            )
          )}
        </GridContainer>
      </div>
    </ClickUIProvider>
  );
}

export default App;
