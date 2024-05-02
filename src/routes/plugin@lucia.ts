import {
  globalAction$,
  routeLoader$,
  z,
  zod$,
  type RequestHandler,
} from "@builder.io/qwik-city";
import { generateState } from "arctic";
import { type Session, type User } from "lucia";
import { github, lucia } from "~/auth";

export const onRequest: RequestHandler = async ({ cookie, sharedMap }) => {
  const sessionId = cookie.get(lucia.sessionCookieName)?.value;

  if (!sessionId) {
    sharedMap.set("user", null);
    sharedMap.set("session", null);

    return;
  }

  const { session, user } = await lucia.validateSession(sessionId);

  if (session && session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id);

    cookie.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  }

  if (!session) {
    const sessionCookie = lucia.createBlankSessionCookie();

    cookie.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes,
    });
  }

  sharedMap.set("user", user);
  sharedMap.set("session", session);
};

export const useAuthSession = routeLoader$((req) => {
  return {
    session: req.sharedMap.get("session") as Session | null,
    user: req.sharedMap.get("user") as User | null,
  };
});

export const useAuthSignin = globalAction$(
  async (data, { redirect, fail, cookie }) => {
    if (data.providerId !== "github") {
      return fail(400, { message: "Invalid provider" });
    }

    const state = generateState();

    const url = await github.createAuthorizationURL(state);

    cookie.set("github_oauth_state", state, {
      path: "/",
      secure: import.meta.env.PROD,
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: "lax",
    });

    throw redirect(302, url.toString());
  },
  zod$({
    providerId: z.string().optional(),
    callbackUrl: z.string().optional(),
  }),
);

export const useAuthSignout = globalAction$(
  async ({ callbackUrl = "/login" }, { sharedMap, redirect, cookie }) => {
    const session = sharedMap.get("session") as Session | null;

    if (!session) {
      throw redirect(302, callbackUrl);
    }

    await lucia.invalidateSession(session.id);

    const sessionCookie = lucia.createBlankSessionCookie();

    cookie.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes,
    });

    throw redirect(302, callbackUrl);
  },
  zod$({ callbackUrl: z.string().optional() }),
);
