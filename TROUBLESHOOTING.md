# Solução de Problemas - Login com Google

## Erro 500 ao clicar no botão do Google

### Causa
O erro 500 geralmente ocorre quando as variáveis de ambiente não estão configuradas corretamente.

### Solução Rápida

1. **Verifique se o arquivo `.env.local` existe:**
   ```bash
   ls -la .env.local
   ```

2. **Se não existir, crie o arquivo `.env.local` na raiz do projeto:**
   ```bash
   touch .env.local
   ```

3. **Adicione as seguintes variáveis no arquivo `.env.local`:**
   ```env
   # Gerar o secret: openssl rand -base64 32
   AUTH_SECRET=seu-secret-gerado-aqui
   
   # Credenciais do Google OAuth (obtenha no Google Cloud Console)
   AUTH_GOOGLE_ID=seu-google-client-id.apps.googleusercontent.com
   AUTH_GOOGLE_SECRET=seu-google-client-secret
   
   # URL da aplicação
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Gerar o AUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```
   Copie o resultado e use como valor de `AUTH_SECRET`.

5. **Verificar se as variáveis estão configuradas:**
   ```bash
   npm run check:env
   ```

6. **Reiniciar o servidor de desenvolvimento:**
   ```bash
   # Pare o servidor (Ctrl+C) e inicie novamente
   npm run dev
   ```

### Como obter as credenciais do Google

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto ou selecione um existente
3. Vá em **APIs e Serviços** > **Credenciais**
4. Clique em **+ CRIAR CREDENCIAIS** > **ID do cliente OAuth**
5. Configure:
   - Tipo: Aplicativo da Web
   - Nome: DevFinance Web Client
   - URIs de redirecionamento autorizados: `http://localhost:3000/api/auth/callback/google`
6. Copie o **ID do cliente** e o **Segredo do cliente**

### Verificar logs do servidor

Se ainda houver problemas, verifique os logs do terminal onde o `npm run dev` está rodando. Você verá mensagens como:

- ✅ `Variáveis configuradas corretamente`
- ❌ `Variáveis de ambiente do Google OAuth não configuradas!`

### Erros comuns

#### "redirect_uri_mismatch"
- Verifique se a URI no Google Cloud Console está exatamente: `http://localhost:3000/api/auth/callback/google`
- Certifique-se de que não há espaços ou caracteres extras

#### "invalid_client"
- Verifique se `AUTH_GOOGLE_ID` e `AUTH_GOOGLE_SECRET` estão corretos
- Certifique-se de que não há espaços extras nas variáveis

#### "AUTH_SECRET is missing"
- Certifique-se de que `AUTH_SECRET` está definido no `.env.local`
- Reinicie o servidor após adicionar a variável

