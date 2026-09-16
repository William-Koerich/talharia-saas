# TODO — Talharia SaaS

Estado do projeto por fase. Ver AGENTS.md para o escopo completo de cada fase.

## Fase 0 — Fundação ✅

- [x] Next.js 16 + TS + Tailwind v4 + shadcn/ui (já vinha configurado no repo)
- [x] Supabase local (auth + Postgres), `.env.local.example`
- [x] Clientes Supabase (browser/server) + `proxy.ts` (refresh de sessão / gate de rotas)
- [x] Multi-tenant: `tenants`, `memberships` (papéis OWNER/ADMIN/OPERADOR), RLS
- [x] Auth email+senha: `/cadastro` (self-service, cria tenant+owner), `/entrar`, sair
- [x] `/painel` protegido, `/api/health`
- [x] README curto

Pendências / decisões futuras:

- Convite de ADMIN/OPERADOR para um tenant existente: Fase 2 (cadastros/usuários).
- Trial, onboarding guiado e billing: Fase 10.

## Fase 1 — Modelo de dados ✅

- [x] Migration `20260916000001_fase1_dominio.sql`: todas as entidades do domínio (clientes, máquinas, operações, motivos de parada, modelos/versões/partes/arquivos, consumo teórico, OS/grade/rolos, apontamentos, enfestos/sobras, consumíveis, fardos, romaneios)
- [x] `pin_codes`: atalho de login do operador (membership com role OPERADOR + PIN hasheado)
- [x] RLS de isolamento por tenant em todas as 25 tabelas de domínio (validado rodando as migrations num Postgres local)
- [x] `supabase/seed.sql` com dados de referência (tenant/cliente/máquinas/modelo/OS de exemplo)
- [x] ERD em Mermaid no README

Decisões tomadas nesta fase:

- Modelo pertence a um Cliente (`modelos.cliente_id` obrigatório), sem catálogo compartilhado entre clientes.
- Operador não tem cadastro à parte: é uma `membership` com role OPERADOR; `pin_codes` só guarda o hash do PIN pra login rápido no tablet.
- Enums fixos (Postgres `enum`) só para vocabulário fechado do domínio (tipo de máquina, status da OS, sentido do fio, tipo de arquivo/sobra, etc.); tabelas que o tenant customiza (máquinas, operações, motivos de parada) são linhas normais, não enum — o seed automático dessas linhas é a Fase 2.

Pendências:

- Não foi possível validar contra o Supabase local de verdade (Docker indisponível no sandbox); as migrations foram validadas num Postgres vazio com `auth.users`/`auth.uid()`/role `authenticated` simulados. Rode `npx supabase db reset` localmente para confirmar.

## Fase 2 — Cadastros e seed do setor

- [ ] Não iniciada

## Fase 3 — Biblioteca de modelos

- [ ] Não iniciada

## Fase 4 — Ordem de Serviço

- [ ] Não iniciada

## Fase 5 — Apontamento (PWA offline-first)

- [ ] Não iniciada

## Fase 6 — Enfesto e aproveitamento

- [ ] Não iniciada

## Fase 7 — Custos, margem e tempo padrão

- [ ] Não iniciada

## Fase 8 — Etiquetas e entrega

- [ ] Não iniciada

## Fase 9 — Portal do cliente

- [ ] Não iniciada

## Fase 10 — Self-service e billing

- [ ] Não iniciada
