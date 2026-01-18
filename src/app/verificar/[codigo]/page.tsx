'use client'

import { useEffect, useState } from 'react'

import { useParams } from 'next/navigation'

import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  FileText,
  GraduationCap,
  Loader2,
  School,
  User,
  XCircle,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { VerificacionDocumento } from '@/types/documentos-estudiante'

export default function VerificarDocumentoPage() {
  const params = useParams()
  const codigo = params.codigo as string

  const [verificacion, setVerificacion] = useState<VerificacionDocumento | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (codigo) {
      verificarDocumento()
    }
  }, [codigo])

  const verificarDocumento = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/documentoestudiante/verificar/${codigo}`
      )

      if (!response.ok) {
        throw new Error('Error al verificar el documento')
      }

      const data = await response.json()
      setVerificacion(data)
    } catch (err) {
      console.error('Error:', err)
      setError('No se pudo verificar el documento. Por favor, intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Verificando documento...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Error de Verificacion</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!verificacion) {
    return null
  }

  const isValid = verificacion.esValido
  const isVigente = verificacion.estaVigente

  return (
    <div
      className={`flex min-h-screen items-center justify-center p-4 ${
        isValid && isVigente
          ? 'bg-gradient-to-br from-green-50 to-emerald-100'
          : isValid && !isVigente
            ? 'bg-gradient-to-br from-yellow-50 to-amber-100'
            : 'bg-gradient-to-br from-red-50 to-orange-100'
      }`}
    >
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          {/* Logo o nombre de la institucion */}
          <div className="mb-4 flex items-center justify-center gap-2">
            <School className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">USAG</span>
          </div>

          {/* Estado del documento */}
          <div
            className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
              isValid && isVigente
                ? 'bg-green-100'
                : isValid && !isVigente
                  ? 'bg-yellow-100'
                  : 'bg-red-100'
            }`}
          >
            {isValid && isVigente ? (
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            ) : isValid && !isVigente ? (
              <AlertTriangle className="h-12 w-12 text-yellow-600" />
            ) : (
              <XCircle className="h-12 w-12 text-red-600" />
            )}
          </div>

          <CardTitle
            className={
              isValid && isVigente
                ? 'text-green-600'
                : isValid && !isVigente
                  ? 'text-yellow-600'
                  : 'text-red-600'
            }
          >
            {isValid && isVigente
              ? 'Documento Valido'
              : isValid && !isVigente
                ? 'Documento Expirado'
                : 'Documento No Valido'}
          </CardTitle>

          <CardDescription className="text-base">{verificacion.mensaje}</CardDescription>
        </CardHeader>

        {isValid && (
          <CardContent className="space-y-4">
            {/* Tipo de documento */}
            {verificacion.tipoDocumento && (
              <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Documento</p>
                  <p className="font-medium">{verificacion.tipoDocumento}</p>
                </div>
              </div>
            )}

            {/* Estudiante */}
            {verificacion.nombreEstudiante && (
              <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Estudiante</p>
                  <p className="font-medium">{verificacion.nombreEstudiante}</p>
                  {verificacion.matricula && (
                    <p className="font-mono text-sm text-muted-foreground">
                      Matricula: {verificacion.matricula}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Carrera */}
            {verificacion.carrera && (
              <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
                <GraduationCap className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Carrera</p>
                  <p className="font-medium">{verificacion.carrera}</p>
                </div>
              </div>
            )}

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-3">
              {verificacion.fechaEmision && (
                <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Emision</p>
                    <p className="font-medium">
                      {new Date(verificacion.fechaEmision).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                </div>
              )}
              {verificacion.fechaVencimiento && (
                <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Vencimiento</p>
                    <p className="font-medium">
                      {new Date(verificacion.fechaVencimiento).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Folio */}
            {verificacion.folioDocumento && (
              <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3">
                <span className="text-sm text-muted-foreground">Folio</span>
                <Badge variant="outline" className="font-mono">
                  {verificacion.folioDocumento}
                </Badge>
              </div>
            )}

            {/* Estado de vigencia */}
            <div className="mt-4 flex items-center justify-center">
              <Badge
                variant={isVigente ? 'default' : 'secondary'}
                className={`px-4 py-2 text-sm ${
                  isVigente ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500'
                }`}
              >
                {isVigente ? 'Vigente' : 'Vencido'}
              </Badge>
            </div>
          </CardContent>
        )}

        {/* Footer */}
        <div className="border-t p-4 text-center text-xs text-muted-foreground">
          <p>Universidad de San Antonio de Guatemala</p>
          <p>Sistema de Verificacion de Documentos</p>
        </div>
      </Card>
    </div>
  )
}
