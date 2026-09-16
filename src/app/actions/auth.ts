"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EstadoFormAuth = { erro: string | null };

export async function entrar(
  _estado: EstadoFormAuth,
  formData: FormData,
): Promise<EstadoFormAuth> {
  const email = String(formData.get("email") ?? "");
  const senha = String(formData.get("senha") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    return { erro: "E-mail ou senha inválidos." };
  }

  revalidatePath("/", "layout");
  redirect("/painel");
}

export async function cadastrar(
  _estado: EstadoFormAuth,
  formData: FormData,
): Promise<EstadoFormAuth> {
  const nomeEmpresa = String(formData.get("nomeEmpresa") ?? "").trim();
  const email = String(formData.get("email") ?? "");
  const senha = String(formData.get("senha") ?? "");

  if (!nomeEmpresa) {
    return { erro: "Informe o nome da empresa." };
  }

  const supabase = await createClient();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password: senha,
  });

  if (signUpError || !signUpData.user) {
    return { erro: signUpError?.message ?? "Não foi possível criar a conta." };
  }

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .insert({ nome: nomeEmpresa })
    .select("id")
    .single();

  if (tenantError) {
    return { erro: "Não foi possível criar a empresa. Tente novamente." };
  }

  const { error: membershipError } = await supabase.from("memberships").insert({
    tenant_id: tenant.id,
    user_id: signUpData.user.id,
    role: "OWNER",
  });

  if (membershipError) {
    return { erro: "Não foi possível vincular o usuário à empresa." };
  }

  revalidatePath("/", "layout");
  redirect("/painel");
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/entrar");
}
