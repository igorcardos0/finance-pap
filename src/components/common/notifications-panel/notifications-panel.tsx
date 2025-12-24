"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, Check, CheckCheck, Trash2, X, AlertCircle, Target, CreditCard, TrendingUp } from "lucide-react"
import { useNotifications, type Notification } from "@/hooks/use-notifications"
import { formatDate } from "@/lib/formatters"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function NotificationsPanel() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications()
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
      setOpen(false)
    }
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "budget":
        return <AlertCircle className="w-4 h-4 text-orange-500" />
      case "goal":
        return <Target className="w-4 h-4 text-blue-500" />
      case "debt":
        return <CreditCard className="w-4 h-4 text-red-500" />
      case "emergency":
        return <TrendingUp className="w-4 h-4 text-emerald-500" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getSeverityColor = (severity: Notification["severity"]) => {
    switch (severity) {
      case "error":
        return "text-red-400 border-red-500/20 bg-red-500/10"
      case "warning":
        return "text-orange-400 border-orange-500/20 bg-orange-500/10"
      case "info":
        return "text-blue-400 border-blue-500/20 bg-blue-500/10"
      default:
        return "text-zinc-400 border-zinc-500/20 bg-zinc-500/10"
    }
  }

  const unreadNotifications = notifications.filter((n) => !n.read)
  const readNotifications = notifications.filter((n) => n.read)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative border-zinc-800 bg-transparent hover:bg-zinc-800"
        >
          <Bell className="w-5 h-5 text-zinc-400" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs font-mono">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 bg-zinc-900 border-zinc-800 text-zinc-100"
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">
              {unreadCount} não lidas
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-zinc-500 font-mono text-sm">
              Nenhuma notificação
            </div>
          ) : (
            <div className="space-y-1">
              {unreadNotifications.length > 0 && (
                <>
                  {unreadNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 border rounded-md cursor-pointer transition-colors hover:bg-zinc-800",
                        getSeverityColor(notification.severity),
                        "border-l-4"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3 group">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs opacity-80 mt-1">{notification.message}</p>
                          <p className="text-xs opacity-60 mt-1 font-mono">
                            {formatDate(notification.timestamp)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {readNotifications.length > 0 && unreadNotifications.length > 0 && (
                <div className="pt-2 border-t border-zinc-800">
                  <p className="text-xs text-zinc-500 px-3 mb-2 font-mono">Lidas</p>
                </div>
              )}

              {readNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-3 border border-zinc-800 rounded-md cursor-pointer transition-colors hover:bg-zinc-800 opacity-60"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-zinc-400">{notification.title}</p>
                      <p className="text-xs text-zinc-500 mt-1">{notification.message}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <div className="p-2 space-y-1">
              <DropdownMenuItem
                onClick={markAllAsRead}
                className="text-zinc-300 hover:bg-zinc-800 cursor-pointer"
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Marcar todas como lidas
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={clearAll}
                className="text-red-400 hover:bg-red-500/10 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar todas
              </DropdownMenuItem>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

