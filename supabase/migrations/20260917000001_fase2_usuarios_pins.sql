-- Fase 2: só OWNER/ADMIN podem gerenciar membros (exceto OWNER) e PINs do
-- próprio tenant. A criação de um novo membro continua passando pela service
-- role (precisa criar o usuário no Auth antes de inserir a membership).

create function public.tenant_ids_como_gestor()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select tenant_id from public.memberships
  where user_id = auth.uid() and role in ('OWNER', 'ADMIN')
$$;

create policy "Gestor atualiza membros do próprio tenant"
  on public.memberships for update
  to authenticated
  using (tenant_id in (select public.tenant_ids_como_gestor()) and role <> 'OWNER')
  with check (tenant_id in (select public.tenant_ids_como_gestor()) and role <> 'OWNER');

create policy "Gestor remove membros do próprio tenant"
  on public.memberships for delete
  to authenticated
  using (tenant_id in (select public.tenant_ids_como_gestor()) and role <> 'OWNER');

-- pin_codes veio com a política genérica de isolamento por tenant (qualquer
-- membro do tenant, inclusive OPERADOR). PIN é sensível: restringe a gestor.
drop policy "Isolamento por tenant" on public.pin_codes;

create policy "Gestor gerencia PINs do próprio tenant"
  on public.pin_codes for all
  to authenticated
  using (tenant_id in (select public.tenant_ids_como_gestor()))
  with check (tenant_id in (select public.tenant_ids_como_gestor()));
