import {
  saveMessageAndTask,
  saveNotificationToDB,
} from "@/actions/notifications/notifications-actions";
import { verifyToken } from "@/actions/token/token-actions";
import prisma from "@/lib/prisma";
import { Task } from "@/types/tasks-types";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function PUT(req: NextRequest) {
  {
    /*verify the existence of the jwt token*/
  }
  const cookieStore = cookies();
  const tokenFromCookie = cookieStore.get("tokenLogin")?.value;
  const tokenFromHeaders = req.headers.get("Authorization")?.split(" ")[1];
  const token = tokenFromCookie || tokenFromHeaders;

  if (req.method !== "PUT") {
    return NextResponse.json({ message: "Method not allowed", status: 405 });
  }

  if (!token) {
    return NextResponse.json({ message: "Token not found", status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    verifyToken(payload);

    const { email } = payload;

    const {
      id,
      title,
      description,
      user,
      status,
      group,
      typeOfAssigned,
      dueDate,
      priority,
      newComment,
    } = await req.json();

    let updatedComments: string | any[] = [];
    if (newComment) {
      const userFromDb = await prisma.user.findUnique({
        where: { email: email as string },
        select: { id: true },
      });

      if (!userFromDb) {
        return NextResponse.json({ message: "User not found", status: 404 });
      }

      updatedComments = [
        { content: newComment, createdAt: new Date(), userId: userFromDb.id },
      ];
    }

    {
      /*Update and format a task to sendit to the front*/
    }
    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        assignedToGroupId: typeOfAssigned !== "person" ? group : null,
        assignedToUserId: typeOfAssigned === "person" ? user : null,
        statusId: status,
        priorityId: priority,
        dueDate: dueDate,
        comments:
          updatedComments.length > 0 ? { create: updatedComments } : undefined,
      },
      include: {
        group: { select: { name: true, id: true } },
        user: { select: { name: true, id: true } },
        priority: { select: { name: true, id: true } },
        status: { select: { name: true, id: true } },
        comments: {
          select: { content: true, user: { select: { name: true, id: true } } },
        },
      },
    });

    const formattedTask: Task = {
      id: task.id,
      title: task.title,
      status: task.status,
      user: task.user ?? null,
      group: task.group ?? null,
      dueDate: task.dueDate,
      priority: task.priority,
      description: task.description,
      comments: task.comments ?? [],
      creationDate: task.creationDate,
    };

    await saveMessageAndTask(
      formattedTask,
      token,
      `La tarea "${formattedTask.title}" ha sido actualizada.`,
    );
    return NextResponse.json({
      message: "Task updated successfully",
      data: formattedTask,
      status: 200,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "EXPIRED-TOKEN"
    ) {
      return NextResponse.json({
        message: "Token has expired",
        data: [],
        status: 401,
      });
    }
    console.error("Error updating task:", error);
    return NextResponse.json({ message: "Internal server error", status: 500 });
  }
}
