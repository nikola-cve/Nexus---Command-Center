"use server";

import { revalidatePath } from "next/cache";
import { createDecision, createProject, createTask } from "@/lib/data";
import type { Project } from "@/lib/db/types";

export async function createProjectAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const priority = (String(formData.get("priority") ?? "medium") as Project["priority"]) || "medium";
  await createProject({ name, priority });
  revalidatePath("/mission-control");
}

export async function createTaskAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const projectIdRaw = String(formData.get("projectId") ?? "");
  const projectId = projectIdRaw.length > 0 ? projectIdRaw : null;
  await createTask({ title, projectId });
  revalidatePath("/mission-control");
}

export async function createDecisionAction(formData: FormData) {
  const decision = String(formData.get("decision") ?? "").trim();
  if (!decision) return;
  const projectIdRaw = String(formData.get("projectId") ?? "");
  const projectId = projectIdRaw.length > 0 ? projectIdRaw : null;
  await createDecision({ decision, projectId });
  revalidatePath("/mission-control");
}
