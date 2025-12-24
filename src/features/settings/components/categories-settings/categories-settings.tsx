"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Tag, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useCategories, type CustomCategory, DEFAULT_CATEGORIES } from "@/hooks/use-categories"
import { toast } from "@/lib/toast"
import { useLanguage, translateCategoryName } from "@/lib/i18n"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(50, "Nome muito longo"),
  color: z.string().min(1, "Cor é obrigatória"),
  type: z.enum(["income", "expense"], { required_error: "Tipo é obrigatório" }),
  icon: z.string().optional(),
})

type CategoryFormData = z.infer<typeof categorySchema>

const PRESET_COLORS = [
  { name: "Verde", value: "#10b981" },
  { name: "Azul", value: "#3b82f6" },
  { name: "Roxo", value: "#a855f7" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Laranja", value: "#f59e0b" },
  { name: "Vermelho", value: "#ef4444" },
  { name: "Amarelo", value: "#eab308" },
  { name: "Ciano", value: "#06b6d4" },
  { name: "Índigo", value: "#6366f1" },
  { name: "Tema", value: "var(--theme-primary)" },
]

export function CategoriesSettings() {
  const {
    allCategories,
    customCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useCategories()
  const lang = useLanguage()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<CustomCategory | null>(null)

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      color: "#3b82f6",
      type: "expense",
      icon: "",
    },
  })

  const handleOpenDialog = (category?: CustomCategory) => {
    if (category) {
      setEditingCategory(category)
      form.reset({
        name: category.name,
        color: category.color,
        type: category.type,
        icon: category.icon || "",
      })
    } else {
      setEditingCategory(null)
      form.reset({
        name: "",
        color: "#3b82f6",
        type: "expense",
        icon: "",
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingCategory(null)
    form.reset()
  }

  const onSubmit = (data: CategoryFormData) => {
    try {
      if (editingCategory) {
        updateCategory(editingCategory.id, data)
        toast.success("Categoria atualizada", `${data.name} foi atualizada com sucesso.`)
      } else {
        addCategory(data)
        toast.success("Categoria criada", `${data.name} foi adicionada com sucesso.`)
      }
      handleCloseDialog()
    } catch (error) {
      toast.error("Erro", "Não foi possível salvar a categoria.")
    }
  }

  const handleDelete = (category: CustomCategory) => {
    try {
      deleteCategory(category.id)
      toast.success("Categoria excluída", `${category.name} foi removida com sucesso.`)
      setDeletingCategory(null)
    } catch (error) {
      toast.error("Erro", "Não foi possível excluir a categoria padrão.")
    }
  }

  const isDefaultCategory = (category: CustomCategory) => {
    return DEFAULT_CATEGORIES.some((cat) => cat.id === category.id)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5 text-theme-primary" />
              <div>
                <CardTitle className="text-zinc-100 flex items-center gap-2">
                  Categorias Customizadas
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                      <p className="font-mono text-xs">
                        <strong>Categorias Customizadas</strong> permitem criar suas próprias categorias
                        para organizar melhor suas transações. Você pode escolher nome, cor e tipo (receita ou despesa).
                        As categorias padrão não podem ser excluídas.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
                <CardDescription className="text-zinc-500 font-mono text-sm">
                  Gerencie suas categorias personalizadas
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => handleOpenDialog()}
              style={{ backgroundColor: 'var(--theme-primary)' }}
              className="hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Default Categories */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 mb-3">Categorias Padrão</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {DEFAULT_CATEGORIES.map((category) => {
                  const translatedName = translateCategoryName(category.id, lang)
                  return (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg border border-zinc-800"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor:
                              category.color === "var(--theme-primary)"
                                ? "var(--theme-primary)"
                                : category.color,
                          }}
                        />
                        <div>
                          <p className="text-zinc-100 font-medium">{translatedName}</p>
                          <p className="text-xs text-zinc-500">
                            {category.type === "income" ? "Receita" : "Despesa"}
                          </p>
                        </div>
                      </div>
                    <Badge
                      className={
                        category.type === "income"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      }
                    >
                      {category.type === "income" ? "Receita" : "Despesa"}
                    </Badge>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Custom Categories */}
            {customCategories.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-zinc-400 mb-3">Suas Categorias</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {customCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg border border-zinc-800 group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor:
                              category.color === "var(--theme-primary)"
                                ? "var(--theme-primary)"
                                : category.color,
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-zinc-100 font-medium truncate">{category.name}</p>
                          <p className="text-xs text-zinc-500">
                            {category.type === "income" ? "Receita" : "Despesa"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(category)}
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-theme-primary/20"
                        >
                          <Edit className="w-3.5 h-3.5 text-zinc-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingCategory(category)}
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {customCategories.length === 0 && (
              <div className="text-center py-8 text-zinc-500 font-mono text-sm">
                Nenhuma categoria customizada. Clique em "Nova Categoria" para criar uma.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">
              {editingCategory ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {editingCategory
                ? "Edite os detalhes da categoria"
                : "Crie uma nova categoria para organizar suas transações"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Nome da Categoria</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Transporte, Lazer, etc."
                        className="bg-zinc-950 border-zinc-800 text-zinc-100"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Tipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        <SelectItem value="income">Receita</SelectItem>
                        <SelectItem value="expense">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Cor</FormLabel>
                    <div className="space-y-2">
                      <div className="grid grid-cols-5 gap-2">
                        {PRESET_COLORS.map((preset) => (
                          <button
                            key={preset.value}
                            type="button"
                            onClick={() => field.onChange(preset.value)}
                            className={`h-10 rounded-md border-2 transition-all ${
                              field.value === preset.value
                                ? "border-theme-primary ring-2 ring-theme-primary/30"
                                : "border-zinc-700 hover:border-zinc-600"
                            }`}
                            style={{
                              backgroundColor:
                                preset.value === "var(--theme-primary)"
                                  ? "var(--theme-primary)"
                                  : preset.value,
                            }}
                            title={preset.name}
                          />
                        ))}
                      </div>
                      <Input
                        type="text"
                        placeholder="#3b82f6 ou nome da cor"
                        className="bg-zinc-950 border-zinc-800 text-zinc-100 font-mono text-sm"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Ícone (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: 🚗, 📱, etc."
                        maxLength={2}
                        className="bg-zinc-950 border-zinc-800 text-zinc-100"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="border-zinc-800 bg-transparent"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-theme-primary hover:bg-theme-primary-hover">
                  {editingCategory ? "Salvar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem certeza que deseja excluir a categoria "{deletingCategory?.name}"? Esta ação não pode ser desfeita.
              Transações que usam esta categoria não serão afetadas, mas a categoria não estará mais disponível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-800 bg-transparent hover:bg-zinc-800">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingCategory && handleDelete(deletingCategory)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

