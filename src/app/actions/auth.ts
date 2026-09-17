"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
  const nome = String(formData.get("nome") ?? "").trim();
  const nomeEmpresa = String(formData.get("nomeEmpresa") ?? "").trim();
  const email = String(formData.get("email") ?? "");
  const senha = String(formData.get("senha") ?? "");

  if (!nome) {
    return { erro: "Informe seu nome." };
  }

  if (!nomeEmpresa) {
    return { erro: "Informe o nome da empresa." };
  }

  // Cria a conta já confirmada via service role: o cadastro é self-service e
  // não deve depender de e-mail de confirmação chegar (nem do provedor de
  // e-mail padrão do Supabase, com limite de envio bem baixo).
  const admin = createAdminClient();

  const { data: novoUsuario, error: signUpError } =
    await admin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: { full_name: nome },
    });

  if (signUpError || !novoUsuario.user) {
    return {
      erro:
        signUpError?.code === "email_exists"
          ? "Já existe uma conta com esse e-mail."
          : "Não foi possível criar a conta.",
    };
  }

  const { data: tenant, error: tenantError } = await admin
    .from("tenants")
    .insert({ nome: nomeEmpresa })
    .select("id")
    .single();

  if (tenantError) {
    await admin.auth.admin.deleteUser(novoUsuario.user.id);
    return { erro: "Não foi possível criar a empresa. Tente novamente." };
  }

  const { error: membershipError } = await admin.from("memberships").insert({
    tenant_id: tenant.id,
    user_id: novoUsuario.user.id,
    role: "OWNER",
    nome,
    email,
  });

  if (membershipError) {
    await admin.auth.admin.deleteUser(novoUsuario.user.id);
    return { erro: "Não foi possível vincular o usuário à empresa." };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (signInError) {
    return { erro: "Conta criada. Faça login na tela de entrar." };
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
