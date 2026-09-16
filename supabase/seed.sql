-- Seed mínimo de desenvolvimento: dados de referência para explorar o schema
-- no Supabase Studio local (que usa a service role e ignora RLS). Não cria
-- usuário/membership — para testar o app de ponta a ponta, cadastre-se pela
-- tela /cadastro em http://localhost:3000.

insert into public.tenants (id, nome) values
  ('00000000-0000-0000-0000-000000000001', 'Talharia Exemplo Ltda');

insert into public.clientes (id, tenant_id, nome, documento) values
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Confecção Modelo', '00.000.000/0001-00');

insert into public.maquinas (tenant_id, nome, tipo, custo_hora) values
  ('00000000-0000-0000-0000-000000000001', 'Mesa de Enfesto 1', 'mesa_enfesto_manual', 45.00),
  ('00000000-0000-0000-0000-000000000001', 'Plotter de Risco', 'plotter_risco', 60.00),
  ('00000000-0000-0000-0000-000000000001', 'Serra Fita 1', 'serra_fita', 35.00);

insert into public.operacoes (tenant_id, nome) values
  ('00000000-0000-0000-0000-000000000001', 'risco'),
  ('00000000-0000-0000-0000-000000000001', 'enfesto'),
  ('00000000-0000-0000-0000-000000000001', 'corte'),
  ('00000000-0000-0000-0000-000000000001', 'separacao');

insert into public.motivos_parada (tenant_id, nome) values
  ('00000000-0000-0000-0000-000000000001', 'troca_lamina'),
  ('00000000-0000-0000-0000-000000000001', 'falta_tecido'),
  ('00000000-0000-0000-0000-000000000001', 'setup');

insert into public.modelos (id, tenant_id, cliente_id, nome) values
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', 'Camiseta Básica');

insert into public.modelo_versoes (id, tenant_id, modelo_id, versao, vigente, largura_exigida, eficiencia_encaixe) values
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 1, true, 1.60, 82.50);

insert into public.modelo_partes (tenant_id, modelo_versao_id, nome, qtd_por_peca, sentido_fio, par) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000301', 'Corpo Frente', 1, 'fio_reto', false),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000301', 'Corpo Costas', 1, 'fio_reto', false),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000301', 'Manga', 2, 'fio_reto', true);

insert into public.consumo_teorico_tamanho (tenant_id, modelo_versao_id, tamanho, consumo_metros) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000301', 'P', 0.65),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000301', 'M', 0.70),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000301', 'G', 0.75);

insert into public.rolos (id, tenant_id, cliente_id, origem, partida, metragem, largura, cor) values
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', 'cliente', 'PT-2026-01', 120.00, 1.60, 'Branco');

insert into public.ordens_servico (id, tenant_id, cliente_id, modelo_versao_id, prazo, preco_acordado) values
  ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000301', current_date + 7, 1500.00);

insert into public.os_grades (tenant_id, os_id, tamanho, cor, quantidade) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000501', 'P', 'Branco', 50),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000501', 'M', 'Branco', 80),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000501', 'G', 'Branco', 50);

insert into public.os_rolo_consumo (tenant_id, os_id, rolo_id, metros_consumidos) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000401', 118.50);
