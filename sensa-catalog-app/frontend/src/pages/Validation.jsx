import { useApi } from '../hooks/useApi'
import { api } from '../lib/api'
import { PageHeader } from '../components/layout/PageHeader'
import { Card, CardContent, CardTitle } from '../components/ui/Card'
import { Loading } from '../components/ui/Loading'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

function ValidationItem({ entity, validation }) {
  const hasErrors = validation.errors && validation.errors.length > 0
  const hasWarnings = validation.warnings && validation.warnings.length > 0
  
  return (
    <Card className={hasErrors ? 'border-l-4 border-red-500' : hasWarnings ? 'border-l-4 border-yellow-500' : 'border-l-4 border-green-500'}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            {hasErrors ? (
              <XCircle className="w-5 h-5 text-red-600" />
            ) : hasWarnings ? (
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
            <div>
              <h3 className="font-semibold">{entity.displayName || entity.name}</h3>
              <p className="text-sm text-gray-600">{entity.kind} • {entity.name}</p>
            </div>
          </div>
          <Badge variant={hasErrors ? 'danger' : hasWarnings ? 'warning' : 'success'}>
            {hasErrors ? 'Erro' : hasWarnings ? 'Aviso' : 'OK'}
          </Badge>
        </div>
        
        {hasErrors && (
          <div className="mt-3 space-y-1">
            <p className="text-sm font-medium text-red-700">Erros:</p>
            <ul className="list-disc list-inside text-sm text-red-600">
              {validation.errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        
        {hasWarnings && (
          <div className="mt-3 space-y-1">
            <p className="text-sm font-medium text-yellow-700">Avisos:</p>
            <ul className="list-disc list-inside text-sm text-yellow-600">
              {validation.warnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function Validation() {
  const { data: validationResult, loading, error } = useApi(() => api.validateCatalog())

  if (loading) return <Loading text="Validando catálogo..." />
  if (error) return <Alert variant="error" title="Erro ao validar">{error}</Alert>

  const validEntities = validationResult?.valid || 0
  const invalidEntities = validationResult?.invalid || 0
  const totalEntities = validationResult?.total || 0
  const successRate = totalEntities > 0 ? ((validEntities / totalEntities) * 100).toFixed(1) : 0

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Validação do Catálogo" 
        description="Health check e integridade das entidades"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total de Entidades</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalEntities}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Válidas</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{validEntities}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Com Erros</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{invalidEntities}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-100">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <CardTitle className="mb-4">Taxa de Sucesso</CardTitle>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progresso</span>
              <span className="font-semibold text-gray-900">{successRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all ${
                  successRate >= 90 ? 'bg-green-600' :
                  successRate >= 70 ? 'bg-yellow-600' :
                  'bg-red-600'
                }`}
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {invalidEntities > 0 && (
        <Alert variant="warning" title="Atenção">
          Existem {invalidEntities} entidade(s) com problemas de validação. Revise os erros abaixo.
        </Alert>
      )}

      {validationResult?.errors && validationResult.errors.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Entidades com Problemas</h2>
          {validationResult.errors.map((item, idx) => (
            <ValidationItem key={idx} entity={item.entity} validation={item.validation} />
          ))}
        </div>
      )}

      {invalidEntities === 0 && (
        <Alert variant="success" title="Catálogo Válido">
          Todas as {totalEntities} entidades estão válidas e em conformidade com os schemas!
        </Alert>
      )}
    </div>
  )
}
