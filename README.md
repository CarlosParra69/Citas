# Citas Médicas Frontend

Este proyecto es una aplicación móvil desarrollada con React Native y diseñada para ejecutarse en Expo Go. Permite a los usuarios agendar, consultar y administrar citas, así como visualizar reportes y gestionar información de pacientes, médicos y especialidades.

## Características principales
- Autenticación de usuarios (login y registro)
- Gestión de citas médicas (crear, consultar, ver detalles)
- Visualización de especialidades y médicos
- Administración de pacientes
- Reportes y dashboard de estadísticas
- Navegación intuitiva entre pantallas

## Estructura del proyecto
- `src/api/`: Lógica para llamadas a la API (autenticación, citas, especialidades, médicos, pacientes, reportes)
- `src/components/`: Componentes reutilizables (botones, tarjetas, campos de entrada, loader)
- `src/context/`: Contextos para manejo de estado global (auth, citas, pacientes)
- `src/hooks/`: Hooks personalizados
- `src/navigation/`: Configuración de la navegación entre pantallas
- `src/screens/`: Pantallas principales de la app (autenticación, citas, especialidades, médicos, pacientes, reportes)
- `src/styles/`: Estilos globales y colores
- `src/utils/`: Utilidades (axios, formateo de fechas, colores)
- `assets/`: Imágenes y recursos gráficos

## Instalación
1. Clona el repositorio:
   ```powershell
   git clone <URL-del-repositorio>
   ```
2. Instala las dependencias:
   ```powershell
   npm install
   ```
3. Ejecuta la aplicación:
   ```powershell
   npm start
   ```

## Requisitos
- Node.js
- npm
- Expo CLI
- Expo Go (para ejecutar la app en dispositivos móviles)

## Uso
- Inicia la app con Expo Go y regístrate o inicia sesión.
- Navega entre las diferentes secciones para gestionar citas, pacientes, médicos y visualizar reportes.

## Contribución
Las contribuciones son bienvenidas. Por favor, abre un issue o envía un pull request para sugerencias o mejoras.

## Licencia
Este proyecto está bajo la licencia MIT.
