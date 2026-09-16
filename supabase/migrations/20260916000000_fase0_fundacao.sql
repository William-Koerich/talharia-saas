-- Fase 0: fundação multi-tenant (tenant + membership + papéis)

create type public.membership_role as enum ('OWNER', 'ADMIN', 'OPERADOR');

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  created_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.membership_role not null default 'OPERADOR',
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

create index memberships_user_id_idx on public.memberships (user_id);
create index memberships_tenant_id_idx on public.memberships (tenant_id);

alter table public.tenants enable row level security;
alter table public.memberships enable row level security;

-- Helper: tenants aos quais o usuário autenticado pertence.
-- security definer para evitar recursão de RLS entre tenants/memberships.
create function public.tenant_ids_do_usuario()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select tenant_id from public.memberships where user_id = auth.uid()
$$;

create policy "Ver tenants do próprio usuário"
  on public.tenants for select
  to authenticated
  using (id in (select public.tenant_ids_do_usuario()));

create policy "Ver memberships do próprio tenant"
  on public.memberships for select
  to authenticated
  using (tenant_id in (select public.tenant_ids_do_usuario()));

-- Cadastro (self-service): usuário autenticado cria seu próprio tenant.
create policy "Criar tenant no cadastro"
  on public.tenants for insert
  to authenticated
  with check (true);

-- Cadastro (self-service): usuário só pode se vincular a si mesmo, como OWNER,
-- em um tenant que acabou de criar (ainda sem nenhum membro).
create policy "Vincular-se como owner no cadastro"
  on public.memberships for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and role = 'OWNER'
    and not exists (
      select 1 from public.memberships m where m.tenant_id = memberships.tenant_id
    )
  );
