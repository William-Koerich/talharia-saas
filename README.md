# Talharia SaaS

Gestão para talharias (corte de tecido para confecções). Multi-tenant, pt-BR, timezone America/Sao_Paulo, moeda BRL.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · Supabase (Postgres, Auth, RLS)

## Rodando localmente

```bash
npm install
npx supabase start        # sobe Postgres/Auth local via Docker
cp .env.local.example .env.local
# preencha NEXT_PUBLIC_SUPABASE_ANON_KEY com a "anon key" impressa pelo `supabase start`
npx supabase migration up # aplica as migrations em supabase/migrations
npm run dev
```

- App: http://localhost:3000
- Health check: http://localhost:3000/api/health
- Supabase Studio local: http://127.0.0.1:54323

## Multi-tenant

Toda tabela de domínio carrega `tenant_id` e tem RLS habilitado, restringindo o acesso aos tenants aos quais o usuário pertence (tabela `memberships`, papéis `OWNER`/`ADMIN`/`OPERADOR`). Ver `supabase/migrations`.

Operador (talhador) tem conta normal (`memberships` com role `OPERADOR`); o PIN de 4 dígitos (`pin_codes`) é só um atalho de login no tablet.

## Apontamento offline (`/apontar`)

PWA de página única (380px, alto contraste) pro talhador: PIN → OS (câmera ou
número) → máquina/operação → iniciar/pausar/retomar/finalizar. Funciona
100% offline depois do primeiro carregamento online — service worker
(Serwist) cacheia o app, IndexedDB guarda a fila de ações e os dados de
referência (máquinas, operações, PINs). Sincroniza sozinho ao reconectar.

Em produção, câmera e service worker exigem HTTPS (localhost fica isento
em dev). Pra testar offline de verdade: abra `/apontar` uma vez online,
depois DevTools → Network → Offline.

## Modelo de dados

```mermaid
erDiagram
  TENANTS ||--o{ MEMBERSHIPS : tem
  MEMBERSHIPS ||--o| PIN_CODES : "atalho de login"
  TENANTS ||--o{ CLIENTES : tem
  TENANTS ||--o{ MAQUINAS : tem
  TENANTS ||--o{ OPERACOES : tem
  MAQUINAS ||--o{ OPERACOES : "maquina padrao"
  TENANTS ||--o{ MOTIVOS_PARADA : tem
  TENANTS ||--o{ CONSUMIVEIS : tem

  CLIENTES ||--o{ MODELOS : tem
  MODELOS ||--o{ MODELO_VERSOES : tem
  MODELO_VERSOES ||--o{ MODELO_PARTES : tem
  MODELO_VERSOES ||--o{ MODELO_ARQUIVOS : tem
  MODELO_VERSOES ||--o{ CONSUMO_TEORICO_TAMANHO : tem

  CLIENTES ||--o{ ORDENS_SERVICO : tem
  MODELO_VERSOES ||--o{ ORDENS_SERVICO : usa
  ORDENS_SERVICO ||--o{ OS_GRADES : tem

  CLIENTES ||--o{ ROLOS : "fornece (opcional)"
  ORDENS_SERVICO ||--o{ OS_ROLO_CONSUMO : consome
  ROLOS ||--o{ OS_ROLO_CONSUMO : "usado em"

  ORDENS_SERVICO ||--o{ APONTAMENTOS : tem
  OPERACOES ||--o{ APONTAMENTOS : tem
  MAQUINAS ||--o{ APONTAMENTOS : usa
  MEMBERSHIPS ||--o{ APONTAMENTOS : aponta
  MOTIVOS_PARADA ||--o{ APONTAMENTOS : "motivo da parada"

  ORDENS_SERVICO ||--o{ ENFESTOS : tem
  APONTAMENTOS ||--o| ENFESTOS : origina
  ENFESTOS ||--o{ ENFESTO_ROLOS : usa
  ROLOS ||--o{ ENFESTO_ROLOS : "usado em"

  ORDENS_SERVICO ||--o{ SOBRAS : gera
  ENFESTOS ||--o{ SOBRAS : gera

  ORDENS_SERVICO ||--o{ CONSUMO_OS : consome
  CONSUMIVEIS ||--o{ CONSUMO_OS : "usado em"

  ORDENS_SERVICO ||--o{ FARDOS : gera
  CLIENTES ||--o{ ROMANEIOS : recebe
  ROMANEIOS ||--o{ ROMANEIO_ITENS : tem
  FARDOS ||--o{ ROMANEIO_ITENS : "conferido em"
```
