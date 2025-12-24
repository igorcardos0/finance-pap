#!/usr/bin/env node

/**
 * Script robusto de testes para verificar imports, exports e estrutura do projeto
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let errors = [];
let warnings = [];
let passed = 0;
let failed = 0;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  errors.push(message);
  failed++;
  log(`❌ ${message}`, 'red');
}

function warning(message) {
  warnings.push(message);
  log(`⚠️  ${message}`, 'yellow');
}

function success(message) {
  passed++;
  log(`✓ ${message}`, 'green');
}

function checkFileExists(filePath, description) {
  const fullPath = path.resolve(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    success(`${description}: ${filePath}`);
    return true;
  } else {
    error(`${description} não encontrado: ${filePath}`);
    return false;
  }
}

function checkFileContent(filePath, requiredContent, description) {
  const fullPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    error(`${description}: Arquivo não existe - ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  if (typeof requiredContent === 'string') {
    if (content.includes(requiredContent)) {
      success(`${description}: Encontrado "${requiredContent}" em ${filePath}`);
      return true;
    } else {
      error(`${description}: Não encontrado "${requiredContent}" em ${filePath}`);
      return false;
    }
  } else if (requiredContent instanceof RegExp) {
    if (requiredContent.test(content)) {
      success(`${description}: Regex match em ${filePath}`);
      return true;
    } else {
      error(`${description}: Regex não match em ${filePath}`);
      return false;
    }
  }
  return false;
}

function findImports(filePath) {
  const fullPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) return [];

  const content = fs.readFileSync(fullPath, 'utf-8');
  const importRegex = /from\s+["'](@\/[^"']+)["']/g;
  const imports = [];
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    imports.push({
      importPath: match[1],
      line: content.substring(0, match.index).split('\n').length,
    });
  }

  return imports;
}

function resolveImportPath(importPath, fromFile) {
  // Remove @/ prefix
  const relativePath = importPath.replace('@/', 'src/');
  const fromDir = path.dirname(fromFile);
  const resolvedPath = path.resolve(process.cwd(), relativePath);

  // Try different extensions
  const extensions = ['.tsx', '.ts', '/index.tsx', '/index.ts', ''];
  for (const ext of extensions) {
    const testPath = resolvedPath + ext;
    if (fs.existsSync(testPath)) {
      return testPath;
    }
  }

  return null;
}

function checkImports(filePath) {
  const imports = findImports(filePath);
  let allValid = true;

  for (const imp of imports) {
    const resolved = resolveImportPath(imp.importPath, filePath);
    if (resolved) {
      success(`  Import válido: ${imp.importPath} (linha ${imp.line})`);
    } else {
      error(`  Import inválido: ${imp.importPath} em ${filePath} (linha ${imp.line})`);
      allValid = false;
    }
  }

  return allValid;
}

function checkExports(filePath, expectedExports) {
  const fullPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    error(`Arquivo não existe para verificar exports: ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  let allFound = true;

  for (const exp of expectedExports) {
    // Melhor regex que captura diferentes formas de export
    // export function Name
    // export const Name
    // export { Name }
    // export default function Name
    // export default Name
    // Também verifica exports com parênteses: export function Name()
    const exportPatterns = [
      // Padrão mais flexível: export function/const/class Name (com ou sem parênteses)
      new RegExp(`export\\s+(?:default\\s+)?(?:const|function|class|let|var)\\s+${exp}\\s*[=(<]`, 'g'),
      // Padrão com word boundary: export function/const/class Name
      new RegExp(`export\\s+(?:default\\s+)?(?:const|function|class|let|var)\\s+${exp}\\b`, 'g'),
      // Padrão para exports nomeados: export { Name }
      new RegExp(`export\\s*\\{[^}]*\\b${exp}\\b[^}]*\\}`, 'g'),
      // Padrão para default exports: export default Name
      new RegExp(`export\\s+default\\s+${exp}\\b`, 'g'),
      // Padrão mais flexível para exports nomeados
      new RegExp(`export\\s*\\{[^}]*${exp}[^}]*\\}`, 'g'),
    ];
    
    let found = false;
    for (const pattern of exportPatterns) {
      // Reset regex lastIndex para evitar problemas com múltiplas chamadas
      pattern.lastIndex = 0;
      if (pattern.test(content)) {
        found = true;
        break;
      }
    }
    
    // Fallback: verificação simples por string (mais confiável)
    if (!found) {
      // Verifica se existe "export" seguido do nome em qualquer formato
      const simplePattern = new RegExp(`export[^\\n]*\\b${exp}\\b`, 'g');
      simplePattern.lastIndex = 0;
      if (simplePattern.test(content)) {
        found = true;
      }
    }
    
    if (found) {
      success(`  Export encontrado: ${exp}`);
    } else {
      error(`  Export não encontrado: ${exp} em ${filePath}`);
      allFound = false;
    }
  }

  return allFound;
}

function runTypeScriptCheck() {
  log('\n📝 Verificando TypeScript...', 'cyan');
  try {
    execSync('npx tsc --noEmit --skipLibCheck', { 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    success('TypeScript: Sem erros de tipo');
    return true;
  } catch (e) {
    const output = e.stdout?.toString() || e.stderr?.toString() || '';
    error(`TypeScript: Erros encontrados\n${output}`);
    return false;
  }
}

function runBuildCheck() {
  log('\n🔨 Verificando build...', 'cyan');
  try {
    execSync('npm run build', { 
      stdio: 'pipe',
      cwd: process.cwd(),
      timeout: 60000
    });
    success('Build: Compilação bem-sucedida');
    return true;
  } catch (e) {
    const output = e.stdout?.toString() || e.stderr?.toString() || '';
    error(`Build: Falha na compilação\n${output}`);
    return false;
  }
}

// ========== TESTES ==========

log('\n🧪 INICIANDO TESTES ROBUSTOS DO PROJETO\n', 'cyan');

// 1. Verificar arquivos críticos
log('\n📁 1. Verificando arquivos críticos...', 'blue');
checkFileExists('src/components/commit-heatmap.tsx', 'CommitHeatmap');
checkFileExists('src/components/console-logs.tsx', 'ConsoleLogs');
checkFileExists('src/components/common/app-shell/app-shell.tsx', 'AppShell');
checkFileExists('src/components/common/command-palette/command-palette.tsx', 'CommandPalette');
checkFileExists('src/features/dashboard/components/dashboard-view/dashboard-view.tsx', 'DashboardView');
checkFileExists('tsconfig.json', 'TypeScript Config');
checkFileExists('next.config.mjs', 'Next.js Config');
checkFileExists('package.json', 'Package.json');

// 2. Verificar exports dos componentes
log('\n📤 2. Verificando exports...', 'blue');
checkExports('src/components/commit-heatmap.tsx', ['CommitHeatmap']);
checkExports('src/components/console-logs.tsx', ['ConsoleLogs']);
checkExports('src/components/common/app-shell/app-shell.tsx', ['AppShell', 'useTransactionDialog']);
checkExports('src/components/common/command-palette/command-palette.tsx', ['CommandPalette']);

// 3. Verificar conteúdo dos arquivos
log('\n📄 3. Verificando conteúdo dos arquivos...', 'blue');
checkFileContent('src/components/commit-heatmap.tsx', 'export function CommitHeatmap', 'CommitHeatmap export');
checkFileContent('src/components/console-logs.tsx', 'export function ConsoleLogs', 'ConsoleLogs export');
checkFileContent('src/components/commit-heatmap.tsx', '"use client"', 'CommitHeatmap client directive');
checkFileContent('src/components/console-logs.tsx', '"use client"', 'ConsoleLogs client directive');

// 4. Verificar imports no dashboard-view
log('\n🔗 4. Verificando imports no dashboard-view...', 'blue');
const dashboardViewPath = 'src/features/dashboard/components/dashboard-view/dashboard-view.tsx';
if (checkFileExists(dashboardViewPath, 'DashboardView file')) {
  checkFileContent(dashboardViewPath, 'from "@/components/commit-heatmap"', 'Import CommitHeatmap');
  checkFileContent(dashboardViewPath, 'from "@/components/console-logs"', 'Import ConsoleLogs');
  checkImports(dashboardViewPath);
}

// 5. Verificar imports no command-palette
log('\n🔗 5. Verificando imports no command-palette...', 'blue');
const commandPalettePath = 'src/components/common/command-palette/command-palette.tsx';
if (checkFileExists(commandPalettePath, 'CommandPalette file')) {
  checkFileContent(commandPalettePath, 'from "../app-shell"', 'Import app-shell (correto)');
  // Verificar que NÃO existe o import incorreto (isso é bom, não é erro)
  const content = fs.readFileSync(path.resolve(process.cwd(), commandPalettePath), 'utf-8');
  if (!content.includes('from "./app-shell"')) {
    // Este é um teste que verifica que o import incorreto NÃO existe - isso é correto
    success('Import app-shell (verificação): Import incorreto "./app-shell" não existe (correto)');
  } else {
    error('Import app-shell (incorreto): Encontrado import incorreto "./app-shell"');
  }
  checkImports(commandPalettePath);
}

// 6. Verificar estrutura de pastas
log('\n📂 6. Verificando estrutura de pastas...', 'blue');
const requiredDirs = [
  'src/components',
  'src/components/ui',
  'src/components/common',
  'src/features',
  'src/hooks',
  'src/lib',
  'app',
  'app/dashboard'
];

requiredDirs.forEach(dir => {
  const fullPath = path.resolve(process.cwd(), dir);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    success(`Diretório existe: ${dir}`);
  } else {
    error(`Diretório não encontrado: ${dir}`);
  }
});

// 7. Verificar tsconfig paths
log('\n⚙️  7. Verificando configuração TypeScript...', 'blue');
const tsconfigPath = path.resolve(process.cwd(), 'tsconfig.json');
if (fs.existsSync(tsconfigPath)) {
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
  if (tsconfig.compilerOptions?.paths?.['@/*']) {
    const paths = tsconfig.compilerOptions.paths['@/*'];
    if (paths.includes('./src/*')) {
      success('TypeScript paths configurado corretamente: @/* -> ./src/*');
    } else {
      error(`TypeScript paths incorreto: ${JSON.stringify(paths)}`);
    }
  } else {
    error('TypeScript paths não configurado');
  }
}

// 8. Verificar todos os imports em arquivos críticos
log('\n🔍 8. Verificando todos os imports em arquivos críticos...', 'blue');
const criticalFiles = [
  'src/components/commit-heatmap.tsx',
  'src/components/console-logs.tsx',
  'src/features/dashboard/components/dashboard-view/dashboard-view.tsx',
  'src/components/common/command-palette/command-palette.tsx',
  'src/components/common/app-shell/app-shell.tsx'
];

criticalFiles.forEach(file => {
  if (fs.existsSync(path.resolve(process.cwd(), file))) {
    log(`\n  Verificando: ${file}`, 'cyan');
    checkImports(file);
  }
});

// 9. Verificar se os componentes podem ser importados
log('\n🧩 9. Verificando resolução de módulos...', 'blue');
const moduleChecks = [
  { import: '@/components/commit-heatmap', file: 'src/components/commit-heatmap.tsx' },
  { import: '@/components/console-logs', file: 'src/components/console-logs.tsx' },
  { import: '@/components/common/app-shell', file: 'src/components/common/app-shell/index.ts' },
  { import: '@/components/common/command-palette', file: 'src/components/common/command-palette/index.ts' },
];

moduleChecks.forEach(({ import: importPath, file }) => {
  const resolved = resolveImportPath(importPath, file);
  if (resolved && fs.existsSync(resolved)) {
    success(`Módulo resolvível: ${importPath} -> ${resolved}`);
  } else {
    error(`Módulo não resolvível: ${importPath}`);
  }
});

// 10. Verificar TypeScript
runTypeScriptCheck();

// 11. Verificar Build (opcional, pode ser lento)
log('\n⚠️  11. Build check (pode demorar)...', 'yellow');
log('    Pule esta etapa se já executou build recentemente', 'yellow');
const shouldRunBuild = process.argv.includes('--build');
if (shouldRunBuild) {
  runBuildCheck();
} else {
  warning('Build check pulado. Use --build para executar.');
}

// ========== RESUMO ==========
log('\n' + '='.repeat(60), 'cyan');
log('📊 RESUMO DOS TESTES', 'cyan');
log('='.repeat(60), 'cyan');
log(`\n✅ Testes passados: ${passed}`, 'green');
log(`❌ Testes falhados: ${failed}`, failed > 0 ? 'red' : 'green');
log(`⚠️  Avisos: ${warnings.length}`, warnings.length > 0 ? 'yellow' : 'green');

if (errors.length > 0) {
  log('\n❌ ERROS ENCONTRADOS:', 'red');
  errors.forEach((err, i) => {
    log(`  ${i + 1}. ${err}`, 'red');
  });
}

if (warnings.length > 0) {
  log('\n⚠️  AVISOS:', 'yellow');
  warnings.forEach((warn, i) => {
    log(`  ${i + 1}. ${warn}`, 'yellow');
  });
}

if (failed === 0) {
  log('\n🎉 Todos os testes passaram!', 'green');
  process.exit(0);
} else {
  log(`\n💥 ${failed} teste(s) falharam. Corrija os erros acima.`, 'red');
  process.exit(1);
}

