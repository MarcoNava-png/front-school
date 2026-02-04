"use client"

import { useState, useEffect, useCallback } from "react"

import {
  Mail,
  Inbox,
  RefreshCw,
  Search,
  Send,
  Star,
  Clock,
  Paperclip,
  ChevronLeft,
  Users,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import microsoftGraphService, {
  EmailDto,
  UserInfoDto,
  SendEmailRequest,
} from "@/services/microsoft-graph-service"

export default function AzureEmailsPage() {
  const [users, setUsers] = useState<UserInfoDto[]>([])
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [emails, setEmails] = useState<EmailDto[]>([])
  const [selectedEmail, setSelectedEmail] = useState<EmailDto | null>(null)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [isLoadingEmails, setIsLoadingEmails] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [composeOpen, setComposeOpen] = useState(false)
  const [composeData, setComposeData] = useState<SendEmailRequest>({
    to: [],
    cc: [],
    subject: "",
    body: "",
    isHtml: false,
  })
  const [toInput, setToInput] = useState("")
  const [ccInput, setCcInput] = useState("")
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersData = await microsoftGraphService.getUsers(200)
        setUsers(usersData.filter((u) => u.accountEnabled))
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error al cargar usuarios"
        setError(message)
      } finally {
        setIsLoadingUsers(false)
      }
    }
    loadUsers()
  }, [])

  const loadEmails = useCallback(async () => {
    if (!selectedUser) return

    setIsLoadingEmails(true)
    setError(null)
    setSelectedEmail(null)
    try {
      const emailsData = await microsoftGraphService.getEmails(
        selectedUser,
        50,
        unreadOnly
      )
      setEmails(emailsData)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al cargar correos"
      setError(message)
      toast.error("Error al cargar correos")
    } finally {
      setIsLoadingEmails(false)
    }
  }, [selectedUser, unreadOnly])

  useEffect(() => {
    if (selectedUser) {
      loadEmails()
    }
  }, [selectedUser, loadEmails])

  const handleSearch = async () => {
    if (!selectedUser || !searchTerm.trim()) return

    setIsLoadingEmails(true)
    setError(null)
    try {
      const results = await microsoftGraphService.searchEmails(
        selectedUser,
        searchTerm,
        50
      )
      setEmails(results)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error en la busqueda"
      toast.error(message)
    } finally {
      setIsLoadingEmails(false)
    }
  }

  const handleViewEmail = async (email: EmailDto) => {
    setSelectedEmail(email)

    if (!email.isRead) {
      try {
        await microsoftGraphService.markAsRead(selectedUser, email.id)
        setEmails((prev) =>
          prev.map((e) => (e.id === email.id ? { ...e, isRead: true } : e))
        )
      } catch {
        // silently ignore mark-as-read errors
      }
    }
  }

  const handleSendEmail = async () => {
    if (!selectedUser) {
      toast.error("Seleccione un usuario primero")
      return
    }

    if (composeData.to.length === 0) {
      toast.error("Ingrese al menos un destinatario")
      return
    }

    if (!composeData.subject.trim()) {
      toast.error("Ingrese un asunto")
      return
    }

    setIsSending(true)
    try {
      await microsoftGraphService.sendEmail(selectedUser, composeData)
      toast.success("Correo enviado exitosamente")
      setComposeOpen(false)
      setComposeData({ to: [], cc: [], subject: "", body: "", isHtml: false })
      setToInput("")
      setCcInput("")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al enviar correo"
      toast.error(message)
    } finally {
      setIsSending(false)
    }
  }

  const addRecipient = (type: "to" | "cc", email: string) => {
    const trimmed = email.trim()
    if (!trimmed) return
    if (!trimmed.includes("@")) {
      toast.error("Ingrese un correo valido")
      return
    }

    if (type === "to") {
      if (!composeData.to.includes(trimmed)) {
        setComposeData((prev) => ({ ...prev, to: [...prev.to, trimmed] }))
      }
      setToInput("")
    } else {
      if (!composeData.cc?.includes(trimmed)) {
        setComposeData((prev) => ({ ...prev, cc: [...(prev.cc || []), trimmed] }))
      }
      setCcInput("")
    }
  }

  const removeRecipient = (type: "to" | "cc", email: string) => {
    if (type === "to") {
      setComposeData((prev) => ({
        ...prev,
        to: prev.to.filter((e) => e !== email),
      }))
    } else {
      setComposeData((prev) => ({
        ...prev,
        cc: (prev.cc || []).filter((e) => e !== email),
      }))
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } else if (days === 1) {
      return "Ayer"
    } else if (days < 7) {
      return date.toLocaleDateString("es-MX", { weekday: "long" })
    } else {
      return date.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Correos Azure</h1>
          <p className="text-muted-foreground">
            Lee y envia correos desde cuentas Office 365
          </p>
        </div>
        <div className="flex gap-2">
          {selectedUser && (
            <>
              <Button variant="outline" onClick={loadEmails} disabled={isLoadingEmails}>
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoadingEmails ? "animate-spin" : ""}`}
                />
                Actualizar
              </Button>
              <Button onClick={() => setComposeOpen(true)}>
                <Send className="h-4 w-4 mr-2" />
                Redactar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* User Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Seleccionar Usuario
          </CardTitle>
          <CardDescription>
            Selecciona un usuario para ver y gestionar sus correos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label>Usuario</Label>
              {isLoadingUsers ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar usuario..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem
                        key={user.id}
                        value={user.email || user.userPrincipalName}
                      >
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{user.displayName}</span>
                          <span className="text-muted-foreground text-xs">
                            ({user.email || user.userPrincipalName})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email List and Detail */}
      {selectedUser && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Email List */}
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Inbox className="h-5 w-5" />
                  Bandeja de entrada
                </CardTitle>
                <Badge variant="secondary">{emails.length}</Badge>
              </div>
              {/* Search */}
              <div className="flex gap-2 mt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-8 h-9"
                  />
                </div>
                <Button
                  variant={unreadOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUnreadOnly(!unreadOnly)}
                  title="Solo no leidos"
                >
                  <Star className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {isLoadingEmails ? (
                  <div className="p-4 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : emails.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No hay correos
                  </div>
                ) : (
                  <div>
                    {emails.map((email) => (
                      <div
                        key={email.id}
                        className={`p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedEmail?.id === email.id ? "bg-muted" : ""
                        } ${!email.isRead ? "bg-blue-50 dark:bg-blue-950/20" : ""}`}
                        onClick={() => handleViewEmail(email)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm truncate ${
                                !email.isRead ? "font-semibold" : ""
                              }`}
                            >
                              {email.from?.name || email.from?.address || "Desconocido"}
                            </p>
                            <p
                              className={`text-sm truncate ${
                                !email.isRead ? "font-medium" : "text-muted-foreground"
                              }`}
                            >
                              {email.subject || "(Sin asunto)"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {email.bodyPreview}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDate(email.receivedDateTime)}
                            </span>
                            <div className="flex gap-1">
                              {!email.isRead && (
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                              )}
                              {email.hasAttachments && (
                                <Paperclip className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Email Detail */}
          <Card className="md:col-span-2">
            {selectedEmail ? (
              <>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mb-2 -ml-2"
                        onClick={() => setSelectedEmail(null)}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Volver
                      </Button>
                      <CardTitle className="text-xl">
                        {selectedEmail.subject || "(Sin asunto)"}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Email metadata */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">De:</span>
                      <span>
                        {selectedEmail.from?.name || selectedEmail.from?.address}
                      </span>
                      {selectedEmail.from?.name && (
                        <span className="text-muted-foreground">
                          &lt;{selectedEmail.from.address}&gt;
                        </span>
                      )}
                    </div>
                    {selectedEmail.toRecipients.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Para:</span>
                        <span>
                          {selectedEmail.toRecipients
                            .map((r) => r.name || r.address)
                            .join(", ")}
                        </span>
                      </div>
                    )}
                    {selectedEmail.ccRecipients.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">CC:</span>
                        <span>
                          {selectedEmail.ccRecipients
                            .map((r) => r.name || r.address)
                            .join(", ")}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {new Date(selectedEmail.receivedDateTime).toLocaleString(
                          "es-MX",
                          {
                            dateStyle: "full",
                            timeStyle: "short",
                          }
                        )}
                      </span>
                    </div>
                    {selectedEmail.hasAttachments && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Paperclip className="h-4 w-4" />
                        <span>Tiene archivos adjuntos</span>
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />

                  {/* Email body */}
                  <ScrollArea className="h-[350px]">
                    {selectedEmail.bodyContentType === "html" ? (
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                      />
                    ) : (
                      <pre className="whitespace-pre-wrap font-sans text-sm">
                        {selectedEmail.body}
                      </pre>
                    )}
                  </ScrollArea>
                </CardContent>
              </>
            ) : (
              <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                <div className="text-center">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecciona un correo para ver su contenido</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Compose Dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Redactar Correo</DialogTitle>
            <DialogDescription>
              Enviar correo como {selectedUser}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* To */}
            <div className="space-y-2">
              <Label>Para</Label>
              <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
                {composeData.to.map((email) => (
                  <Badge key={email} variant="secondary" className="gap-1">
                    {email}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeRecipient("to", email)}
                    />
                  </Badge>
                ))}
                <Input
                  value={toInput}
                  onChange={(e) => setToInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault()
                      addRecipient("to", toInput)
                    }
                  }}
                  onBlur={() => addRecipient("to", toInput)}
                  placeholder="correo@ejemplo.com"
                  className="border-0 shadow-none focus-visible:ring-0 h-6 flex-1 min-w-[150px]"
                />
              </div>
            </div>

            {/* CC */}
            <div className="space-y-2">
              <Label>CC (opcional)</Label>
              <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
                {composeData.cc?.map((email) => (
                  <Badge key={email} variant="secondary" className="gap-1">
                    {email}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeRecipient("cc", email)}
                    />
                  </Badge>
                ))}
                <Input
                  value={ccInput}
                  onChange={(e) => setCcInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault()
                      addRecipient("cc", ccInput)
                    }
                  }}
                  onBlur={() => addRecipient("cc", ccInput)}
                  placeholder="correo@ejemplo.com"
                  className="border-0 shadow-none focus-visible:ring-0 h-6 flex-1 min-w-[150px]"
                />
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label>Asunto</Label>
              <Input
                value={composeData.subject}
                onChange={(e) =>
                  setComposeData((prev) => ({ ...prev, subject: e.target.value }))
                }
                placeholder="Asunto del correo"
              />
            </div>

            {/* Body */}
            <div className="space-y-2">
              <Label>Mensaje</Label>
              <Textarea
                value={composeData.body}
                onChange={(e) =>
                  setComposeData((prev) => ({ ...prev, body: e.target.value }))
                }
                placeholder="Escribe tu mensaje aqui..."
                rows={10}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setComposeOpen(false)
                setComposeData({ to: [], cc: [], subject: "", body: "", isHtml: false })
                setToInput("")
                setCcInput("")
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSendEmail} disabled={isSending}>
              {isSending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Send className="h-4 w-4 mr-2" />
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
