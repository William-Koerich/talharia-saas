-- Fase 2: seed automático de máquinas/operações/motivos por tenant + campos
-- de exibição em memberships (evita depender da admin API pra listar nome/e-mail).

alter table public.memberships
  add column nome text not null default '',
  add column email text not null default '';

update public.memberships m
set email = u.email
from auth.users u
where u.id = m.user_id and m.email = '';

create function public.seed_padrao_tenant()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.maquinas (tenant_id, nome, tipo) values
    (new.id, 'Mesa de Enfesto Manual', 'mesa_enfesto_manual'),
    (new.id, 'Mesa de Enfesto Automática', 'mesa_enfesto_auto'),
    (new.id, 'Plotter de Risco', 'plotter_risco'),
    (new.id, 'Serra Fita', 'serra_fita'),
    (new.id, 'Serra Vertical', 'serra_vertical'),
    (new.id, 'Cortadora de Disco', 'cortadora_disco'),
    (new.id, 'Corte Automático', 'corte_automatico'),
    (new.id, 'Prensa de Entretela', 'prensa_entretela'),
    (new.id, 'Etiquetadeira', 'etiquetadeira'),
    (new.id, 'Mesa de Separação', 'mesa_separacao');

  insert into public.operacoes (tenant_id, nome) values
    (new.id, 'risco'),
    (new.id, 'enfesto'),
    (new.id, 'corte'),
    (new.id, 'prensa'),
    (new.id, 'numeracao'),
    (new.id, 'separacao'),
    (new.id, 'amarracao'),
    (new.id, 'revisao');

  insert into public.motivos_parada (tenant_id, nome) values
    (new.id, 'troca_lamina'),
    (new.id, 'afiacao'),
    (new.id, 'falta_tecido'),
    (new.id, 'manutencao'),
    (new.id, 'aguardando_cliente'),
    (new.id, 'setup'),
    (new.id, 'refeicao'),
    (new.id, 'outros');

  return new;
end;
$$;

create trigger seed_padrao_tenant_trigger
  after insert on public.tenants
  for each row execute function public.seed_padrao_tenant();
