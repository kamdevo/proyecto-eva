import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { 
  ArrowLeft, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Upload,
  X
} from 'lucide-react'

export default function CreateTicket() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    prioridad: '',
    equipo: '',
    ubicacion: '',
    fecha_limite: '',
    archivo_adjunto: null,
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categorias = [
    { value: 'soporte_tecnico', label: 'Soporte Técnico' },
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'calibracion', label: 'Calibración' },
    { value: 'capacitacion', label: 'Capacitación' },
    { value: 'instalacion', label: 'Instalación' },
    { value: 'otro', label: 'Otro' },
  ]

  const prioridades = [
    { value: 'baja', label: 'Baja', color: 'secondary' },
    { value: 'media', label: 'Media', color: 'default' },
    { value: 'alta', label: 'Alta', color: 'destructive' },
    { value: 'urgente', label: 'Urgente', color: 'destructive' },
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setErrors(prev => ({ ...prev, archivo_adjunto: 'El archivo no puede ser mayor a 10MB' }))
        return
      }
      setFormData(prev => ({ ...prev, archivo_adjunto: file }))
      setErrors(prev => ({ ...prev, archivo_adjunto: '' }))
    }
  }

  const removeFile = () => {
    setFormData(prev => ({ ...prev, archivo_adjunto: null }))
  }

  const validateStep = (step) => {
    const newErrors = {}

    if (step === 1) {
      if (!formData.titulo.trim()) {
        newErrors.titulo = 'El título es requerido'
      }
      if (!formData.descripcion.trim()) {
        newErrors.descripcion = 'La descripción es requerida'
      }
    }

    if (step === 2) {
      if (!formData.categoria) {
        newErrors.categoria = 'La categoría es requerida'
      }
      if (!formData.prioridad) {
        newErrors.prioridad = 'La prioridad es requerida'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)
    
    // Simular envío
    setTimeout(() => {
      setIsSubmitting(false)
      alert('¡Ticket creado exitosamente!')
      navigate('/tickets')
    }, 2000)
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título del Ticket *
        </label>
        <Input
          placeholder="Describe brevemente el problema o solicitud"
          value={formData.titulo}
          onChange={(e) => handleInputChange('titulo', e.target.value)}
          className={errors.titulo ? 'border-red-500' : ''}
        />
        {errors.titulo && (
          <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción Detallada *
        </label>
        <textarea
          placeholder="Proporciona una descripción detallada del problema, incluyendo pasos para reproducirlo, síntomas observados, etc."
          value={formData.descripcion}
          onChange={(e) => handleInputChange('descripcion', e.target.value)}
          rows={6}
          className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            errors.descripcion ? 'border-red-500' : ''
          }`}
        />
        {errors.descripcion && (
          <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Equipo Afectado
          </label>
          <Input
            placeholder="Ej: Monitor de signos vitales - Sala 101"
            value={formData.equipo}
            onChange={(e) => handleInputChange('equipo', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ubicación
          </label>
          <Input
            placeholder="Ej: UCI, Sala de emergencias, Laboratorio"
            value={formData.ubicacion}
            onChange={(e) => handleInputChange('ubicacion', e.target.value)}
          />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categoría *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categorias.map((categoria) => (
            <button
              key={categoria.value}
              type="button"
              onClick={() => handleInputChange('categoria', categoria.value)}
              className={`p-3 text-left border rounded-lg transition-colors ${
                formData.categoria === categoria.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-sm">{categoria.label}</div>
            </button>
          ))}
        </div>
        {errors.categoria && (
          <p className="text-red-500 text-sm mt-1">{errors.categoria}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Prioridad *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {prioridades.map((prioridad) => (
            <button
              key={prioridad.value}
              type="button"
              onClick={() => handleInputChange('prioridad', prioridad.value)}
              className={`p-3 text-center border rounded-lg transition-colors ${
                formData.prioridad === prioridad.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Badge variant={prioridad.color} className="mb-1">
                {prioridad.label}
              </Badge>
            </button>
          ))}
        </div>
        {errors.prioridad && (
          <p className="text-red-500 text-sm mt-1">{errors.prioridad}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fecha Límite (Opcional)
        </label>
        <Input
          type="datetime-local"
          value={formData.fecha_limite}
          onChange={(e) => handleInputChange('fecha_limite', e.target.value)}
          min={new Date().toISOString().slice(0, 16)}
        />
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Archivo Adjunto (Opcional)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          {formData.archivo_adjunto ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded">
                  <Upload className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{formData.archivo_adjunto.name}</p>
                  <p className="text-xs text-gray-500">
                    {(formData.archivo_adjunto.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={removeFile}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Subir archivo
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    PNG, JPG, PDF hasta 10MB
                  </span>
                </label>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          )}
        </div>
        {errors.archivo_adjunto && (
          <p className="text-red-500 text-sm mt-1">{errors.archivo_adjunto}</p>
        )}
      </div>

      {/* Resumen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumen del Ticket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="font-medium">Título:</span> {formData.titulo}
          </div>
          <div>
            <span className="font-medium">Categoría:</span>{' '}
            {categorias.find(c => c.value === formData.categoria)?.label}
          </div>
          <div>
            <span className="font-medium">Prioridad:</span>{' '}
            <Badge variant={prioridades.find(p => p.value === formData.prioridad)?.color}>
              {prioridades.find(p => p.value === formData.prioridad)?.label}
            </Badge>
          </div>
          {formData.equipo && (
            <div>
              <span className="font-medium">Equipo:</span> {formData.equipo}
            </div>
          )}
          {formData.ubicacion && (
            <div>
              <span className="font-medium">Ubicación:</span> {formData.ubicacion}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/tickets')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Ticket</h1>
            <p className="text-gray-600">Paso {currentStep} de 3</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step < currentStep ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  step
                )}
              </div>
              {step < 3 && (
                <div className={`flex-1 h-1 mx-2 ${
                  step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Información básica</span>
          <span>Categorización</span>
          <span>Revisión y envío</span>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between mt-6">
        <div>
          {currentStep > 1 && (
            <Button variant="outline" onClick={prevStep}>
              Anterior
            </Button>
          )}
        </div>
        <div className="space-x-2">
          {currentStep < 3 ? (
            <Button onClick={nextStep}>
              Siguiente
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Crear Ticket
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
