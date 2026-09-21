-- Fase 7: custos, margem e tempo padrão.

alter table public.memberships add column custo_hora numeric(10, 2);

-- Custo da OS = tempo de máquina (setup+produtivo, sem parada) × custo_hora
-- da máquina + o mesmo tempo × custo_hora de quem apontou (mão de obra) +
-- consumíveis + tecido só quando o rolo é próprio (tecido do cliente não é
-- custo da talharia). security_invoker pra respeitar a RLS de cada tenant.
create view public.os_custos
with (security_invoker = true) as
select
  os.id as os_id,
  os.tenant_id,
  os.numero,
  os.preco_acordado,
  coalesce(maquina.custo, 0) as custo_maquina,
  coalesce(mao_de_obra.custo, 0) as custo_mao_de_obra,
  coalesce(consumiveis.custo, 0) as custo_consumiveis,
  coalesce(tecido.custo, 0) as custo_tecido_proprio,
  coalesce(maquina.custo, 0) + coalesce(mao_de_obra.custo, 0)
    + coalesce(consumiveis.custo, 0) + coalesce(tecido.custo, 0) as custo_total,
  os.preco_acordado - (
    coalesce(maquina.custo, 0) + coalesce(mao_de_obra.custo, 0)
    + coalesce(consumiveis.custo, 0) + coalesce(tecido.custo, 0)
  ) as margem,
  case
    when os.preco_acordado > 0 then round(
      (os.preco_acordado - (
        coalesce(maquina.custo, 0) + coalesce(mao_de_obra.custo, 0)
        + coalesce(consumiveis.custo, 0) + coalesce(tecido.custo, 0)
      )) / os.preco_acordado * 100,
      2
    )
    else null
  end as margem_percentual
from public.ordens_servico os
left join lateral (
  select sum(extract(epoch from (a.fim - a.inicio)) / 3600 * m.custo_hora) as custo
  from public.apontamentos a
  join public.maquinas m on m.id = a.maquina_id
  where a.os_id = os.id and a.tipo in ('setup', 'produtivo') and a.fim is not null
) maquina on true
left join lateral (
  select sum(extract(epoch from (a.fim - a.inicio)) / 3600 * mb.custo_hora) as custo
  from public.apontamentos a
  join public.memberships mb on mb.id = a.operador_membership_id
  where a.os_id = os.id and a.tipo in ('setup', 'produtivo') and a.fim is not null
) mao_de_obra on true
left join lateral (
  select sum(co.quantidade * c.custo_unitario) as custo
  from public.consumo_os co
  join public.consumiveis c on c.id = co.consumivel_id
  where co.os_id = os.id
) consumiveis on true
left join lateral (
  select sum(orc.metros_consumidos * r.custo_metro) as custo
  from public.os_rolo_consumo orc
  join public.rolos r on r.id = orc.rolo_id
  where orc.os_id = os.id and r.origem = 'proprio' and r.custo_metro is not null
) tecido on true;

grant select on public.os_custos to authenticated;

-- Tempo padrão por modelo/operação: média de horas por peça produzida,
-- só a partir de 3 apontamentos produtivos concluídos com quantidade > 0.
create view public.tempo_padrao_modelo_operacao
with (security_invoker = true) as
select
  os.tenant_id,
  mv.modelo_id,
  a.operacao_id,
  count(*) as execucoes,
  avg(extract(epoch from (a.fim - a.inicio)) / 3600 / a.qtd_produzida) as horas_por_peca
from public.apontamentos a
join public.ordens_servico os on os.id = a.os_id
join public.modelo_versoes mv on mv.id = os.modelo_versao_id
where a.tipo = 'produtivo' and a.fim is not null and a.qtd_produzida > 0
group by os.tenant_id, mv.modelo_id, a.operacao_id
having count(*) >= 3;

grant select on public.tempo_padrao_modelo_operacao to authenticated;
