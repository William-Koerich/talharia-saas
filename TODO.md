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

## Fase 6 — Enfesto e aproveitamento ✅

- [x] `rolos.custo_metro` (opcional) — base pra calcular sobra em R$
- [x] RLS de `enfestos`/`enfesto_rolos`/`sobras` endurecida pro padrão leitura-livre/escrita-gestor (mesma correção das Fases 2-4)
- [x] View `os_aproveitamento` (`security_invoker = true`) com consumo teórico (grade × consumo_teorico_tamanho) × real (folhas × comprimento dos enfestos) × perda em metros e % por OS — testada explicitamente contra vazamento entre tenants (dois tenants, dois usuários, confirmado que um não vê a OS do outro)
- [x] `/painel/os/[id]`: seções de Enfesto (folhas, comprimento, quais rolos já vinculados à OS foram consumidos) e Sobra (tipo, metros, valor — se não informado manualmente, calculado a partir do custo médio ponderado dos rolos da OS); resumo teórico×real×perda no topo da seção de enfestos
- [x] `/painel/relatorios/perdas`: filtro por período/cliente/modelo, agrupado por modelo e por cliente, com badge de desvio (pp) contra a média geral do período filtrado
- [x] Validado de ponta a ponta contra o projeto remoto com números exatos (teórico 10m, real 14m, perda 28,57%, sobra calculada em R$10,00 a partir do custo do rolo)

Decisão tomada nesta fase:

- "Média" de comparação no relatório é agregada (perda total / real total do grupo), não a média simples dos percentuais por OS — evita que uma OS pequena distorça o comparativo tanto quanto uma grande.

## Fase 7 — Custos, margem e tempo padrão ✅

- [x] `memberships.custo_hora` (mão de obra, análogo ao `maquinas.custo_hora` já existente)
- [x] View `os_custos` (`security_invoker`): custo = tempo de máquina (só setup+produtivo, parada não entra — decisão confirmada com o usuário) × custo_hora da máquina + mesmo tempo × custo_hora de quem apontou + consumíveis + tecido só quando o rolo é próprio; margem = preço acordado − custo; testada contra vazamento entre tenants
- [x] View `tempo_padrao_modelo_operacao`: média de horas por peça por (modelo, operação), só a partir de 3 apontamentos produtivos concluídos (setup fica de fora, é overhead de uma vez só)
- [x] `/painel/os/[id]`: seção de custos e margem, com destaque quando a OS está deficitária
- [x] `/painel/relatorios/margem`: margem agregada por cliente (filtro de período/cliente), com badge "Deficitário"
- [x] `/painel/os/novo`: "tempo estimado" (horas) baseado no tempo padrão × quantidade da grade, quando há histórico suficiente
- [x] `/painel` (OWNER/ADMIN) virou o dashboard: OS atrasadas, ocupação por máquina (mês atual), top 5 motivos de parada (mês atual), margem do mês
- [x] `/painel/usuarios`: coluna e tela de custo/hora por usuário (`/painel/usuarios/[id]/custo-hora`)
- [x] Validado de ponta a ponta contra o projeto remoto com números exatos (custo máquina R$60, mão de obra R$40, consumíveis R$12, total R$112, margem R$888/88,8%) refletidos corretamente na OS, no relatório de margem e no dashboard

Decisão tomada nesta fase:

- Tempo de parada nunca entra no custo da OS — é perda operacional rastreada separadamente (top motivos de parada no dashboard), não custo repassável.

## Fase 8 — Etiquetas e entrega ✅

- [x] Migration: `fardos` e `romaneios`/`romaneio_itens` (já existiam da Fase 1) endurecidos para o padrão leitura-livre/escrita-gestor; `romaneios.foto_entrega_storage_path`
- [x] `criar_romaneio()` (RPC, `security invoker`): cria o romaneio e vincula os fardos numa transação só; testado com RLS simulando dois tenants (isolamento confirmado, inclusive tentativa de fabricar romaneio para outro tenant rejeitada)
- [x] `src/lib/etiqueta.ts`: gera ZPL (203dpi, `^BQ` pro QR) e PDF (`pdf-lib`+`qrcode`) em dois tamanhos (4x6, 4x2); QR = `etiqueta_codigo` do fardo (`OS{numero}-F{sequencial}`)
- [x] `/painel/os/[id]`: seção "Fardos e etiquetas" — cria fardo, baixa etiqueta (ZPL 4x6/4x2 e PDF) via `/api/fardos/[id]/etiqueta`
- [x] `/painel/romaneios`: listagem com status (Rascunho/Conferido/Entregue)
- [x] `/painel/romaneios/novo`: escolhe cliente, lista fardos com OS em status "pronto" e ainda não vinculados a nenhum romaneio
- [x] `/painel/romaneios/[id]`: conferência dos fardos (manual ou por câmera/QR reaproveitando o padrão do `/apontar`), captura de foto da entrega (câmera) e assinatura (canvas), "Finalizar entrega" (upload pro bucket `arquivos`, status → entregue), download do PDF do romaneio (`/api/romaneios/[id]/pdf`)
- [x] Nav "Romaneios" adicionado ao painel
- [x] Validado de ponta a ponta contra o projeto remoto: criação de fardos, download de etiqueta ZPL/PDF, criação de romaneio, conferência, captura de foto+assinatura, entrega finalizada, PDF do romaneio — todos os 200/OK com dados reais

Bugs corrigidos nesta fase:

- `captura-entrega.tsx` (novo) e `apontar/tela-buscar-os.tsx` (Fase 5, achado ao reaproveitar o mesmo padrão): a câmera nunca funcionava de verdade. O `<video>` só era montado no DOM depois de `setEscaneando(true)`/`setCameraAtiva(true)`, mas o código tentava atribuir `srcObject` a `videoRef.current` *antes* dessa mudança de estado — ou seja, o ref sempre estava `null` nesse momento e o stream nunca era conectado ao elemento. Ninguém percebeu porque o vídeo aparecia (elemento existe após o re-render) e o loop de leitura de QR simplesmente ficava girando sem erro, sem nunca ler nada. Corrigido montando o `<video>` sempre (oculto via classe, mesmo padrão já usado no `<canvas>`), então o ref existe antes do `getUserMedia` resolver. Confirmado com diagnóstico ao vivo (câmera fake do Chrome): antes da correção `videoWidth: 0, hasSrcObject: false`; depois, `videoWidth: 640, hasSrcObject: true`. **Isso significa que a leitura de QR no tablet do talhador (`/apontar`, Fase 5 CRÍTICA) nunca funcionou em produção até este fix** — só a busca manual por número da OS funcionava.

## Fase 9 — Portal do cliente

- [ ] Não iniciada

## Fase 9 — Portal do cliente

- [ ] Não iniciada

## Fase 10 — Self-service e billing

- [ ] Não iniciada
