"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    redirect("/login?error=" + encodeURIComponent("Email and password are required."));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message));
  }

  // Optional single-user guard: if ALLOWED_EMAIL is set, only that account may enter.
  const allowed = process.env.ALLOWED_EMAIL;
  if (allowed && email.toLowerCase() !== allowed.toLowerCase()) {
    await supabase.auth.signOut();
    redirect("/login?error=" + encodeURIComponent("This account is not allowed."));
  }

  revalidatePath("/", "layout");
  redirect("/mission-control");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
