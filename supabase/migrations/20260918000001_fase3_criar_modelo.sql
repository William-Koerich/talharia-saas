-- Cria o modelo e sua primeira versão (vigente) em uma única transação.
create function public.criar_modelo(p_tenant_id uuid, p_cliente_id uuid, p_nome text)
returns table(modelo_id uuid, modelo_versao_id uuid)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_modelo_id uuid;
  v_versao_id uuid;
begin
  insert into public.modelos (tenant_id, cliente_id, nome)
  values (p_tenant_id, p_cliente_id, p_nome)
  returning id into v_modelo_id;

  insert into public.modelo_versoes (tenant_id, modelo_id, versao, vigente)
  values (p_tenant_id, v_modelo_id, 1, true)
  returning id into v_versao_id;

  return query select v_modelo_id, v_versao_id;
end;
$$;
