import { Handler } from "@netlify/functions";

export const handler: Handler = async (event, context) => {
  console.log("Debug function called", {
    path: event.path,
    httpMethod: event.httpMethod,
    headers: event.headers,
    queryStringParameters: event.queryStringParameters,
  });

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      message: "Debug endpoint working",
      timestamp: new Date().toISOString(),
      path: event.path,
      method: event.httpMethod,
      env: {
        hasDatabase: !!process.env.NETLIFY_DATABASE_URL || !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
      },
    }),
  };
};
