-- Fase 1: modelo de dados de domínio (schema completo)

create type public.tipo_maquina as enum (
  'mesa_enfesto_manual',
  'mesa_enfesto_auto',
  'plotter_risco',
  'serra_fita',
  'serra_vertical',
  'cortadora_disco',
  'corte_automatico',
  'prensa_entretela',
  'etiquetadeira',
  'mesa_separacao'
);

create type public.sentido_fio as enum ('fio_reto', 'vies', 'indiferente');

create type public.tipo_arquivo_modelo as enum ('croqui', 'risco_pdf', 'plt', 'dxf');

create type public.os_status as enum (
  'aguardando_tecido',
  'risco',
  'enfesto',
  'corte',
  'prensa',
  'separacao',
  'pronto',
  'entregue'
);

create type public.origem_rolo as enum ('cliente', 'proprio');

create type public.tipo_apontamento as enum ('setup', 'produtivo', 'parada');

create type public.tipo_sobra as enum ('retalho', 'ponta', 'emenda');

create type public.status_romaneio as enum ('rascunho', 'conferido', 'entregue');

-- PIN de 4 dígitos: atalho de login do operador no tablet (a conta continua
-- sendo uma membership normal com role OPERADOR).
create table public.pin_codes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  membership_id uuid not null unique references public.memberships (id) on delete cascade,
  pin_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  nome text not null,
  documento text,
  contato text,
  endereco text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.maquinas (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  nome text not null,
  tipo public.tipo_maquina not null,
  custo_hora numeric(10, 2) not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.operacoes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  nome text not null,
  maquina_padrao_id uuid references public.maquinas (id) on delete set null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, nome)
);

create table public.motivos_parada (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  nome text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, nome)
);

create table public.modelos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  nome text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.modelo_versoes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  modelo_id uuid not null references public.modelos (id) on delete cascade,
  versao integer not null,
  vigente boolean not null default false,
  largura_exigida numeric(10, 2),
  eficiencia_encaixe numeric(5, 2),
  created_at timestamptz not null default now(),
  unique (modelo_id, versao)
);

-- Só pode haver uma versão vigente por modelo (trava de versão vigente).
create unique index modelo_versoes_vigente_unica_idx
  on public.modelo_versoes (modelo_id)
  where vigente;

create table public.modelo_partes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  modelo_versao_id uuid not null references public.modelo_versoes (id) on delete cascade,
  nome text not null,
  qtd_por_peca integer not null default 1,
  sentido_fio public.sentido_fio not null default 'indiferente',
  par boolean not null default false,
  entretela boolean not null default false,
  obs text
);

create table public.modelo_arquivos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  modelo_versao_id uuid not null references public.modelo_versoes (id) on delete cascade,
  tipo public.tipo_arquivo_modelo not null,
  storage_path text not null,
  nome_original text,
  created_at timestamptz not null default now()
);

create table public.consumo_teorico_tamanho (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  modelo_versao_id uuid not null references public.modelo_versoes (id) on delete cascade,
  tamanho text not null,
  consumo_metros numeric(10, 3) not null,
  unique (modelo_versao_id, tamanho)
);

create sequence public.ordens_servico_numero_seq;

create table public.ordens_servico (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  numero bigint not null default nextval('public.ordens_servico_numero_seq'),
  cliente_id uuid not null references public.clientes (id) on delete restrict,
  modelo_versao_id uuid not null references public.modelo_versoes (id) on delete restrict,
  prazo date,
  preco_acordado numeric(12, 2),
  status public.os_status not null default 'aguardando_tecido',
  created_at timestamptz not null default now(),
  unique (tenant_id, numero)
);

create table public.os_grades (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  os_id uuid not null references public.ordens_servico (id) on delete cascade,
  tamanho text not null,
  cor text not null,
  quantidade integer not null check (quantidade > 0)
);

create table public.rolos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  cliente_id uuid references public.clientes (id) on delete set null,
  origem public.origem_rolo not null default 'proprio',
  partida text,
  metragem numeric(10, 2) not null,
  peso numeric(10, 2),
  largura numeric(10, 2),
  cor text,
  created_at timestamptz not null default now()
);

create table public.os_rolo_consumo (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  os_id uuid not null references public.ordens_servico (id) on delete cascade,
  rolo_id uuid not null references public.rolos (id) on delete restrict,
  metros_consumidos numeric(10, 2) not null
);

create table public.apontamentos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  os_id uuid not null references public.ordens_servico (id) on delete cascade,
  operacao_id uuid not null references public.operacoes (id) on delete restrict,
  maquina_id uuid not null references public.maquinas (id) on delete restrict,
  operador_membership_id uuid not null references public.memberships (id) on delete restrict,
  tipo public.tipo_apontamento not null,
  motivo_parada_id uuid references public.motivos_parada (id) on delete restrict,
  inicio timestamptz not null default now(),
  fim timestamptz,
  qtd_produzida integer,
  created_at timestamptz not null default now(),
  check (tipo = 'parada' or motivo_parada_id is null),
  check (tipo <> 'parada' or motivo_parada_id is not null)
);

-- Impede dois apontamentos ativos (sem fim) do mesmo operador.
create unique index apontamentos_operador_ativo_idx
  on public.apontamentos (operador_membership_id)
  where fim is null;

create table public.enfestos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  os_id uuid not null references public.ordens_servico (id) on delete cascade,
  apontamento_id uuid references public.apontamentos (id) on delete set null,
  folhas integer not null,
  comprimento numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

create table public.enfesto_rolos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  enfesto_id uuid not null references public.enfestos (id) on delete cascade,
  rolo_id uuid not null references public.rolos (id) on delete restrict,
  metros_usados numeric(10, 2) not null
);

create table public.sobras (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  os_id uuid not null references public.ordens_servico (id) on delete cascade,
  enfesto_id uuid references public.enfestos (id) on delete set null,
  tipo public.tipo_sobra not null,
  metros numeric(10, 2) not null,
  valor numeric(10, 2),
  created_at timestamptz not null default now()
);

create table public.consumiveis (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  nome text not null,
  unidade text not null,
  custo_unitario numeric(10, 2) not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.consumo_os (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  os_id uuid not null references public.ordens_servico (id) on delete cascade,
  consumivel_id uuid not null references public.consumiveis (id) on delete restrict,
  quantidade numeric(10, 2) not null
);

create table public.fardos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  os_id uuid not null references public.ordens_servico (id) on delete cascade,
  etiqueta_codigo text not null unique,
  descricao text,
  created_at timestamptz not null default now()
);

create table public.romaneios (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  cliente_id uuid not null references public.clientes (id) on delete restrict,
  data_entrega date,
  status public.status_romaneio not null default 'rascunho',
  assinatura_storage_path text,
  created_at timestamptz not null default now()
);

create table public.romaneio_itens (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  romaneio_id uuid not null references public.romaneios (id) on delete cascade,
  fardo_id uuid not null references public.fardos (id) on delete restrict,
  conferido boolean not null default false,
  conferido_em timestamptz,
  unique (romaneio_id, fardo_id)
);

-- Índices de tenant_id + RLS de isolamento por tenant, iguais para todas as
-- tabelas de domínio criadas nesta migration.
do $$
declare
  tabela text;
  tabelas text[] := array[
    'pin_codes', 'clientes', 'maquinas', 'operacoes', 'motivos_parada',
    'modelos', 'modelo_versoes', 'modelo_partes', 'modelo_arquivos',
    'consumo_teorico_tamanho', 'ordens_servico', 'os_grades', 'rolos',
    'os_rolo_consumo', 'apontamentos', 'enfestos', 'enfesto_rolos', 'sobras',
    'consumiveis', 'consumo_os', 'fardos', 'romaneios', 'romaneio_itens'
  ];
begin
  foreach tabela in array tabelas loop
    execute format(
      'create index %I on public.%I (tenant_id)',
      tabela || '_tenant_id_idx', tabela
    );
    execute format('alter table public.%I enable row level security', tabela);
    execute format(
      'create policy %I on public.%I for all to authenticated using (tenant_id in (select public.tenant_ids_do_usuario())) with check (tenant_id in (select public.tenant_ids_do_usuario()))',
      'Isolamento por tenant', tabela
    );
  end loop;
end $$;
