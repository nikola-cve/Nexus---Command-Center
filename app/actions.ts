"use server";

import { revalidatePath } from "next/cache";
import {
  createAgent,
  createDecision,
  createDepartment,
  createDocument,
  createHandoff,
  createOpportunity,
  createPhase,
  createProject,
  createResearch,
  createTask,
  createTeam,
  deleteAgent,
  deleteDecision,
  deleteDepartment,
  deleteDocument,
  deleteOpportunity,
  deletePhase,
  deleteProject,
  deleteResearch,
  deleteTask,
  deleteTeam,
  toggleTaskStatus,
  updateAgent,
  updateDepartment,
  updateDocument,
  updatePhase,
  updateProjectMeta,
  updateProjectNotes,
  updateTaskNotes,
  updateTaskPlan,
  updateTeam,
} from "@/lib/data";
import type { DocumentType, Opportunity, Phase, Project, Task } from "@/lib/db/types";

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
    const phaseId = String(formData.get("phaseId") ?? "") || null;
    const teamId = String(formData.get("teamId") ?? "") || null;
    const assigneeAgentId = String(formData.get("assigneeAgentId") ?? "") || null;
    await createTask({ title, projectId, phaseId, teamId, assigneeAgentId });
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
  patch: {
    name?: string;
    role?: string;
    system_prompt?: string;
    color?: string;
    enabled?: boolean;
    team_id?: string | null;
    model?: string;
    skills?: string[];
    tools?: string[];
  },
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

// ---- Organization actions ----

export async function createDepartmentAction(formData: FormData): Promise<ActionResult> {
  try {
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return { ok: false, error: "Name is required" };
    await createDepartment({ name });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function updateDepartmentAction(
  id: string,
  patch: { name?: string; description?: string; color?: string; icon?: string },
): Promise<ActionResult> {
  try {
    await updateDepartment(id, patch);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteDepartmentAction(id: string): Promise<ActionResult> {
  try {
    await deleteDepartment(id);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function createTeamAction(formData: FormData): Promise<ActionResult> {
  try {
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return { ok: false, error: "Name is required" };
    const departmentId = String(formData.get("departmentId") ?? "");
    if (!departmentId) return { ok: false, error: "Department is required" };
    await createTeam({ name, departmentId });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function updateTeamAction(
  id: string,
  patch: { name?: string; description?: string; department_id?: string | null },
): Promise<ActionResult> {
  try {
    await updateTeam(id, patch);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteTeamAction(id: string): Promise<ActionResult> {
  try {
    await deleteTeam(id);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ---- Plan actions (phases + task plan) ----

export async function createPhaseAction(formData: FormData): Promise<ActionResult> {
  try {
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return { ok: false, error: "Name is required" };
    const projectId = String(formData.get("projectId") ?? "");
    if (!projectId) return { ok: false, error: "Project is required" };
    await createPhase({ projectId, name });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function updatePhaseAction(
  id: string,
  patch: { name?: string; status?: Phase["status"]; sort?: number },
): Promise<ActionResult> {
  try {
    await updatePhase(id, patch);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deletePhaseAction(id: string): Promise<ActionResult> {
  try {
    await deletePhase(id);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function updateTaskPlanAction(
  id: string,
  patch: {
    phase_id?: string | null;
    assignee_agent_id?: string | null;
    team_id?: string | null;
    depends_on?: string[];
    start_date?: string | null;
    due?: string | null;
    priority?: Task["priority"];
    status?: Task["status"];
    requires_approval?: boolean;
    title?: string;
    sort?: number;
  },
): Promise<ActionResult> {
  try {
    await updateTaskPlan(id, patch);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ---- Document actions ----

export async function createDocumentAction(formData: FormData): Promise<ActionResult> {
  try {
    const projectId = String(formData.get("projectId") ?? "");
    if (!projectId) return { ok: false, error: "Project is required" };
    const type = (String(formData.get("type") ?? "note") || "note") as DocumentType;
    const title = String(formData.get("title") ?? "").trim() || "Untitled";
    await createDocument({ projectId, type, title });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function updateDocumentAction(
  id: string,
  patch: { title?: string; content?: string },
): Promise<ActionResult> {
  try {
    await updateDocument(id, patch);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteDocumentAction(id: string): Promise<ActionResult> {
  try {
    await deleteDocument(id);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
