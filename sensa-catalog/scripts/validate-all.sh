#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CATALOG_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔍 Validando Sensa Catalog..."
echo "================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
TOTAL_FILES=0
VALID_FILES=0
INVALID_FILES=0

# Função para validar um arquivo
validate_file() {
    local file=$1
    local kind=$(yq eval '.kind' "$file" 2>/dev/null)
    
    if [ -z "$kind" ] || [ "$kind" = "null" ]; then
        echo -e "${RED}❌ $file - Invalid YAML or missing kind${NC}"
        ((INVALID_FILES++))
        return 1
    fi
    
    local schema_file="${CATALOG_ROOT}/schemas/${kind,,}.schema.json"
    
    if [ ! -f "$schema_file" ]; then
        echo -e "${YELLOW}⚠️  $file - No schema found for kind: $kind${NC}"
        ((VALID_FILES++))
        return 0
    fi
    
    # Validar contra schema
    if yq eval -o=json "$file" | ajv validate -s "$schema_file" -d - 2>/dev/null; then
        echo -e "${GREEN}✅ $file${NC}"
        ((VALID_FILES++))
        return 0
    else
        echo -e "${RED}❌ $file - Schema validation failed${NC}"
        yq eval -o=json "$file" | ajv validate -s "$schema_file" -d - 2>&1 | head -n 5
        ((INVALID_FILES++))
        return 1
    fi
}

# Verificar dependências
if ! command -v yq &> /dev/null; then
    echo -e "${RED}Error: yq is not installed${NC}"
    echo "Install with: brew install yq (macOS) or apt-get install yq (Linux)"
    exit 1
fi

if ! command -v ajv &> /dev/null; then
    echo -e "${RED}Error: ajv-cli is not installed${NC}"
    echo "Install with: npm install -g ajv-cli"
    exit 1
fi

# Validar todos os arquivos YAML
for dir in top-domains domains subdomains systems components repositories groups users; do
    if [ -d "${CATALOG_ROOT}/${dir}" ]; then
        echo "📁 Validating ${dir}..."
        for file in "${CATALOG_ROOT}/${dir}"/*.yaml; do
            if [ -f "$file" ]; then
                ((TOTAL_FILES++))
                validate_file "$file"
            fi
        done
        echo ""
    fi
done

# Sumário
echo "================================"
echo "📊 Validation Summary"
echo "================================"
echo "Total files:   $TOTAL_FILES"
echo -e "Valid files:   ${GREEN}$VALID_FILES${NC}"
echo -e "Invalid files: ${RED}$INVALID_FILES${NC}"
echo ""

if [ $INVALID_FILES -eq 0 ]; then
    echo -e "${GREEN}✅ All files are valid!${NC}"
    exit 0
else
    echo -e "${RED}❌ Validation failed with $INVALID_FILES errors${NC}"
    exit 1
fi
