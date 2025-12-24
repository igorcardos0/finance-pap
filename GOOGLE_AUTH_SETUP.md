# Configuração do Login com Google

Este documento explica como configurar o login com Google no DevFinance_.

## Pré-requisitos

1. Uma conta Google
2. Acesso ao [Google Cloud Console](https://console.cloud.google.com/)

## Passos para Configuração

### 1. Criar um Projeto no Google Cloud Console

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Clique em "Selecionar um projeto" no topo
3. Clique em "Novo Projeto"
4. Dê um nome ao projeto (ex: "DevFinance")
5. Clique em "Criar"

### 2. Configurar a Tela de Consentimento OAuth

1. No menu lateral, vá em **APIs e Serviços** > **Tela de consentimento OAuth**
2. Selecione **Externo** (ou **Interno** se você tiver Google Workspace)
3. Preencha as informações obrigatórias:
   - **Nome do aplicativo**: DevFinance_
   - **Email de suporte ao usuário**: seu email
   - **Email de contato do desenvolvedor**: seu email
4. Clique em **Salvar e continuar**
5. Na seção **Escopos**, clique em **Adicionar ou remover escopos**
6. Selecione os escopos:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
7. Clique em **Atualizar** e depois **Salvar e continuar**
8. Adicione usuários de teste (opcional) e clique em **Salvar e continuar**
9. Revise e clique em **Voltar ao painel**

### 3. Criar Credenciais OAuth 2.0

1. No menu lateral, vá em **APIs e Serviços** > **Credenciais**
2. Clique em **+ CRIAR CREDENCIAIS** > **ID do cliente OAuth**
3. Selecione **Aplicativo da Web**
4. Configure:
   - **Nome**: DevFinance Web Client
   - **URIs de redirecionamento autorizados**:
     - Para desenvolvimento: `http://localhost:3000/api/auth/callback/google`
     - Para produção: `https://seu-dominio.com/api/auth/callback/google`
5. Clique em **Criar**
6. **Copie o ID do cliente** e o **Segredo do cliente**

### 4. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# NextAuth Configuration
AUTH_SECRET=seu-secret-aqui
# Para gerar um secret, execute: openssl rand -base64 32

# Google OAuth
GOOGLE_CLIENT_ID=seu-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-google-client-secret

# URL da aplicação (desenvolvimento)
NEXTAUTH_URL=http://localhost:3000
```

**Importante**: 
- Não commite o arquivo `.env.local` no Git (já está no `.gitignore`)
- Para produção, configure essas variáveis no seu provedor de hospedagem (Vercel, etc.)

### 5. Gerar AUTH_SECRET

Execute o seguinte comando no terminal para gerar um secret seguro:

```bash
openssl rand -base64 32
```

Copie o resultado e use como valor de `AUTH_SECRET` no arquivo `.env.local`.

## Testando o Login

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse `http://localhost:3000`

3. Clique no botão "Google" na página de login

4. Você será redirecionado para a página de autenticação do Google

5. Após autenticar, você será redirecionado de volta para `/dashboard`

## Troubleshooting

### Erro: "redirect_uri_mismatch"

- Verifique se a URI de redirecionamento no Google Cloud Console está exatamente igual a: `http://localhost:3000/api/auth/callback/google`
- Certifique-se de que não há espaços ou caracteres extras

### Erro: "invalid_client"

- Verifique se `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estão corretos no arquivo `.env.local`
- Certifique-se de que não há espaços extras nas variáveis

### Erro: "AUTH_SECRET is missing"

- Certifique-se de que a variável `AUTH_SECRET` está definida no arquivo `.env.local`
- Reinicie o servidor após adicionar a variável

## Produção

Para produção, você precisará:

1. Adicionar a URL de produção nas **URIs de redirecionamento autorizados** no Google Cloud Console
2. Configurar as variáveis de ambiente no seu provedor de hospedagem
3. Atualizar `NEXTAUTH_URL` com a URL de produção

