# Diagrammes d'Architecture - App-Kine

## 1. Architecture Globale

```mermaid
graph TB
    subgraph "Client Layer"
        A[React App<br/>Mobile-First UI]
        B[PWA<br/>Offline Support]
    end

    subgraph "CDN & Edge"
        C[CloudFlare CDN<br/>Global Distribution]
    end

    subgraph "Application Layer"
        D[Vercel<br/>Frontend Hosting]
        E[Railway/Render<br/>Backend API]
    end

    subgraph "Data Layer"
        F[PostgreSQL<br/>Primary Database]
        G[Redis<br/>Cache & Sessions]
        H[AWS S3<br/>File Storage]
    end

    subgraph "External Services"
        I[Email Service<br/>Resend/SendGrid]
        J[Monitoring<br/>Sentry + Analytics]
    end

    A --> C
    B --> C
    C --> D
    D --> E
    E --> F
    E --> G
    E --> H
    E --> I
    E --> J
```

## 2. Architecture des Couches

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React Components]
        B[State Management<br/>Zustand]
        C[API Client<br/>Axios/Fetch]
    end

    subgraph "API Layer"
        D[Express.js Server]
        E[Authentication<br/>JWT Middleware]
        F[Validation<br/>Zod Schemas]
        G[Controllers]
    end

    subgraph "Business Layer"
        H[Services<br/>Business Logic]
        I[Repositories<br/>Data Access]
    end

    subgraph "Data Layer"
        J[Prisma ORM]
        K[PostgreSQL<br/>Primary DB]
        L[Redis<br/>Cache]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    J --> L
```

## 3. Flux de Données - Authentification

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant D as Database
    participant R as Redis

    U->>F: Login Request
    F->>A: POST /auth/login
    A->>D: Validate Credentials
    D-->>A: User Data
    A->>A: Generate JWT
    A->>R: Store Session
    A-->>F: Access + Refresh Token
    F->>F: Store Tokens
    F-->>U: Redirect to Dashboard
```

## 4. Flux de Données - Gestion des Patients

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant S as Service
    participant D as Database

    U->>F: Create Patient
    F->>A: POST /patients
    A->>A: Validate Data
    A->>S: PatientService.create
    S->>D: Insert Patient
    D-->>S: Patient Created
    S-->>A: Patient Data
    A-->>F: Success Response
    F-->>U: Show Success Message
```

## 5. Architecture de Sécurité

```mermaid
graph TB
    subgraph "Client Security"
        A[HTTPS Only]
        B[Content Security Policy]
        C[Secure Headers]
    end

    subgraph "API Security"
        D[JWT Authentication]
        E[Rate Limiting]
        F[Input Validation]
        G[CORS Protection]
    end

    subgraph "Data Security"
        H[Encryption at Rest]
        I[Encryption in Transit]
        J[Access Control]
        K[Audit Logging]
    end

    subgraph "Infrastructure Security"
        L[WAF Protection]
        M[DDoS Mitigation]
        N[SSL/TLS 1.3]
        O[Security Monitoring]
    end

    A --> D
    B --> E
    C --> F
    D --> H
    E --> I
    F --> J
    G --> K
    H --> L
    I --> M
    J --> N
    K --> O
```

## 6. Modèle de Données - Relations

```mermaid
erDiagram
    USER ||--o{ PATIENT : manages
    USER ||--o{ SESSION : conducts
    USER ||--o{ INVOICE : creates

    PATIENT ||--o{ SESSION : has
    PATIENT ||--o{ INVOICE : receives
    PATIENT ||--o{ DOCUMENT : contains

    SESSION ||--o{ EVALUATION : includes
    SESSION ||--o{ EXERCISE : prescribes
    SESSION ||--o{ OBJECTIVE : tracks

    INVOICE ||--o{ PAYMENT : receives

    USER {
        string id PK
        string email
        string password
        string firstName
        string lastName
        enum role
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    PATIENT {
        string id PK
        string practitionerId FK
        string firstName
        string lastName
        date birthDate
        string phone
        string email
        json address
        json medicalInfo
        json emergencyContact
        datetime createdAt
        datetime updatedAt
    }

    SESSION {
        string id PK
        string patientId FK
        string practitionerId FK
        datetime scheduledAt
        int duration
        enum status
        text notes
        json objectives
        json exercises
        json evaluation
        datetime createdAt
        datetime updatedAt
    }

    INVOICE {
        string id PK
        string patientId FK
        string practitionerId FK
        decimal amount
        enum status
        date dueDate
        date paidAt
        datetime createdAt
        datetime updatedAt
    }
```

## 7. Architecture de Déploiement

```mermaid
graph TB
    subgraph "Development"
        A[Local Development<br/>Docker Compose]
        B[Git Repository<br/>GitHub]
    end

    subgraph "CI/CD Pipeline"
        C[GitHub Actions<br/>Automated Testing]
        D[Build & Deploy<br/>Staging]
        E[E2E Tests<br/>Playwright]
        F[Deploy Production<br/>Zero Downtime]
    end

    subgraph "Production Environment"
        G[Vercel<br/>Frontend]
        H[Railway<br/>Backend]
        I[PostgreSQL<br/>Database]
        J[Redis<br/>Cache]
        K[CloudFlare<br/>CDN]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    F --> H
    H --> I
    H --> J
    G --> K
```

## 8. Monitoring et Observabilité

```mermaid
graph TB
    subgraph "Application Metrics"
        A[Performance Metrics<br/>Response Time, Throughput]
        B[Error Tracking<br/>Sentry]
        C[User Analytics<br/>Vercel Analytics]
    end

    subgraph "Infrastructure Metrics"
        D[Server Health<br/>CPU, Memory, Disk]
        E[Database Performance<br/>Query Time, Connections]
        F[Cache Performance<br/>Hit Rate, Latency]
    end

    subgraph "Business Metrics"
        G[User Engagement<br/>DAU, MAU]
        H[Feature Usage<br/>Conversion Rates]
        I[Revenue Metrics<br/>MRR, Churn]
    end

    subgraph "Alerting"
        J[Error Alerts<br/>PagerDuty]
        K[Performance Alerts<br/>Slack]
        L[Business Alerts<br/>Email]
    end

    A --> J
    B --> J
    C --> G
    D --> K
    E --> K
    F --> K
    G --> L
    H --> L
    I --> L
```

## 9. Évolutivité - Migration vers Microservices

```mermaid
graph TB
    subgraph "Phase 1 - Modular Monolith"
        A[User Service Module]
        B[Patient Service Module]
        C[Session Service Module]
        D[Invoice Service Module]
    end

    subgraph "Phase 2 - API Gateway"
        E[API Gateway<br/>Kong/AWS API Gateway]
        F[Service Discovery<br/>Consul/Eureka]
    end

    subgraph "Phase 3 - Microservices"
        G[User Microservice]
        H[Patient Microservice]
        I[Session Microservice]
        J[Invoice Microservice]
        K[Notification Microservice]
    end

    A --> E
    B --> E
    C --> E
    D --> E
    E --> F
    F --> G
    F --> H
    F --> I
    F --> J
    F --> K
```

## 10. Flux de Facturation

```mermaid
sequenceDiagram
    participant S as Session
    participant A as API
    participant I as Invoice Service
    participant D as Database
    participant E as Email Service

    S->>A: Session Completed
    A->>I: Generate Invoice
    I->>D: Create Invoice Record
    I->>I: Calculate Amount
    I->>D: Update Invoice
    I->>E: Send Invoice Email
    E-->>I: Email Sent
    I-->>A: Invoice Created
    A-->>S: Success Response
```

---

**Architecte** : Winston (BMad-Method)  
**Date** : 2024-12-19  
**Version** : 1.0
