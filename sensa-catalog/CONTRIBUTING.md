# Guia de Contribuição - Sensa Catalog

## Visão Geral

O Sensa Catalog é a fonte da verdade para metadados organizacionais. Todas as mudanças devem seguir este guia.

## Pré-requisitos

### Ferramentas Necessárias

```bash
# yq - YAML processor
brew install yq  # macOS
# ou
apt-get install yq  # Linux

# ajv-cli - JSON Schema validator
npm install -g ajv-cli

# Python 3.8+ (para validação de referências)
python3 --version
```

## Workflow de Contribuição

### 1. Clone e Configure

```bash
git clone https://github.com/sensa/sensa-catalog.git
cd sensa-catalog

# Configure pre-commit hook (opcional mas recomendado)
cp scripts/pre-commit.sample .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### 2. Crie uma Branch

```bash
git checkout -b feature/add-new-component
```

### 3. Faça suas Mudanças

#### Adicionar Novo Component

```bash
# Copie um template ou arquivo existente
cp components/payment-api.yaml components/my-new-service.yaml

# Edite o arquivo
vim components/my-new-service.yaml
```

**Checklist:**
- [ ] `metadata.name` é único e kebab-case
- [ ] `metadata.namespace` é `catalog`
- [ ] `metadata.labels.sensa.io/owner` está definido
- [ ] `metadata.annotations.sensa.io/description` tem pelo menos 10 caracteres
- [ ] `spec.owner` referencia um Group existente
- [ ] `spec.system` referencia um System existente
- [ ] `spec.lifecycle` é válido (experimental|development|production|deprecated|retired)
- [ ] `spec.environments` tem pelo menos 1 ambiente

#### Adicionar Novo System

```bash
cp systems/payment-gateway.yaml systems/my-new-system.yaml
vim systems/my-new-system.yaml
```

**Checklist:**
- [ ] `spec.domain` referencia um Domain ou SubDomain existente
- [ ] `spec.owner` referencia um Group existente
- [ ] `spec.lifecycle` está definido
- [ ] `spec.environments` lista todos os ambientes onde o sistema existe

#### Adicionar Novo Group

```bash
cp groups/payments-squad.yaml groups/my-new-team.yaml
vim groups/my-new-team.yaml
```

**Checklist:**
- [ ] `spec.type` é válido (team|squad|chapter|guild)
- [ ] `spec.members` lista pelo menos 1 User existente
- [ ] `spec.contact.email` está definido
- [ ] Se `spec.parent` está definido, referencia um Group existente

#### Adicionar Novo User

```bash
cp users/joao-silva.yaml users/new-user.yaml
vim users/new-user.yaml
```

**Checklist:**
- [ ] `spec.email` é válido
- [ ] `spec.memberOf` lista pelo menos 1 Group existente
- [ ] `spec.keycloak.username` está definido

### 4. Valide Localmente

```bash
# Validação de schema
./scripts/validate-all.sh

# Validação de integridade referencial
python3 scripts/validate-references.py
```

**Ambos devem passar sem erros.**

### 5. Commit e Push

```bash
git add .
git commit -m "feat: add my-new-service component"
git push origin feature/add-new-component
```

### 6. Abra Pull Request

1. Vá para https://github.com/sensa/sensa-catalog
2. Clique em "New Pull Request"
3. Selecione sua branch
4. Preencha o template de PR:

```markdown
## Descrição
Breve descrição da mudança.

## Tipo de Mudança
- [ ] Nova entidade
- [ ] Atualização de entidade existente
- [ ] Remoção de entidade
- [ ] Atualização de schema
- [ ] Documentação

## Checklist
- [ ] Validação de schema passou
- [ ] Validação de referências passou
- [ ] Descrições estão claras
- [ ] CODEOWNERS foi atualizado (se necessário)
- [ ] Documentação foi atualizada (se necessário)

## Entidades Afetadas
- `Component/my-new-service`
- `System/my-system`
```

5. Aguarde aprovação dos CODEOWNERS
6. CI validará automaticamente
7. Após aprovação, merge para `main`

## Convenções

### Nomenclatura

#### Identificadores (metadata.name)

- **Formato:** kebab-case
- **Caracteres:** `[a-z0-9-]`
- **Início/fim:** letra ou número
- **Máximo:** 63 caracteres

**Exemplos:**
- ✅ `payment-gateway`
- ✅ `billing-api-v2`
- ✅ `user-management`
- ❌ `Payment_Gateway`
- ❌ `billing.api`
- ❌ `-payment-gateway`

#### DisplayNames

- **Formato:** Livre, legível por humanos
- **Exemplo:** `"Payment Gateway System"`

#### Arquivos

- **Formato:** `<entity-name>.yaml`
- **Extensão:** `.yaml` (não `.yml`)

### Descrições

Todas as entidades devem ter descrição clara em `metadata.annotations.sensa.io/description`:

- **Mínimo:** 10 caracteres
- **Recomendado:** 50-200 caracteres
- **Conteúdo:** O que a entidade faz, não como

**Exemplos:**

✅ **Bom:**
```yaml
annotations:
  sensa.io/description: "API REST para processamento de pagamentos via múltiplos provedores"
```

❌ **Ruim:**
```yaml
annotations:
  sensa.io/description: "API de pagamento"  # Muito vago
```

### Lifecycle

Use o lifecycle apropriado:

| Lifecycle | Quando Usar |
|-----------|-------------|
| `experimental` | POC, não usar em produção |
| `development` | Em desenvolvimento ativo |
| `production` | Estável, em uso produtivo |
| `deprecated` | Marcado para remoção, evitar novos usos |
| `retired` | Desativado, apenas referência histórica |

### Dependências

Ao definir `dependsOn` em Components:

- **`hard`:** Componente não funciona sem a dependência
- **`soft`:** Componente funciona com degradação

**Sempre forneça `reason` claro:**

```yaml
dependsOn:
  - component: payment-db
    type: hard
    reason: "Armazena estado das transações"
```

## Validação

### Schema Validation

Valida estrutura YAML contra JSON Schema:

```bash
yq eval -o=json components/payment-api.yaml | \
  ajv validate -s schemas/component.schema.json -d -
```

### Referential Integrity

Valida que todas as referências existem:

```bash
python3 scripts/validate-references.py
```

**Verifica:**
- Owners existem
- Parents existem (TopDomain → Domain → System → Component)
- Dependências existem
- Repositórios existem
- Membros de grupos existem
- Grupos de usuários existem
- Não há dependências circulares

## Troubleshooting

### Erro: "owner does not exist"

**Causa:** O grupo especificado em `spec.owner` não existe.

**Solução:**
1. Verifique se o grupo existe em `groups/`
2. Ou crie o grupo primeiro
3. Ou corrija o nome do owner

### Erro: "system does not exist"

**Causa:** O sistema especificado em Component não existe.

**Solução:**
1. Crie o System primeiro
2. Ou corrija o nome do system

### Erro: "Circular dependency detected"

**Causa:** Componentes têm dependências circulares (A → B → A).

**Solução:**
1. Revise a arquitetura
2. Remova a dependência circular
3. Considere introduzir um componente intermediário

### Erro: "Schema validation failed"

**Causa:** YAML não está conforme o schema.

**Solução:**
1. Leia a mensagem de erro do ajv
2. Corrija o campo indicado
3. Valide novamente

## Boas Práticas

### 1. Commits Atômicos

Cada commit deve representar uma mudança lógica:

```bash
# ✅ Bom
git commit -m "feat: add payment-api component"
git commit -m "feat: add payment-worker component"

# ❌ Ruim
git commit -m "add stuff"
```

### 2. Mensagens de Commit

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova entidade ou funcionalidade
- `fix:` Correção de entidade existente
- `docs:` Mudanças em documentação
- `refactor:` Reorganização sem mudança funcional
- `chore:` Manutenção (schemas, scripts)

### 3. Pull Requests Pequenos

- Máximo 10 arquivos por PR
- Foco em uma mudança lógica
- Facilita review

### 4. Documentação

Atualize documentação quando:
- Adicionar novo tipo de entidade
- Mudar schema
- Adicionar nova validação
- Mudar workflow

## Suporte

- **Documentação:** [RFC-001](../docs/rfc-001-catalog-v1.md)
- **Issues:** https://github.com/sensa/sensa-catalog/issues
- **Slack:** #platform-engineering
- **Email:** platform-team@sensa.io

## Aprovadores

Veja [CODEOWNERS](./CODEOWNERS) para lista de aprovadores por área.
