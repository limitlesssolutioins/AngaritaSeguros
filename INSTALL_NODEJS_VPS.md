# Guía Paso a Paso: Instalación de Node.js en tu VPS de GoDaddy (Linux - AlmaLinux)

Esta guía te ayudará a instalar Node.js en tu Servidor Privado Virtual (VPS) de GoDaddy. Asumiremos que tu VPS utiliza un sistema operativo basado en Linux, específicamente **AlmaLinux**. Si tu VPS usa otro sistema operativo (como Ubuntu o CentOS), los comandos pueden variar.

**Importante:** Yo, como tu asistente, no puedo ejecutar estos comandos directamente en tu VPS. Debes seguir estos pasos tú mismo, conectándote a tu servidor.

---

## 1. Conéctate a tu Servidor VPS mediante SSH

Para empezar, necesitas acceder a la línea de comandos de tu servidor. Esto se hace a través de SSH (Secure Shell).

### ¿Qué necesitas?
*   **Dirección IP de tu VPS:** La encontrarás en el panel de control de GoDaddy.
*   **Nombre de usuario:** Generalmente es `root` o `ubuntu`.
*   **Contraseña:** La que configuraste para tu VPS.
*   **Un cliente SSH:**
    *   **En Windows:** Puedes usar la terminal de PowerShell (viene integrada) o descargar una herramienta como [PuTTY](https://www.putty.org/).
    *   **En Mac o Linux:** La terminal ya tiene un cliente SSH integrado.

### Pasos para Conectarte:

1.  Abre tu terminal (PowerShell en Windows, Terminal en Mac/Linux).
2.  Escribe el siguiente comando, reemplazando `tu_usuario` con tu nombre de usuario del VPS y `tu_direccion_ip` con la IP de tu servidor:

    ```bash
    ssh tu_usuario@tu_direccion_ip
    ```

    *Ejemplo:* `ssh root@192.0.2.1`

3.  Cuando te lo pida, introduce tu contraseña y presiona `Enter`. Ten en cuenta que al escribir la contraseña, no verás los caracteres en pantalla por seguridad.

¡Felicidades! Ahora estás conectado a tu VPS y puedes ejecutar comandos en él.

---

## 2. Actualiza tu Sistema Operativo

Antes de instalar cualquier software nuevo, es una buena práctica asegurarte de que tu sistema operativo esté actualizado. Esto ayuda a prevenir problemas de compatibilidad y mejora la seguridad.

Ejecuta el siguiente comando en tu terminal SSH:

```bash
sudo dnf update -y     # Actualiza todos los paquetes del sistema (-y confirma automáticamente)
```

*   `sudo`: Ejecuta el comando con privilegios de superusuario (necesario para cambios en el sistema).
*   `dnf`: Es el gestor de paquetes para sistemas basados en RHEL como AlmaLinux.

---

## 3. Instala NVM (Node Version Manager)

En lugar de instalar Node.js directamente, te recomiendo encarecidamente usar **NVM (Node Version Manager)**.

### ¿Por qué NVM?
*   **Flexibilidad:** Te permite instalar múltiples versiones de Node.js en el mismo servidor y cambiar entre ellas fácilmente. Esto es útil si tienes diferentes proyectos que requieren distintas versiones de Node.
*   **Control:** Puedes instalar versiones específicas de Node.js (por ejemplo, la última LTS) sin afectar otras instalaciones del sistema.
*   **Sin `sudo`:** Una vez que NVM está instalado, puedes instalar paquetes globales de Node.js sin necesidad de `sudo`, lo que es una buena práctica de seguridad.

### Pasos para Instalar NVM:

1.  Descarga y ejecuta el script de instalación de NVM. Este comando obtiene el script desde el repositorio oficial de NVM en GitHub y lo ejecuta:

    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    ```
    *(Nota: `v0.39.7` es la versión actual de NVM al momento de escribir esto. Puedes verificar la última versión en el [repositorio de NVM](https://github.com/nvm-sh/nvm) si lo deseas, pero esta debería funcionar.)*

2.  Después de la instalación, necesitas "recargar" la configuración de tu terminal para que reconozca el comando `nvm`.

    ```bash
    source ~/.bashrc
    ```
    Si estás usando un shell diferente (como `zsh`), podrías necesitar `source ~/.zshrc`.

---

## 4. Instala Node.js usando NVM

Ahora que NVM está configurado, puedes instalar Node.js.

1.  **Instala la última versión LTS (Long-Term Support):** Esta es la versión más estable y recomendada para entornos de producción.

    ```bash
    nvm install --lts
    ```
    NVM descargará e instalará la última versión LTS de Node.js y la establecerá como la versión predeterminada para tu usuario.

2.  **Verifica la instalación:** Asegúrate de que Node.js y npm (el gestor de paquetes de Node.js, que se instala automáticamente con Node.js) estén funcionando correctamente.

    ```bash
    node -v   # Debería mostrar la versión de Node.js instalada (ej: v18.18.0)
    npm -v    # Debería mostrar la versión de npm instalada (ej: 9.8.1)
    ```

---

## 5. Sube tu Aplicación al VPS

Una vez que Node.js está listo, necesitas llevar el código de tu aplicación a tu servidor. La forma más común y recomendada es usando `git`.

1.  **Instala Git (si no lo tienes):**
    ```bash
    sudo dnf install git -y
    ```

2.  **Clona tu repositorio:** Navega a la ubicación donde quieres guardar tu aplicación (por ejemplo, `/var/www/` o tu directorio de usuario) y clona tu repositorio de Git.

    ```bash
    cd /var/www/ # O el directorio que prefieras
    git clone https://github.com/limitlesssolutioins/AngaritaSeguros.git
    ```
    Reemplaza `https://github.com/tu_usuario/tu_repositorio.git` con la URL real de tu repositorio.

3.  **Instala las dependencias de tu aplicación:** Entra al directorio de tu proyecto y ejecuta `npm install` para instalar todas las librerías listadas en tu `package.json`.

    ```bash
    cd tu_repositorio # Entra a la carpeta de tu proyecto
    npm install
    ```

---

## 6. Ejecuta tu Aplicación de Forma Persistente con PM2

Si simplemente ejecutas `node tu_app.js`, tu aplicación se detendrá tan pronto como cierres la sesión SSH. Para que tu aplicación se ejecute continuamente en segundo plano y se reinicie automáticamente si hay un fallo o un reinicio del servidor, usaremos **PM2**.

### ¿Qué es PM2?
PM2 es un administrador de procesos de producción para aplicaciones Node.js con un balanceador de carga incorporado.

### Pasos para Usar PM2:

1.  **Instala PM2 globalmente:**

    ```bash
    npm install pm2 -g
    ```

2.  **Inicia tu aplicación con PM2:** Asegúrate de estar en el directorio raíz de tu proyecto (donde está tu archivo principal, por ejemplo, `server.js`, `app.js` o `index.js`).

    ```bash
    pm2 start tu_archivo_principal.js --name "nombre-de-tu-app"
    ```
    *   Reemplaza `tu_archivo_principal.js` con el nombre de tu archivo de inicio de Node.js.
    *   `--name "nombre-de-tu-app"` es opcional, pero muy útil para identificar tu aplicación fácilmente en PM2.

3.  **Verifica el estado de tu aplicación:**

    ```bash
    pm2 list
    ```
    Esto te mostrará una lista de todas las aplicaciones que PM2 está gestionando, incluyendo el estado, el uso de CPU y memoria.

4.  **Configura PM2 para que se inicie automáticamente al reiniciar el servidor:** Esto es crucial para que tu aplicación vuelva a funcionar si el VPS se reinicia.

    ```bash
    pm2 startup
    ```
    PM2 te dará un comando específico para tu sistema operativo (por ejemplo, `sudo env PATH=$PATH:/home/ubuntu/.nvm/versions/node/v18.18.0/bin /home/ubuntu/.nvm/versions/node/v18.18.0/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu`). **Copia y pega ese comando exactamente como te lo muestra PM2 y ejecútalo.**

    Luego, guarda la lista actual de procesos de PM2 para que se restauren al inicio:
    ```bash
    pm2 save
    ```

---

## ¡Listo!

Tu aplicación Node.js ahora debería estar funcionando en tu VPS de GoDaddy, gestionada por PM2, y configurada para reiniciarse automáticamente.

Si tienes alguna pregunta o encuentras algún error en el camino, no dudes en preguntar.
