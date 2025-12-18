#!/bin/bash
# Script generado automáticamente por PowerShell

echo "🚀 Iniciando despliegue en el servidor..."

# 0. LIMPIEZA: Esta lógica se movió a los pasos manuales previos
# para evitar borrar los archivos que acabamos de descomprimir.



# 1. Ajustar Permisos (Vital para error 403/404 y para npm install)
# Le damos todo a 'ubuntu' (tu usuario) para que puedas editar y npm pueda escribir
echo "🔒 Ajustando permisos..."
sudo chown -R ubuntu:ubuntu .
sudo chmod -R 755 .

# 2. Instalar dependencias si cambiaron
if [ -f "package.json" ]; then
    echo "📦 Instalando librerías del backend (como usuario ubuntu)..."
    # Usamos 'su -' y cargamos nvm explícitamente
    su - ubuntu -c "export NVM_DIR=\"\$HOME/.nvm\" && [ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\" && cd /var/www/turkamerica_project && npm install --production"
fi

# 3. Reiniciar el Backend (PM2)
echo "🧠 Reiniciando API (como usuario ubuntu)..."
# Cargamos nvm explícitamente antes de pm2
su - ubuntu -c "export NVM_DIR=\"\$HOME/.nvm\" && [ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\" && (pm2 restart turkamerica-api || pm2 start /var/www/turkamerica_project/server/server.js --name turkamerica-api)"

# 4. Recargar Nginx
echo "🌐 Recargando servidor web..."
sudo systemctl reload nginx

echo "✅ ¡TODO LISTO! Sitio y Backend actualizados."
