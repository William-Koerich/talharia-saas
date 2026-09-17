-- Cria a OS com sua grade (tamanho×cor×qtd) numa única transação. Recebe a
-- grade como jsonb (array de {tamanho, cor, quantidade}) pra evitar múltiplas
-- viagens ao banco / inconsistência parcial.
create function public.criar_os(
  p_tenant_id uuid,
  p_cliente_id uuid,
  p_modelo_versao_id uuid,
  p_prazo date,
  p_preco_acordado numeric,
  p_grade jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_os_id uuid;
  v_item jsonb;
begin
  insert into public.ordens_servico (tenant_id, cliente_id, modelo_versao_id, prazo, preco_acordado)
  values (p_tenant_id, p_cliente_id, p_modelo_versao_id, p_prazo, p_preco_acordado)
  returning id into v_os_id;

  for v_item in select * from jsonb_array_elements(p_grade) loop
    insert into public.os_grades (tenant_id, os_id, tamanho, cor, quantidade)
    values (
      p_tenant_id,
      v_os_id,
      v_item ->> 'tamanho',
      v_item ->> 'cor',
      (v_item ->> 'quantidade')::integer
    );
  end loop;

  return v_os_id;
end;
$$;
