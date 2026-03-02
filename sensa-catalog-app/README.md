# 🚀 Sensa Catalog - Internal Developer Platform

**Aplicação web completa** para visualizar e gerenciar o Catálogo da Sensa.

## 📋 Visão Geral

Sistema composto por:
- **Backend API** (FastAPI/Python) - Lê e valida o catálogo YAML
- **Frontend Web** (React/Vite) - Interface moderna e interativa
- **Catálogo** (YAML) - Fonte de dados declarativa

## ✨ Funcionalidades

### Dashboard
- ✅ Estatísticas gerais do catálogo
- ✅ Contadores por tipo de entidade
- ✅ Gráficos de distribuição

### Hierarquia
- ✅ Visualização em árvore (TopDomain → Domain → System → Component)
- ✅ Navegação expansível
- ✅ Indicadores de lifecycle e tipo

### Componentes
- ✅ Lista completa de componentes
- ✅ Filtros por lifecycle
- ✅ Cards com informações detalhadas
- ✅ Visualização de dependências
- ✅ Ambientes (dev, qa, prod)

### Grupos
- ✅ Lista de equipes e squads
- ✅ Membros de cada grupo
- ✅ Informações de contato

### Busca
- ✅ Busca por nome ou descrição
- ✅ Resultados em tempo real
- ✅ Filtros por tipo de entidade

### API REST
- ✅ `/api/stats` - Estatísticas
- ✅ `/api/entities/{kind}` - Listar entidades por tipo
- ✅ `/api/entities/{kind}/{name}` - Detalhes de entidade
- ✅ `/api/hierarchy` - Hierarquia completa
- ✅ `/api/dependencies` - Grafo de dependências
- ✅ `/api/search?q=` - Busca
- ✅ `/api/groups` - Grupos com membros
- ✅ `/api/validate` - Validação do catálogo

## 🚀 Quick Start

### Opção 1: Docker Compose (Recomendado)

```bash
cd sensa-catalog-app

# Iniciar aplicação
docker-compose up -d

# Acessar
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Docs API: http://localhost:8000/docs
```

### Opção 2: Execução Local

#### Backend

```bash
cd sensa-catalog-app/backend

# Criar ambiente virtual
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt

# Executar
python main.py

# API disponível em http://localhost:8000
```

#### Frontend

```bash
cd sensa-catalog-app/frontend

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Frontend disponível em http://localhost:3000
```

## 📁 Estrutura do Projeto

```
sensa-catalog-app/
├── backend/
│   ├── main.py              # API FastAPI
│   ├── requirements.txt     # Dependências Python
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Componente principal
│   │   ├── main.jsx        # Entry point
│   │   └── index.css       # Estilos globais
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── docker-compose.yml       # Orquestração
└── README.md               # Este arquivo
```

## 🎨 Screenshots

### Dashboard
- Estatísticas gerais
- Gráficos de distribuição
- Contadores por tipo

### Hierarquia
- Árvore navegável
- TopDomains, Domains, Systems, Components
- Indicadores visuais de lifecycle

### Componentes
- Cards informativos
- Filtros por lifecycle
- Detalhes completos (dependências, ambientes, repositório)

### Grupos
- Equipes e squads
- Membros com emails
- Informações de contato

## 🔧 Tecnologias

### Backend
- **FastAPI** - Framework web moderno e rápido
- **Pydantic** - Validação de dados
- **PyYAML** - Parser YAML
- **jsonschema** - Validação de schemas
- **Uvicorn** - ASGI server

### Frontend
- **React 18** - Biblioteca UI
- **Vite** - Build tool
- **React Router** - Navegação
- **Axios** - HTTP client
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones

## 📊 API Endpoints

### GET /api/stats
Retorna estatísticas do catálogo.

**Response:**
```json
{
  "total_entities": 18,
  "by_kind": {
    "TopDomain": 3,
    "Domain": 3,
    "System": 2,
    "Component": 5,
    "Group": 2,
    "User": 3
  },
  "validation_status": "ok"
}
```

### GET /api/entities/{kind}
Lista entidades de um tipo específico.

**Exemplo:** `/api/entities/Component`

**Response:**
```json
[
  {
    "name": "payment-api",
    "displayName": "Payment API",
    "owner": "payments-squad",
    "description": "API REST para processamento de pagamentos",
    "data": { ... }
  }
]
```

### GET /api/entities/{kind}/{name}
Detalhes de uma entidade específica.

**Exemplo:** `/api/entities/Component/payment-api`

**Response:**
```json
{
  "entity": {
    "apiVersion": "sensa.io/v1alpha1",
    "kind": "Component",
    "metadata": { ... },
    "spec": { ... }
  },
  "validation": {
    "valid": true,
    "errors": [],
    "warnings": []
  }
}
```

### GET /api/hierarchy
Retorna hierarquia completa do catálogo.

**Response:**
```json
[
  {
    "kind": "TopDomain",
    "name": "financeiro",
    "displayName": "Financeiro",
    "domains": [
      {
        "kind": "Domain",
        "name": "pagamentos",
        "systems": [
          {
            "kind": "System",
            "name": "payment-gateway",
            "components": [ ... ]
          }
        ]
      }
    ]
  }
]
```

### GET /api/dependencies
Retorna grafo de dependências entre componentes.

**Response:**
```json
{
  "nodes": [
    {
      "id": "payment-api",
      "label": "Payment API",
      "type": "service",
      "system": "payment-gateway",
      "lifecycle": "production"
    }
  ],
  "edges": [
    {
      "source": "payment-api",
      "target": "payment-db",
      "type": "hard",
      "reason": "Armazena estado das transações"
    }
  ]
}
```

### GET /api/search?q={query}
Busca entidades por nome ou descrição.

**Exemplo:** `/api/search?q=payment`

**Response:**
```json
[
  {
    "kind": "Component",
    "name": "payment-api",
    "displayName": "Payment API",
    "description": "API REST para processamento de pagamentos",
    "match": "name"
  }
]
```

### GET /api/groups
Lista grupos com membros.

**Response:**
```json
[
  {
    "name": "payments-squad",
    "displayName": "Payments Squad",
    "type": "squad",
    "members": [
      {
        "name": "joao-silva",
        "displayName": "João Silva",
        "email": "joao.silva@sensa.io"
      }
    ],
    "contact": {
      "email": "payments-squad@sensa.io",
      "slack": "#payments-squad"
    }
  }
]
```

### GET /api/validate
Valida todo o catálogo.

**Response:**
```json
{
  "total": 18,
  "valid": 18,
  "invalid": 0,
  "errors": []
}
```

## 🔒 Validação

O backend valida automaticamente:
- ✅ Estrutura YAML
- ✅ Conformidade com JSON Schema
- ✅ Campos obrigatórios
- ✅ Tipos de dados
- ✅ Valores de enum

## 🛠️ Desenvolvimento

### Adicionar Nova Funcionalidade

1. **Backend:** Adicionar endpoint em `backend/main.py`
2. **Frontend:** Criar componente em `frontend/src/App.jsx`
3. **Testar:** Verificar em http://localhost:3000

### Hot Reload

Ambos backend e frontend têm hot reload ativado:
- Backend: Uvicorn recarrega automaticamente
- Frontend: Vite HMR (Hot Module Replacement)

### Logs

```bash
# Ver logs do backend
docker-compose logs -f backend

# Ver logs do frontend
docker-compose logs -f frontend
```

## 📝 Customização

### Adicionar Novo Tipo de Entidade

1. Criar schema em `sensa-catalog/schemas/`
2. Adicionar diretório em `sensa-catalog/`
3. Atualizar `load_entities()` em `backend/main.py`
4. Criar componente de visualização no frontend

### Mudar Porta

**Backend:**
```yaml
# docker-compose.yml
services:
  backend:
    ports:
      - "8080:8000"  # Mudar primeira porta
```

**Frontend:**
```yaml
# docker-compose.yml
services:
  frontend:
    ports:
      - "3001:3000"  # Mudar primeira porta
```

## 🐛 Troubleshooting

### Backend não inicia

```bash
# Verificar logs
docker-compose logs backend

# Verificar se catálogo existe
ls ../sensa-catalog

# Reinstalar dependências
cd backend
pip install -r requirements.txt
```

### Frontend não carrega

```bash
# Verificar logs
docker-compose logs frontend

# Limpar cache
cd frontend
rm -rf node_modules
npm install
```

### API retorna erro 404

Verificar se o catálogo está no caminho correto:
```bash
ls ../sensa-catalog
```

O backend espera o catálogo em `../sensa-catalog` relativo ao diretório `backend/`.

## 🚀 Deploy

### Produção

```bash
# Build
docker-compose build

# Executar em background
docker-compose up -d

# Verificar status
docker-compose ps

# Parar
docker-compose down
```

### Variáveis de Ambiente

**Backend:**
- `CATALOG_PATH` - Caminho para o catálogo (padrão: `/app/catalog`)

**Frontend:**
- `VITE_API_URL` - URL da API (padrão: `http://localhost:8000`)

## 📚 Documentação Adicional

- **RFC-001:** `/docs/rfc-001-catalog-v1.md` - Especificação completa
- **Implementation Guide:** `/docs/catalog-implementation-guide.md`
- **Contributing:** `/sensa-catalog/CONTRIBUTING.md`
- **API Docs:** http://localhost:8000/docs (Swagger UI automático)

## 🎯 Roadmap

### V1 (Atual)
- ✅ Visualização de hierarquia
- ✅ Lista de componentes
- ✅ Detalhes de entidades
- ✅ Busca
- ✅ Validação

### V2 (Próximo)
- [ ] Grafo visual de dependências (D3.js/Cytoscape)
- [ ] Edição de entidades via UI
- [ ] Autenticação (Keycloak)
- [ ] Histórico de mudanças (Git log)
- [ ] Métricas e dashboards avançados

### V3 (Futuro)
- [ ] Self-service (criar novos componentes)
- [ ] Integração com ArgoCD
- [ ] Provisionamento automático
- [ ] RBAC dinâmico
- [ ] Webhooks e notificações

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este é um projeto interno da Sensa.

## 🆘 Suporte

- **Slack:** #platform-engineering
- **Email:** platform-team@sensa.io
- **Issues:** GitHub Issues

---

**Desenvolvido com ❤️ pela Platform Engineering Team**
