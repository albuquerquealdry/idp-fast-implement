import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { api } from '../lib/api'
import { PageHeader } from '../components/layout/PageHeader'
import { Card, CardContent } from '../components/ui/Card'
import { Loading } from '../components/ui/Loading'
import { Alert } from '../components/ui/Alert'
import { LifecycleBadge, TypeBadge } from '../components/ui/Badge'
import { Select } from '../components/ui/Input'

function ComponentCard({ component, onClick }) {
  const spec = component.data.spec

  return (
    <Card onClick={onClick} className="cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-lg">{component.displayName}</h3>
          <div className={`w-3 h-3 rounded-full ${
            spec.lifecycle === 'production' ? 'bg-green-500' :
            spec.lifecycle === 'development' ? 'bg-yellow-500' :
            spec.lifecycle === 'experimental' ? 'bg-purple-500' :
            spec.lifecycle === 'deprecated' ? 'bg-orange-500' : 'bg-gray-500'
          }`} />
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{component.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <TypeBadge type={spec.type} />
          <LifecycleBadge lifecycle={spec.lifecycle} />
        </div>
        
        <div className="text-xs text-gray-500 space-y-1">
          <div>System: <span className="font-medium text-gray-700">{spec.system}</span></div>
          <div>Owner: <span className="font-medium text-gray-700">{spec.owner}</span></div>
          {spec.dependsOn && spec.dependsOn.length > 0 && (
            <div>Dependencies: <span className="font-medium text-gray-700">{spec.dependsOn.length}</span></div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function Components() {
  const navigate = useNavigate()
  const { data: components, loading, error } = useApi(() => api.getEntitiesByKind('Component'))
  const [lifecycleFilter, setLifecycleFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  if (loading) return <Loading />
  if (error) return <Alert variant="error" title="Erro">{error}</Alert>

  let filtered = components || []
  
  if (lifecycleFilter !== 'all') {
    filtered = filtered.filter(c => c.data.spec.lifecycle === lifecycleFilter)
  }
  
  if (typeFilter !== 'all') {
    filtered = filtered.filter(c => c.data.spec.type === typeFilter)
  }

  const lifecycleOptions = [
    { value: 'all', label: 'Todos Lifecycles' },
    { value: 'production', label: 'Production' },
    { value: 'development', label: 'Development' },
    { value: 'experimental', label: 'Experimental' },
    { value: 'deprecated', label: 'Deprecated' }
  ]

  const typeOptions = [
    { value: 'all', label: 'Todos Tipos' },
    { value: 'service', label: 'Service' },
    { value: 'database', label: 'Database' },
    { value: 'queue', label: 'Queue' },
    { value: 'cache', label: 'Cache' },
    { value: 'frontend', label: 'Frontend' },
    { value: 'library', label: 'Library' }
  ]

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Componentes" 
        description={`${components?.length || 0} componentes no catálogo`}
        actions={
          <div className="flex gap-3">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={typeOptions}
              className="w-48"
            />
            <Select
              value={lifecycleFilter}
              onChange={(e) => setLifecycleFilter(e.target.value)}
              options={lifecycleOptions}
              className="w-48"
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(component => (
          <ComponentCard 
            key={component.name} 
            component={component}
            onClick={() => navigate(`/component/${component.name}`)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <Alert variant="info">
          Nenhum componente encontrado com os filtros selecionados.
        </Alert>
      )}
    </div>
  )
}
