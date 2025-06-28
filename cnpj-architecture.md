# Arquitetura do CNPJ Agent - Visão Geral

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CNPJ AGENT ARCHITECTURE                    │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   DATA SOURCE   │    │   ETL PIPELINE  │    │   APPLICATIONS  │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ RFB Files   │ │───▶│ │ Downloader  │ │    │ │    API      │ │
│ │  - Empresas │ │    │ │             │ │    │ │ (Express)   │ │
│ │  - Estabele │ │    │ └─────────────┘ │    │ └─────────────┘ │
│ │  - Socios   │ │    │        │        │    │        │        │
│ │  - Simples  │ │    │        ▼        │    │        ▼        │
│ │  - CNAEs    │ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ └─────────────┘ │    │ │   Parser    │ │    │ │  Dashboard  │ │
│                 │    │ │ (Streaming) │ │    │ │  (React)    │ │
└─────────────────┘    │ └─────────────┘ │    │ └─────────────┘ │
                       │        │        │    │                 │
                       │        ▼        │    └─────────────────┘
                       │ ┌─────────────┐ │
                       │ │  Database   │ │
                       │ │ (PostgreSQL)│ │
                       │ └─────────────┘ │
                       └─────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           PACKAGE STRUCTURE                             │
└─────────────────────────────────────────────────────────────────────────┘

cnpj-agent/
├── apps/                          🚀 Applications
│   ├── cnpj-api/                 → REST API server
│   ├── cnpj-dashboard/           → React web dashboard  
│   └── cnpj-etl/                 → ETL processing service
│
├── packages/                      📦 Shared Libraries
│   ├── cnpj-core/               → Validation & formatting
│   ├── cnpj-types/              → TypeScript interfaces
│   ├── cnpj-db/                 → Database layer (Prisma)
│   ├── cnpj-processor/          → File parsing logic
│   └── eslint-config-cnpj/      → Shared ESLint config
│
├── tools/                         🔧 CLI Tools
│   └── cnpj-downloader/         → RFB file downloader
│
└── docs/                          📚 Documentation
    ├── api.md
    ├── database-schema.md
    └── rfb-layout.md

┌─────────────────────────────────────────────────────────────────────────┐
│                             DATA FLOW                                   │
└─────────────────────────────────────────────────────────────────────────┘

1. DOWNLOAD PHASE
   RFB Server ─(ZIP files)─▶ cnpj-downloader ─(extract)─▶ Local Storage

2. ETL PHASE  
   Raw Files ─(parse)─▶ cnpj-processor ─(validate)─▶ cnpj-db ─(insert)─▶ PostgreSQL

3. API PHASE
   PostgreSQL ─(query)─▶ cnpj-api ─(REST)─▶ cnpj-dashboard ─(display)─▶ User

┌─────────────────────────────────────────────────────────────────────────┐
│                          TECHNOLOGY STACK                               │
└─────────────────────────────────────────────────────────────────────────┘

Build System:     pnpm + Turborepo
Language:         TypeScript 5.3+
Runtime:          Node.js 18+
Database:         PostgreSQL 15+
ORM:              Prisma 5.7+
API Framework:    Express.js
Frontend:         React 18 + Vite
Testing:          Vitest
Linting:          ESLint + Prettier
Validation:       Zod
File Processing:  csv-parse + fast-csv
HTTP Client:      Axios

┌─────────────────────────────────────────────────────────────────────────┐
│                         DEVELOPMENT COMMANDS                            │
└─────────────────────────────────────────────────────────────────────────┘

Setup:
  pnpm install                    # Install dependencies
  pnpm db:migrate                # Setup database
  pnpm etl:download              # Download RFB files

Development:
  pnpm turbo run dev             # Start all services
  pnpm turbo run dev --filter cnpj-api      # Start only API
  pnpm turbo run dev --filter cnpj-dashboard # Start only dashboard

ETL Operations:
  pnpm etl:download              # Download files from RFB
  pnpm etl:process               # Process downloaded files
  pnpm etl:validate              # Validate processed data
  pnpm etl:full                  # Full ETL pipeline

Testing & Quality:
  pnpm turbo run test            # Run all tests
  pnpm turbo run lint            # Check code quality
  pnpm turbo run type-check      # TypeScript validation
  pnpm turbo run build          # Build all packages

┌─────────────────────────────────────────────────────────────────────────┐
│                        PERFORMANCE TARGETS                              │
└─────────────────────────────────────────────────────────────────────────┘

Data Processing:
  • 1M+ records/minute ETL throughput
  • <30GB RAM usage during processing
  • <200GB total storage requirement

API Performance:
  • <100ms response time for CNPJ lookups
  • 1000+ concurrent requests support
  • 99.9% uptime requirement

Database:
  • Sub-second query response for indexed fields
  • Efficient pagination for large result sets
  • Automated backup and recovery

┌─────────────────────────────────────────────────────────────────────────┐
│                         DEPLOYMENT OPTIONS                              │
└─────────────────────────────────────────────────────────────────────────┘

Development:
  • Local PostgreSQL + Node.js
  • Docker Compose for services
  • File-based data storage

Production:
  • DigitalOcean Droplets (8GB+ RAM)
  • Managed PostgreSQL instance
  • Object storage for raw files
  • Load balancer for API scaling

Cloud Options:
  • AWS: RDS + EC2 + S3
  • Google Cloud: Cloud SQL + Compute + Storage
  • Azure: Database + VMs + Blob Storage

┌─────────────────────────────────────────────────────────────────────────┐
│                           MONITORING                                    │
└─────────────────────────────────────────────────────────────────────────┘

Metrics:
  • ETL processing speed and errors
  • API response times and error rates  
  • Database performance and connections
  • System resource usage (CPU, RAM, disk)

Logging:
  • Structured JSON logs
  • Log rotation and archival
  • Error tracking and alerting
  • Performance profiling

Health Checks:
  • Service availability endpoints
  • Database connectivity tests
  • Data freshness validation
  • System resource monitoring

┌─────────────────────────────────────────────────────────────────────────┐
│                         SECURITY CONSIDERATIONS                         │
└─────────────────────────────────────────────────────────────────────────┘

Data Protection:
  • Database encryption at rest
  • Secure connection strings
  • Environment variable isolation
  • Regular security updates

API Security:
  • Rate limiting per client
  • Input validation and sanitization
  • CORS configuration
  • Request logging and monitoring

Access Control:
  • Read-only database users for API
  • Separate ETL and API credentials
  • Network security groups
  • VPN access for admin operations