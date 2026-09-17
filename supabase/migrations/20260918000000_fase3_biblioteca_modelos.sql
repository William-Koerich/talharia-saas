-- Fase 3: storage de arquivos de modelo (croqui, risco PDF, plt, dxf) e
-- função atômica para trocar a versão vigente de um modelo.

insert into storage.buckets (id, name, public, file_size_limit)
values ('arquivos', 'arquivos', false, 26214400); -- 25MB

-- Convenção de path: {tenant_id}/{modelo_versao_id}/{arquivo}. Leitura é
-- liberada a qualquer membro do tenant; escrita só a gestor (o mesmo corte
-- de acesso da tabela modelo_arquivos, que fica com a mesma URL).
create policy "Ver arquivos do próprio tenant"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'arquivos'
    and (storage.foldername(name))[1]::uuid in (select public.tenant_ids_do_usuario())
  );

create policy "Gestor envia arquivos do próprio tenant"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'arquivos'
    and (storage.foldername(name))[1]::uuid in (select public.tenant_ids_como_gestor())
  );

create policy "Gestor remove arquivos do próprio tenant"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'arquivos'
    and (storage.foldername(name))[1]::uuid in (select public.tenant_ids_como_gestor())
  );

-- modelos/modelo_versoes/modelo_partes/modelo_arquivos/consumo_teorico_tamanho
-- vieram com a policy genérica de isolamento por tenant (qualquer membro,
-- inclusive OPERADOR, podia escrever). Biblioteca de modelos é gerida pelo
-- gestor: leitura livre no tenant, escrita só gestor.
do $$
declare
  tabela text;
  tabelas text[] := array[
    'modelos', 'modelo_versoes', 'modelo_partes', 'modelo_arquivos',
    'consumo_teorico_tamanho'
  ];
begin
  foreach tabela in array tabelas loop
    execute format('drop policy %I on public.%I', 'Isolamento por tenant', tabela);

    execute format(
      'create policy %I on public.%I for select to authenticated using (tenant_id in (select public.tenant_ids_do_usuario()))',
      'Ver do próprio tenant', tabela
    );

    execute format(
      'create policy %I on public.%I for insert to authenticated with check (tenant_id in (select public.tenant_ids_como_gestor()))',
      'Gestor insere no próprio tenant', tabela
    );

    execute format(
      'create policy %I on public.%I for update to authenticated using (tenant_id in (select public.tenant_ids_como_gestor())) with check (tenant_id in (select public.tenant_ids_como_gestor()))',
      'Gestor atualiza no próprio tenant', tabela
    );

    execute format(
      'create policy %I on public.%I for delete to authenticated using (tenant_id in (select public.tenant_ids_como_gestor()))',
      'Gestor exclui no próprio tenant', tabela
    );
  end loop;
end $$;

-- Troca a versão vigente em uma única transação (evita violar o índice
-- único parcial de "só uma vigente por modelo" com dois updates separados).
create function public.marcar_versao_vigente(p_modelo_versao_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_modelo_id uuid;
begin
  select modelo_id into v_modelo_id
  from public.modelo_versoes
  where id = p_modelo_versao_id;

  if v_modelo_id is null then
    raise exception 'Versão não encontrada';
  end if;

  update public.modelo_versoes
    set vigente = false
    where modelo_id = v_modelo_id and vigente and id <> p_modelo_versao_id;

  update public.modelo_versoes
    set vigente = true
    where id = p_modelo_versao_id;
end;
$$;
