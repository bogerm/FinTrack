"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

export type CreateApiKeyState =
  | { errors?: { name?: string[] }; createdKey?: string; success?: boolean }
  | undefined;

export async function createApiKey(
  state: CreateApiKeyState,
  formData: FormData
): Promise<CreateApiKeyState> {
  const session = await verifySession();
  const name = (formData.get("name") as string)?.trim();

  if (!name) return { errors: { name: ["Key name is required."] } };
  if (name.length > 50) return { errors: { name: ["Name must be 50 characters or less."] } };

  const key = "ft_" + randomBytes(24).toString("hex");

  await prisma.apiKey.create({
    data: { userId: session.userId, key, name },
  });

  revalidatePath("/dashboard/api-keys");
  return { success: true, createdKey: key };
}

export async function revokeApiKey(id: string) {
  const session = await verifySession();
  await prisma.apiKey.deleteMany({ where: { id, userId: session.userId } });
  revalidatePath("/dashboard/api-keys");
}
