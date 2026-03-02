import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { PageHeader } from '../components/layout/PageHeader'
import { Card, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'
import { Loading, Spinner } from '../components/ui/Loading'
import { Search as SearchIcon } from 'lucide-react'

function SearchResult({ result, onClick }) {
  return (
    <Card onClick={onClick} className="cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="default">{result.kind}</Badge>
              <h3 className="font-semibold">{result.displayName}</h3>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{result.description}</p>
            <p className="text-xs text-gray-500 mt-1">Match: {result.match}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function Search() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    setSearched(true)
    try {
      const response = await api.search(query)
      setResults(response.data)
    } catch (err) {
      console.error(err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleResultClick = (result) => {
    const routes = {
      'Component': `/component/${result.name}`,
      'System': `/system/${result.name}`,
      'Domain': `/hierarchy`,
      'TopDomain': `/hierarchy`,
      'Group': `/groups`
    }
    
    const route = routes[result.kind]
    if (route) navigate(route)
  }

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.kind]) acc[result.kind] = []
    acc[result.kind].push(result)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Busca" 
        description="Encontre entidades no catálogo"
      />

      <div className="flex gap-3">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Digite para buscar..."
          icon={<SearchIcon className="w-5 h-5 text-gray-400" />}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Buscar'}
        </Button>
      </div>

      {loading && <Loading text="Buscando..." />}

      {!loading && searched && results.length > 0 && (
        <div className="space-y-6">
          <p className="text-gray-600">{results.length} resultados encontrados</p>
          
          {Object.entries(groupedResults).map(([kind, items]) => (
            <div key={kind}>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                {kind} ({items.length})
              </h2>
              <div className="space-y-3">
                {items.map((result, idx) => (
                  <SearchResult 
                    key={idx} 
                    result={result}
                    onClick={() => handleResultClick(result)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <Alert variant="info">
          Nenhum resultado encontrado para "{query}"
        </Alert>
      )}

      {!searched && (
        <Alert variant="info">
          Digite algo no campo acima e clique em "Buscar" para encontrar entidades no catálogo.
        </Alert>
      )}
    </div>
  )
}
