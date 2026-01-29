import { ApolloLink } from "@apollo/client";
import { onError } from "@apollo/client/link/error";

import { addBreadcrumb } from "~/utils/sentry";

const queryLogger = new ApolloLink((operation, forward) => {
  const { operationName, query } = operation;
  const definition = query.definitions[0];

  const breadcrumb = {
    type: "query" as const,
    level: "info" as const,
    data: {
      name: operationName,
      kind:
        definition.kind === "OperationDefinition"
          ? definition.operation
          : "Unknown",
    },
  };

  addBreadcrumb({ ...breadcrumb, category: "started" });

  return forward(operation).map((data) => {
    addBreadcrumb({ ...breadcrumb, category: "finished" });

    return data;
  });
});

const errorLogger = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, path }) =>
      addBreadcrumb({
        type: "query" as const,
        level: "error" as const,
        category: "GraphQL Error",
        data: {
          message,
          path,
        },
      })
    );

  if (networkError) {
    addBreadcrumb({
      type: "query" as const,
      level: "error" as const,
      category: "Network Error",
      data: {
        message: networkError.message,
        statusCode: (networkError as any).statusCode,
        response: (networkError as any).response,
      },
    });
  }
});

const sentryLink = errorLogger.concat(queryLogger);

export default sentryLink;
