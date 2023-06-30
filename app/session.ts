import { createCookieSessionStorage } from "@remix-run/node";

export const { commitSession, destroySession, getSession } =
  createCookieSessionStorage({
    cookie: {
      secrets: ["afipamo"]
    },
  });
