-- Fase 5: apontamento offline-first.

-- Permite ao tablet cachear os hashes de PIN do próprio tenant (qualquer
-- membro, não só gestor) pra poder conferir o PIN sem internet. Nunca expõe
-- o PIN em texto puro, só o hash (PBKDF2, ver src/lib/pin.ts) — trade-off
-- aceito deliberadamente pra cumprir "nunca bloquear por falta de rede".
create function public.listar_pins_apontamento()
returns table (membership_id uuid, nome text, role public.membership_role, pin_hash text)
language sql
security definer
set search_path = public
stable
as $$
  select m.id, m.nome, m.role, p.pin_hash
  from public.memberships m
  join public.pin_codes p on p.membership_id = m.id
  where m.tenant_id in (select public.tenant_ids_do_usuario())
$$;

-- Classifica automaticamente setup × produtivo: a primeira vez que uma
-- combinação (OS, operação, máquina) é trabalhada é "setup"; as demais são
-- "produtivo". Decidido no servidor (não no cliente) pra ficar correto mesmo
-- com apontamentos vindos da fila offline fora de ordem de criação local.
create function public.classificar_tipo_apontamento()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.tipo = 'produtivo' then
    if not exists (
      select 1 from public.apontamentos a
      where a.tenant_id = new.tenant_id
        and a.os_id = new.os_id
        and a.operacao_id = new.operacao_id
        and a.maquina_id = new.maquina_id
        and a.tipo in ('setup', 'produtivo')
        and a.fim is not null
    ) then
      new.tipo := 'setup';
    end if;
  end if;
  return new;
end;
$$;

create trigger apontamentos_classificar_tipo
  before insert on public.apontamentos
  for each row execute function public.classificar_tipo_apontamento();
