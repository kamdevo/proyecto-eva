"use client"

import { useState } from "react"
import {
  GitBranch,
  FileText,
  BarChart3,
  Bell,
  Plus,
  Star,
  Eye,
  Calendar,
  Filter,
  Edit3,
  MessageSquare,
  ThumbsUp,
  Trash2,
  Search,
  Database,
  Users,
  Clock,
  TrendingUp,
  Award,
  Bookmark,
  Share2,
  ChevronDown,
  Check,
  AlertCircle,
  Info,
  Heart,
  Tag,
  Cloud,
  Folder,
  FileSpreadsheet,
  Archive,
  Video,
  Music,
  Camera,
  MapPin,
  UserCheck,
  Send,
  ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"

export default function EnhancedGitHubLayout() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedFiles, setSelectedFiles] = useState([])
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [commentModalOpen, setCommentModalOpen] = useState(false)
  const [ratingModalOpen, setRatingModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [rating, setRating] = useState([4])

  const reports = [
    {
      id: 1,
      title: "Análisis Q4 2024.xlsx",
      description: "Reporte completo del rendimiento del sistema",
      author: "María González",
      date: "2024-01-15",
      status: "approved",
      rating: 4.8,
      comments: 12,
      views: 245,
      size: "2.4 MB",
      type: "excel",
      tags: ["performance", "quarterly"],
      priority: "high",
    },
    {
      id: 2,
      title: "Funcionalidades.docx",
      description: "Documentación técnica de nuevas características",
      author: "Carlos Rodríguez",
      date: "2024-01-12",
      status: "pending",
      rating: 4.2,
      comments: 8,
      views: 156,
      size: "1.8 MB",
      type: "document",
      tags: ["development", "features"],
      priority: "medium",
    },
    {
      id: 3,
      title: "Seguridad-Sistema.pdf",
      description: "Evaluación completa de vulnerabilidades",
      author: "Ana Martínez",
      date: "2024-01-10",
      status: "review",
      rating: 4.9,
      comments: 15,
      views: 389,
      size: "3.2 MB",
      type: "pdf",
      tags: ["security", "audit"],
      priority: "critical",
    },
    {
      id: 4,
      title: "Backup-Database.zip",
      description: "Respaldo completo de la base de datos",
      author: "Luis Pérez",
      date: "2024-01-08",
      status: "approved",
      rating: 4.5,
      comments: 5,
      views: 123,
      size: "45.8 MB",
      type: "zip",
      tags: ["backup", "database"],
      priority: "high",
    },
    {
      id: 5,
      title: "Presentacion-Resultados.pptx",
      description: "Presentación de resultados trimestrales",
      author: "Sofia Ruiz",
      date: "2024-01-05",
      status: "approved",
      rating: 4.7,
      comments: 18,
      views: 567,
      size: "12.3 MB",
      type: "presentation",
      tags: ["presentation", "results"],
      priority: "medium",
    },
    {
      id: 6,
      title: "Video-Tutorial.mp4",
      description: "Tutorial de uso del sistema",
      author: "Diego Torres",
      date: "2024-01-03",
      status: "approved",
      rating: 4.6,
      comments: 22,
      views: 789,
      size: "89.4 MB",
      type: "video",
      tags: ["tutorial", "training"],
      priority: "low",
    },
    {
      id: 7,
      title: "Graficos-Estadisticas.png",
      description: "Gráficos estadísticos del mes",
      author: "Carmen López",
      date: "2024-01-01",
      status: "review",
      rating: 4.3,
      comments: 9,
      views: 234,
      size: "5.6 MB",
      type: "image",
      tags: ["graphics", "statistics"],
      priority: "medium",
    },
    {
      id: 8,
      title: "Audio-Reunion.mp3",
      description: "Grabación de la reunión semanal",
      author: "Roberto Silva",
      date: "2023-12-28",
      status: "approved",
      rating: 4.1,
      comments: 7,
      views: 145,
      size: "23.7 MB",
      type: "audio",
      tags: ["meeting", "audio"],
      priority: "low",
    },
  ]

  const evidences = [
    {
      id: 1,
      title: "Reunión de Planificación Estratégica Q1 2024",
      description:
        "Sesión de planificación para el primer trimestre con todos los departamentos. Se definieron objetivos y metas clave.",
      author: "María González",
      date: "2024-01-15 14:30",
      image: "/placeholder.svg?height=300&width=400",
      location: "Sala de Juntas Principal",
      attendees: 12,
      comments: [
        { author: "Carlos R.", text: "Excelente sesión, muy productiva", time: "hace 2h" },
        { author: "Ana M.", text: "Los objetivos están muy claros", time: "hace 1h" },
      ],
    },
    {
      id: 2,
      title: "Workshop de Innovación Tecnológica",
      description:
        "Taller sobre nuevas tecnologías y su implementación en nuestros procesos. Participación de expertos externos.",
      author: "Carlos Rodríguez",
      date: "2024-01-12 09:00",
      image: "/placeholder.svg?height=300&width=400",
      location: "Auditorio Central",
      attendees: 25,
      comments: [{ author: "Luis P.", text: "Muy interesante el tema de IA", time: "hace 3h" }],
    },
    {
      id: 3,
      title: "Revisión de Seguridad Mensual",
      description: "Reunión mensual del comité de seguridad para revisar incidentes y actualizar protocolos.",
      author: "Ana Martínez",
      date: "2024-01-10 16:00",
      image: "/placeholder.svg?height=300&width=400",
      location: "Sala de Seguridad",
      attendees: 8,
      comments: [],
    },
  ]

  const getFileIcon = (type) => {
    switch (type) {
      case "excel":
        return <FileSpreadsheet className="w-8 h-8 text-green-600" />;
      case "pdf":
        return <FileText className="w-8 h-8 text-red-600" />;
      case "zip":
        return <Archive className="w-8 h-8 text-yellow-600" />;
      case "image":
        return <ImageIcon className="w-8 h-8 text-purple-600" />;
      case "video":
        return <Video className="w-8 h-8 text-blue-600" />;
      case "audio":
        return <Music className="w-8 h-8 text-pink-600" />;
      case "presentation":
        return <BarChart3 className="w-8 h-8 text-orange-600" />;
      default:
        return <FileText className="w-8 h-8 text-gray-600" />;
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      case "pending":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20"
      case "review":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      case "high":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20"
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      case "low":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  const EditReportModal = () => (
    <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-blue-600" />
            Editar Reporte: {selectedReport?.title}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-semibold">
                Título del Reporte
              </Label>
              <Input id="title" defaultValue={selectedReport?.title} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="description" className="text-sm font-semibold">
                Descripción
              </Label>
              <Textarea
                id="description"
                defaultValue={selectedReport?.description}
                className="mt-1 min-h-[100px]" />
            </div>
            <div>
              <Label htmlFor="tags" className="text-sm font-semibold">
                Etiquetas
              </Label>
              <Input
                id="tags"
                defaultValue={selectedReport?.tags?.join(", ")}
                placeholder="Separar con comas"
                className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority" className="text-sm font-semibold">
                  Prioridad
                </Label>
                <Select defaultValue={selectedReport?.priority}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status" className="text-sm font-semibold">
                  Estado
                </Label>
                <Select defaultValue={selectedReport?.status}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="review">En Revisión</SelectItem>
                    <SelectItem value="approved">Aprobado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div
              className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                Información del Archivo
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                  <Badge variant="outline">{selectedReport?.type}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tamaño:</span>
                  <span className="font-medium">{selectedReport?.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Vistas:</span>
                  <span className="font-medium">{selectedReport?.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Comentarios:</span>
                  <span className="font-medium">{selectedReport?.comments}</span>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">Configuraciones Avanzadas</Label>
              <div className="mt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Permitir comentarios</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Visible públicamente</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notificar cambios</span>
                  <Switch />
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setEditModalOpen(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Check className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  const CommentModal = () => (
    <Dialog open={commentModalOpen} onOpenChange={setCommentModalOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            Comentarios: {selectedReport?.title}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4 mb-6">
            {[1, 2, 3].map((comment) => (
              <div key={comment} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>U{comment}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">Usuario {comment}</span>
                      <Badge variant="outline" className="text-xs">
                        Colaborador
                      </Badge>
                      <span className="text-xs text-gray-500">hace 2 horas</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Este es un comentario de ejemplo sobre el reporte. Muy buen análisis de los datos presentados.
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <Button variant="ghost" size="sm" className="text-xs">
                        <Heart className="w-3 h-3 mr-1" />
                        Me gusta (5)
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs">
                        Responder
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div>
            <Label htmlFor="new-comment" className="text-sm font-semibold">
              Agregar Comentario
            </Label>
            <Textarea
              id="new-comment"
              placeholder="Escribe tu comentario aquí..."
              className="mt-2 min-h-[100px]" />
            <div className="flex justify-between items-center mt-3">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Tag className="w-4 h-4 mr-1" />
                  Etiquetar
                </Button>
                <Button variant="ghost" size="sm">
                  <Bookmark className="w-4 h-4 mr-1" />
                  Marcar
                </Button>
              </div>
              <Button
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <MessageSquare className="w-4 h-4 mr-2" />
                Comentar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  const RatingModal = () => (
    <Dialog open={ratingModalOpen} onOpenChange={setRatingModalOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Calificar Reporte: {selectedReport?.title}
          </DialogTitle>
        </DialogHeader>
        <div className="py-6 space-y-6">
          <div className="text-center">
            <div className="flex justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 cursor-pointer transition-colors ${
                    star <= rating[0] ? "text-yellow-500 fill-yellow-500" : "text-gray-300 hover:text-yellow-400"
                  }`}
                  onClick={() => setRating([star])} />
              ))}
            </div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{rating[0]} de 5 estrellas</p>
          </div>

          <div>
            <Label className="text-sm font-semibold">Calificación Detallada</Label>
            <div className="mt-3 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Calidad del Contenido</span>
                  <span>{rating[0]}/5</span>
                </div>
                <Slider
                  value={rating}
                  onValueChange={setRating}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full" />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="feedback" className="text-sm font-semibold">
              Comentario de Evaluación
            </Label>
            <Textarea
              id="feedback"
              placeholder="Comparte tu opinión sobre este reporte..."
              className="mt-2 min-h-[100px]" />
          </div>

          <div
            className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              Estadísticas del Reporte
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Calificación Actual:</span>
                <span className="font-medium">{selectedReport?.rating}/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Evaluaciones:</span>
                <span className="font-medium">24</span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setRatingModalOpen(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
            <ThumbsUp className="w-4 h-4 mr-2" />
            Enviar Calificación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  const DeleteModal = () => (
    <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            Confirmar Eliminación
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              ¿Estás seguro de que deseas eliminar este reporte? Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
            <p className="font-semibold text-sm">{selectedReport?.title}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Creado por {selectedReport?.author} el {selectedReport?.date}
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar Definitivamente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  const EvidenceModal = () => (
    <Dialog open={evidenceModalOpen} onOpenChange={setEvidenceModalOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            Nueva Evidencia de Reunión
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="meeting-title" className="text-sm font-semibold">
              Título de la Reunión
            </Label>
            <Input
              id="meeting-title"
              placeholder="Ej: Reunión de Planificación Q1 2024"
              className="mt-1" />
          </div>

          <div>
            <Label htmlFor="meeting-description" className="text-sm font-semibold">
              Descripción
            </Label>
            <Textarea
              id="meeting-description"
              placeholder="Describe los temas tratados en la reunión..."
              className="mt-1 min-h-[100px]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="meeting-location" className="text-sm font-semibold">
                Ubicación
              </Label>
              <Input id="meeting-location" placeholder="Sala de Juntas" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="meeting-attendees" className="text-sm font-semibold">
                Asistentes
              </Label>
              <Input id="meeting-attendees" type="number" placeholder="12" className="mt-1" />
            </div>
          </div>

          <div>
            <Label htmlFor="meeting-image" className="text-sm font-semibold">
              Foto de la Reunión
            </Label>
            <div
              className="mt-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Arrastra una imagen aquí o haz clic para seleccionar
              </p>
              <Button variant="outline" className="mt-2">
                Seleccionar Imagen
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setEvidenceModalOpen(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Send className="w-4 h-4 mr-2" />
            Publicar Evidencia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/20">
      {/* Enhanced Header */}
      <header
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div
                  className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <GitBranch className="w-6 h-6 text-white" />
                </div>
                <div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <h1
                  className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                  Reportes Inovación
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Advanced Analytics Platform</p>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-4 ml-8">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar repositorios, archivos, reportes..."
                  className="w-96 pl-10 bg-gray-100/50 dark:bg-gray-700/50 border-gray-300/50 dark:border-gray-600/50 focus:bg-white dark:focus:bg-gray-700 transition-colors" />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div
              className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg px-3 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Sistema Activo</span>
            </div>

            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <div
                className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">3</span>
              </div>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Nuevo</span>
            </Button>

            <div className="flex items-center space-x-2">
              <Avatar className="w-9 h-9 ring-2 ring-blue-200 dark:ring-blue-800">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold">
                  JD
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Enhanced Sidebar */}
          <div className="xl:col-span-1">
            <Card
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <Avatar className="w-16 h-16 ring-4 ring-blue-200 dark:ring-blue-800">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-lg font-bold">
                        JD
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mt-3">John Doe</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">@johndoe • Administrador</p>
                  <Badge className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">Pro Member</Badge>
                </div>

                {/* Tech Style Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div
                    className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">1,247</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Active Files</div>
                  </div>
                  <div
                    className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">2.4 TB</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Data Processed</div>
                  </div>
                  <div
                    className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">24</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Repositories</div>
                  </div>
                  <div
                    className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">99.9%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Uptime</div>
                  </div>
                </div>

                {/* Mega Style Storage */}
                <div className="mb-6">
                  <div className="text-center mb-3">
                    <div
                      className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Cloud className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-white">Cloud Storage</h4>
                    <p className="text-sm text-gray-400">2.4 GB of 15 GB used</p>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: "16%" }}></div>
                  </div>
                </div>

                {/* Mega Style Navigation */}
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Folder className="w-4 h-4 mr-3" />
                    All Files
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Star className="w-4 h-4 mr-3" />
                    Starred
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Share2 className="w-4 h-4 mr-3" />
                    Shared
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Trash2 className="w-4 h-4 mr-3" />
                    Trash
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Main Content */}
          <div className="xl:col-span-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList
                className="grid w-full grid-cols-5 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <TabsTrigger
                  value="dashboard"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger
                  value="reports"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">
                  <Award className="w-4 h-4 mr-2" />
                  Reportes
                </TabsTrigger>
                <TabsTrigger
                  value="evidences"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
                  <Camera className="w-4 h-4 mr-2" />
                  Evidencias
                </TabsTrigger>
                <TabsTrigger
                  value="files"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  Archivos
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="reports" className="mt-6">
                <div className="space-y-6">
                  {/* Enhanced Reports Header */}
                  <div
                    className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                      <h2
                        className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                        Gestión de Reportes
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Administra y evalúa todos los reportes del sistema
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtros
                      </Button>
                      <Button
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Reporte
                      </Button>
                    </div>
                  </div>

                  {/* Enhanced Reports Grid - 4 per row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {reports.map((report) => (
                      <Card
                        key={report.id}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* File Icon and Title */}
                            <div className="flex items-start gap-3">
                              <div
                                className="w-12 h-12 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center shadow-sm">
                                {getFileIcon(report.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3
                                  className="font-semibold text-sm text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {report.title}
                                </h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                  {report.description}
                                </p>
                              </div>
                            </div>

                            {/* Status and Priority */}
                            <div className="flex gap-1">
                              <Badge className={`${getStatusColor(report.status)} text-xs`}>
                                {report.status === "approved" ? "✓" : report.status === "pending" ? "⏳" : "👁"}
                              </Badge>
                              <Badge className={`${getPriorityColor(report.priority)} text-xs`}>
                                {report.priority === "critical"
                                  ? "🔴"
                                  : report.priority === "high"
                                    ? "🟠"
                                    : report.priority === "medium"
                                      ? "🟡"
                                      : "🟢"}
                              </Badge>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500" />
                                <span className="font-medium">{report.rating}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3 text-gray-500" />
                                <span>{report.views}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3 text-blue-500" />
                                <span>{report.comments}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Database className="w-3 h-3 text-purple-500" />
                                <span>{report.size}</span>
                              </div>
                            </div>

                            {/* Author and Date */}
                            <div className="text-xs text-gray-500 border-t pt-2">
                              <div className="flex items-center gap-1 mb-1">
                                <Avatar className="w-4 h-4">
                                  <AvatarFallback className="text-xs">
                                    {report.author
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="truncate">{report.author}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{report.date}</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 border-blue-200 text-blue-700 hover:bg-blue-50"
                                onClick={() => {
                                  setSelectedReport(report)
                                  setEditModalOpen(true)
                                }}>
                                <Edit3 className="w-3 h-3 mr-1" />
                                Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 border-green-200 text-green-700 hover:bg-green-50"
                                onClick={() => {
                                  setSelectedReport(report)
                                  setCommentModalOpen(true)
                                }}>
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Comentar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                                onClick={() => {
                                  setSelectedReport(report)
                                  setRatingModalOpen(true)
                                }}>
                                <Award className="w-3 h-3 mr-1" />
                                Calificar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 border-red-200 text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  setSelectedReport(report)
                                  setDeleteModalOpen(true)
                                }}>
                                <Trash2 className="w-3 h-3 mr-1" />
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="evidences" className="mt-6">
                <div className="space-y-6">
                  {/* Evidence Header */}
                  <div
                    className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                      <h2
                        className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-emerald-800 dark:from-white dark:via-green-200 dark:to-emerald-200 bg-clip-text text-transparent">
                        Evidencias de Reuniones
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Documenta y comparte evidencias de tus reuniones
                      </p>
                    </div>
                    <Button
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                      onClick={() => setEvidenceModalOpen(true)}>
                      <Camera className="w-4 h-4 mr-2" />
                      Nueva Evidencia
                    </Button>
                  </div>

                  {/* Evidence Feed */}
                  <div className="space-y-6">
                    {evidences.map((evidence) => (
                      <Card
                        key={evidence.id}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                        <CardContent className="p-6">
                          {/* Header */}
                          <div className="flex items-start gap-4 mb-4">
                            <Avatar className="w-12 h-12 ring-2 ring-green-200 dark:ring-green-800">
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback
                                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold">
                                {evidence.author
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{evidence.author}</h3>
                                <Badge variant="outline" className="text-xs">
                                  Organizador
                                </Badge>
                              </div>
                              <div
                                className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{evidence.date}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{evidence.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <UserCheck className="w-4 h-4" />
                                  <span>{evidence.attendees} asistentes</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="mb-4">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {evidence.title}
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">{evidence.description}</p>

                            {/* Image */}
                            <div
                              className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                              <img
                                src={evidence.image || "/placeholder.svg"}
                                alt={evidence.title}
                                className="w-full h-64 object-cover" />
                              <div
                                className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div
                            className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600">
                                <Heart className="w-4 h-4 mr-1" />
                                Me gusta
                              </Button>
                              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                                <MessageSquare className="w-4 h-4 mr-1" />
                                Comentar ({evidence.comments.length})
                              </Button>
                              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-green-600">
                                <Share2 className="w-4 h-4 mr-1" />
                                Compartir
                              </Button>
                            </div>
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-yellow-600">
                              <Bookmark className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Comments */}
                          {evidence.comments.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                              <div className="space-y-3">
                                {evidence.comments.map((comment, index) => (
                                  <div key={index} className="flex items-start gap-3">
                                    <Avatar className="w-8 h-8">
                                      <AvatarFallback className="text-xs">
                                        {comment.author
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-sm">{comment.author}</span>
                                        <span className="text-xs text-gray-500">{comment.time}</span>
                                      </div>
                                      <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Add Comment */}
                              <div className="flex items-center gap-3 mt-4">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback>JD</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 flex gap-2">
                                  <Input placeholder="Escribe un comentario..." className="flex-1" />
                                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                                    <Send className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Other tabs content */}
              <TabsContent value="dashboard" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      title: "Total Reportes",
                      value: "1,247",
                      icon: FileText,
                      color: "from-blue-500 to-indigo-500",
                      change: "+12%",
                    },
                    {
                      title: "Aprobados",
                      value: "892",
                      icon: Check,
                      color: "from-green-500 to-emerald-500",
                      change: "+8%",
                    },
                    {
                      title: "En Revisión",
                      value: "234",
                      icon: Clock,
                      color: "from-yellow-500 to-orange-500",
                      change: "+15%",
                    },
                    {
                      title: "Usuarios Activos",
                      value: "156",
                      icon: Users,
                      color: "from-purple-500 to-pink-500",
                      change: "+5%",
                    },
                  ].map((stat, index) => (
                    <Card
                      key={index}
                      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">{stat.change}</p>
                          </div>
                          <div
                            className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center shadow-lg`}>
                            <stat.icon className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      {/* Modals */}
      <EvidenceModal />
    </div>
  );
}
