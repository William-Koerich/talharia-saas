import { createClient } from "@/lib/supabase/server";

export type MembershipRole = "OWNER" | "ADMIN" | "OPERADOR";

export type SessaoAtual = {
  userId: string;
  email: string | null;
  tenantId: string;
  tenantNome: string;
  role: MembershipRole;
};

/**
 * Carrega o usuário autenticado e seu tenant/papel.
 * Assume um único tenant por usuário (regra do cadastro self-service da Fase 0).
 */
export async function getSessaoAtual(): Promise<SessaoAtual | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: membership } = await supabase
    .from("memberships")
    .select("tenant_id, role, tenants(nome)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) return null;

  return {
    userId: user.id,
    email: user.email ?? null,
    tenantId: membership.tenant_id,
    tenantNome: (membership.tenants as unknown as { nome: string }).nome,
    role: membership.role,
  };
}
