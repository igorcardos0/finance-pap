#!/usr/bin/env node

/**
 * Script para verificar se as variáveis de ambiente necessárias estão configuradas
 */

const fs = require('fs');
const path = require('path');

const requiredVars = [
  'AUTH_SECRET',
  'AUTH_GOOGLE_ID',
  'AUTH_GOOGLE_SECRET',
];

const optionalVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
];

console.log('🔍 Verificando variáveis de ambiente...\n');

// Verificar se .env.local existe
const envLocalPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envLocalPath);

if (!envExists) {
  console.log('❌ Arquivo .env.local não encontrado!\n');
  console.log('📝 Crie um arquivo .env.local na raiz do projeto com:');
  console.log('');
  console.log('AUTH_SECRET=seu-secret-aqui');
  console.log('AUTH_GOOGLE_ID=seu-google-client-id');
  console.log('AUTH_GOOGLE_SECRET=seu-google-client-secret');
  console.log('NEXTAUTH_URL=http://localhost:3000');
  console.log('');
  console.log('💡 Para gerar o AUTH_SECRET, execute:');
  console.log('   openssl rand -base64 32');
  console.log('');
  process.exit(1);
}

// Carregar variáveis do .env.local
const envContent = fs.readFileSync(envLocalPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

let hasErrors = false;

// Verificar variáveis obrigatórias
console.log('Variáveis obrigatórias:');
requiredVars.forEach(varName => {
  const value = envVars[varName] || process.env[varName];
  if (value && value !== '') {
    console.log(`  ✅ ${varName}`);
  } else {
    console.log(`  ❌ ${varName} - NÃO CONFIGURADA`);
    hasErrors = true;
  }
});

console.log('\nVariáveis opcionais:');
optionalVars.forEach(varName => {
  const value = envVars[varName] || process.env[varName];
  if (value && value !== '') {
    console.log(`  ✅ ${varName}`);
  } else {
    console.log(`  ⚠️  ${varName} - não configurada (opcional)`);
  }
});

if (hasErrors) {
  console.log('\n❌ Algumas variáveis obrigatórias não estão configuradas!');
  console.log('   Configure-as no arquivo .env.local\n');
  process.exit(1);
} else {
  console.log('\n✅ Todas as variáveis obrigatórias estão configuradas!\n');
}

