# 🚀 Como Executar o Sensa Catalog

## ⚡ Quick Start (Docker)

```bash
cd sensa-catalog-app

# Iniciar aplicação
./start.sh

# Acessar
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## 📋 Opções de Execução

### 1. Docker Compose (Recomendado)

**Pré-requisitos:**
- Docker
- Docker Compose

**Executar:**
```bash
cd sensa-catalog-app
docker-compose up -d
```

**Parar:**
```bash
docker-compose down
```

### 2. Execução Local

**Pré-requisitos:**
- Python 3.11+
- Node.js 20+

**Executar:**
```bash
cd sensa-catalog-app
./start-local.sh
```

### 3. Manual

**Backend:**
```bash
cd sensa-catalog-app/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

**Frontend (em outro terminal):**
```bash
cd sensa-catalog-app/frontend
npm install
npm run dev
```

## 🌐 URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs (Swagger):** http://localhost:8000/docs
- **API Redoc:** http://localhost:8000/redoc

## 📊 Funcionalidades Disponíveis

### Dashboard
- Estatísticas gerais
- Contadores por tipo de entidade
- Gráficos de distribuição

### Hierarquia
- Visualização em árvore
- TopDomain → Domain → System → Component
- Navegação expansível

### Componentes
- Lista completa com filtros
- Detalhes de cada componente
- Dependências
- Ambientes (dev, qa, prod)
- Repositórios

### Grupos
- Equipes e squads
- Membros com emails
- Informações de contato

### Busca
- Busca por nome ou descrição
- Resultados em tempo real

## 🔧 Comandos Úteis

```bash
# Ver logs
docker-compose logs -f

# Ver logs do backend apenas
docker-compose logs -f backend

# Ver logs do frontend apenas
docker-compose logs -f frontend

# Reiniciar serviços
docker-compose restart

# Rebuild após mudanças
docker-compose up -d --build

# Parar e remover containers
docker-compose down

# Parar e remover volumes
docker-compose down -v
```

## 🐛 Troubleshooting

### Porta já em uso

**Erro:** `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solução:**
```bash
# Parar processo na porta 3000
lsof -ti:3000 | xargs kill -9

# Ou mudar porta no docker-compose.yml
```

### Backend não encontra catálogo

**Erro:** `Catalog not found`

**Solução:**
```bash
# Verificar se catálogo existe
ls ../sensa-catalog

# Deve estar em /home/boneka/ido/sensa-catalog
```

### Frontend não conecta com backend

**Solução:**
```bash
# Verificar se backend está rodando
curl http://localhost:8000/api/stats

# Verificar proxy no vite.config.js
```

## 📝 Estrutura de Arquivos

```
/home/boneka/ido/
├── sensa-catalog/              # Dados (YAML)
│   ├── top-domains/
│   ├── domains/
│   ├── systems/
│   ├── components/
│   ├── groups/
│   └── users/
│
└── sensa-catalog-app/          # Software
    ├── backend/                # API FastAPI
    ├── frontend/               # React App
    ├── docker-compose.yml
    ├── start.sh
    └── start-local.sh
```

## 🎯 Próximos Passos

1. **Explorar a interface:** http://localhost:3000
2. **Testar a API:** http://localhost:8000/docs
3. **Adicionar mais dados:** Editar arquivos em `sensa-catalog/`
4. **Customizar:** Modificar `backend/main.py` ou `frontend/src/App.jsx`

## 📚 Documentação

- **README completo:** `sensa-catalog-app/README.md`
- **RFC técnico:** `docs/rfc-001-catalog-v1.md`
- **Guia de implementação:** `docs/catalog-implementation-guide.md`
