# Diagrammes d'Architecture - App-Kine

## 1. Architecture Globale (Serverless)

```mermaid
graph TB
    subgraph "Client Layer"
        A[React 19 App<br/>Mobile-First UI + PWA]
        B[TanStack Query<br/>Server State Management]
    end

    subgraph "CDN & Edge"
        C[CloudFlare CDN<br/>Global Distribution]
        D[Vercel Edge Network<br/>Global Edge Functions]
    end

    subgraph "Application Layer"
        E[Vercel<br/>Frontend Hosting]
        F[Supabase Platform<br/>Backend-as-a-Service]
    end

    subgraph "Data Layer"
        G[PostgreSQL<br/>Primary Database + RLS]
        H[Supabase Storage<br/>File Storage + RLS]
        I[Upstash Redis<br/>Cache (Optional)]
    end

    subgraph "Edge Functions"
        J[Generate Invoice<br/>PDF + Email]
        K[Upload Document<br/>File Processing]
        L[Daily Report<br/>Analytics]
    end

    subgraph "External Services"
        M[Email Service<br/>Resend/SendGrid]
        N[Monitoring<br/>Sentry + Analytics]
    end

    A --> C
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    F --> H
    F --> I
    F --> J
    F --> K
    F --> L
    J --> M
    K --> N
    L --> N
```

## 2. Architecture des Couches (Serverless)

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React 19 Components]
        B[TanStack Query<br/>Server State]
        C[Zustand<br/>Client State]
        D[Supabase Client<br/>API Client]
    end

    subgraph "Edge Functions Layer"
        E[Generate Invoice<br/>PDF + Email]
        F[Upload Document<br/>File Processing]
        G[Daily Report<br/>Analytics]
        H[Business Logic<br/>Complex Operations]
    end

    subgraph "Data Access Layer"
        I[Supabase API<br/>REST + Realtime]
        J[Row Level Security<br/>RLS Policies]
        K[Supabase Storage<br/>File Management]
    end

    subgraph "Data Layer"
        L[PostgreSQL<br/>Primary DB + RLS]
        M[Upstash Redis<br/>Cache (Optional)]
        N[Audit Logs<br/>Security Tracking]
    end

    A --> B
    B --> C
    C --> D
    D --> I
    I --> J
    J --> L
    D --> E
    D --> F
    D --> G
    D --> H
    E --> I
    F --> K
    G --> I
    H --> I
    I --> M
    I --> N
```

## 3. Flux de Données - Authentification (Supabase)

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant S as Supabase Auth
    participant D as Database
    participant R as RLS

    U->>F: Login Request
    F->>S: signInWithPassword()
    S->>D: Validate Credentials
    D-->>S: User Data + RLS Context
    S->>S: Generate JWT (with RLS)
    S-->>F: Access Token + User Data
    F->>F: Store Session (Auto)
    F->>D: Query Data (RLS Applied)
    D->>R: Check RLS Policies
    R-->>D: Filtered Data
    D-->>F: User's Data Only
    F-->>U: Dashboard with Data
```

## 4. Flux de Données - Gestion des Patients (RLS)

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant S as Supabase Client
    participant D as Database
    participant R as RLS

    U->>F: Create Patient
    F->>S: from('patients').insert()
    S->>D: Insert Patient (with auth.uid())
    D->>R: Check RLS Policy
    R->>R: Verify practitioner_id = auth.uid()
    R-->>D: Allow Insert
    D-->>S: Patient Created
    S-->>F: Patient Data (Filtered)
    F->>F: Update TanStack Query Cache
    F-->>U: Show Success Message
```

## 5. Architecture de Sécurité (RGPD-Native)

```mermaid
graph TB
    subgraph "Client Security"
        A[HTTPS Only (Vercel)]
        B[Content Security Policy]
        C[Secure Headers (Auto)]
    end

    subgraph "API Security"
        D[Supabase Auth (JWT)]
        E[Rate Limiting (CloudFlare)]
        F[Input Validation (Zod)]
        G[CORS Protection (Supabase)]
    end

    subgraph "Data Security (RLS)"
        H[Encryption at Rest (Auto)]
        I[Encryption in Transit (TLS 1.3)]
        J[Row Level Security (RLS)]
        K[Audit Logging (Auto)]
    end

    subgraph "Infrastructure Security"
        L[WAF Protection (CloudFlare)]
        M[DDoS Mitigation (Auto)]
        N[SSL/TLS 1.3 (Auto)]
        O[Security Monitoring (Sentry)]
    end

    subgraph "RGPD Compliance"
        P[Data Isolation (RLS)]
        Q[Right to Erasure (Cascade)]
        R[Data Portability (Export)]
        S[Consent Management (Auth)]
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
    J --> P
    P --> Q
    Q --> R
    R --> S
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

## 10. Flux de Facturation (Edge Functions)

```mermaid
sequenceDiagram
    participant S as Session
    participant F as Frontend
    participant E as Edge Function
    participant D as Database
    participant M as Email Service

    S->>F: Session Completed
    F->>E: invoke('generate-invoice')
    E->>D: Query Sessions (RLS Applied)
    D-->>E: Session Data
    E->>E: Calculate Amount
    E->>D: Create Invoice (RLS Applied)
    D-->>E: Invoice Created
    E->>M: Send Invoice Email
    M-->>E: Email Sent
    E-->>F: Invoice Created
    F->>F: Update TanStack Query Cache
    F-->>S: Success Response
```

## 11. Architecture Edge Functions

```mermaid
graph TB
    subgraph "Edge Functions (Deno)"
        A[generate-invoice<br/>PDF + Email]
        B[upload-document<br/>File Processing]
        C[daily-report<br/>Analytics]
        D[send-email<br/>Notifications]
        E[business-logic<br/>Complex Operations]
    end

    subgraph "Supabase Platform"
        F[PostgreSQL<br/>Database + RLS]
        G[Storage<br/>File Management]
        H[Auth<br/>User Management]
        I[Realtime<br/>WebSockets]
    end

    subgraph "External Services"
        J[Resend/SendGrid<br/>Email Service]
        K[Puppeteer<br/>PDF Generation]
        L[Upstash Redis<br/>Cache]
    end

    A --> F
    A --> J
    A --> K
    B --> G
    B --> F
    C --> F
    C --> L
    D --> J
    D --> F
    E --> F
    E --> G
    E --> H
    E --> I
```

---

**Architecte** : Winston (BMad-Method)  
**Date** : 2024-12-19  
**Version** : 2.0 (Serverless)
