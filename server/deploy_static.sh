#!/bin/bash

# deploy_static.sh - Despliegue de sitio estático (sin build en servidor)

PROJECT_ROOT="/var/www/turkamerica_project"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="$PROJECT_ROOT/backups"

echo "🚀 Iniciando despliegue estático..."

# 1. Verificar que estamos en el directorio correcto
cd $PROJECT_ROOT || exit 1

# 2. Crear directorio de backups si no existe
mkdir -p $BACKUP_DIR

# 3. Backup del sitio actual
if [ -d "_site" ]; then
    echo "💾 Creando backup de la versión anterior..."
    tar -czf "$BACKUP_DIR/_site_backup_$TIMESTAMP.tar.gz" _site
fi

# 4. Mover la nueva carpeta _site (asumiendo que se descomprimió como 'site_new' o similar, 
#    pero si el zip trae '_site', hay que tener cuidado de no sobrescribir antes de tiempo)
#    Estrategia: El zip debe traer una carpeta llamada '_site_new' o nosotros renombramos.

#    Vamos a asumir que el usuario sube 'deploy_static.zip' y lo descomprime.
#    El zip contendrá '_site' y este script.
#    Al descomprimir, 'unzip' preguntará si sobrescribir.
#    Para evitar líos, el script esperará que exista una carpeta '_site_new' 
#    (que el script de empaquetado local debe generar).

if [ -d "_site_new" ]; then
    echo "📦 Encontrada nueva versión (_site_new). Instalando..."
    
    # Eliminar _site actual (ya tenemos backup)
    rm -rf _site
    
    # Mover nueva versión
    mv _site_new _site
    
    # 5. Permisos
    echo "🔒 Ajustando permisos..."
    chown -R www-data:www-data _site
    chmod -R 755 _site
    
    # 6. Reiniciar Nginx
    echo "🔄 Recargando Nginx..."
    systemctl reload nginx
    
    echo "✅ Despliegue completado con éxito!"
    
    # Limpieza
    rm -rf _site_new
else
    echo "❌ Error: No se encontró la carpeta '_site_new'. Asegúrate de haber descomprimido el paquete correctamente."
    exit 1
fi
