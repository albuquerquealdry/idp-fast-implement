import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { api } from '../lib/api'
import { PageHeader } from '../components/layout/PageHeader'
import { Card, CardContent } from '../components/ui/Card'
import { Loading } from '../components/ui/Loading'
import { Alert } from '../components/ui/Alert'
import { LifecycleBadge } from '../components/ui/Badge'
import { Select } from '../components/ui/Input'

function SystemCard({ system, onClick }) {
  const spec = system.data.spec

  return (
    <Card onClick={onClick} className="cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-lg">{system.displayName}</h3>
          <LifecycleBadge lifecycle={spec.lifecycle} />
        </div>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{system.description}</p>
        
        <div className="text-xs text-gray-500 space-y-1">
          <div>Domain: <span className="font-medium text-gray-700">{spec.domain}</span></div>
          <div>Owner: <span className="font-medium text-gray-700">{spec.owner}</span></div>
          <div>Ambientes: <span className="font-medium text-gray-700">{spec.environments.join(', ')}</span></div>
        </div>
      </CardContent>
    </Card>
  )
}

export function Systems() {
  const navigate = useNavigate()
  const { data: systems, loading, error } = useApi(() => api.getEntitiesByKind('System'))
  const [filter, setFilter] = useState('all')

  if (loading) return <Loading />
  if (error) return <Alert variant="error" title="Erro">{error}</Alert>

  const filteredSystems = filter === 'all' 
    ? systems 
    : systems?.filter(s => s.data.spec.lifecycle === filter)

  const lifecycleOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'production', label: 'Production' },
    { value: 'development', label: 'Development' },
    { value: 'experimental', label: 'Experimental' },
    { value: 'deprecated', label: 'Deprecated' }
  ]

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Sistemas" 
        description={`${systems?.length || 0} sistemas no catálogo`}
        actions={
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={lifecycleOptions}
            className="w-48"
          />
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSystems?.map(system => (
          <SystemCard 
            key={system.name} 
            system={system}
            onClick={() => navigate(`/system/${system.name}`)}
          />
        ))}
      </div>

      {filteredSystems?.length === 0 && (
        <Alert variant="info">
          Nenhum sistema encontrado com o filtro selecionado.
        </Alert>
      )}
    </div>
  )
}
