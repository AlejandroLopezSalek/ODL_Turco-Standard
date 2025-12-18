#!/bin/bash
# cleanup_server.sh
# Script de limpieza para eliminar backups viejos que causan conflictos.

echo "🧹 Iniciando limpieza de seguridad..."

# Directorio del proyecto (ajusta si es diferente)
PROJECT_DIR="/var/www/turkamerica_project"

if [ -d "$PROJECT_DIR" ]; then
    cd "$PROJECT_DIR"
    echo "📂 Ubicado en $PROJECT_DIR"

    # 1. Eliminar backups de node_modules (CAUSA PRINCIPAL DE ERRORES)
    if ls node_modules.bak* 1> /dev/null 2>&1; then
        echo "🗑️  Eliminando backups antiguos de node_modules..."
        rm -rf node_modules.bak*
    else
        echo "✅ No se encontraron backups de node_modules."
    fi

    # 2. Eliminar directorios temporales de build
    if ls _site_tmp* 1> /dev/null 2>&1; then
        echo "🗑️  Eliminando builds temporales (_site_tmp)..."
        rm -rf _site_tmp*
    fi

    # 3. Eliminar zips de deploy antiguos
    if ls deploy_package*.zip 1> /dev/null 2>&1; then
        echo "🗑️  Eliminando paquetes zip antiguos..."
        rm -f deploy_package*.zip
    fi

    echo "✨ Limpieza completada. El directorio está listo para un deploy limpio."
else
    echo "❌ Error: No se encuentra el directorio $PROJECT_DIR"
    exit 1
fi
