"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

export type TransactionFormState =
  | { errors?: { amount?: string[]; description?: string[]; category?: string[]; date?: string[] }; message?: string; success?: boolean }
  | undefined;

export async function createTransaction(
  state: TransactionFormState,
  formData: FormData
): Promise<TransactionFormState> {
  const session = await verifySession();

  const amountStr = formData.get("amount") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const type = formData.get("type") as string;
  const dateStr = formData.get("date") as string;
  const isRecurring = formData.get("isRecurring") === "on";

  const errors: { amount?: string[]; description?: string[]; category?: string[]; date?: string[] } = {};
  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) errors.amount = ["Amount must be a positive number."];
  if (!description?.trim()) errors.description = ["Description is required."];
  if (!category) errors.category = ["Category is required."];
  if (!dateStr) errors.date = ["Date is required."];

  if (Object.keys(errors).length > 0) return { errors };

  await prisma.transaction.create({
    data: {
      userId: session.userId,
      amount,
      description: description.trim(),
      category,
      type: type === "INCOME" ? "INCOME" : "EXPENSE",
      isRecurring,
      date: new Date(dateStr),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");
  return { success: true };
}

export async function deleteTransaction(id: string) {
  const session = await verifySession();

  await prisma.transaction.deleteMany({
    where: { id, userId: session.userId },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");
}
