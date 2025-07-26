# Configuración del Logo en Emails

## Opciones para agregar el logo

### Opción 1: Usando una URL externa (Recomendada)

1. **Subir el logo a un servicio de hosting de imágenes:**
   - [Imgur](https://imgur.com/) (gratuito)
   - [Cloudinary](https://cloudinary.com/) (gratuito con límites)
   - [AWS S3](https://aws.amazon.com/s3/) (de pago)

2. **Configurar la URL en el archivo .env:**
   ```env
   LOGO_URL=https://i.imgur.com/TU_LOGO_ID.png
   ```

### Opción 2: Usando Base64 (Para logos pequeños)

1. **Convertir el logo a Base64:**
   ```bash
   # En Windows PowerShell:
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("ruta/al/logo.png"))
   
   # En Linux/Mac:
   base64 -i ruta/al/logo.png
   ```

2. **Usar en el archivo .env:**
   ```env
   LOGO_URL=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
   ```

### Opción 3: Servidor de archivos estáticos

1. **Crear una ruta para servir archivos estáticos en el servidor**
2. **Colocar el logo en `src/assets/images/`**
3. **Configurar la URL:**
   ```env
   LOGO_URL=http://tu-dominio.com/static/images/logo.png
   ```

## Pasos para implementar

1. **Elegir una de las opciones anteriores**
2. **Actualizar la variable `LOGO_URL` en tu archivo `.env`**
3. **Reiniciar el servidor**
4. **Probar enviando una cotización**

## Recomendaciones

- **Tamaño del logo:** Máximo 150px de ancho
- **Formato:** PNG o JPG
- **Peso:** Menos de 100KB para emails rápidos
- **Fondo:** Transparente o que combine con el color del header (#3f7575)

## Personalización adicional

Puedes modificar el estilo del logo editando las plantillas HTML:

```html
<img src="{{logoUrl}}" alt="Pamela Cossio Logo" 
     style="max-width: 150px; height: auto; border-radius: 8px;">
```

Cambios que puedes hacer:
- `max-width: 150px` - Cambiar el tamaño máximo
- `border-radius: 8px` - Cambiar el redondeo de esquinas
- Agregar `box-shadow` para sombras
- Agregar `border` para bordes 