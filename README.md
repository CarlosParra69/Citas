# MediApp - Frontend React Native

Aplicación móvil para gestión de citas médicas desarrollada con React Native y Expo.

## 📱 Descripción

MediApp Frontend es una aplicación móvil que permite a pacientes, médicos y administradores gestionar citas médicas de manera eficiente. La aplicación ofrece una interfaz intuitiva y moderna para:

- **Pacientes**: Agendar, consultar y gestionar sus citas médicas
- **Médicos**: Ver agenda, gestionar pacientes y consultar historial médico
- **Administradores**: Gestión completa del sistema, usuarios y reportes

## 🛠️ Tecnologías Utilizadas

- **React Native** - Framework para desarrollo móvil
- **Expo** - Plataforma para desarrollo y despliegue de apps React Native
- **React Navigation** - Navegación entre pantallas
- **Context API** - Gestión de estado global
- **Axios** - Cliente HTTP para API calls
- **React Native Elements** - Componentes UI

## 📋 Características Principales

- ✅ Autenticación de usuarios con JWT
- ✅ Gestión de perfiles de usuario
- ✅ Sistema de citas médicas
- ✅ Gestión de especialidades médicas
- ✅ Historial médico de pacientes
- ✅ Notificaciones push
- ✅ Modo oscuro/claro
- ✅ Estadísticas y reportes
- ✅ Gestión de roles (Paciente, Médico, Administrador, Superadmin)

## 📋 Requisitos del Sistema

### Para desarrollo:
- **Node.js** 16.x o superior
- **npm** o **yarn**
- **Expo CLI**
- **Git**

### Para ejecutar en dispositivo móvil:
- **Expo Go** app (disponible en App Store y Google Play)
- **Dispositivo móvil** (iOS o Android)

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/CarlosParra69/Citas.git
cd Citas
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configuración del Backend

⚠️ **Importante**: Asegúrate de que el backend Laravel esté ejecutándose antes de iniciar el frontend.

El backend debe estar disponible en `http://localhost:8000` (o la URL configurada).

### 4. Variables de Entorno (si es necesario)

Si el proyecto requiere variables de entorno específicas, créalas en un archivo `.env`:

```bash
# Ejemplo de variables de entorno
API_BASE_URL=http://localhost:8000/api
EXPO_PUBLIC_API_URL=http://localhost:8000/api
```

## 🏃‍♂️ Ejecución

### Modo Desarrollo con Expo

```bash
npx expo start
```

### Pasos para ejecutar:

1. **Ejecutar el comando anterior**
2. **Esperar a que aparezca el código QR**
3. **Abrir la app Expo Go** en tu dispositivo móvil
4. **Escanear el código QR** con la cámara del dispositivo
5. **La aplicación se cargará automáticamente**

### Alternativas para ejecutar:

#### En simulador/emulador:
```bash
# Para iOS
npx expo run:ios

# Para Android
npx expo run:android
```

#### En web (para desarrollo):
```bash
npx expo start --web
```

## 🔐 Credenciales de Acceso

### Super Administrador
- **Correo**: `admin@citasmedicas.com`
- **Contraseña**: `admin123`

### Otros usuarios de prueba
Los seeders del backend crean usuarios de prueba adicionales:
- **Médicos**: Consulta la base de datos para credenciales específicas
- **Pacientes**: Consulta la base de datos para credenciales específicas

## 📱 Funcionalidades por Rol

### 👨‍💼 Superadmin
- Gestión completa de usuarios
- Configuración del sistema
- Visualización de reportes y estadísticas
- Gestión de especialidades médicas
- Dashboard administrativo completo

### 👨‍⚕️ Médico
- Ver agenda de citas
- Gestionar pacientes asignados
- Consultar historial médico
- Confirmar/cancelar citas
- Ver estadísticas personales

### 👤 Paciente
- Agendar nuevas citas
- Ver citas pendientes y confirmadas
- Consultar historial médico personal
- Gestionar perfil personal
- Recibir notificaciones de citas

## 🏗️ Estructura del Proyecto

```
Citas/
├── src/
│   ├── api/                 # Configuración y llamadas a la API
│   ├── components/          # Componentes reutilizables
│   ├── screens/            # Pantallas de la aplicación
│   │   ├── Auth/          # Pantallas de autenticación
│   │   ├── Citas/         # Pantallas de gestión de citas
│   │   ├── Dashboard/     # Dashboards por rol
│   │   ├── Especialidades/ # Gestión de especialidades
│   │   ├── Medicos/       # Gestión de médicos
│   │   ├── Pacientes/     # Gestión de pacientes
│   │   ├── Reportes/      # Pantallas de reportes
│   │   └── Usuarios/      # Gestión de usuarios
│   ├── navigation/        # Configuración de navegación
│   ├── context/          # Contextos de React (Auth, Theme, etc.)
│   ├── hooks/           # Hooks personalizados
│   ├── styles/          # Estilos y temas
│   ├── utils/           # Utilidades y helpers
│   └── assets/          # Recursos estáticos (imágenes, íconos)
├── App.js              # Archivo principal de la aplicación
├── app.json           # Configuración de Expo
├── package.json       # Dependencias del proyecto
└── assets/           # Recursos adicionales
```

## 🔧 Configuración de Expo

El proyecto utiliza Expo para facilitar el desarrollo. Algunas configuraciones importantes:

### app.json
```json
{
  "expo": {
    "name": "MediApp",
    "slug": "mediapp",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

## 🌐 Integración con el Backend

La aplicación se comunica con el backend Laravel a través de REST API:

- **URL Base**: Configurada en `src/api/config.js` o variables de entorno
- **Autenticación**: Utiliza JWT tokens almacenados securely
- **Endpoints**: Mapeados en `src/api/` para cada funcionalidad

### Configuración de la API

Los archivos de configuración de API están en `src/api/`:
- `auth.js` - Autenticación
- `citas.js` - Gestión de citas
- `medicos.js` - Gestión de médicos
- `pacientes.js` - Gestión de pacientes
- `usuarios.js` - Gestión de usuarios
- etc.

## 🧪 Testing

Para ejecutar pruebas (si están implementadas):

```bash
npm test
```

## 📦 Build y Despliegue

### Build para producción:

```bash
# Para iOS
npx expo build:ios

# Para Android
npx expo build:android
```

### Publicar en Expo Application Services:

```bash
npx expo publish
```

## 🔄 Sincronización con Backend

Para que la aplicación funcione correctamente:

1. ✅ **Backend ejecutándose** en `http://localhost:8000`
2. ✅ **Base de datos configurada** con datos de prueba
3. ✅ **Cuentas de usuario creadas** (admin, médicos, pacientes)
4. ✅ **Frontend conectado** a la misma red/wifi

## 🚨 Solución de Problemas

### Problemas comunes:

1. **Error de conexión con backend**:
   - Verificar que el backend esté ejecutándose
   - Confirmar la URL de la API en la configuración
   - Revisar logs del backend para errores

2. **Problemas con Expo**:
   - Limpiar cache: `npx expo start --clear`
   - Reinstalar dependencias: `rm -rf node_modules && npm install`

3. **Problemas de red**:
   - Asegurar que el dispositivo móvil esté en la misma red
   - Verificar firewall y puertos abiertos

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Notas Adicionales

- La aplicación está optimizada para orientación vertical
- Compatible con tablets y dispositivos móviles
- Incluye modo oscuro para mejor experiencia de usuario
- Totalmente responsive y adaptativa

## 📞 Soporte

Para soporte técnico o consultas sobre el frontend, contactar al equipo de desarrollo móvil.

---

**Desarrollado por Carlos Parra con ❤️ para MediApp**