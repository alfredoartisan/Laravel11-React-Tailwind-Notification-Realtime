# Documentación Técnica: Sistema de Chat en Tiempo Real con Laravel 11 y Reverb

Este documento detalla la arquitectura, flujos de datos y configuración del sistema de chat en tiempo real construido con Laravel 11, React, Tailwind CSS y Laravel Reverb.

---

## 1. Visión General del Proyecto

El sistema es una aplicación moderna de mensajería que permite comunicación instantánea entre usuarios y grupos. Utiliza una arquitectura **SPA (Single Page Application)** servida por **Inertia.js** dentro de un backend Laravel robusto.

### Stack Tecnológico
- **Backend**: Laravel 11 (PHP 8.2+).
- **Frontend**: React 18, Tailwind CSS, Inertia.js.
- **Base de Datos**: SQLite (configuración por defecto) o MySQL.
- **Real-Time**: Laravel Reverb (Servidor WebSocket nativo de Laravel).
- **Colas**: Database Queue Driver (para procesar eventos de broadcast asíncronos).

---

## 2. Arquitectura de Datos

El núcleo del sistema se basa en cuatro modelos principales y sus relaciones:

### Modelos Principales

1.  **User (`users`)**:
    - Usuarios del sistema.
    - Relación 1:N con `Messages` (como remitente y receptor).
    - Relación M:N con `Groups`.

2.  **Message (`messages`)**:
    - La unidad central de información.
    - Atributos clave: `message` (texto), `sender_id`, `receiver_id` (para 1-a-1), `group_id` (para grupos).
    - **Optimización**: Contiene timestamps para ordenamiento cronológico.

3.  **Conversation (`conversations`)**:
    - Modelo auxiliar para listar chats recientes eficientemente en el sidebar.
    - Relaciona dos usuarios (`user_id1`, `user_id2`).
    - Rastrea el `last_message_id` para mostrar previsualizaciones rápidas sin consultar toda la tabla de mensajes.

4.  **Group (`groups`)**:
    - Entidad para chats grupales.
    - Tiene un `last_message_id` propio para el sidebar.

### Diagrama de Relación Simplificado
- Un `Message` pertenece a un `Sender` (User) y puede pertenecer a un `Receiver` (User) O un `Group`.
- Una `Conversation` se actualiza ("touch") cada vez que se crea un `Message` entre dos usuarios.

---

## 3. Flujo del Proceso de Mensajería

Este es el ciclo de vida completo de un mensaje desde que el usuario lo escribe hasta que el destinatario lo recibe.

### Paso 1: Envío (Frontend)
- **Componente**: `resources/js/Components/App/MessageInput.jsx`
- El usuario escribe y presiona "Enviar".
- **Lógica Crítica**: Se determina si es chat directo o grupo.
    - Si es usuario directo, se adjunta `receiver_id` (¡Crucial!).
    - Si es grupo, se adjunta `group_id`.
- Se realiza una petición HTTP POST a `/message` (Ruta: `message.store`).

### Paso 2: Procesamiento (Backend)
- **Controlador**: `App\Http\Controllers\MessageController@store`
- **Validación**: Se valida el request.
- **Persistencia**:
    1. Se crea el registro en la tabla `messages`.
    2. Se actualiza o crea la `Conversation` correspondiente (actualizando `last_message_id` y fecha).
        - *Nota*: Esto asegura que el chat suba al tope de la lista lateral.
- **Evento de Broadcast**:
    - Se dispara el evento `App\Events\SocketMessage`.
    - Este evento implementa `ShouldBroadcast`, por lo que se envía a la **Cola de Trabajos** (Queue) en lugar de bloquear la petición.

### Paso 3: Transmisión (Broadcasting)
- **Worker**: El proceso `php artisan queue:listen` recoge el trabajo.
- **Reverb**: El worker envía el payload del mensaje al servidor **Laravel Reverb** (corriendo en puerto 8080).
- **Canales**:
    - `message.user.{id}`: Para mensajes privados 1-a-1.
    - `message.group.{id}`: Para mensajes de grupo.

### Paso 4: Recepción (Frontend)
- **Librería**: Laravel Echo (`resources/js/echo.js`).
- El cliente (navegador del receptor) está suscrito a su canal privado.
- **Evento**: `SocketMessage`.
- **Acción**:
    - Al recibir el evento, React actualiza el estado (`conversations` o `messages`).
    - Si el chat está abierto, el mensaje aparece "mágicamente" (burbuja gris).
    - Si no, se actualiza la notificación o el sidebar.

---

## 4. Configuración del Entorno (Guía de Inicio)

Para ejecutar este proyecto correctamente, se requiere iniciar varios servicios en paralelo.

### Archivo `.env` Crítico
Asegúrate de tener estas configuraciones para que Reverb funcione localmente:

```ini
BROADCAST_CONNECTION=reverb
QUEUE_CONNECTION=database

# Configuración Reverb (Localhost 127.0.0.1 es más seguro para evitar timeouts en Windows)
REVERB_APP_ID=alguna_id
REVERB_APP_KEY=alguna_key
REVERB_APP_SECRET=secreto
REVERB_HOST="127.0.0.1"
REVERB_PORT=8080
REVERB_SCHEME=http

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

### Comandos de Ejecución
Usamos un script compuesto en `composer.json` para levantar todo con un solo comando:

```bash
composer dev
```

Esto inicia simultáneamente:
1.  **Laravel Server**: `php artisan serve` (API/Web)
2.  **Vite**: `npm run dev` (Frontend Assets)
3.  **Queue Worker**: `php artisan queue:listen` (Procesamiento de eventos en fondo)
4.  **Reverb Server**: `php artisan reverb:start` (WebSocket Server)

---

## 5. Solución de Problemas Comunes (Troubleshooting)

### A. "Error al enviar el mensaje" (Barra Roja)
- **Causa probable**: El backend no puede conectar con Reverb.
- **Solución**: Asegúrate de usar `127.0.0.1` en `REVERB_HOST` en lugar de `localhost` en Windows, y reinicia `composer dev`.

### B. "El mensaje se envía, pero si refresco desaparece" (No Persistencia)
- **Causa probable**: El mensaje se guardó mal en la BD (ej. sin `receiver_id`) o la `Conversation` no se actualizó.
- **Solución Aplicada**: Se corrigió el controlador `MessageController::byUser` para incluir metadatos (`is_user: true`) asegurando que el frontend sepa a quién enviar el mensaje.

### C. "No recibo mensajes en tiempo real"
- **Verificación**: Abre la consola del navegador (F12).
- Si ves errores de conexión WebSocket: Revisa que `php artisan reverb:start` esté corriendo en el puerto correcto.
- Si no hay errores, pero no llegan: Revisa que `php artisan queue:listen` esté corriendo. Al usar colas, si el worker está apagado, los mensajes se quedan "pendientes" y no se envían.

---

## 6. Recursos Adicionales

- **Seeders**: El proyecto incluye usuarios de prueba (`juan@example.com`, `juana@example.com`, Password: `password`).
- **Comandos Útiles**:
    - `php artisan migrate:fresh --seed`: Reinicia la base de datos completamente.
    - `php artisan tinker`: Consola interactiva para inspeccionar datos.

---
*Documentación generada automáticamente por Antigravity Assistant.*
