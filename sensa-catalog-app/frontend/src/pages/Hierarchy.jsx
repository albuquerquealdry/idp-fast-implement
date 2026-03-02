import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { api } from '../lib/api'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { Loading } from '../components/ui/Loading'
import { Alert } from '../components/ui/Alert'
import { LifecycleBadge, TypeBadge } from '../components/ui/Badge'
import { ChevronDown, ChevronRight } from 'lucide-react'

function ComponentNode({ component }) {
  const typeIcons = {
    service: '🚀',
    database: '🗄️',
    queue: '📬',
    cache: '⚡',
    frontend: '🖥️',
    library: '📚',
    other: '📦'
  }

  return (
    <div className="p-3 bg-gray-50 rounded-lg text-sm flex items-center gap-3 hover:bg-gray-100 transition-colors">
      <span className="text-xl">{typeIcons[component.type] || '📦'}</span>
      <span className="font-medium flex-1">{component.displayName}</span>
      <TypeBadge type={component.type} />
      <LifecycleBadge lifecycle={component.lifecycle} />
    </div>
  )
}

function SystemNode({ system }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border-l-2 border-gray-200 pl-4">
      <div 
        className="p-3 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            <div className="w-2 h-2 bg-purple-600 rounded-full" />
            <span className="font-medium text-sm">{system.displayName}</span>
            <LifecycleBadge lifecycle={system.lifecycle} />
            <span className="text-xs text-gray-500">({system.components.length} componentes)</span>
          </div>
        </div>
      </div>

      {expanded && system.components.length > 0 && (
        <div className="pl-6 mt-2 space-y-2">
          {system.components.map(component => (
            <ComponentNode key={component.name} component={component} />
          ))}
        </div>
      )}
    </div>
  )
}

function SubDomainNode({ subdomain }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border-l-2 border-gray-200 pl-4">
      <div 
        className="p-3 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            <div className="w-2.5 h-2.5 bg-teal-600 rounded-full" />
            <span className="font-medium text-sm">{subdomain.displayName}</span>
            <span className="text-xs text-gray-500">({subdomain.systems.length} sistemas)</span>
          </div>
        </div>
      </div>

      {expanded && subdomain.systems.length > 0 && (
        <div className="pl-6 mt-2 space-y-2">
          {subdomain.systems.map(system => (
            <SystemNode key={system.name} system={system} />
          ))}
        </div>
      )}
    </div>
  )
}

function DomainNode({ domain }) {
  const [expanded, setExpanded] = useState(false)
  const totalSystems = domain.systems.length + (domain.subdomains?.reduce((acc, sd) => acc + sd.systems.length, 0) || 0)

  return (
    <div className="border-l-2 border-gray-300 pl-4">
      <div 
        className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            <div className="w-3 h-3 bg-green-600 rounded-full" />
            <span className="font-medium">{domain.displayName}</span>
            <span className="text-xs text-gray-500">
              ({domain.subdomains?.length || 0} subdomains, {totalSystems} sistemas)
            </span>
          </div>
        </div>
      </div>

      {expanded && (domain.subdomains?.length > 0 || domain.systems.length > 0) && (
        <div className="pl-6 mt-3 space-y-3">
          {domain.subdomains?.map(subdomain => (
            <SubDomainNode key={subdomain.name} subdomain={subdomain} />
          ))}
          {domain.systems.map(system => (
            <SystemNode key={system.name} system={system} />
          ))}
        </div>
      )}
    </div>
  )
}

function TopDomainNode({ topDomain }) {
  const hasDomains = topDomain.domains.length > 0
  const [expanded, setExpanded] = useState(hasDomains)
  
  const totalDomains = topDomain.domains.length
  const totalSubdomains = topDomain.domains.reduce((acc, d) => acc + (d.subdomains?.length || 0), 0)
  const totalSystems = topDomain.domains.reduce((acc, d) => 
    acc + d.systems.length + (d.subdomains?.reduce((acc2, sd) => acc2 + sd.systems.length, 0) || 0), 0
  )

  return (
    <Card>
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => hasDomains && setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {hasDomains ? (
              expanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />
            ) : (
              <div className="w-5 h-5" />
            )}
            <div className="w-4 h-4 bg-blue-600 rounded-full" />
            <div>
              <h3 className="font-semibold text-lg">{topDomain.displayName}</h3>
              <p className="text-sm text-gray-600">
                Owner: {topDomain.owner} • {totalDomains} domains, {totalSubdomains} subdomains, {totalSystems} sistemas
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {expanded && hasDomains && (
        <div className="px-6 pb-6 space-y-4">
          {topDomain.domains.map(domain => (
            <DomainNode key={domain.name} domain={domain} />
          ))}
        </div>
      )}
      
      {!hasDomains && (
        <div className="px-6 pb-6">
          <p className="text-sm text-gray-500 italic">Nenhum domain cadastrado</p>
        </div>
      )}
    </Card>
  )
}

export function Hierarchy() {
  const { data: hierarchy, loading, error } = useApi(() => api.getHierarchy())

  if (loading) return <Loading />
  if (error) return <Alert variant="error" title="Erro">{error}</Alert>

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Hierarquia" 
        description="Estrutura organizacional completa"
      />

      <div className="space-y-4">
        {hierarchy?.map(topDomain => (
          <TopDomainNode key={topDomain.name} topDomain={topDomain} />
        ))}
      </div>
    </div>
  )
}
