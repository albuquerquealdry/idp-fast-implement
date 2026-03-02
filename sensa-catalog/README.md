# Sensa Catalog

Catálogo declarativo da Sensa Internal Developer Platform (IDP).

## Visão Geral

Este repositório contém a definição completa da estrutura organizacional e técnica da Sensa:
- Domínios de negócio (TopDomains, Domains, SubDomains)
- Sistemas e componentes técnicos
- Repositórios de código
- Grupos e usuários

## Estrutura do Repositório

```
sensa-catalog/
├── schemas/           # JSON Schemas para validação
├── top-domains/       # Domínios de negócio de alto nível
├── domains/           # Áreas de negócio
├── subdomains/        # Subáreas (opcional)
├── systems/           # Aplicações e produtos
├── components/        # Serviços, bibliotecas, databases, etc
├── repositories/      # Repositórios Git
├── groups/            # Equipes e squads
└── users/             # Pessoas
```

## Convenções

### Nomenclatura

- **Arquivos:** `<entity-name>.yaml` (kebab-case)
- **Identificadores:** `[a-z0-9-]` (máximo 63 caracteres)
- **DisplayNames:** Formato livre, legível por humanos

### Campos Obrigatórios

Todas as entidades devem ter:
- `apiVersion: sensa.io/v1alpha1`
- `kind: <EntityKind>`
- `metadata.name`: Identificador único
- `metadata.namespace: catalog`
- `metadata.labels.sensa.io/owner`: Grupo responsável
- `metadata.annotations.sensa.io/description`: Descrição clara

## Validação

### Pré-requisitos

```bash
# Instalar ferramentas
npm install -g ajv-cli
brew install yq  # ou apt-get install yq
```

### Validar um arquivo

```bash
# Validação de schema
yq eval -o=json components/payment-api.yaml | \
  ajv validate -s schemas/component.schema.json -d -
```

### Validar todos os arquivos

```bash
./scripts/validate-all.sh
```

## Workflow de Contribuição

1. **Clone o repositório**
   ```bash
   git clone https://github.com/sensa/sensa-catalog.git
   cd sensa-catalog
   ```

2. **Crie/edite entidades**
   ```bash
   # Copie um template
   cp templates/component.yaml components/my-new-service.yaml
   
   # Edite o arquivo
   vim components/my-new-service.yaml
   ```

3. **Valide localmente**
   ```bash
   ./scripts/validate-all.sh
   ```

4. **Commit e push**
   ```bash
   git add .
   git commit -m "feat: add my-new-service component"
   git push origin feature/my-new-service
   ```

5. **Abra Pull Request**
   - Mínimo 1 aprovação necessária
   - CI validará automaticamente
   - CODEOWNERS será notificado

## Queries Úteis

### Listar todos os componentes de um sistema

```bash
yq eval 'select(.spec.system == "payment-gateway") | .metadata.name' components/*.yaml
```

### Encontrar owners de um domain

```bash
yq eval 'select(.spec.domain == "pagamentos") | .spec.owner' systems/*.yaml | sort -u
```

### Verificar dependências de um componente

```bash
yq eval '.spec.dependsOn[].component' components/payment-api.yaml
```

### Listar componentes em produção

```bash
yq eval 'select(.spec.lifecycle == "production") | .metadata.name' components/*.yaml
```

## Entidades

### TopDomain
Domínio de negócio de mais alto nível (ex: Financeiro, Operações).

### Domain
Área de negócio específica (ex: Pagamentos, Cobranças).

### SubDomain
Subárea opcional dentro de um Domain (ex: Processamento de Pagamentos).

### System
Aplicação ou produto completo (ex: Payment Gateway).

### Component
Unidade técnica deployável:
- `service`: Microsserviço/API
- `library`: Biblioteca compartilhada
- `database`: Banco de dados
- `queue`: Fila de mensagens
- `cache`: Sistema de cache
- `frontend`: Aplicação frontend

### Repository
Repositório Git contendo código-fonte.

### Group
Equipe ou squad responsável por entidades.

### User
Pessoa física membro de grupos.

## Lifecycle

Entidades técnicas (System, Component) possuem lifecycle:

- `experimental`: Prova de conceito, não usar em produção
- `development`: Em desenvolvimento ativo
- `production`: Estável e em uso produtivo
- `deprecated`: Marcado para remoção
- `retired`: Desativado

## Ambientes

Ambientes suportados:
- `dev`: Desenvolvimento
- `qa`: Quality Assurance
- `prod`: Produção
- `staging`: Staging (opcional)
- `all`: Presente em todos os ambientes

## Suporte

- **Documentação:** [RFC-001](../docs/rfc-001-catalog-v1.md)
- **Issues:** https://github.com/sensa/sensa-catalog/issues
- **Slack:** #platform-engineering

## Versão do Schema

Versão atual: **1.0.0**

Ver [SCHEMA_VERSION](./SCHEMA_VERSION) para detalhes.
