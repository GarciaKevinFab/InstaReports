# InstaReports

Sistema de gestion de reportes tecnicos para empresas de mantenimiento y soporte de equipos.

## Funcionalidades

### Roles
- **Administrador**: acceso total - gestiona reportes, usuarios y estadisticas
- **Tecnico**: crea reportes, visualiza sus propios reportes, descarga PDFs

### Reportes
- Crear, editar y eliminar reportes de mantenimiento
- Datos del cliente (nombre, direccion, telefono, DNI)
- Datos del equipo (tipo, marca, modelo, serie, codigo patrimonial)
- Descripcion de falla, observaciones, comentarios
- Tipo de mantenimiento (correctivo/preventivo)
- Estado del equipo (operativo/inoperativo)
- Gestion de partes (solicitud, detalles, estado de pedido)
- Indicador "listo para recoger"
- Subida de archivos adjuntos (max 10MB)
- Generacion de PDF por reporte

### Usuarios
- CRUD completo de usuarios (solo admin)
- Asignacion de roles
- Proteccion contra auto-eliminacion

### Seguridad
- Autenticacion JWT
- Middleware de proteccion por rol
- Passwords hasheados con bcrypt
- CORS configurado
- Filtrado de reportes por rol (tecnicos solo ven sus reportes)

## Tecnologias

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT para autenticacion
- Multer para subida de archivos
- bcryptjs para hashing

### Frontend
- Next.js (Pages Router)
- React 18
- Axios con interceptores
- Framer Motion (animaciones)
- React Toastify (notificaciones)
- jsPDF (generacion de PDFs)
- React Modal
- CSS Modules

## Instalacion

### Requisitos
- Node.js v18+
- MongoDB (local o Atlas)

### 1. Clonar el repositorio
```bash
git clone <url-del-repo>
cd InstaReports
```

### 2. Backend
```bash
cd Backend
npm install
cp .env.example .env
```

Editar `Backend/.env` con tus datos:
```env
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/insta_reports
PORT=4000
JWT_SECRET=tu_clave_secreta
FRONTEND_URI=http://localhost:3000
```

Crear el usuario administrador inicial:
```bash
npm run seed
```

Iniciar el servidor:
```bash
npm run dev
```

### 3. Frontend
```bash
cd Frontend
npm install
```

El archivo `.env` ya viene configurado. Si tu backend corre en otro puerto, editar `Frontend/.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Iniciar el frontend:
```bash
npm run dev
```

### 4. Abrir la aplicacion
Ir a [http://localhost:3000](http://localhost:3000)

Credenciales por defecto del admin:
- Email: `admin@instareports.com`
- Password: `admin123`

## Scripts

### Backend
| Comando | Descripcion |
|---------|------------|
| `npm run dev` | Servidor en modo desarrollo (nodemon) |
| `npm start` | Servidor en modo produccion |
| `npm run seed` | Crear usuario administrador inicial |

### Frontend
| Comando | Descripcion |
|---------|------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de produccion |
| `npm start` | Servir build de produccion |

## Estructura del proyecto

```
InstaReports/
├── Backend/
│   ├── config/          # Configuracion JWT
│   ├── controllers/     # Logica de negocio
│   ├── middleware/       # Auth, errores, uploads
│   ├── models/          # Esquemas Mongoose
│   ├── routes/          # Definicion de rutas API
│   ├── scripts/         # Script de inicializacion
│   ├── uploads/         # Archivos subidos
│   └── server.js        # Punto de entrada
├── Frontend/
│   ├── components/      # Componentes React
│   ├── contexts/        # Context de autenticacion
│   ├── hooks/           # Custom hooks
│   ├── pages/           # Paginas Next.js
│   ├── services/        # Llamadas a la API
│   ├── styles/          # CSS Modules
│   └── utils/           # Utilidades (API, PDF, helpers)
└── README.md
```

## API Endpoints

### Auth
| Metodo | Ruta | Descripcion |
|--------|------|------------|
| POST | `/api/auth/register` | Registrar usuario (rol tecnico) |
| POST | `/api/auth/login` | Iniciar sesion |

### Reportes (requiere auth)
| Metodo | Ruta | Descripcion |
|--------|------|------------|
| GET | `/api/reports` | Obtener reportes |
| POST | `/api/reports` | Crear reporte |
| PUT | `/api/reports/:id` | Actualizar reporte |
| DELETE | `/api/reports/:id` | Eliminar reporte |

### Usuarios (requiere auth + admin)
| Metodo | Ruta | Descripcion |
|--------|------|------------|
| GET | `/api/users` | Listar usuarios |
| POST | `/api/users` | Crear usuario |
| PUT | `/api/users/:id` | Actualizar usuario |
| DELETE | `/api/users/:id` | Eliminar usuario |
