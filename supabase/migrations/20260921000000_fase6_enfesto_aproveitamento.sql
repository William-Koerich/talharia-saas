-- Fase 6: enfesto e aproveitamento.

alter table public.rolos add column custo_metro numeric(10, 2);

-- enfestos/enfesto_rolos/sobras vieram da Fase 1 com a policy genérica de
-- isolamento por tenant (qualquer membro, inclusive OPERADOR, podia
-- escrever). Registro de enfesto é do gestor; leitura livre no tenant.
do $$
declare
  tabela text;
  tabelas text[] := array['enfestos', 'enfesto_rolos', 'sobras'];
begin
  foreach tabela in array tabelas loop
    execute format('drop policy %I on public.%I', 'Isolamento por tenant', tabela);

    execute format(
      'create policy %I on public.%I for select to authenticated using (tenant_id in (select public.tenant_ids_do_usuario()))',
      'Ver do próprio tenant', tabela
    );

    execute format(
      'create policy %I on public.%I for insert to authenticated with check (tenant_id in (select public.tenant_ids_como_gestor()))',
      'Gestor insere no próprio tenant', tabela
    );

    execute format(
      'create policy %I on public.%I for update to authenticated using (tenant_id in (select public.tenant_ids_como_gestor())) with check (tenant_id in (select public.tenant_ids_como_gestor()))',
      'Gestor atualiza no próprio tenant', tabela
    );

    execute format(
      'create policy %I on public.%I for delete to authenticated using (tenant_id in (select public.tenant_ids_como_gestor()))',
      'Gestor exclui no próprio tenant', tabela
    );
  end loop;
end $$;

-- Consumo teórico × real por OS (metros e %). security_invoker é essencial
-- aqui: sem isso a view rodaria com os privilégios de quem a criou, não do
-- usuário que está consultando, e vazaria dado entre tenants.
create view public.os_aproveitamento
with (security_invoker = true) as
select
  os.id as os_id,
  os.tenant_id,
  os.numero,
  os.cliente_id,
  c.nome as cliente_nome,
  m.id as modelo_id,
  m.nome as modelo_nome,
  os.created_at,
  coalesce(teorico.consumo_teorico, 0) as consumo_teorico,
  coalesce(real_.consumo_real, 0) as consumo_real,
  coalesce(real_.consumo_real, 0) - coalesce(teorico.consumo_teorico, 0) as perda_metros,
  case
    when coalesce(real_.consumo_real, 0) > 0
      then round(
        (coalesce(real_.consumo_real, 0) - coalesce(teorico.consumo_teorico, 0))
        / real_.consumo_real * 100,
        2
      )
    else null
  end as perda_percentual
from public.ordens_servico os
join public.clientes c on c.id = os.cliente_id
join public.modelo_versoes mv on mv.id = os.modelo_versao_id
join public.modelos m on m.id = mv.modelo_id
left join lateral (
  select sum(g.quantidade * ct.consumo_metros) as consumo_teorico
  from public.os_grades g
  join public.consumo_teorico_tamanho ct
    on ct.modelo_versao_id = os.modelo_versao_id and ct.tamanho = g.tamanho
  where g.os_id = os.id
) teorico on true
left join lateral (
  select sum(e.folhas * e.comprimento) as consumo_real
  from public.enfestos e
  where e.os_id = os.id
) real_ on true;

grant select on public.os_aproveitamento to authenticated;
