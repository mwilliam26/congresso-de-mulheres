# Sistema de Inscrição MW

Aplicação web em **Next.js** para inscrições de evento com pagamento via **Mercado Pago** (PIX e boleto), persistência em **Supabase** e painel administrativo para gestão de pedidos.

## Visão geral

O projeto possui dois fluxos principais:

- **Público**: formulário de inscrição em `/inscricao`.
- **Admin**: painel em `/admin` com login, filtros, edição de pedidos, alteração de status, troca de lote ativo e exportação em PDF/Excel.

A aplicação cria o pedido no banco, gera uma preferência de pagamento no Mercado Pago e atualiza o status via webhook.

## Funcionalidades

- Inscrição com validações de campos (nome, idade, telefone, e-mail, paróquia, cidade, tamanho).
- Aceite obrigatório das diretrizes de uso de imagem/dados e regulamento.
- Seleção opcional de almoço (+ R$ 25,00).
- Lotes de inscrição com preços configuráveis via `config_sistema`.
- Criação de preferência de pagamento no Mercado Pago.
- Páginas de retorno de pagamento:
  - `/pagamento/sucesso`
  - `/pagamento/pendente`
  - `/pagamento/falha`
- Webhook para atualização automática de status do pedido.
- Painel admin com:
  - busca e filtro por status,
  - edição e exclusão de pedidos,
  - alteração de lote ativo,
  - exportação PDF/Excel.

## Stack

- **Frontend/Backend**: Next.js 14 (App Router) + React 18 + TypeScript
- **Estilo**: Tailwind CSS
- **Banco/Auth**: Supabase
- **Pagamentos**: SDK Mercado Pago
- **Exportação**: `jspdf`, `jspdf-autotable`, `xlsx`

## Estrutura principal

- `app/inscricao/page.tsx`: formulário público de inscrição.
- `app/admin/page.tsx`: painel administrativo.
- `app/login/page.tsx`: autenticação de administrador.
- `app/api/mercadopago/create-preference/route.ts`: cria pedido + preferência de pagamento.
- `app/api/mercadopago/webhook/route.ts`: recebe webhook e atualiza status.
- `lib/supabase.ts`: cliente Supabase.
- `lib/termos.ts`: textos de diretrizes e regulamento.
- `database/`: scripts SQL para schema e ajustes.

> Observação: também existem rotas legadas em `app/api/pedidos/create` e `app/api/webhook/mercadopago`.

## Pré-requisitos

- Node.js 18+
- npm, yarn ou pnpm
- Projeto Supabase configurado
- Conta Mercado Pago com credenciais (teste/produção)

## Variáveis de ambiente

Crie um arquivo `.env.local` na raiz com:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
MERCADOPAGO_ACCESS_TOKEN=
NEXT_PUBLIC_APP_URL=http://localhost:3000
# opcional (fallback):
# NEXT_PUBLIC_SITE_URL=
```

### Observações importantes

- `SUPABASE_SERVICE_ROLE_KEY` é usada nas rotas de servidor/webhook para operações administrativas.
- `NEXT_PUBLIC_APP_URL` define as URLs de retorno do Mercado Pago e a URL de notificação (`notification_url`).
- Não exponha secrets fora do ambiente de servidor.

## Instalação e execução

```bash
npm install
npm run dev
```

Acesse:

- Público: `http://localhost:3000/inscricao`
- Admin: `http://localhost:3000/login`

## Banco de dados (Supabase)

1. Execute o schema base em `database/schema.sql`.
2. Execute os scripts complementares conforme necessidade (colunas de Mercado Pago, data de compra, RLS, lotes e preços) disponíveis na pasta `database/`.
3. Cadastre pelo menos um administrador na tabela `admins`.

### Tabelas principais

- `pedidos`: dados da inscrição, valor total, status de pagamento e metadados de pagamento.
- `admins`: e-mails autorizados para acesso ao painel.
- `config_sistema`: configurações de lote/preço utilizadas pela inscrição e admin.

## Fluxo de pagamento (resumo)

1. Usuária envia o formulário em `/inscricao`.
2. API `POST /api/mercadopago/create-preference`:
   - valida dados,
   - cria pedido com status `Pendente`,
   - cria preferência no Mercado Pago,
   - retorna URL de pagamento para redirecionamento.
3. Mercado Pago processa pagamento.
4. Webhook `POST /api/mercadopago/webhook` recebe a notificação e atualiza o pedido para `Pago`, `Pendente` ou `Cancelado`.
5. Usuária retorna para páginas de sucesso/falha/pendente.

## Scripts disponíveis

- `npm run dev`: ambiente de desenvolvimento
- `npm run build`: build de produção
- `npm run start`: inicia aplicação em produção
- `npm run lint`: lint

## Segurança e acesso

- A rota `/admin` usa autenticação via Supabase no cliente e validação de e-mail na tabela `admins`.
- O middleware está habilitado para casar `/admin/:path*`, porém a proteção efetiva atual está no fluxo client-side.

## Deploy

Para deploy (ex.: Vercel):

- Configure todas as variáveis de ambiente do `.env.local` no provedor.
- Garanta que `NEXT_PUBLIC_APP_URL` aponte para a URL pública do projeto.
- Configure a URL de webhook do Mercado Pago para:
  - `https://SEU_DOMINIO/api/mercadopago/webhook`

## Melhorias recomendadas

- Mover proteção de admin para server-side (middleware/session checks robustos).
- Consolidar rotas legadas de API para evitar duplicidade.
- Criar migrations versionadas para a pasta `database/`.

---

Se quiser, eu também posso montar um `.env.example` e uma seção de **runbook de produção** (checklist de deploy + validação de webhook).
