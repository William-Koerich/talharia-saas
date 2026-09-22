-- Fase 10: self-service (trial) e billing. Sem gateway de pagamento — a
-- assinatura é ativada manualmente (cobrança combinada fora do sistema);
-- aqui só modelamos o estado de acesso.

alter table public.tenants
  add column trial_termina_em timestamptz not null default (now() + interval '14 days'),
  add column assinatura_ativa boolean not null default false;

-- Tenants que já existiam antes desta fase continuam com acesso liberado —
-- não é justo aplicar trial retroativo a quem já estava usando o sistema.
update public.tenants set assinatura_ativa = true;
