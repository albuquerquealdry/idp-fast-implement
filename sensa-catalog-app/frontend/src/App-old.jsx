import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { Dashboard } from './pages/Dashboard'
import { Hierarchy } from './pages/Hierarchy'
import { Systems } from './pages/Systems'
import { Components } from './pages/Components'
import { ComponentDetail } from './pages/ComponentDetail'
import { Groups } from './pages/Groups'
import { Search } from './pages/Search'
import { Dependencies } from './pages/Dependencies'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/hierarchy" element={<Hierarchy />} />
            <Route path="/systems" element={<Systems />} />
            <Route path="/system/:name" element={<ComponentDetail />} />
            <Route path="/components" element={<Components />} />
            <Route path="/component/:name" element={<ComponentDetail />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/search" element={<Search />} />
            <Route path="/dependencies" element={<Dependencies />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
