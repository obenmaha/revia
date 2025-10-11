# Spécifications Techniques Détaillées - App-Kine

## Configuration du Projet

### Structure des Dossiers

```
app-kine/
├── frontend/                 # Application React
│   ├── src/
│   │   ├── components/      # Composants réutilisables
│   │   │   ├── ui/         # Composants UI de base
│   │   │   ├── forms/      # Composants de formulaires
│   │   │   └── features/   # Composants métier
│   │   ├── pages/          # Pages de l'application
│   │   ├── hooks/          # Hooks React personnalisés
│   │   ├── stores/         # État global (Zustand)
│   │   ├── services/       # Services API
│   │   ├── utils/          # Utilitaires
│   │   └── types/          # Types TypeScript
│   ├── public/             # Assets statiques
│   └── package.json
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── controllers/    # Contrôleurs des routes
│   │   ├── services/       # Logique métier
│   │   ├── repositories/   # Accès aux données
│   │   ├── middleware/     # Middleware Express
│   │   ├── routes/         # Définition des routes
│   │   ├── models/         # Modèles Prisma
│   │   ├── utils/          # Utilitaires
│   │   └── types/          # Types TypeScript
│   ├── prisma/             # Configuration Prisma
│   └── package.json
├── shared/                  # Types et utilitaires partagés
│   ├── types/              # Types TypeScript communs
│   └── utils/              # Utilitaires partagés
├── docs/                   # Documentation
├── docker-compose.yml      # Environnement de développement
└── README.md
```

## Configuration Frontend

### package.json (Frontend)

```json
{
  "name": "app-kine-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  },
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^6.20.1",
    "zustand": "^4.4.7",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-button": "^1.0.4",
    "@radix-ui/react-calendar": "^1.0.4",
    "@radix-ui/react-card": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-form": "^0.0.3",
    "@radix-ui/react-input": "^1.0.4",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-navigation-menu": "^1.1.4",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-radio-group": "^1.1.3",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-sheet": "^1.0.4",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-table": "^1.0.4",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-textarea": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-tooltip": "^1.0.7",
    "react-hook-form": "^7.48.2",
    "@hookform/resolvers": "^3.3.2",
    "zod": "^3.22.4",
    "axios": "^1.6.2",
    "date-fns": "^2.30.0",
    "recharts": "^2.8.0",
    "react-dropzone": "^14.2.3",
    "react-hot-toast": "^2.4.1",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.1.16",
    "@types/react-dom": "^19.1.9",
    "@types/node": "^20.10.0",
    "@vitejs/plugin-react": "^5.0.4",
    "vite": "^7.1.7",
    "typescript": "^5.9.3",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "eslint": "^9.36.0",
    "@eslint/js": "^9.36.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.22",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/user-event": "^14.5.1",
    "jsdom": "^23.0.1",
    "@vitest/ui": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0"
  }
}
```

### Configuration Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/stores': path.resolve(__dirname, './src/stores'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
});
```

### Configuration Tailwind CSS

```typescript
// tailwind.config.js
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
```

## Configuration Backend

### package.json (Backend)

```json
{
  "name": "app-kine-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint . --ext ts --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cookie-parser": "^1.4.6",
    "dotenv": "^16.3.1",
    "prisma": "^5.7.0",
    "@prisma/client": "^5.7.0",
    "zod": "^3.22.4",
    "axios": "^1.6.2",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.32.6",
    "puppeteer": "^21.5.2",
    "nodemailer": "^6.9.7",
    "redis": "^4.6.10",
    "winston": "^3.11.0",
    "express-winston": "^4.2.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/compression": "^1.7.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/cookie-parser": "^1.4.6",
    "@types/multer": "^1.4.11",
    "@types/nodemailer": "^6.4.14",
    "@types/node": "^20.10.0",
    "typescript": "^5.9.3",
    "tsx": "^4.6.0",
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "supertest": "^6.3.3",
    "@types/supertest": "^2.0.16",
    "eslint": "^9.36.0",
    "@eslint/js": "^9.36.0"
  }
}
```

### Configuration Prisma

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  firstName String
  lastName  String
  role      Role     @default(PRACTITIONER)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  patients  Patient[]
  sessions  Session[]
  invoices  Invoice[]

  @@map("users")
}

model Patient {
  id             String       @id @default(cuid())
  practitionerId String
  firstName      String
  lastName       String
  birthDate      DateTime
  phone          String
  email          String?
  address        Json
  medicalInfo    Json
  emergencyContact Json
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  // Relations
  practitioner User      @relation(fields: [practitionerId], references: [id], onDelete: Cascade)
  sessions     Session[]
  invoices     Invoice[]
  documents    Document[]

  @@map("patients")
}

model Session {
  id             String      @id @default(cuid())
  patientId      String
  practitionerId String
  scheduledAt    DateTime
  duration       Int         // en minutes
  status         SessionStatus @default(SCHEDULED)
  notes          String?
  objectives     Json?
  exercises      Json?
  evaluation     Json?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  // Relations
  patient      Patient @relation(fields: [patientId], references: [id], onDelete: Cascade)
  practitioner User    @relation(fields: [practitionerId], references: [id], onDelete: Cascade)
  invoices     Invoice[]

  @@map("sessions")
}

model Invoice {
  id             String      @id @default(cuid())
  patientId      String
  practitionerId String
  invoiceNumber  String      @unique
  amount         Decimal     @db.Decimal(10, 2)
  status         InvoiceStatus @default(DRAFT)
  dueDate        DateTime
  paidAt         DateTime?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  // Relations
  patient      Patient   @relation(fields: [patientId], references: [id], onDelete: Cascade)
  practitioner User      @relation(fields: [practitionerId], references: [id], onDelete: Cascade)
  sessions     Session[]
  payments     Payment[]

  @@map("invoices")
}

model Payment {
  id        String   @id @default(cuid())
  invoiceId String
  amount    Decimal  @db.Decimal(10, 2)
  method    String
  reference String?
  createdAt DateTime @default(now())

  // Relations
  invoice Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  @@map("payments")
}

model Document {
  id        String   @id @default(cuid())
  patientId String
  filename  String
  filepath  String
  fileType  String
  fileSize  Int
  category  String?
  createdAt DateTime @default(now())

  // Relations
  patient Patient @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@map("documents")
}

enum Role {
  PRACTITIONER
  ADMIN
}

enum SessionStatus {
  SCHEDULED
  COMPLETED
  CANCELLED
  NO_SHOW
}

enum InvoiceStatus {
  DRAFT
  SENT
  PAID
  OVERDUE
}
```

## Configuration Docker

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: app_kine
      POSTGRES_USER: app_kine
      POSTGRES_PASSWORD: app_kine_password
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U app_kine']
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - '5000:5000'
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://app_kine:app_kine_password@postgres:5432/app_kine
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your_jwt_secret_here
      - JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: npm run dev

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    environment:
      - VITE_API_URL=http://localhost:5000
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

volumes:
  postgres_data:
  redis_data:
```

### Dockerfile Backend

```dockerfile
# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

### Dockerfile Frontend

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

EXPOSE 3000

CMD ["npm", "preview"]
```

## Configuration de Déploiement

### Variables d'Environnement

```bash
# .env.example

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/app_kine"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# File Storage
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="eu-west-3"
AWS_S3_BUCKET="app-kine-files"

# Email
SMTP_HOST="smtp.resend.com"
SMTP_PORT="587"
SMTP_USER="resend"
SMTP_PASS="your-resend-api-key"
FROM_EMAIL="noreply@app-kine.com"

# Frontend
VITE_API_URL="https://api.app-kine.com"

# Security
BCRYPT_ROUNDS="12"
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="100"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
```

### Configuration Vercel

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ],
  "env": {
    "VITE_API_URL": "@api-url"
  }
}
```

### Configuration Railway

```toml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10

[env]
NODE_ENV = "production"
```

## Tests et Qualité

### Configuration Vitest (Frontend)

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/', '**/*.d.ts', '**/*.config.*'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Configuration Vitest (Backend)

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
      ],
    },
  },
});
```

## Monitoring et Logging

### Configuration Winston

```typescript
// src/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'app-kine-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export default logger;
```

### Configuration Sentry

```typescript
// src/utils/sentry.ts
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

export default Sentry;
```

---

**Architecte** : Winston (BMad-Method)  
**Date** : 2024-12-19  
**Version** : 1.0
