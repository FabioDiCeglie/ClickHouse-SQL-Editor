export type QueryState = {
  current: string;
  executed: string[];
}

export type ExecutionState = {
  results: QueryResult[][];
  isLoading: boolean;
  error: string | null;
}

export type QueryResult = {
  [key: string]: string | number | boolean | null;
}
