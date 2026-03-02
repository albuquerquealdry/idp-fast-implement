import { useEffect, useRef, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { api } from '../lib/api'
import { PageHeader } from '../components/layout/PageHeader'
import { Card, CardContent } from '../components/ui/Card'
import { Loading } from '../components/ui/Loading'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'

function DependencyGraph({ data }) {
  const canvasRef = useRef(null)
  const [selectedNode, setSelectedNode] = useState(null)

  useEffect(() => {
    if (!data || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const width = canvas.width = canvas.offsetWidth
    const height = canvas.height = 600

    // Simple force-directed layout
    const nodes = data.nodes.map((n, i) => ({
      ...n,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      radius: 30
    }))

    const edges = data.edges

    // Simulation
    let animationId
    const simulate = () => {
      ctx.clearRect(0, 0, width, height)

      // Apply forces
      nodes.forEach(node => {
        // Center force
        node.vx += (width / 2 - node.x) * 0.001
        node.vy += (height / 2 - node.y) * 0.001

        // Repulsion between nodes
        nodes.forEach(other => {
          if (node === other) return
          const dx = other.x - node.x
          const dy = other.y - node.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const force = -500 / (dist * dist)
          node.vx += (dx / dist) * force
          node.vy += (dy / dist) * force
        })

        // Damping
        node.vx *= 0.9
        node.vy *= 0.9

        // Update position
        node.x += node.vx
        node.y += node.vy

        // Bounds
        node.x = Math.max(node.radius, Math.min(width - node.radius, node.x))
        node.y = Math.max(node.radius, Math.min(height - node.radius, node.y))
      })

      // Draw edges
      edges.forEach(edge => {
        const source = nodes.find(n => n.id === edge.source)
        const target = nodes.find(n => n.id === edge.target)
        if (!source || !target) return

        ctx.beginPath()
        ctx.moveTo(source.x, source.y)
        ctx.lineTo(target.x, target.y)
        ctx.strokeStyle = edge.type === 'hard' ? '#ef4444' : '#3b82f6'
        ctx.lineWidth = edge.type === 'hard' ? 2 : 1
        ctx.stroke()

        // Arrow
        const angle = Math.atan2(target.y - source.y, target.x - source.x)
        const arrowX = target.x - Math.cos(angle) * target.radius
        const arrowY = target.y - Math.sin(angle) * target.radius
        ctx.beginPath()
        ctx.moveTo(arrowX, arrowY)
        ctx.lineTo(
          arrowX - 10 * Math.cos(angle - Math.PI / 6),
          arrowY - 10 * Math.sin(angle - Math.PI / 6)
        )
        ctx.lineTo(
          arrowX - 10 * Math.cos(angle + Math.PI / 6),
          arrowY - 10 * Math.sin(angle + Math.PI / 6)
        )
        ctx.closePath()
        ctx.fillStyle = edge.type === 'hard' ? '#ef4444' : '#3b82f6'
        ctx.fill()
      })

      // Draw nodes
      nodes.forEach(node => {
        const colors = {
          service: '#3b82f6',
          database: '#10b981',
          queue: '#8b5cf6',
          cache: '#f59e0b',
          frontend: '#ec4899',
          library: '#6366f1',
          other: '#6b7280'
        }

        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI)
        ctx.fillStyle = colors[node.type] || colors.other
        ctx.fill()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 3
        ctx.stroke()

        // Label
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 10px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const label = node.label.length > 12 ? node.label.slice(0, 10) + '...' : node.label
        ctx.fillText(label, node.x, node.y)
      })

      animationId = requestAnimationFrame(simulate)
    }

    simulate()

    // Click handler
    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const clicked = nodes.find(node => {
        const dx = x - node.x
        const dy = y - node.y
        return Math.sqrt(dx * dx + dy * dy) < node.radius
      })

      setSelectedNode(clicked || null)
    }

    canvas.addEventListener('click', handleClick)

    return () => {
      cancelAnimationFrame(animationId)
      canvas.removeEventListener('click', handleClick)
    }
  }, [data])

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="w-full border rounded-lg bg-gray-50" />
      
      {selectedNode && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">{selectedNode.label}</h3>
            <div className="space-y-1 text-sm">
              <div>Type: <Badge variant="primary">{selectedNode.type}</Badge></div>
              <div>System: <span className="font-medium">{selectedNode.system}</span></div>
              <div>Lifecycle: <Badge variant="success">{selectedNode.lifecycle}</Badge></div>
              <div>Owner: <span className="font-medium">{selectedNode.owner}</span></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function DependencyList({ data }) {
  return (
    <div className="space-y-3">
      {data.edges.map((edge, idx) => {
        const source = data.nodes.find(n => n.id === edge.source)
        const target = data.nodes.find(n => n.id === edge.target)
        
        return (
          <Card key={idx}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <span className="font-medium">{source?.label}</span>
                <span className="text-gray-400">→</span>
                <span className="font-medium">{target?.label}</span>
                <Badge variant={edge.type === 'hard' ? 'danger' : 'primary'}>
                  {edge.type}
                </Badge>
              </div>
              {edge.reason && (
                <p className="text-sm text-gray-600 mt-2">{edge.reason}</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export function Dependencies() {
  const { data, loading, error } = useApi(() => api.getDependencies())
  const [view, setView] = useState('graph')

  if (loading) return <Loading />
  if (error) return <Alert variant="error" title="Erro">{error}</Alert>

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Grafo de Dependências" 
        description={`${data?.nodes?.length || 0} componentes, ${data?.edges?.length || 0} dependências`}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setView('graph')}
              className={`px-4 py-2 rounded-lg ${view === 'graph' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Grafo
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Lista
            </button>
          </div>
        }
      />

      <Alert variant="info">
        <strong>Legenda:</strong> Linhas vermelhas = dependências hard (críticas), Linhas azuis = dependências soft (opcionais)
      </Alert>

      {view === 'graph' ? (
        <DependencyGraph data={data} />
      ) : (
        <DependencyList data={data} />
      )}
    </div>
  )
}
