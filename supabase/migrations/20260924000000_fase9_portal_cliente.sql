-- Fase 9: portal do cliente. Link público por cliente (token, sem senha) pra
-- ver o andamento das OS e baixar o romaneio quando entregue. O acesso é via
-- Server Component/Route Handler usando a service role (filtrando pelo token
-- explicitamente em cada query) — não é exposto a RLS de `anon`.

alter table public.clientes
  add column portal_token uuid not null default gen_random_uuid();

create unique index clientes_portal_token_key on public.clientes (portal_token);

create function public.regenerar_portal_token(p_cliente_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_token uuid;
begin
  update public.clientes
  set portal_token = gen_random_uuid()
  where id = p_cliente_id
  returning portal_token into v_token;

  return v_token;
end;
$$;
