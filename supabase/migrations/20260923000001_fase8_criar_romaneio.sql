-- Cria o romaneio e vincula os fardos selecionados numa única transação.
create function public.criar_romaneio(
  p_tenant_id uuid,
  p_cliente_id uuid,
  p_fardo_ids uuid[]
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_romaneio_id uuid;
  v_fardo_id uuid;
begin
  insert into public.romaneios (tenant_id, cliente_id)
  values (p_tenant_id, p_cliente_id)
  returning id into v_romaneio_id;

  foreach v_fardo_id in array p_fardo_ids loop
    insert into public.romaneio_itens (tenant_id, romaneio_id, fardo_id)
    values (p_tenant_id, v_romaneio_id, v_fardo_id);
  end loop;

  return v_romaneio_id;
end;
$$;
