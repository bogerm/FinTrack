"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";

type SignupState = { errors?: { name?: string[]; email?: string[]; password?: string[] }; message?: string } | undefined;
type SigninState = { message?: string } | undefined;

export async function signup(state: SignupState, formData: FormData): Promise<SignupState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const errors: { name?: string[]; email?: string[]; password?: string[] } = {};
  if (!name || name.trim().length < 2) errors.name = ["Name must be at least 2 characters."];
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = ["Please enter a valid email."];
  if (!password || password.length < 8) errors.password = ["Password must be at least 8 characters."];

  if (Object.keys(errors).length > 0) return { errors };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { errors: { email: ["An account with this email already exists."] } };

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name: name.trim(), email: email.toLowerCase().trim(), passwordHash },
  });

  await createSession({ id: user.id, name: user.name, email: user.email });
  redirect("/dashboard");
}

export async function signin(state: SigninState, formData: FormData): Promise<SigninState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await prisma.user.findUnique({ where: { email: email?.toLowerCase().trim() } });
  if (!user) return { message: "Invalid email or password." };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { message: "Invalid email or password." };

  await createSession({ id: user.id, name: user.name, email: user.email });
  redirect("/dashboard");
}

export async function signout() {
  await deleteSession();
  redirect("/sign-in");
}
