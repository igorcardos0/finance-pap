/**
 * PDF Export utilities
 * Note: This is a simplified version. For production, consider using libraries like jsPDF or pdfkit
 */

export function exportReportToPDF(data: {
  title: string
  period: string
  totals: {
    income: number
    expenses: number
    balance: number
    transactionCount: number
  }
  expensesByCategory: Array<{ name: string; amount: number; percentage: number }>
  topExpenses: Array<{ description: string; amount: number; date: string; category: string }>
}) {
  // For now, we'll create a formatted text report that can be printed as PDF
  // In a production environment, you'd use a library like jsPDF
  
  const report = `
╔══════════════════════════════════════════════════════════════╗
║                    RELATÓRIO FINANCEIRO                       ║
╚══════════════════════════════════════════════════════════════╝

Título: ${data.title}
Período: ${data.period}
Data de Geração: ${new Date().toLocaleDateString("pt-BR")}

═══════════════════════════════════════════════════════════════
RESUMO EXECUTIVO
═══════════════════════════════════════════════════════════════

Receitas Totais:     ${data.totals.income.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
Despesas Totais:     ${data.totals.expenses.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
Saldo:               ${data.totals.balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
Total de Transações: ${data.totals.transactionCount}

═══════════════════════════════════════════════════════════════
DESPESAS POR CATEGORIA
═══════════════════════════════════════════════════════════════

${data.expensesByCategory
  .map(
    (cat, index) =>
      `${String(index + 1).padStart(2, "0")}. ${cat.name.padEnd(20)} ${cat.amount
        .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        .padStart(15)} (${cat.percentage.toFixed(1)}%)`
  )
  .join("\n")}

═══════════════════════════════════════════════════════════════
TOP 10 DESPESAS
═══════════════════════════════════════════════════════════════

${data.topExpenses
  .map(
    (expense, index) =>
      `${String(index + 1).padStart(2, "0")}. ${expense.description.padEnd(30)} ${expense.amount
        .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        .padStart(15)} | ${new Date(expense.date).toLocaleDateString("pt-BR")} | ${expense.category}`
  )
  .join("\n")}

═══════════════════════════════════════════════════════════════
FIM DO RELATÓRIO
═══════════════════════════════════════════════════════════════
  `.trim()

  // Create a printable HTML document
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Relatório Financeiro - ${data.title}</title>
  <style>
    @media print {
      body { margin: 0; padding: 20px; }
      .no-print { display: none; }
    }
    body {
      font-family: 'Courier New', monospace;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #09090b;
      color: #f4f4f5;
    }
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      background: #18181b;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #27272a;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .no-print {
      margin-bottom: 20px;
    }
    button {
      background: #10b981;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-family: inherit;
    }
    button:hover {
      background: #059669;
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button onclick="window.print()">🖨️ Imprimir / Salvar como PDF</button>
  </div>
  <div class="header">
    <h1>Relatório Financeiro</h1>
    <p>${data.title} - ${data.period}</p>
    <p>Gerado em: ${new Date().toLocaleDateString("pt-BR")}</p>
  </div>
  <pre>${report}</pre>
</body>
</html>
  `

  // Open in new window for printing
  const printWindow = window.open("", "_blank")
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    // Auto-print after a short delay
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }
}

