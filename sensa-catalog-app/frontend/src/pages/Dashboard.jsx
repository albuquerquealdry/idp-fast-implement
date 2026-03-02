import { useApi } from '../hooks/useApi'
import { api } from '../lib/api'
import { PageHeader } from '../components/layout/PageHeader'
import { Card, CardContent, CardTitle } from '../components/ui/Card'
import { Loading } from '../components/ui/Loading'
import { Alert } from '../components/ui/Alert'
import { Database, Layers, GitBranch, Users } from 'lucide-react'

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colors[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function Dashboard() {
  const { data: stats, loading, error } = useApi(() => api.getStats())
  const { data: byLifecycle } = useApi(() => api.getComponentsByLifecycle())

  if (loading) return <Loading />
  if (error) return <Alert variant="error" title="Erro">{error}</Alert>

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        description="Visão geral do Catálogo da Sensa"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total de Entidades" 
          value={stats?.total_entities || 0}
          icon={Database}
          color="blue"
        />
        <StatCard 
          title="Sistemas" 
          value={stats?.by_kind?.System || 0}
          icon={Layers}
          color="green"
        />
        <StatCard 
          title="Componentes" 
          value={stats?.by_kind?.Component || 0}
          icon={GitBranch}
          color="purple"
        />
        <StatCard 
          title="Grupos" 
          value={stats?.by_kind?.Group || 0}
          icon={Users}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <CardTitle className="mb-4">Entidades por Tipo</CardTitle>
            <div className="space-y-3">
              {stats?.by_kind && Object.entries(stats.by_kind).map(([kind, count]) => (
                <div key={kind} className="flex items-center justify-between">
                  <span className="text-gray-700">{kind}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-48 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all" 
                        style={{ width: `${(count / stats.total_entities) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-900 font-semibold w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {byLifecycle && (
          <Card>
            <CardContent className="p-6">
              <CardTitle className="mb-4">Componentes por Lifecycle</CardTitle>
              <div className="space-y-3">
                {Object.entries(byLifecycle).map(([lifecycle, components]) => (
                  <div key={lifecycle} className="flex items-center justify-between">
                    <span className="text-gray-700 capitalize">{lifecycle}</span>
                    <span className="text-gray-900 font-semibold">{components.length}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
