import axios from 'axios'

const API_URL = '/api'

export const api = {
  // Stats
  getStats: () => axios.get(`${API_URL}/stats`),

  // Entities
  getEntitiesByKind: (kind) => axios.get(`${API_URL}/entities/${kind}`),
  getEntity: (kind, name) => axios.get(`${API_URL}/entities/${kind}/${name}`),

  // Hierarchy
  getHierarchy: () => axios.get(`${API_URL}/hierarchy`),

  // Dependencies
  getDependencies: () => axios.get(`${API_URL}/dependencies`),

  // Search
  search: (query) => axios.get(`${API_URL}/search`, { params: { q: query } }),

  // Groups
  getGroups: () => axios.get(`${API_URL}/groups`),

  // Components by lifecycle
  getComponentsByLifecycle: () => axios.get(`${API_URL}/components/by-lifecycle`),

  // Validation
  validateCatalog: () => axios.get(`${API_URL}/validate`)
}
