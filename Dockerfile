FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo dev)
RUN npm install

# Copiar código fuente
COPY . .

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Cambiar propiedad de archivos
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exponer puerto
EXPOSE 3000

# Comando para ejecutar la aplicación en desarrollo con nodemon
CMD ["npm", "run", "dev"] 