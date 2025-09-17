# Configuración de Conexión API

## Configuración del Backend (Laravel)

1. **Iniciar el servidor Laravel:**
   ```bash
   cd CitasBack
   php artisan serve
   ```
   El servidor estará disponible en `http://localhost:8000`

2. **Verificar que la API funciona:** Visita `http://localhost:8000/api/test` en
   tu navegador

## Configuración del Frontend (React Native)

### Para Emulador Android:

- Edita `CitasFront/src/config/api.js`
- Cambia `BASE_URL` a: `"http://10.0.2.2:8000/api"`

### Para Emulador iOS:

- Edita `CitasFront/src/config/api.js`
- Cambia `BASE_URL` a: `"http://localhost:8000/api"`

### Para Dispositivo Físico:

1. **Encuentra tu IP local:**
   - Windows: `ipconfig` (busca IPv4)
   - Mac/Linux: `ifconfig` (busca inet)

2. **Actualiza la configuración:**
   - Edita `CitasFront/src/config/api.js`
   - Cambia `BASE_URL` a: `"http://TU_IP:8000/api"`
   - Ejemplo: `"http://192.168.1.100:8000/api"`

3. **Asegúrate de que el firewall permita conexiones en el puerto 8000**

## Iniciar la Aplicación

```bash
cd CitasFront
npm start
```

## Endpoints de Autenticación Disponibles

- **POST** `/auth/register` - Registro de usuario
- **POST** `/auth/login` - Inicio de sesión
- **GET** `/auth/me` - Obtener perfil del usuario
- **POST** `/auth/logout` - Cerrar sesión
- **POST** `/auth/refresh` - Renovar token

## Estructura de Respuesta del Backend

### Login/Register exitoso:

```json
{
    "success": true,
    "message": "Login exitoso",
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
        "id": 1,
        "name": "Usuario",
        "email": "usuario@email.com",
        "created_at": "2024-01-01T00:00:00.000000Z"
    }
}
```

### Error:

```json
{
    "success": false,
    "message": "Credenciales inválidas"
}
```
