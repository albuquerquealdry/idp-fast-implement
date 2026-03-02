import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { 
  Home, 
  Database, 
  GitBranch, 
  Users, 
  Search,
  BarChart3,
  Network,
  CheckCircle,
  AlertCircle,
  Layers
} from 'lucide-react'

// API base URL
const API_URL = '/api'

// Dashboard Component
function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API_URL}/stats`)
      .then(res => {
        setStats(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-gray-500">Carregando...</div>
    </div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Visão geral do Catálogo da Sensa</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total de Entidades" 
          value={stats?.total_entities || 0}
          icon={<Database className="w-6 h-6" />}
          color="blue"
        />
        <StatCard 
          title="Sistemas" 
          value={stats?.by_kind?.System || 0}
          icon={<Layers className="w-6 h-6" />}
          color="green"
        />
        <StatCard 
          title="Componentes" 
          value={stats?.by_kind?.Component || 0}
          icon={<GitBranch className="w-6 h-6" />}
          color="purple"
        />
        <StatCard 
          title="Grupos" 
          value={stats?.by_kind?.Group || 0}
          icon={<Users className="w-6 h-6" />}
          color="orange"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Entidades por Tipo</h2>
        <div className="space-y-3">
          {stats?.by_kind && Object.entries(stats.by_kind).map(([kind, count]) => (
            <div key={kind} className="flex items-center justify-between">
              <span className="text-gray-700">{kind}</span>
              <div className="flex items-center gap-3">
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(count / stats.total_entities) * 100}%` }}
                  />
                </div>
                <span className="text-gray-900 font-semibold w-8 text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

// Hierarchy Component
function Hierarchy() {
  const [hierarchy, setHierarchy] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API_URL}/hierarchy`)
      .then(res => {
        setHierarchy(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-gray-500">Carregando hierarquia...</div>
    </div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hierarquia</h1>
        <p className="text-gray-600 mt-2">Estrutura organizacional completa</p>
      </div>

      <div className="space-y-4">
        {hierarchy.map(topDomain => (
          <TopDomainNode key={topDomain.name} topDomain={topDomain} />
        ))}
      </div>
    </div>
  )
}

function TopDomainNode({ topDomain }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="bg-white rounded-lg shadow">
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-blue-600 rounded-full" />
          <div>
            <h3 className="font-semibold text-lg">{topDomain.displayName}</h3>
            <p className="text-sm text-gray-600">Owner: {topDomain.owner}</p>
          </div>
        </div>
        <span className="text-gray-400">{expanded ? '▼' : '▶'}</span>
      </div>
      
      {expanded && topDomain.domains.length > 0 && (
        <div className="pl-8 pb-4 space-y-3">
          {topDomain.domains.map(domain => (
            <DomainNode key={domain.name} domain={domain} />
          ))}
        </div>
      )}
    </div>
  )
}

function DomainNode({ domain }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border-l-2 border-gray-300 pl-4">
      <div 
        className="p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-600 rounded-full" />
            <span className="font-medium">{domain.displayName}</span>
            <span className="text-xs text-gray-500">({domain.systems.length} sistemas)</span>
          </div>
          <span className="text-gray-400 text-sm">{expanded ? '▼' : '▶'}</span>
        </div>
      </div>

      {expanded && domain.systems.length > 0 && (
        <div className="pl-6 mt-2 space-y-2">
          {domain.systems.map(system => (
            <SystemNode key={system.name} system={system} />
          ))}
        </div>
      )}
    </div>
  )
}

function SystemNode({ system }) {
  const [expanded, setExpanded] = useState(false)

  const lifecycleColors = {
    production: 'bg-green-100 text-green-800',
    development: 'bg-yellow-100 text-yellow-800',
    experimental: 'bg-purple-100 text-purple-800',
    deprecated: 'bg-orange-100 text-orange-800',
    retired: 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="border-l-2 border-gray-200 pl-4">
      <div 
        className="p-2 bg-white rounded border cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-600 rounded-full" />
            <span className="font-medium text-sm">{system.displayName}</span>
            <span className={`text-xs px-2 py-0.5 rounded ${lifecycleColors[system.lifecycle]}`}>
              {system.lifecycle}
            </span>
            <span className="text-xs text-gray-500">({system.components.length} componentes)</span>
          </div>
          <span className="text-gray-400 text-xs">{expanded ? '▼' : '▶'}</span>
        </div>
      </div>

      {expanded && system.components.length > 0 && (
        <div className="pl-6 mt-1 space-y-1">
          {system.components.map(component => (
            <ComponentNode key={component.name} component={component} />
          ))}
        </div>
      )}
    </div>
  )
}

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

  const lifecycleColors = {
    production: 'text-green-600',
    development: 'text-yellow-600',
    experimental: 'text-purple-600',
    deprecated: 'text-orange-600',
    retired: 'text-gray-600'
  }

  return (
    <div className="p-2 bg-gray-50 rounded text-sm flex items-center gap-2">
      <span>{typeIcons[component.type] || '📦'}</span>
      <span className="font-medium">{component.displayName}</span>
      <span className="text-xs text-gray-500">({component.type})</span>
      <span className={`text-xs ${lifecycleColors[component.lifecycle]}`}>
        ● {component.lifecycle}
      </span>
    </div>
  )
}

// Components List
function ComponentsList() {
  const [components, setComponents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    axios.get(`${API_URL}/entities/Component`)
      .then(res => {
        setComponents(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-gray-500">Carregando componentes...</div>
    </div>
  }

  const filteredComponents = filter === 'all' 
    ? components 
    : components.filter(c => c.data.spec.lifecycle === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Componentes</h1>
          <p className="text-gray-600 mt-2">{components.length} componentes no catálogo</p>
        </div>
        <select 
          className="px-4 py-2 border rounded-lg"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Todos</option>
          <option value="production">Production</option>
          <option value="development">Development</option>
          <option value="experimental">Experimental</option>
          <option value="deprecated">Deprecated</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredComponents.map(component => (
          <ComponentCard key={component.name} component={component} />
        ))}
      </div>
    </div>
  )
}

function ComponentCard({ component }) {
  const navigate = useNavigate()
  const spec = component.data.spec

  const typeColors = {
    service: 'bg-blue-100 text-blue-800',
    database: 'bg-green-100 text-green-800',
    queue: 'bg-purple-100 text-purple-800',
    cache: 'bg-yellow-100 text-yellow-800',
    frontend: 'bg-pink-100 text-pink-800',
    library: 'bg-indigo-100 text-indigo-800',
    other: 'bg-gray-100 text-gray-800'
  }

  const lifecycleColors = {
    production: 'bg-green-500',
    development: 'bg-yellow-500',
    experimental: 'bg-purple-500',
    deprecated: 'bg-orange-500',
    retired: 'bg-gray-500'
  }

  return (
    <div 
      className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/component/${component.name}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg">{component.displayName}</h3>
        <div className={`w-3 h-3 rounded-full ${lifecycleColors[spec.lifecycle]}`} />
      </div>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{component.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`text-xs px-2 py-1 rounded ${typeColors[spec.type]}`}>
          {spec.type}
        </span>
        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800">
          {spec.lifecycle}
        </span>
      </div>
      
      <div className="text-xs text-gray-500 space-y-1">
        <div>System: <span className="font-medium">{spec.system}</span></div>
        <div>Owner: <span className="font-medium">{spec.owner}</span></div>
        {spec.dependsOn && spec.dependsOn.length > 0 && (
          <div>Dependencies: <span className="font-medium">{spec.dependsOn.length}</span></div>
        )}
      </div>
    </div>
  )
}

// Component Detail
function ComponentDetail({ componentName }) {
  const [component, setComponent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API_URL}/entities/Component/${componentName}`)
      .then(res => {
        setComponent(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [componentName])

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-gray-500">Carregando...</div>
    </div>
  }

  if (!component) {
    return <div className="text-center py-12">
      <p className="text-gray-600">Componente não encontrado</p>
    </div>
  }

  const entity = component.entity
  const spec = entity.spec

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{spec.displayName}</h1>
        <p className="text-gray-600 mt-2">
          {entity.metadata.annotations['sensa.io/description']}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Informações Básicas</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-600">Nome</dt>
              <dd className="font-medium">{entity.metadata.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Tipo</dt>
              <dd className="font-medium">{spec.type}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Lifecycle</dt>
              <dd className="font-medium">{spec.lifecycle}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Sistema</dt>
              <dd className="font-medium">{spec.system}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Owner</dt>
              <dd className="font-medium">{spec.owner}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Repositório</h2>
          {spec.repository ? (
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-600">Nome</dt>
                <dd className="font-medium">{spec.repository.name}</dd>
              </div>
              {spec.repository.path && (
                <div>
                  <dt className="text-sm text-gray-600">Path</dt>
                  <dd className="font-mono text-sm">{spec.repository.path}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-gray-500">Nenhum repositório configurado</p>
          )}
        </div>
      </div>

      {spec.dependsOn && spec.dependsOn.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Dependências</h2>
          <div className="space-y-3">
            {spec.dependsOn.map((dep, idx) => (
              <div key={idx} className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{dep.component}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    dep.type === 'hard' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {dep.type}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{dep.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {spec.environments && spec.environments.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Ambientes</h2>
          <div className="space-y-3">
            {spec.environments.map((env, idx) => (
              <div key={idx} className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium uppercase">{env.name}</span>
                  {env.url && (
                    <a 
                      href={env.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Acessar →
                    </a>
                  )}
                </div>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  {env.namespace && (
                    <>
                      <dt className="text-gray-600">Namespace:</dt>
                      <dd className="font-mono">{env.namespace}</dd>
                    </>
                  )}
                  {env.cluster && (
                    <>
                      <dt className="text-gray-600">Cluster:</dt>
                      <dd className="font-mono">{env.cluster}</dd>
                    </>
                  )}
                </dl>
              </div>
            ))}
          </div>
        </div>
      )}

      {component.validation && !component.validation.valid && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Erros de Validação</h3>
          </div>
          <ul className="list-disc list-inside text-sm text-red-800">
            {component.validation.errors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Groups Component
function Groups() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API_URL}/groups`)
      .then(res => {
        setGroups(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-gray-500">Carregando grupos...</div>
    </div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Grupos</h1>
        <p className="text-gray-600 mt-2">{groups.length} grupos cadastrados</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map(group => (
          <div key={group.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">{group.displayName}</h3>
                <span className="text-sm text-gray-600">{group.type}</span>
              </div>
              <Users className="w-6 h-6 text-gray-400" />
            </div>

            <p className="text-sm text-gray-600 mb-4">{group.description}</p>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Membros ({group.members.length})</h4>
                <div className="space-y-1">
                  {group.members.map(member => (
                    <div key={member.name} className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                        {member.displayName.charAt(0)}
                      </div>
                      <span>{member.displayName}</span>
                      <span className="text-gray-500 text-xs">{member.email}</span>
                    </div>
                  ))}
                </div>
              </div>

              {group.contact && (
                <div className="pt-3 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Contato</h4>
                  <div className="text-sm space-y-1">
                    {group.contact.email && (
                      <div className="text-gray-600">📧 {group.contact.email}</div>
                    )}
                    {group.contact.slack && (
                      <div className="text-gray-600">💬 {group.contact.slack}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Search Component
function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSearch = () => {
    if (!query.trim()) return
    
    setLoading(true)
    axios.get(`${API_URL}/search?q=${encodeURIComponent(query)}`)
      .then(res => {
        setResults(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Busca</h1>
        <p className="text-gray-600 mt-2">Encontre entidades no catálogo</p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Digite para buscar..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Buscar
        </button>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="text-gray-500">Buscando...</div>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-gray-600">{results.length} resultados encontrados</p>
          {results.map((result, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">{result.kind}</span>
                    <h3 className="font-semibold">{result.displayName}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{result.description}</p>
                  <p className="text-xs text-gray-500 mt-1">Match: {result.match}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">Nenhum resultado encontrado</p>
        </div>
      )}
    </div>
  )
}

// Layout Component
function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center px-2 text-gray-900 font-bold text-xl">
                <Database className="w-6 h-6 mr-2 text-blue-600" />
                Sensa Catalog
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                <NavLink to="/" icon={<Home className="w-4 h-4" />}>Dashboard</NavLink>
                <NavLink to="/hierarchy" icon={<Layers className="w-4 h-4" />}>Hierarquia</NavLink>
                <NavLink to="/components" icon={<GitBranch className="w-4 h-4" />}>Componentes</NavLink>
                <NavLink to="/groups" icon={<Users className="w-4 h-4" />}>Grupos</NavLink>
                <NavLink to="/search" icon={<Search className="w-4 h-4" />}>Busca</NavLink>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

function NavLink({ to, icon, children }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </Link>
  )
}

// Main App Component
function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/hierarchy" element={<Hierarchy />} />
          <Route path="/components" element={<ComponentsList />} />
          <Route path="/component/:name" element={<ComponentDetailWrapper />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

function ComponentDetailWrapper() {
  const params = window.location.pathname.split('/')
  const name = params[params.length - 1]
  return <ComponentDetail componentName={name} />
}

export default App
