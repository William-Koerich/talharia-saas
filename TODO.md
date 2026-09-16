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

- PinCode do operador (apontamento) fica para a Fase 1/5.
- Convite de ADMIN/OPERADOR para um tenant existente: Fase 2 (cadastros/usuários).
- Trial, onboarding guiado e billing: Fase 10.

## Fase 1 — Modelo de dados

- [ ] Não iniciada

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
