export const validateSQL = (query: string): string | null => {
  if (!query.trim().endsWith(";")) {
    return "Invalid SQL syntax: Each SQL statement must end with a semicolon (;)";
  }

  const basicSyntaxRegex =
    /^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|WITH|SHOW|DESCRIBE|EXPLAIN)\s+.+/i;
  const queries = splitQueries(query);

  for (const singleQuery of queries) {
    if (!basicSyntaxRegex.test(singleQuery)) {
      return `Invalid SQL syntax: "${singleQuery}". Query must start with a valid SQL command.`;
    }
  }

  return null;
};

export const splitQueries = (query: string): string[] => {
  return query
    .split(";")
    .map((q) => q.trim())
    .filter((q) => q.length > 0);
};