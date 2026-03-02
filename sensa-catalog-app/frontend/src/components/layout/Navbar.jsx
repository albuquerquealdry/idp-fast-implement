import { Link, useLocation } from 'react-router-dom'
import { Database, Home, Layers, GitBranch, Users, Search, Network } from 'lucide-react'

export function Navbar() {
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/hierarchy', icon: Layers, label: 'Hierarquia' },
    { path: '/systems', icon: Database, label: 'Sistemas' },
    { path: '/components', icon: GitBranch, label: 'Componentes' },
    { path: '/groups', icon: Users, label: 'Grupos' },
    { path: '/dependencies', icon: Network, label: 'Dependências' },
    { path: '/validation', icon: Database, label: 'Validação' },
    { path: '/search', icon: Search, label: 'Busca' }
  ]

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center px-2 text-gray-900 font-bold text-xl">
              <Database className="w-6 h-6 mr-2 text-blue-600" />
              Sensa Catalog
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-2">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`
                    inline-flex items-center px-3 py-2 text-sm font-medium rounded-md
                    transition-colors
                    ${isActive(path)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
