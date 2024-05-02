import { eq } from "drizzle-orm";
import { db } from ".";
import { type CreateUser, users } from "./schema";

export async function getUserByGithubId(githubId: number) {
  return db.query.users.findFirst({
    where: (user) => eq(user.githubId, githubId),
  });
}

export async function createUser(data: CreateUser) {
  return db.insert(users).values(data).returning({ id: users.id });
}
