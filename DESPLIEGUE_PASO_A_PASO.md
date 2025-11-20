# Guía de Despliegue para Dummies (Versión cPanel/WHM)

¡Hola de nuevo! Como descubrimos que tu servidor usa un panel de control (WHM/cPanel), el plan de acción cambia por completo. Esta es la guía correcta para tu caso.

**La nueva regla de oro:** En un servidor con cPanel, **siempre** usaremos las herramientas que nos da el panel. Olvídate de la línea de comandos para instalar Nginx o PM2. El panel lo hace por nosotros.

Piensa que, en lugar de construir la casa desde cero (la guía anterior), ahora vamos a decorar un apartamento que el panel ya construyó.

---

### **Paso 1: Entrar a cPanel (El Panel de TU Sitio Web)**

WHM es el panel del "dueño del edificio", pero tú necesitas entrar al panel de "tu apartamento", que es cPanel.

1.  Inicia sesión en **WHM**.
2.  En el menú de la izquierda o en el buscador, busca "List Accounts" (Listar Cuentas).
3.  Encuentra el dominio de tu aplicación (`tu-dominio.com`) en la lista.
4.  Haz clic en el pequeño ícono naranja de **"cP"**. Esto te llevará directamente al cPanel de ese sitio web.

---

### **Paso 2: Encontrar la Herramienta Mágica: "Setup Node.js App"**

Dentro de cPanel, tienes que buscar la herramienta específica para aplicaciones de Node.js.

1.  Una vez en cPanel, desplázate hacia abajo hasta la sección **"Software"**.
2.  Busca y haz clic en el ícono que dice **"Setup Node.js App"**.

---

### **Paso 3: Crear tu Aplicación de Node.js**

Aquí le diremos a cPanel cómo debe ser nuestra aplicación.

1.  Haz clic en el botón **"CREATE APPLICATION"**.
2.  Rellena el formulario que aparece:
    *   **Node.js version:** Elige la más reciente que te ofrezca, idealmente `20.x.x` o superior.
    *   **Application mode:** Selecciona `Production` en el menú desplegable.
    *   **Application root:** Es la carpeta donde vivirá tu código. Escribe un nombre, por ejemplo: `angarita-seguros`. La ruta completa será algo como `/home/tu_usuario_cpanel/angarita-seguros`. **Apunta esta ruta, la necesitarás.**
    *   **Application URL:** Elige el dominio o subdominio donde quieres que se vea la aplicación.
    *   **Application startup file:** Este es el archivo que arranca todo. cPanel usualmente no sabe cómo arrancar Next.js directamente. Para solucionarlo, pon `app.js` en este campo. Crearemos ese archivo en el siguiente paso.

3.  Haz clic en el botón **"CREATE"** en la parte superior.

---

### **Paso 4: Subir tu Código (¡Y el archivo `app.js`!)**

Ahora vamos a poner los archivos de tu proyecto en la carpeta que definimos.

1.  **Crea el archivo `app.js`:**
    *   En tu computadora, dentro de la carpeta de tu proyecto, crea un nuevo archivo llamado `app.js`.
    *   Abre el archivo y pega el siguiente código adentro. No necesitas modificarlo.
        ```javascript
        const { createServer } = require('http');
        const { parse } = require('url');
        const next = require('next');

        const dev = process.env.NODE_ENV !== 'production';
        const app = next({ dev });
        const handle = app.getRequestHandler();

        // cPanel nos da el puerto a través de process.env.PORT
        const port = process.env.PORT || 3000;

        app.prepare().then(() => {
          createServer((req, res) => {
            const parsedUrl = parse(req.url, true);
            handle(req, res, parsedUrl);
          }).listen(port, (err) => {
            if (err) throw err;
            console.log(`> Ready on http://localhost:${port}`);
          });
        });
        ```
    *   Guarda el archivo.

2.  **Sube todo a cPanel:**
    *   Vuelve a la pantalla principal de cPanel y haz clic en **"File Manager"** (Administrador de Archivos).
    *   Navega a la carpeta que definiste como `Application root` (ej: `/home/tu_usuario_cpanel/angarita-seguros`).
    *   Dentro de esa carpeta, haz clic en **"Upload"** (Subir).
    *   En tu computadora, comprime **todo el contenido** de tu proyecto en un solo archivo `.zip`. **Asegúrate de que el nuevo `app.js` esté incluido.**
    *   Sube ese archivo `.zip`.
    *   Una vez subido, vuelve al File Manager, selecciona el `.zip` y haz clic en **"Extract"** (Extraer).

---

### **Paso 5: Instalar y Construir (Con Botones)**

Ahora que los archivos están en el servidor, hay que instalar las dependencias y construir la versión de producción.

1.  Vuelve a la herramienta **"Setup Node.js App"**.
2.  Verás tu aplicación en la lista. Haz clic en "Edit Application".
3.  Desplázate hacia abajo. Verás una sección para ejecutar comandos.
4.  Haz clic en el botón **"Run NPM Install"**. Espera a que termine. Esto instalará todas las dependencias de tu `package.json`.
5.  Ahora, necesitas construir la app. En la sección "Execute command", escribe `npm run build` y presiona Enter. Espera a que el proceso termine.

---

### **Paso 6: ¡Encender la App!**

Este es el último paso.

1.  En la misma pantalla de edición de tu aplicación, busca los botones de control.
2.  Haz clic en **"RESTART"** o **"START APP"**.

¡Y listo! cPanel se encargará de todo lo demás (el "supervisor" PM2 y el "recepcionista" Nginx/Apache). Ahora, si visitas la URL que configuraste, deberías ver tu aplicación de Next.js funcionando.

### **Para actualizar tu web en el futuro:**

1.  Comprime tu código actualizado en un `.zip`.
2.  Usa el "File Manager" para borrar los archivos antiguos y subir y extraer el nuevo `.zip`.
3.  Vuelve a "Setup Node.js App", edita tu app y ejecuta `npm install` y luego `npm run build`.
4.  Finalmente, haz clic en **"RESTART"**.