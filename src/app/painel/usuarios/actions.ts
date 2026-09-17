"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirGestor, type MembershipRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashPin } from "@/lib/pin";

export type EstadoForm = { erro: string | null };

const PAPEIS_CRIAVEIS: MembershipRole[] = ["ADMIN", "OPERADOR"];

export async function criarUsuario(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const sessao = await exigirGestor();

  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const role = String(formData.get("role") ?? "") as MembershipRole;

  if (!nome) return { erro: "Informe o nome." };
  if (!PAPEIS_CRIAVEIS.includes(role))
    return { erro: "Selecione o papel do usuário." };
  if (senha.length < 6)
    return { erro: "A senha precisa ter pelo menos 6 caracteres." };

  const admin = createAdminClient();

  const { data: novoUsuario, error: erroUsuario } =
    await admin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: { full_name: nome },
    });

  if (erroUsuario || !novoUsuario.user) {
    return {
      erro: erroUsuario?.message ?? "Não foi possível criar o usuário.",
    };
  }

  const { error: erroMembership } = await admin.from("memberships").insert({
    tenant_id: sessao.tenantId,
    user_id: novoUsuario.user.id,
    role,
    nome,
    email,
  });

  if (erroMembership) {
    await admin.auth.admin.deleteUser(novoUsuario.user.id);
    return { erro: "Não foi possível vincular o usuário à empresa." };
  }

  revalidatePath("/painel/usuarios");
  redirect("/painel/usuarios");
}

export async function removerUsuario(id: string) {
  await exigirGestor();
  const supabase = await createClient();
  await supabase.from("memberships").delete().eq("id", id);
  revalidatePath("/painel/usuarios");
}

export async function definirPin(
  membershipId: string,
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirGestor();
  const pin = String(formData.get("pin") ?? "");

  if (!/^\d{4}$/.test(pin))
    return { erro: "O PIN precisa ter exatamente 4 dígitos." };

  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("memberships")
    .select("id, tenant_id")
    .eq("id", membershipId)
    .maybeSingle();

  if (!membership) return { erro: "Usuário não encontrado." };

  const { error } = await supabase.from("pin_codes").upsert(
    {
      tenant_id: membership.tenant_id,
      membership_id: membership.id,
      pin_hash: await hashPin(pin),
    },
    { onConflict: "membership_id" },
  );

  if (error) return { erro: "Não foi possível salvar o PIN." };

  revalidatePath("/painel/usuarios");
  redirect("/painel/usuarios");
}
