import { type RequestHandler } from "@builder.io/qwik-city";
import { github, lucia } from "~/auth";

import { OAuth2RequestError } from "arctic";
import { createUser, getUserByGithubId } from "~/db/queries";
import { generateIdFromEntropySize } from "lucia";

type GitHubUser = {
  id: number;
  login: string;
};
export const onGet: RequestHandler = async ({
  cookie,
  params,
  pathname,
  query,
  error,
  redirect,
}) => {
  const providerId = params.providerId;

  const code = query.get("code");

  const state = query.get("state");

  const storedState = cookie.get("github_oauth_state")?.value;

  console.log({ providerId, pathname, code, state, storedState });

  if (!code || !state || !storedState || state !== storedState) {
    throw error(400, "");
  }

  try {
    const tokens = await github.validateAuthorizationCode(code);

    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });

    const githubUser: GitHubUser = await githubUserResponse.json();

    const existingUser = await getUserByGithubId(githubUser.id);

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id.toString(), {});

      const sessionCookie = lucia.createSessionCookie(session.id);

      cookie.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );

      throw redirect(302, "/");
    }

    const userId = generateIdFromEntropySize(10);

    const [newUser] = await createUser({
      id: userId,
      githubId: githubUser.id,
      username: githubUser.login,
    });

    console.log({ newUser, userId });

    const session = await lucia.createSession(newUser.id, {});

    const sessionCookie = lucia.createSessionCookie(session.id);

    cookie.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    throw redirect(302, "/");
  } catch (e) {
    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      // invalid code

      throw error(400, "");
    }

    throw error(500, "");
  }
};
