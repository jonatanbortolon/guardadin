# 💰 GuardaDin

O **GuardaDin** é o seu gerente financeiro pessoal que vive dentro do WhatsApp. Em vez de abrir planilhas ou baixar mais um aplicativo, você simplesmente manda uma mensagem como _"gastei 50 reais no mercado hoje"_ e o assistente entende, registra e organiza o lançamento para você. Quando quiser entender para onde o dinheiro está indo, é só perguntar — ou abrir o dashboard web para ver tudo em gráficos.

Este projeto foi desenvolvido como Trabalho de Conclusão de Curso (TCC).

## 📖 Sobre o projeto

A ideia nasceu de um problema simples: controlar gastos dá trabalho, e por isso a maioria das pessoas desiste. O GuardaDin tira esse atrito do caminho colocando o controle financeiro no lugar onde já passamos o dia — a conversa do WhatsApp.

Por trás da conversa existe um agente de IA que interpreta linguagem natural, decide qual ação executar (registrar uma entrada, uma saída, apagar um lançamento, gerar um relatório do mês, etc.) e responde de forma amigável. Tudo o que é registrado fica disponível também em um painel web com resumos e gráficos por categoria e por conta bancária.

## 🧠 Como funciona

- Você envia uma mensagem por **texto ou foto** (ex.: a foto de uma notinha) no WhatsApp.
- A Meta encaminha para o **webhook** da aplicação (`/api/whatsapp/webhook`).
- Um agente construído com **LangGraph** interpreta a mensagem (extraindo os dados do texto ou da imagem), **lembra da conversa** para coletar os campos aos poucos e escolhe a ferramenta certa: registrar/excluir lançamento, **consultar transações** (com filtros por nome, tipo, categoria, conta, valor, período e até busca por padrão) ou gerar **relatórios** do mês.
- Se a mensagem não se encaixa em nenhuma ação, o bot mostra os comandos que você pode usar — em vez de responder algo fora do escopo do app.
- O modelo de linguagem pode ser trocado livremente: **Ollama** (local), **OpenAI**, **Anthropic (Claude)** ou **Gemini** — basta uma variável de ambiente. (Para ler imagens, use um modelo com visão, como `gpt-4o`, Claude, Gemini ou um Ollama multimodal.)
- O resultado é salvo no banco e a resposta volta pelo WhatsApp.
- O **dashboard web** consome os mesmos dados através de uma **API REST** própria da aplicação. As listagens (lançamentos, categorias e contas) usam **paginação**, **busca**, **ordenação** (por data de criação/edição e, nos lançamentos, por valor, parcelas e data) e **filtros** — com todo o estado refletido na **URL** (dá para compartilhar um link já filtrado).
- A interface é **multilíngue** (Português, Español e English), com um seletor de idioma no cabeçalho que fica salvo no navegador.
- Para o bot responder, o número remetente precisa estar **cadastrado em um usuário e liberado** no Painel do Administrador. Mensagens de números não autorizados são ignoradas, evitando que qualquer pessoa use o assistente.

## 🔐 Autenticação e acesso

O painel é protegido por login. O modelo de acesso funciona assim:

- **Primeiro acesso (bootstrap):** enquanto não existir nenhum usuário, a aplicação obriga a criação da **conta de administrador** — a primeira conta é sempre o admin. Depois disso, o cadastro aberto é desativado.
- **Novos usuários por convite:** o administrador cria um convite para um e-mail no **Painel do Administrador**; o cadastro só acontece pelo link gerado, com o e-mail **fixado pelo servidor** (não editável no formulário).
- **Confirmação de e-mail** e **recuperação/alteração de senha por código** de 6 dígitos enviados por e-mail. Em desenvolvimento, os e-mails são capturados pelo **Mailpit** (veja abaixo).
- **Permissões:** cada usuário tem permissão de **somente leitura** ou **todas as permissões**, além do papel de administrador. O Painel do Administrador reúne a gestão de usuários e a **liberação de telefones** para o bot.
- **Perfil:** cada usuário pode editar seus próprios dados (nome, e-mail, telefone) e trocar a senha (com código por e-mail).

Se você rodar o seed (passo mais abaixo), já existe um administrador pronto para testes: **`admin@admin.com`** / senha **`admin`**.

## 🛠️ Tecnologias

- **Next.js 16** (App Router, React 19, API Routes) + **TypeScript**
- **LangChain** e **LangGraph** para o agente de IA
- Provedores de LLM plugáveis: **Ollama**, **OpenAI**, **Anthropic (Claude)** e **Gemini**
- **WhatsApp Cloud API** (API oficial da Meta)
- **PostgreSQL** com **Kysely** (query builder) sobre o driver serverless da **Neon**
- **TanStack Query** (dados/cache) e **TanStack Table** (tabelas com ordenação e filtros)
- **nuqs** para manter o estado das listagens na URL
- **next-intl** para a internacionalização (pt-BR, es, en)
- **Tailwind CSS v4**, **Radix UI** e **Recharts** na interface
- Autenticação por **sessão** (cookies) com hashing **scrypt** e controle de acesso por papéis
- **Nodemailer** + **React Email** para os e-mails transacionais, com **Mailpit** capturando os envios em desenvolvimento
- **Biome** para lint e formatação
- **Docker Compose** para subir a infraestrutura local (Postgres, Ollama e Mailpit)
- **ngrok** para expor o webhook durante o desenvolvimento

## 📋 Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose
- [Node.js](https://nodejs.org/) 20.x
- [ngrok](https://ngrok.com/download) instalado e autenticado (`ngrok config add-authtoken <seu-token>`)
- Uma conta no [Meta for Developers](https://developers.facebook.com/) com um app de WhatsApp (para o bot funcionar de ponta a ponta)

## ⚙️ Configuração do ambiente

Copie o arquivo de exemplo e preencha os valores:

```bash
cp .env.example .env
```

As variáveis mais importantes:

| Variável | Descrição |
|----------|-----------|
| `DB_URL` | String de conexão do PostgreSQL (já configurada para o Docker local) |
| `TRANSACTIONS_URL` | URL do dashboard (ex.: `http://localhost:3000/transactions`) |
| `APP_URL` | URL base da aplicação, usada nos links dos e-mails (ex.: `http://localhost:3000`) |
| `LLM_PROVIDER` | `ollama`, `openai`, `anthropic` ou `gemini` |
| `LLM_MODEL` | Nome do modelo (ex.: `llama3`, `gpt-4o`, `claude-3-5-sonnet-latest`, `gemini-1.5-flash`) |
| `LLM_API_KEY` | Chave do provedor (não é necessária no Ollama) |
| `LLM_BASE_URL` | URL base do provedor (usada pelo Ollama e APIs compatíveis) |
| `WHATSAPP_TOKEN` | Token de acesso do app da Meta |
| `WHATSAPP_PHONE_NUMBER_ID` | ID do número de telefone do WhatsApp |
| `WHATSAPP_WEBHOOK_TOKEN` | Token de verificação do webhook (você define o valor) |
| `EMAIL_HOST` / `EMAIL_PORT` | Servidor SMTP (padrão aponta para o Mailpit: `localhost:1025`) |
| `EMAIL_SECURE` | `true`/`false` — usar TLS (deixe `false` para o Mailpit local) |
| `EMAIL_USER` / `EMAIL_PASSWORD` | Credenciais SMTP (vazias no Mailpit) |

## 🚀 Rodando localmente

1. Clone o repositório e configure o `.env` (passo anterior).
2. Suba a infraestrutura local (banco, proxy, Ollama e Mailpit) em segundo plano:
   ```bash
   docker compose up -d postgres neon-proxy mailpit ollama
   ```
   > Também existe o atalho `npm run docker`, que sobe **tudo** (inclusive a aplicação em container) em primeiro plano.
3. Se estiver usando Ollama, **não precisa baixar o modelo na mão**: o serviço `ollama` já baixa o `llama3` automaticamente na primeira vez que sobe. Você pode acompanhar o download com:
   ```bash
   docker compose logs -f ollama
   ```
4. Instale as dependências:
   ```bash
   npm ci
   ```
5. Crie as tabelas e popule os dados iniciais:
   ```bash
   npm run database:migrate
   npm run database:seed
   ```
   O seed cria um **administrador de teste** (`admin@admin.com` / senha `admin`), além de categorias e contas bancárias padrão. Para recomeçar do zero, use `npm run database:reset`.
6. Inicie a aplicação:
   ```bash
   npm run dev
   ```
7. Acesse o painel em [http://localhost:3000](http://localhost:3000) e entre com o admin do seed (`admin@admin.com` / `admin`).

> 📬 **E-mails em desenvolvimento:** confirmação de conta e códigos de senha são enviados para o **Mailpit**. Abra a caixa de entrada em [http://localhost:8025](http://localhost:8025) para ler as mensagens (o Mailpit tem alternância de tema claro/escuro para conferir os dois).

### 👤 Primeiro acesso e novos usuários

- Se **não** rodar o seed, o primeiro acesso força a criação da **conta de administrador** (a primeira conta é sempre o admin).
- Para adicionar outras pessoas, entre como admin, abra o **Painel do Administrador**, crie um **convite** para o e-mail desejado e compartilhe o link de cadastro gerado.
- Para o assistente do WhatsApp responder a um usuário, **libere o telefone dele** no Painel do Administrador (coluna "Bot liberado").

### 📱 WhatsApp e ngrok (webhooks)

Até aqui o dashboard já funciona, mas o bot ainda não recebe mensagens. Isso acontece porque a Meta precisa **enviar** as mensagens do WhatsApp para a sua aplicação através de um webhook — e para isso ela exige uma **URL pública HTTPS**. Como em desenvolvimento o projeto roda em `localhost` (que a Meta não enxerga), usamos o **ngrok** para criar um túnel que expõe a sua máquina para a internet.

O fluxo é: _você manda uma mensagem no WhatsApp → a Meta chama a URL do ngrok → o ngrok entrega para o `localhost:3000` → a aplicação processa e responde_.

**1. Abra o túnel.** Com a aplicação rodando (`npm run dev`), abra outro terminal e execute:

```bash
npm run tunnel
```

**2. Copie a URL pública.** O ngrok vai exibir algo assim:

```
Forwarding  https://a1b2-c3d4.ngrok-free.app -> http://localhost:3000
```

A URL `https://...` é o endereço público da sua aplicação. É ela que vai na configuração da Meta.

**3. Cole a URL na Meta.** No painel do [Meta for Developers](https://developers.facebook.com/), dentro do seu app, vá em **WhatsApp → Configuração → Webhooks** e clique em **Editar**. Preencha:

- **URL de callback**: a URL do ngrok **seguida do caminho do webhook**, por exemplo:
  ```
  https://a1b2-c3d4.ngrok-free.app/api/whatsapp/webhook
  ```
- **Token de verificação**: exatamente o mesmo valor que está em `WHATSAPP_WEBHOOK_TOKEN` no seu `.env`.

**4. Verifique e assine os eventos.** Clique em **Verificar e salvar** — se os dois valores baterem, a Meta confirma o webhook (ela faz uma chamada de teste que a aplicação responde automaticamente). Por fim, na lista de campos, **assine (subscribe) o campo `messages`** para começar a receber as mensagens.

> ⚠️ No plano gratuito do ngrok, a URL muda toda vez que você reinicia o túnel. Sempre que isso acontecer, atualize a **URL de callback** na Meta com o novo endereço.

As demais credenciais da Meta (`WHATSAPP_TOKEN` e `WHATSAPP_PHONE_NUMBER_ID`) ficam na tela **WhatsApp → Configuração da API**, de onde você copia o token de acesso e o ID do número para o `.env`. Pronto: mande uma mensagem para o número de teste e o GuardaDin já deve responder.

## ☁️ Deploy na Vercel

Em produção não precisamos do ngrok: a própria URL da Vercel já é pública e fixa. O passo a passo, de forma resumida:

**1. Suba o repositório** para o GitHub (ou GitLab/Bitbucket).

**2. Importe o projeto na Vercel.** Em [vercel.com](https://vercel.com), clique em **Add New → Project** e selecione o repositório. A Vercel detecta o Next.js automaticamente, não é preciso configurar o build.

**3. Configure o banco de dados.** O `localhost` do Docker não existe na Vercel, então você precisa de um Postgres hospedado. Como o projeto usa o driver serverless da **Neon**, o caminho mais direto é criar um banco gratuito na [Neon](https://neon.tech), copiar a _connection string_ e rodar as migrações apontando para ele (em modo produção, para usar a conexão real da Neon):

```bash
NODE_ENV=production DB_URL="postgres://...sua-url-da-neon..." npm run database:migrate
NODE_ENV=production DB_URL="postgres://...sua-url-da-neon..." npm run database:seed
```

**4. Defina as variáveis de ambiente** em **Project Settings → Environment Variables**, com os mesmos nomes do `.env`:

- `DB_URL` → connection string da Neon
- `TRANSACTIONS_URL` → `https://seu-projeto.vercel.app/transactions`
- `APP_URL` → `https://seu-projeto.vercel.app` (usada nos links dos e-mails)
- `LLM_PROVIDER` / `LLM_MODEL` / `LLM_API_KEY` → em produção o Ollama local não é acessível, então use um provedor hospedado (**OpenAI**, **Anthropic** ou **Gemini**)
- `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_WEBHOOK_TOKEN`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASSWORD` → em produção o Mailpit não existe; use um **provedor SMTP real** (ex.: Resend, Mailgun, SendGrid) para os e-mails de confirmação e recuperação de senha

**5. Faça o deploy** e aguarde a Vercel gerar a URL do projeto.

**6. Aponte o webhook para a Vercel.** É o mesmo processo do ngrok, só que com a URL de produção. Na Meta, em **WhatsApp → Configuração → Webhooks**, coloque a URL de callback:

```
https://seu-projeto.vercel.app/api/whatsapp/webhook
```

e o mesmo token de verificação (`WHATSAPP_WEBHOOK_TOKEN`). Diferente do ngrok, essa URL é fixa e não muda a cada reinício.

> 💡 O token de acesso de teste da Meta expira em 24 horas. Para um bot em produção, gere um **token permanente** através de um Usuário do Sistema (System User) no Business Manager.
