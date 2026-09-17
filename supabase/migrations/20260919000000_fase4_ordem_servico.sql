-- Fase 4: ordens_servico/os_grades/rolos/os_rolo_consumo vieram da Fase 1 com
-- a policy genérica de isolamento por tenant (qualquer membro, inclusive
-- OPERADOR, podia escrever). Gestão de OS é do gestor; leitura livre no
-- tenant (o operador vai precisar ler OS pelo QR na Fase 5).
do $$
declare
  tabela text;
  tabelas text[] := array[
    'ordens_servico', 'os_grades', 'rolos', 'os_rolo_consumo'
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
