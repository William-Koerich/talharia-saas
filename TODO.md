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

- Trial, onboarding guiado e billing: Fase 10.

Correção feita durante a Fase 2: `/cadastro` passou a criar a conta via admin
API (service role) já confirmada, em vez de `auth.signUp()` client-side — o
projeto remoto tem confirmação de e-mail exigida por padrão e um limite de
envio baixo no mailer embutido, o que travava o self-service.

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

- Migrations validadas num Postgres local (Docker indisponível no sandbox) e depois aplicadas e confirmadas no projeto remoto de verdade (ver Fase 2). `npx supabase db reset` local ainda não testado.

## Fase 2 — Cadastros e seed do setor ✅

- [x] Trigger `seed_padrao_tenant`: ao criar um tenant, semeia 10 máquinas (uma por tipo), 8 operações e 8 motivos de parada padrão do setor
- [x] CRUD completo (listar/criar/editar/ativar-desativar/excluir) para clientes, máquinas, operações, motivos de parada e consumíveis, restrito a OWNER/ADMIN (`exigirGestor`)
- [x] Importação de clientes por CSV (`papaparse`)
- [x] Usuários: OWNER/ADMIN cria ADMIN/OPERADOR com senha temporária (via admin API, conta já confirmada), remove membro, define/reseta PIN de 4 dígitos (hash com `scrypt`, sem dependência nova)
- [x] Nav no `/painel` ligando todas as seções
- [x] RLS: `memberships` ganhou policies de UPDATE/DELETE restritas a gestor (nunca sobre OWNER); `pin_codes` restrito a gestor (antes usava a policy genérica de tenant, que deixaria OPERADOR ler/escrever PIN de qualquer um)
- [x] Validado de ponta a ponta contra o projeto remoto de verdade (cadastro → cliente → seed automático → usuário → PIN), depois limpo do banco

Decisões tomadas nesta fase:

- Novo ADMIN/OPERADOR é criado pelo gestor com senha temporária de uma vez (sem convite por e-mail — não há SMTP próprio configurado ainda).
- `/cadastro` (Fase 0) foi corrigido pra criar a conta via admin API já confirmada, pelo mesmo motivo (ver nota na Fase 0).

## Fase 3 — Biblioteca de modelos ✅

- [x] Storage privado (`arquivos`) com RLS por pasta de tenant: leitura pra qualquer membro, escrita só gestor
- [x] `criar_modelo` (função) cria modelo + versão 1 vigente numa transação; `marcar_versao_vigente` troca a vigente atomicamente (só uma por modelo, via índice único parcial)
- [x] CRUD de modelo (nome + cliente) e de versão (largura exigida, eficiência do encaixe)
- [x] Partes e grade/consumo teórico por tamanho editáveis dentro da versão
- [x] Upload de croqui/foto, risco (PDF), .plt e .dxf; preview de imagem (`<img>`) e PDF (`<iframe>`) via signed URL de 5 min; plt/dxf só link de download
- [x] Aviso explícito na versão não vigente ("não pode ser usada em novas Ordens de Serviço") — o bloqueio de fato na criação da OS é Fase 4
- [x] RLS de `modelos`/`modelo_versoes`/`modelo_partes`/`modelo_arquivos`/`consumo_teorico_tamanho` endurecida pro mesmo padrão leitura-livre/escrita-gestor (vieram da Fase 1 com a policy genérica de tenant, que deixava qualquer membro escrever)
- [x] Validado de ponta a ponta contra o projeto remoto (modelo → versão 1 vigente → partes/consumo/arquivos → nova versão → trocar vigente), arquivos e dados de teste limpos depois

## Fase 4 — Ordem de Serviço ✅

- [x] `criar_os` (função) cria a OS + grade (tamanho×cor×qtd) numa transação; cliente → modelo usa sempre a versão vigente automaticamente (sem escolha manual de versão)
- [x] Esteira kanban em `/painel/os` por status (`@dnd-kit`), com fallback de select de status na página de detalhe (mesma ação, dois caminhos)
- [x] Vincular rolos à OS com partida/origem/metragem/metros consumidos; aviso explícito quando os rolos vinculados têm partidas diferentes
- [x] Ficha imprimível (`/painel/os/[id]/ficha`) com QR code (`qrcode`, conteúdo = número da OS) e CSS `print:hidden` no chrome do painel
- [x] Alerta na OS quando a versão do modelo usada não é mais a vigente (badge no card do kanban e aviso no detalhe)
- [x] RLS de `ordens_servico`/`os_grades`/`rolos`/`os_rolo_consumo` endurecida pro padrão leitura-livre/escrita-gestor (mesma correção das Fases 2/3)
- [x] Validado de ponta a ponta contra o projeto remoto, incluindo o drag-and-drop de verdade (mouse down/move/up) no kanban

Bug real encontrado e corrigido nesta fase (afetava todo `Select` do app, não só
OS): o `Select.Value` do Base UI renderiza o **valor bruto** por padrão — só
mostra o rótulo do item se você passar uma função `children` que faça esse
mapeamento (ou usar a prop `items`). Todo `<SelectValue placeholder="..." />`
sem `children` estava mostrando UUID/enum cru assim que uma opção era
selecionada (ex.: cliente aparecia como UUID em vez do nome). Corrigido em
todos os selects do app (clientes, máquinas, operações, modelos, arquivos,
partes, rolos, status da OS).

Decisão tomada nesta fase:

- Rolo não tem catálogo/CRUD próprio — é criado inline ao vincular numa OS
  (o escopo da Fase 4 menciona "vincular rolos com partida" dentro do fluxo
  da OS, não uma seção own separada).

## Fase 5 — Apontamento (PWA offline-first) ✅

- [x] `/apontar`: app de página única fora do `/painel`, 380px, alto contraste, sem scroll horizontal
- [x] PIN de 4 dígitos → buscar OS (câmera/QR via `jsqr` ou número) → escolher máquina/operação → INICIAR/PAUSAR (motivo obrigatório)/RETOMAR/FINALIZAR (qtd + sobra)
- [x] Hash de PIN trocado de scrypt (Node-only) pra PBKDF2 via Web Crypto — isomórfico, roda igual no servidor e no navegador
- [x] `listar_pins_apontamento()`: libera leitura do hash de PIN (nunca o PIN em texto puro) pra qualquer membro do próprio tenant, não só gestor — trade-off deliberado pra permitir bater PIN 100% offline (decisão confirmada com o usuário)
- [x] IndexedDB (`idb`): cache de referência (máquinas/operações/motivos/PINs/OS ativas) + fila de ações pendentes + apontamento ativo local — tudo sobrevive a reload/fechar o app
- [x] Setup×produtivo classificado automaticamente **no servidor** (trigger `classificar_tipo_apontamento`): 1ª vez que uma combinação OS+operação+máquina é trabalhada = setup, demais = produtivo — decidido no servidor (não no cliente) pra ficar correto mesmo com ações sincronizadas fora de ordem
- [x] Sync automática: tentativa imediata após cada ação + no evento `online` + retentativa a cada 20s como rede de segurança; conflito de "dois apontamentos ativos" resolvido por timestamp do dispositivo (o mais antigo vence, o outro é descartado com aviso)
- [x] Service worker via `@serwist/turbopack` (o `@serwist/next` webpack não suporta Turbopack, que é o padrão do Next 16) servido por uma route `/[path]` com `generateStaticParams` restrito a `sw.js`/`sw.js.map`
- [x] Manifest PWA (`app/manifest.ts`) com ícones gerados localmente (PIL)
- [x] Validado de ponta a ponta contra o projeto remoto: fluxo completo online, fluxo completo **100% offline** (PIN, busca de OS, iniciar, finalizar — nada bloqueou por falta de rede), e sincronização automática ao reconectar (inclusive um caso real de resposta perdida exatamente na borda offline→online, recuperado sozinho pela retentativa de 20s)

Bugs reais encontrados e corrigidos nesta fase:

- `navigator.onLine` acessado direto no corpo do componente quebrava SSR — corrigido com `useSyncExternalStore`.
- Duas rodadas de `setState` dentro de `useEffect` sem callback (efeito de sincronizar estado local com props, e assinatura de online/offline) — corrigidas com o padrão "ajustar estado durante o render" e `useSyncExternalStore`, respectivamente.
- Chamadas concorrentes de sincronização (uma ação enfileirada logo após outra) eram **descartadas silenciosamente** pelo guard de reentrância em vez de serem enfileiradas pra rodar depois — uma ação podia ficar até 20s sem sincronizar mesmo com internet boa. Corrigido com um flag de "rodar de novo assim que a atual terminar".
- Contador de "pendentes" não atualizava enquanto offline (a função só chamava `atualizarContagem()` dentro do caminho que tenta sincronizar de verdade, que retorna cedo sem rede).

Decisões tomadas nesta fase:

- PIN não troca a sessão Supabase do dispositivo — o tablet fica autenticado como quem configurou (OWNER/ADMIN/OPERADOR), e o PIN só resolve **qual membership** fez o apontamento (`operador_membership_id`). Muito mais simples que mintar uma sessão por operador a cada troca, e suficiente pro requisito.
- Rolo/QR da OS usa o `numero` (inteiro, não UUID) como conteúdo do QR — mais curto e a RLS já isola por tenant.
- Sem catálogo de "operadores" separado: continua sendo `memberships` + `pin_codes`, como decidido na Fase 0/2.

Pendências / limitações conhecidas:

- Resolução de conflito (dois ativos) testada via SQL direto, não via dois dispositivos reais simultâneos.
- Sem teste de carregamento 100% frio do Service Worker (fechar o navegador inteiro e reabrir offline) — testado offline com o app já carregado, que é o caso de uso real (tablet fica ligado no chão de fábrica).

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
