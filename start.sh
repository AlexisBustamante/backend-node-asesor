#!/bin/bash

echo "🚀 Iniciando configuración del Backend de Asesoría de Seguros"
echo "=========================================================="

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+"
    exit 1
fi

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker no está instalado. Se usará PostgreSQL local"
    USE_DOCKER=false
else
    USE_DOCKER=true
fi

# Verificar si el archivo .env existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env desde env.example..."
    cp env.example .env
    echo "✅ Archivo .env creado. Por favor edítalo con tus configuraciones."
    echo "   Especialmente importante:"
    echo "   - JWT_SECRET y JWT_REFRESH_SECRET"
    echo "   - Configuración de email"
    echo "   - DATABASE_URL"
    read -p "Presiona Enter cuando hayas configurado el archivo .env..."
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Configurar base de datos
if [ "$USE_DOCKER" = true ]; then
    echo "🐳 Iniciando PostgreSQL con Docker..."
    docker-compose up -d db
    
    echo "⏳ Esperando a que PostgreSQL esté listo..."
    sleep 30
    
    echo "🔄 Ejecutando migraciones..."
    npm run migrate
    
    echo "🌱 Poblando datos iniciales..."
    npm run seed
else
    echo "📊 Configurando base de datos local..."
    echo "Por favor asegúrate de que PostgreSQL esté instalado y ejecutándose"
    echo "y que la base de datos 'asesoria_seguros' exista"
    
    read -p "¿PostgreSQL está configurado? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 Ejecutando migraciones..."
        npm run migrate
        
        echo "🌱 Poblando datos iniciales..."
        npm run seed
    else
        echo "❌ Por favor configura PostgreSQL primero"
        exit 1
    fi
fi

echo ""
echo "✅ Configuración completada!"
echo ""
echo "📋 Credenciales de acceso:"
echo "   Admin: admin@asesoriaseguros.cl / admin123"
echo "   Asesor: asesor@asesoriaseguros.cl / asesor123"
echo ""
echo "🚀 Para iniciar el servidor:"
echo "   Desarrollo: npm run dev"
echo "   Producción: npm start"
echo "   Docker: docker-compose up -d"
echo ""
echo "🔗 URLs importantes:"
echo "   API: http://localhost:3000"
echo "   Health Check: http://localhost:3000/health"
echo ""
echo "📚 Documentación: README.md" 