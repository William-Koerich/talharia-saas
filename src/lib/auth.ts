import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type MembershipRole = "OWNER" | "ADMIN" | "OPERADOR";

export type SessaoAtual = {
  userId: string;
  email: string | null;
  nome: string;
  tenantId: string;
  tenantNome: string;
  role: MembershipRole;
  assinaturaAtiva: boolean;
  trialTerminaEm: string;
  trialExpirado: boolean;
  diasRestantesTrial: number;
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
    .select(
      "tenant_id, role, nome, tenants(nome, assinatura_ativa, trial_termina_em)",
    )
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) return null;

  const tenant = membership.tenants as unknown as {
    nome: string;
    assinatura_ativa: boolean;
    trial_termina_em: string;
  };

  const trialTerminaEm = new Date(tenant.trial_termina_em);
  const trialExpirado =
    !tenant.assinatura_ativa && new Date() >= trialTerminaEm;
  const diasRestantesTrial = Math.max(
    0,
    Math.ceil((trialTerminaEm.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  return {
    userId: user.id,
    email: user.email ?? null,
    nome: membership.nome,
    tenantId: membership.tenant_id,
    tenantNome: tenant.nome,
    role: membership.role,
    assinaturaAtiva: tenant.assinatura_ativa,
    trialTerminaEm: tenant.trial_termina_em,
    trialExpirado,
    diasRestantesTrial,
  };
}

/**
 * Cadastros (clientes, máquinas, usuários etc.) são restritos a OWNER/ADMIN.
 * Redireciona OPERADOR e visitantes não autenticados para fora da página.
 */
export async function exigirGestor(): Promise<SessaoAtual> {
  const sessao = await getSessaoAtual();
  if (!sessao) redirect("/entrar");
  if (sessao.role === "OPERADOR") redirect("/painel");
  return sessao;
}
