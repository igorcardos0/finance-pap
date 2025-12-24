"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Search, Filter, Plus, Edit, Trash2, HelpCircle, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { t, useLanguage } from "@/lib/i18n"
import { useFinanceData, type Transaction } from "@/hooks/use-finance-data"
import { useCategories } from "@/hooks/use-categories"
import { AddTransactionDialog } from "@/features/transactions/components/add-transaction-dialog"
import { formatCurrency, formatDate } from "@/lib/formatters"
import { toast } from "@/lib/toast"

const ITEMS_PER_PAGE = 10

export function TransactionsView() {
  const [lang, setLang] = useState<"pt" | "en" | "es">("pt")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all")
  const [filterDateStart, setFilterDateStart] = useState<string>("")
  const [filterDateEnd, setFilterDateEnd] = useState<string>("")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const savedLang = useLanguage()
  const { transactions, deleteTransaction } = useFinanceData()
  const { allCategories, getCategory } = useCategories()

  useEffect(() => {
    setLang(savedLang as "pt" | "en" | "es")

    const handleLanguageChange = () => {
      setLang(savedLang as "pt" | "en" | "es")
    }

    window.addEventListener("languageChange", handleLanguageChange)
    return () => window.removeEventListener("languageChange", handleLanguageChange)
  }, [savedLang])

  // Filter transactions based on search and filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Search filter - matches description or tags
      const matchesSearch =
        searchQuery === "" ||
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      // Category filter
      const matchesCategory = !filterCategory || transaction.category === filterCategory

      // Type filter (income/expense)
      const matchesType =
        filterType === "all" ||
        (filterType === "income" && transaction.amount > 0) ||
        (filterType === "expense" && transaction.amount < 0)

      // Date range filter
      const matchesDate =
        (!filterDateStart && !filterDateEnd) ||
        (filterDateStart && filterDateEnd
          ? transaction.date >= filterDateStart && transaction.date <= filterDateEnd
          : filterDateStart
            ? transaction.date >= filterDateStart
            : filterDateEnd
              ? transaction.date <= filterDateEnd
              : true)

      return matchesSearch && matchesCategory && matchesType && matchesDate
    })
  }, [transactions, searchQuery, filterCategory, filterType, filterDateStart, filterDateEnd])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterCategory, filterType, filterDateStart, filterDateEnd])

  // Paginate filtered transactions
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredTransactions.slice(startIndex, endIndex)
  }, [filteredTransactions, currentPage])

  // Calculate total pages
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)

  // Get unique categories from transactions (including custom categories)
  const availableCategories = useMemo(() => {
    const transactionCategories = new Set(transactions.map((t) => t.category))
    const allCategoryNames = allCategories.map((cat) => cat.name)
    // Combine transaction categories with all available categories
    const combined = new Set([...transactionCategories, ...allCategoryNames])
    return Array.from(combined).sort()
  }, [transactions, allCategories])

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filterCategory) count++
    if (filterType !== "all") count++
    if (filterDateStart || filterDateEnd) count++
    return count
  }, [filterCategory, filterType, filterDateStart, filterDateEnd])

  const clearFilters = () => {
    setFilterCategory(null)
    setFilterType("all")
    setFilterDateStart("")
    setFilterDateEnd("")
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setDialogOpen(true)
  }

  const handleDelete = (transaction: Transaction) => {
    setDeletingTransaction(transaction)
  }

  const confirmDelete = () => {
    if (deletingTransaction) {
      const description = deletingTransaction.description
      deleteTransaction(deletingTransaction.id)
      toast.success("Transação excluída", `${description} foi removida com sucesso.`)
      setDeletingTransaction(null)
    }
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingTransaction(null)
    }
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push("ellipsis")
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i)
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis")
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="space-y-6">
      <AddTransactionDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        transaction={editingTransaction}
      />
      <AlertDialog open={!!deletingTransaction} onOpenChange={(open) => !open && setDeletingTransaction(null)}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem certeza que deseja excluir a transação "{deletingTransaction?.description}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-800 bg-transparent hover:bg-zinc-800">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-zinc-100">{t("transactions.title", lang)}</CardTitle>
            <div className="flex gap-3 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  placeholder={t("transactions.search", lang)}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-zinc-950 border-zinc-800 w-64 font-mono text-sm text-zinc-100"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-zinc-800"
                  >
                    <X className="w-3 h-3 text-zinc-500" />
                  </Button>
                )}
              </div>
              <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`border-zinc-800 bg-transparent ${
                      activeFiltersCount > 0 ? "border-theme-primary/50" : ""
                    }`}
                    style={
                      activeFiltersCount > 0
                        ? { borderColor: "color-mix(in oklch, var(--theme-primary) 50%, transparent)" }
                        : undefined
                    }
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    {t("transactions.filters", lang)}
                    {activeFiltersCount > 0 && (
                      <Badge className="ml-2 bg-theme-primary text-zinc-950 border-0 font-mono text-xs">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-zinc-900 border-zinc-800 text-zinc-100" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-zinc-100">Filtros</h4>
                      {activeFiltersCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                          className="h-7 text-xs text-zinc-400 hover:text-zinc-400"
                        >
                          Limpar
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-zinc-300 text-sm">Categoria</Label>
                      <Select value={filterCategory || "all"} onValueChange={(value) => setFilterCategory(value === "all" ? null : value)}>
                        <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100">
                          <SelectValue placeholder="Todas as categorias" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800">
                          <SelectItem value="all">Todas as categorias</SelectItem>
                          {availableCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {t(`category.${category.toLowerCase()}`, lang) || category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-zinc-300 text-sm">Tipo</Label>
                      <Select value={filterType} onValueChange={(value) => setFilterType(value as "all" | "income" | "expense")}>
                        <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800">
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="income">Receitas</SelectItem>
                          <SelectItem value="expense">Despesas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-zinc-300 text-sm">Período</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-zinc-400 text-xs mb-1 block">De</Label>
                          <Input
                            type="date"
                            value={filterDateStart}
                            onChange={(e) => setFilterDateStart(e.target.value)}
                            className="bg-zinc-950 border-zinc-800 text-zinc-100 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-zinc-400 text-xs mb-1 block">Até</Label>
                          <Input
                            type="date"
                            value={filterDateEnd}
                            onChange={(e) => setFilterDateEnd(e.target.value)}
                            className="bg-zinc-950 border-zinc-800 text-zinc-100 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                onClick={() => setDialogOpen(true)}
                style={{ backgroundColor: 'var(--theme-primary)' }}
                className="hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("btn.new.transaction", lang)}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-zinc-400 font-mono">
              Mostrando {paginatedTransactions.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} de {filteredTransactions.length} transações
            </span>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7 text-xs text-zinc-400 hover:text-zinc-100"
              >
                <X className="w-3 h-3 mr-1" />
                Limpar filtros
              </Button>
            )}
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400 font-mono">{t("transactions.date", lang)}</TableHead>
                <TableHead className="text-zinc-400 font-mono">{t("transactions.description", lang)}</TableHead>
                <TableHead className="text-zinc-400 font-mono">{t("transactions.category", lang)}</TableHead>
                <TableHead className="text-zinc-400 font-mono">{t("transactions.tags", lang)}</TableHead>
                <TableHead className="text-zinc-400 font-mono">{t("transactions.account", lang)}</TableHead>
                <TableHead className="text-zinc-400 font-mono text-right">{t("transactions.amount", lang)}</TableHead>
                <TableHead className="text-zinc-400 font-mono text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-zinc-500 font-mono py-8">
                    {transactions.length === 0
                      ? "Nenhuma transação encontrada"
                      : "Nenhuma transação corresponde aos filtros"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="font-mono text-zinc-400 text-sm">
                      {formatDate(transaction.date)}
                    </TableCell>
                    <TableCell className="text-zinc-100">{transaction.description}</TableCell>
                    <TableCell>
                      {(() => {
                        const category = getCategory(transaction.category)
                        const categoryColor = category?.color || "var(--theme-primary)"
                        const isIncome = category?.type === "income" || transaction.category === "Income"
                        
                        return (
                          <Badge
                            className={`font-mono text-xs ${
                              isIncome
                                ? "border"
                                : "bg-zinc-800 text-zinc-400 border-zinc-700"
                            }`}
                            style={isIncome ? {
                              backgroundColor: categoryColor === "var(--theme-primary)" 
                                ? 'color-mix(in oklch, var(--theme-primary) 10%, transparent)'
                                : `color-mix(in oklch, ${categoryColor} 10%, transparent)`,
                              color: categoryColor === "var(--theme-primary)" 
                                ? 'var(--theme-primary)' 
                                : categoryColor,
                              borderColor: categoryColor === "var(--theme-primary)"
                                ? 'color-mix(in oklch, var(--theme-primary) 20%, transparent)'
                                : `color-mix(in oklch, ${categoryColor} 20%, transparent)`
                            } : category ? {
                              backgroundColor: `color-mix(in oklch, ${categoryColor} 10%, transparent)`,
                              color: categoryColor,
                              borderColor: `color-mix(in oklch, ${categoryColor} 20%, transparent)`
                            } : undefined}
                          >
                            {category?.icon && <span className="mr-1">{category.icon}</span>}
                            {category?.name || transaction.category}
                          </Badge>
                        )
                      })()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {transaction.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="font-mono text-xs border-zinc-700 text-zinc-500">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm">{transaction.account}</TableCell>
                    <TableCell
                      className={`font-mono text-right font-semibold ${
                        transaction.amount > 0 ? "" : "text-rose-600"
                      }`}
                      style={transaction.amount > 0 ? { color: 'var(--theme-primary)' } : undefined}
                    >
                      {transaction.amount > 0 ? "+" : "-"}{formatCurrency(Math.abs(transaction.amount))}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(transaction)}
                          className="h-8 w-8 p-0"
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'color-mix(in oklch, var(--theme-primary) 20%, transparent)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Edit className="w-4 h-4 text-emerald-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(transaction)}
                          className="h-8 w-8 p-0 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      className={`cursor-pointer ${
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "hover:bg-zinc-800"
                      }`}
                    />
                  </PaginationItem>
                  
                  {getPageNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                      {page === "ellipsis" ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          onClick={() => setCurrentPage(page as number)}
                          isActive={currentPage === page}
                          className={`cursor-pointer ${
                            currentPage === page
                              ? "bg-theme-primary text-zinc-950 hover:bg-theme-primary-hover"
                              : "hover:bg-zinc-800"
                          }`}
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      className={`cursor-pointer ${
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "hover:bg-zinc-800"
                      }`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
