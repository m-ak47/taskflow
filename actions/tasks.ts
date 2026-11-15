"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
})

export async function createTask(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const validated = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    status: formData.get("status") || "TODO",
    priority: formData.get("priority") || "MEDIUM",
  })

  if (!validated.success) return

  await prisma.task.create({
    data: {
      ...validated.data,
      userId: session.user.id,
    },
  })

  revalidatePath("/dashboard")
}

export async function updateTaskStatus(taskId: string, status: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.task.updateMany({
    where: { id: taskId, userId: session.user.id },
    data: { status },
  })

  revalidatePath("/dashboard")
}

export async function deleteTask(taskId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.task.deleteMany({
    where: { id: taskId, userId: session.user.id },
  })

  revalidatePath("/dashboard")
}