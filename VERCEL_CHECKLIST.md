# Checklist de Configuração - Vercel

## ✅ Variáveis de Ambiente Configuradas

Você já tem todas as variáveis necessárias na Vercel:
- ✅ `AUTH_SECRET`
- ✅ `AUTH_GOOGLE_ID`
- ✅ `AUTH_GOOGLE_SECRET`
- ✅ `NEXTAUTH_URL`

## 🔍 Verificações Importantes

### 1. NEXTAUTH_URL
**Verifique se está configurado com a URL correta da sua aplicação:**

- Se estiver usando o domínio da Vercel: `https://finance-pap.vercel.app` (ou seu domínio)
- Se tiver domínio customizado: `https://seu-dominio.com`
- **NÃO use `http://localhost:3000` em produção!**

### 2. Google Cloud Console - URIs de Redirecionamento

**IMPORTANTE:** Você precisa adicionar a URI de produção no Google Cloud Console:

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Vá em **APIs e Serviços** > **Credenciais**
3. Clique no seu **ID do cliente OAuth**
4. Em **URIs de redirecionamento autorizados**, adicione:
   ```
   https://seu-dominio.vercel.app/api/auth/callback/google
   ```
   Ou se tiver domínio customizado:
   ```
   https://seu-dominio.com/api/auth/callback/google
   ```

**Exemplo:**
- Se seu projeto é `finance-pap`, a URL seria: `https://finance-pap.vercel.app/api/auth/callback/google`

### 3. Verificar se o Deploy foi feito após adicionar as variáveis

A Vercel precisa fazer um novo deploy para as variáveis de ambiente serem aplicadas. Verifique:
- ✅ As variáveis foram adicionadas há menos de 30 minutos (conforme mostrado)
- ⚠️ Se você já tinha um deploy anterior, precisa fazer um novo deploy

### 4. Testar o Login

Após verificar tudo acima:
1. Acesse sua aplicação na Vercel
2. Clique no botão "Google" para fazer login
3. Se ainda der erro, verifique os logs da Vercel em **Deployments** > **Functions** > **Logs**

## 🐛 Troubleshooting

### Erro: "redirect_uri_mismatch"
- Verifique se a URI no Google Cloud Console está **exatamente** igual à URL da Vercel
- Certifique-se de usar `https://` (não `http://`)
- Verifique se não há espaços ou caracteres extras

### Erro 500 ainda ocorre
1. Verifique os logs da Vercel: **Deployments** > Selecione o deploy > **Functions** > **Logs**
2. Verifique se todas as variáveis estão com valores corretos (sem espaços extras)
3. Certifique-se de que fez um novo deploy após adicionar as variáveis

### Como fazer um novo deploy
- Faça um commit e push para o repositório conectado
- Ou vá em **Deployments** > Clique nos três pontos (...) > **Redeploy**

