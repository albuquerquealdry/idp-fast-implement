import { useParams, Link } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { api } from '../lib/api'
import { PageHeader } from '../components/layout/PageHeader'
import { Card, CardContent, CardTitle } from '../components/ui/Card'
import { Loading } from '../components/ui/Loading'
import { Alert } from '../components/ui/Alert'
import { LifecycleBadge, TypeBadge, Badge } from '../components/ui/Badge'
import { ExternalLink, ArrowLeft } from 'lucide-react'

export function ComponentDetail() {
  const { name } = useParams()
  const { data: response, loading, error } = useApi(() => api.getEntity('Component', name), [name])

  if (loading) return <Loading />
  if (error) return <Alert variant="error" title="Erro">{error}</Alert>
  if (!response) return <Alert variant="error">Componente não encontrado</Alert>

  const entity = response.entity
  const spec = entity.spec
  const metadata = entity.metadata

  return (
    <div className="space-y-6">
      <Link to="/components" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para Componentes
      </Link>

      <PageHeader 
        title={spec.displayName}
        description={metadata.annotations['sensa.io/description']}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <CardTitle className="mb-4">Informações Básicas</CardTitle>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-600">Nome</dt>
                <dd className="font-medium font-mono text-sm">{metadata.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Tipo</dt>
                <dd><TypeBadge type={spec.type} /></dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Lifecycle</dt>
                <dd><LifecycleBadge lifecycle={spec.lifecycle} /></dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Sistema</dt>
                <dd>
                  <Link to={`/system/${spec.system}`} className="font-medium text-blue-600 hover:text-blue-700">
                    {spec.system}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Owner</dt>
                <dd className="font-medium">{spec.owner}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {spec.repository && (
          <Card>
            <CardContent className="p-6">
              <CardTitle className="mb-4">Repositório</CardTitle>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-600">Nome</dt>
                  <dd className="font-medium">{spec.repository.name}</dd>
                </div>
                {spec.repository.path && (
                  <div>
                    <dt className="text-sm text-gray-600">Path</dt>
                    <dd className="font-mono text-sm text-gray-700">{spec.repository.path}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        )}
      </div>

      {spec.dependsOn && spec.dependsOn.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <CardTitle className="mb-4">Dependências ({spec.dependsOn.length})</CardTitle>
            <div className="space-y-3">
              {spec.dependsOn.map((dep, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Link 
                      to={`/component/${dep.component}`}
                      className="font-medium text-blue-600 hover:text-blue-700"
                    >
                      {dep.component}
                    </Link>
                    <Badge variant={dep.type === 'hard' ? 'danger' : 'primary'}>
                      {dep.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{dep.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {spec.environments && spec.environments.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <CardTitle className="mb-4">Ambientes ({spec.environments.length})</CardTitle>
            <div className="space-y-3">
              {spec.environments.map((env, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium uppercase text-gray-900">{env.name}</span>
                    {env.url && (
                      <a 
                        href={env.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 inline-flex items-center text-sm"
                      >
                        Acessar <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                  </div>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    {env.namespace && (
                      <>
                        <dt className="text-gray-600">Namespace:</dt>
                        <dd className="font-mono text-gray-900">{env.namespace}</dd>
                      </>
                    )}
                    {env.cluster && (
                      <>
                        <dt className="text-gray-600">Cluster:</dt>
                        <dd className="font-mono text-gray-900">{env.cluster}</dd>
                      </>
                    )}
                  </dl>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {response.validation && !response.validation.valid && (
        <Alert variant="error" title="Erros de Validação">
          <ul className="list-disc list-inside">
            {response.validation.errors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}
    </div>
  )
}
