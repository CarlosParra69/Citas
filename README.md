# 🏥 Sistema de Gestión de Citas Médicas - Frontend

Aplicación móvil desarrollada con **React Native** y **Expo** para la gestión
completa de un sistema de citas médicas. Conecta con el backend Laravel para
ofrecer una experiencia completa de administración médica.

## ✨ Características Principales

### 🔐 **Autenticación Completa**

- Registro e inicio de sesión con JWT
- Gestión automática de tokens
- Perfil de usuario editable
- Logout seguro

### 📅 **Gestión de Citas**

- Crear nuevas citas con validaciones
- Ver todas las citas del paciente
- Citas del día actual
- Detalle completo de cada cita
- Cancelación de citas (estados permitidos)
- Estados visuales con colores diferenciados

### 🏥 **Especialidades Médicas**

- Lista completa de especialidades disponibles
- Navegación a médicos por especialidad
- Información detallada de cada especialidad
- Estados activos/inactivos

### 👨‍⚕️ **Gestión de Médicos**

- Lista de médicos por especialidad o general
- Perfiles completos con información profesional
- Horarios de atención detallados
- Tarifas de consulta
- Estados de disponibilidad
- Biografías profesionales

### 👤 **Administración de Pacientes**

- Lista completa con búsqueda
- Perfiles detallados con información médica
- Historial médico completo
- Crear nuevos pacientes
- Información de contacto de emergencia
- Datos médicos (tipo sangre, alergias, etc.)

### 📊 **Reportes y Analytics**

- Dashboard con estadísticas generales
- Médicos con más citas (ranking)
- Patrones de citas (horarios, días populares)
- Tendencias temporales
- Análisis de especialidades más solicitadas
- Gráficos interactivos

## 🏗️ Arquitectura del Proyecto

```
CitasFront/
├── src/
│   ├── api/                    # Servicios de API
│   │   ├── auth.js            # Autenticación
│   │   ├── citas.js           # Gestión de citas
│   │   ├── especialidades.js  # Especialidades médicas
│   │   ├── medicos.js         # Gestión de médicos
│   │   ├── pacientes.js       # Gestión de pacientes
│   │   └── reportes.js        # Reportes y analytics
│   │
│   ├── components/            # Componentes reutilizables
│   │   ├── ButtonPrimary.js   # Botón principal
│   │   ├── CardItem.js        # Tarjeta de información
│   │   ├── InputField.js      # Campo de entrada
│   │   ├── LoadingSpinner.js  # Indicador de carga
│   │   └── GenderSelector.js  # Selector de género
│   │
│   ├── context/               # Contextos globales
│   │   ├── AuthContext.js     # Estado de autenticación
│   │   ├── CitasContext.js    # Estado de citas
│   │   └── PacientesContext.js # Estado de pacientes
│   │
│   ├── navigation/            # Navegación
│   │   ├── AppNavigator.js    # Navegador principal
│   │   ├── TabNavigator.js    # Navegación por tabs
│   │   ├── CitasNavigator.js  # Stack de citas
│   │   ├── EspecialidadesNavigator.js
│   │   ├── MedicosNavigator.js
│   │   ├── PacientesNavigator.js
│   │   └── ReportesNavigator.js
│   │
│   ├── screens/               # Pantallas principales
│   │   ├── Auth/             # Autenticación
│   │   ├── Citas/            # Gestión de citas
│   │   ├── Especialidades/   # Especialidades médicas
│   │   ├── Medicos/          # Gestión de médicos
│   │   ├── Pacientes/        # Gestión de pacientes
│   │   └── Reportes/         # Reportes y analytics
│   │
│   ├── utils/                # Utilidades
│   │   ├── axiosInstance.js  # Configuración de Axios
│   │   ├── colors.js         # Paleta de colores
│   │   └── formatDate.js     # Formateo de fechas
│   │
│   └── styles/               # Estilos globales
│       ├── colors.js
│       └── globalStyles.js
```

## 📱 Pantallas Implementadas

### **Autenticación**

- `LoginScreen` - Inicio de sesión
- `RegisterScreen` - Registro de usuarios
- `ProfileScreen` - Perfil del usuario

### **Citas Médicas**

- `CitasScreen` - Lista de todas las citas
- `CitasHoyScreen` - Citas del día actual
- `CrearCitaScreen` - Crear nueva cita
- `DetalleCitaScreen` - Detalle completo de cita

### **Especialidades**

- `EspecialidadesScreen` - Lista de especialidades
- Navegación integrada a médicos por especialidad

### **Médicos**

- `MedicosScreen` - Lista de médicos (general o por especialidad)
- `MedicoDetailScreen` - Perfil completo del médico

### **Pacientes**

- `PacientesScreen` - Lista con búsqueda
- `PacienteDetailScreen` - Perfil completo del paciente
- `CrearPacienteScreen` - Crear nuevo paciente

### **Reportes**

- `DashboardScreen` - Dashboard principal
- `MedicosMasCitasScreen` - Ranking de médicos
- `PatronesCitasScreen` - Análisis de patrones

## 🚀 Instalación y Configuración

### Prerequisitos

- Node.js >= 16
- npm o yarn
- Expo CLI
- Expo Go (para dispositivos móviles)

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <URL-del-repositorio>
   cd CitasFront
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar la API**
   - Editar `src/config/api.js` con la URL del backend
   ```javascript
   export const API_BASE_URL = "http://tu-backend-url:8000/api";
   ```

4. **Ejecutar la aplicación**
   ```bash
   npm start
   ```

5. **Abrir en dispositivo**
   - Escanear el código QR con Expo Go
   - O usar simulador iOS/Android

## 🔧 Configuración del Backend

La aplicación está diseñada para conectar con el backend Laravel. Asegúrate de:

1. **Backend ejecutándose** en `http://localhost:8000`
2. **CORS configurado** para permitir requests desde la app
3. **Base de datos** con datos de prueba cargados

## 📊 Funcionalidades Destacadas

### **Estados de Citas con Colores**

- 🔵 Programada (Azul)
- 🟢 Confirmada (Verde)
- 🟠 En Curso (Naranja)
- 🔵 Completada (Azul primario)
- 🔴 Cancelada (Rojo)
- ⚫ No Asistió (Gris)

### **Navegación Inteligente**

- Stack navigators para cada sección
- Parámetros entre pantallas
- Navegación cruzada entre secciones
- Títulos dinámicos

### **Manejo de Estados**

- Loading states durante operaciones
- Pull-to-refresh en todas las listas
- Manejo robusto de errores
- Validaciones de formularios

### **Búsqueda y Filtros**

- Búsqueda de pacientes por nombre/cédula
- Filtros por especialidad en médicos
- Estados de citas filtrados

## 🎨 Diseño y UX

### **Paleta de Colores**

- Primary: `#1976D2` (Azul médico)
- Secondary: `#388E3C` (Verde)
- Success: `#4CAF50`
- Warning: `#FF9800`
- Error: `#F44336`
- Background: `#F5F8FF`

### **Componentes Reutilizables**

- Botones consistentes con loading states
- Tarjetas de información estandarizadas
- Campos de entrada con validación
- Spinners de carga personalizados

## 🔒 Seguridad

- **JWT Tokens** manejados automáticamente
- **Interceptores Axios** para tokens expirados
- **Validación de formularios** en frontend
- **Manejo seguro** de datos sensibles

## 📈 Rendimiento

- **Lazy loading** de pantallas
- **Optimización de re-renders** con contextos
- **Caché de datos** en contextos globales
- **Navegación optimizada** con stack navigators

## 🧪 Testing y Debugging

### **Datos de Prueba**

- Usuario: `test2@example.com` / `password123`
- Especialidades precargadas
- Médicos de ejemplo
- Citas de prueba

### **Debugging**

- Console logs en operaciones críticas
- Manejo de errores con alertas informativas
- Estados de loading visibles

## 🚀 Próximas Mejoras

- [ ] **Notificaciones push** para recordatorios
- [ ] **Modo offline** con sincronización
- [ ] **Calendario visual** para citas
- [ ] **Chat en tiempo real** con médicos
- [ ] **Geolocalización** de consultorios
- [ ] **Pagos integrados** para consultas
- [ ] **Telemedicina** con videollamadas

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para nueva funcionalidad
   (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 🎉 Estado del Proyecto

**✅ COMPLETAMENTE FUNCIONAL**

- ✅ Autenticación JWT
- ✅ Gestión completa de citas
- ✅ Especialidades y médicos
- ✅ Administración de pacientes
- ✅ Reportes y analytics
- ✅ Navegación fluida
- ✅ Diseño responsivo
- ✅ Manejo de errores
- ✅ Integración con backend Laravel

**¡Sistema listo para producción! 🚀**
