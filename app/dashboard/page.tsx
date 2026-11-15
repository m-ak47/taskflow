export const instant = false
import { auth, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { createTask, deleteTask, updateTaskStatus } from "@/actions/tasks"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">TaskFlow Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Hello, {session.user.name || session.user.email}</span>
            <form
              action={async () => {
                "use server"
                await signOut({ redirectTo: "/login" })
              }}
            >
              <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                Logout
              </button>
            </form>
          </div>
        </div>

        {/* Create Task Form */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
          <form action={createTask} className="space-y-4">
            <input
              type="text"
              name="title"
              placeholder="Task title"
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <textarea
              name="description"
              placeholder="Description (optional)"
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows={2}
            />
            <div className="flex gap-4">
              <select name="priority" className="border border-gray-300 rounded px-3 py-2">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
              <select name="status" className="border border-gray-300 rounded px-3 py-2">
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Add Task
              </button>
            </div>
          </form>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center">No tasks yet. Create one above!</p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{task.title}</h3>
                  {task.description && (
                    <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                  )}
                  <div className="flex gap-3 mt-2 text-sm">
                    <span className="bg-gray-200 px-2 py-1 rounded">{task.status}</span>
                    <span className="bg-blue-100 px-2 py-1 rounded">{task.priority}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <form action={updateTaskStatus.bind(null, task.id, "DONE")}>
                    <button className="text-green-600 hover:underline text-sm">Done</button>
                  </form>
                  <form action={deleteTask.bind(null, task.id)}>
                    <button className="text-red-600 hover:underline text-sm">Delete</button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}