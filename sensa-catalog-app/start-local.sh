#!/bin/bash

echo "🚀 Iniciando Sensa Catalog (modo local)..."
echo ""

# Verificar se Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 não está instalado"
    exit 1
fi

# Verificar se Node está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado"
    exit 1
fi

echo "✅ Pré-requisitos verificados"
echo ""

# Iniciar backend em background
echo "🔧 Iniciando backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "📦 Criando ambiente virtual Python..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -q -r requirements.txt

echo "✅ Backend iniciando em http://localhost:8000"
python main.py &
BACKEND_PID=$!

cd ..

# Iniciar frontend em background
echo "🎨 Iniciando frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências Node..."
    npm install
fi

echo "✅ Frontend iniciando em http://localhost:3000"
npm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo "✅ Sensa Catalog iniciado com sucesso!"
echo ""
echo "🌐 Acesse:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "⚠️  Para parar, pressione Ctrl+C"
echo ""

# Aguardar Ctrl+C
trap "echo ''; echo '🛑 Parando serviços...'; kill $BACKEND_PID $FRONTEND_PID; exit 0" INT

wait
