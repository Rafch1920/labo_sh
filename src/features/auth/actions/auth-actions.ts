"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

type ActionResult = { error: string | null; success?: boolean };

export async function login(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message, success: false };
  }

  return { error: null, success: true };
}

export async function register(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "patient",
      },
    },
  });

  if (error) {
    return { error: error.message, success: false };
  }

  const userId = data?.user?.id;
  if (userId) {
    const { error: profileError } = await adminClient.from("profiles").insert({
      id: userId,
      email,
      full_name: fullName,
      role: "patient",
    });
    if (profileError) {
      return { error: `Erreur création profil: ${profileError.message}`, success: false };
    }
  }

  return { error: null, success: true };
}

export async function resetPassword(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password/confirm`,
  });

  if (error) {
    return { error: error.message, success: false };
  }

  return { error: null, success: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
