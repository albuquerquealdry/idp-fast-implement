#!/bin/bash

echo "🚀 Iniciando Sensa Catalog..."
echo ""

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado"
    echo "Instale Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado"
    echo "Instale Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# Verificar se catálogo existe
if [ ! -d "../sensa-catalog" ]; then
    echo "❌ Catálogo não encontrado em ../sensa-catalog"
    echo "Execute este script do diretório sensa-catalog-app/"
    exit 1
fi

echo "✅ Pré-requisitos verificados"
echo ""

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down

# Iniciar containers
echo "🚀 Iniciando containers..."
docker-compose up -d

# Aguardar inicialização
echo ""
echo "⏳ Aguardando inicialização..."
sleep 5

# Verificar status
echo ""
echo "📊 Status dos containers:"
docker-compose ps

echo ""
echo "✅ Sensa Catalog iniciado com sucesso!"
echo ""
echo "🌐 Acesse:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📝 Comandos úteis:"
echo "   Ver logs: docker-compose logs -f"
echo "   Parar: docker-compose down"
echo "   Reiniciar: docker-compose restart"
echo ""
