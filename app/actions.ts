"use server";

import { revalidatePath } from "next/cache";
import {
  createAgent,
  createDecision,
  createHandoff,
  createOpportunity,
  createProject,
  createResearch,
  createTask,
  deleteAgent,
  deleteDecision,
  deleteOpportunity,
  deleteProject,
  deleteResearch,
  deleteTask,
  toggleTaskStatus,
  updateAgent,
  updateProjectMeta,
  updateProjectNotes,
  updateTaskNotes,
} from "@/lib/data";
import type { Opportunity, Project, Task } from "@/lib/db/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

function fail(e: unknown): ActionResult {
  return { ok: false, error: e instanceof Error ? e.message : "Something went wrong" };
}

export async function createProjectAction(formData: FormData): Promise<ActionResult> {
  try {
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return { ok: false, error: "Name is required" };
    const priority = String(formData.get("priority") ?? "medium") as Project["priority"];
    await createProject({ name, priority });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function createTaskAction(formData: FormData): Promise<ActionResult> {
  try {
    const title = String(formData.get("title") ?? "").trim();
    if (!title) return { ok: false, error: "Title is required" };
    const projectId = String(formData.get("projectId") ?? "") || null;
    await createTask({ title, projectId });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function createOpportunityAction(formData: FormData): Promise<ActionResult> {
  try {
    const title = String(formData.get("title") ?? "").trim();
    if (!title) return { ok: false, error: "Title is required" };
    const potential = String(formData.get("potential") ?? "medium") as Opportunity["potential"];
    const nextAction = String(formData.get("nextAction") ?? "").trim() || null;
    await createOpportunity({ title, potential, nextAction });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function createDecisionAction(formData: FormData): Promise<ActionResult> {
  try {
    const decision = String(formData.get("decision") ?? "").trim();
    if (!decision) return { ok: false, error: "Decision is required" };
    const projectId = String(formData.get("projectId") ?? "") || null;
    await createDecision({ decision, projectId });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function toggleTaskStatusAction(
  id: string,
  current: Task["status"],
): Promise<ActionResult> {
  try {
    await toggleTaskStatus(id, current);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteTaskAction(id: string): Promise<ActionResult> {
  try {
    await deleteTask(id);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteProjectAction(id: string): Promise<ActionResult> {
  try {
    await deleteProject(id);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function updateProjectMetaAction(
  id: string,
  patch: { priority?: Project["priority"]; status?: Project["status"] },
): Promise<ActionResult> {
  try {
    await updateProjectMeta(id, patch);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteOpportunityAction(id: string): Promise<ActionResult> {
  try {
    await deleteOpportunity(id);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function createResearchAction(formData: FormData): Promise<ActionResult> {
  try {
    const title = String(formData.get("title") ?? "").trim();
    if (!title) return { ok: false, error: "Title is required" };
    const sourceUrl = String(formData.get("sourceUrl") ?? "").trim() || null;
    const summary = String(formData.get("summary") ?? "").trim() || null;
    await createResearch({ title, sourceUrl, summary });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteResearchAction(id: string): Promise<ActionResult> {
  try {
    await deleteResearch(id);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteDecisionAction(id: string): Promise<ActionResult> {
  try {
    await deleteDecision(id);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function updateProjectNotesAction(id: string, notes: string): Promise<ActionResult> {
  try {
    await updateProjectNotes(id, notes);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function updateTaskNotesAction(id: string, notes: string): Promise<ActionResult> {
  try {
    await updateTaskNotes(id, notes);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function createAgentAction(formData: FormData): Promise<ActionResult> {
  try {
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return { ok: false, error: "Name is required" };
    const role = String(formData.get("role") ?? "").trim() || "Custom agent";
    await createAgent({ name, role });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function updateAgentAction(
  id: string,
  patch: { name?: string; role?: string; system_prompt?: string; color?: string; enabled?: boolean },
): Promise<ActionResult> {
  try {
    await updateAgent(id, patch);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteAgentAction(id: string): Promise<ActionResult> {
  try {
    await deleteAgent(id);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function saveHandoffAction(scope: string, content: string): Promise<ActionResult> {
  try {
    await createHandoff(scope, content);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
