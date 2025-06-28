# CNPJ Data Agent - Contributor Guide

## Dev Environment Tips
- Use pnpm dlx turbo run dev where cnpj-processor to jump to the CNPJ processing package instead of scanning with ls.
- Run pnpm install --filter cnpj-agent to add the package to your workspace so Vite, ESLint, and TypeScript can see it.
- Use pnpm create vite@latest cnpj-dashboard -- --template react-ts to spin up a new React + Vite dashboard with TypeScript checks ready.
- Check the name field inside each package's package.json to confirm the right name—skip the top-level one.
- For CNPJ ETL processes, use pnpm turbo run etl --filter cnpj-processor to execute data pipeline tasks.

## Project Structure

```
cnpj-agent/
├── apps/
│   ├── cnpj-dashboard/           # React dashboard for CNPJ data visualization
│   ├── cnpj-api/                 # Express API server for CNPJ queries
│   └── cnpj-etl/                 # ETL service for downloading and processing RFB data
├── packages/
│   ├── cnpj-core/                # Core CNPJ validation and formatting utilities
│   ├── cnpj-db/                  # Database schema and migrations (Prisma)
│   ├── cnpj-types/               # Shared TypeScript interfaces for CNPJ data
│   ├── cnpj-processor/           # Data processing logic for RFB files
│   └── eslint-config-cnpj/       # Shared ESLint configuration
├── tools/
│   └── cnpj-downloader/          # CLI tool for downloading RFB files
└── docs/
    ├── api.md                    # API documentation
    ├── database-schema.md        # Database structure documentation
    └── rfb-layout.md            # Receita Federal layout documentation
```

## Package Descriptions

### Core Packages
- **cnpj-core**: CNPJ validation, formatting, and basic utilities
- **cnpj-types**: TypeScript interfaces for all CNPJ-related data structures
- **cnpj-db**: Prisma schema and database utilities for PostgreSQL/SQLite
- **cnpj-processor**: ETL logic for processing RFB fixed-width files

### Applications
- **cnpj-dashboard**: React dashboard for querying and visualizing company data
- **cnpj-api**: REST API server providing CNPJ lookup endpoints
- **cnpj-etl**: Background service for downloading and processing RFB updates

### Tools
- **cnpj-downloader**: CLI utility for downloading and extracting RFB ZIP files

## Testing Instructions
- Find the CI plan in the .github/workflows folder.
- Run pnpm turbo run test --filter cnpj-core to run validation tests for CNPJ utilities.
- From the package root you can just call pnpm test. The commit should pass all tests before you merge.
- To focus on ETL processing tests, add the Vitest pattern: pnpm vitest run -t "CNPJ ETL processing".
- For database tests, use: pnpm turbo run test:db --filter cnpj-db.
- Fix any test or type errors until the whole suite is green.
- After moving files or changing imports, run pnpm lint --filter cnpj-agent to be sure ESLint and TypeScript rules still pass.
- Add or update tests for the code you change, even if nobody asked.

## Database Setup Instructions
- Ensure PostgreSQL 14+ is running locally or configure connection strings in .env
- Run pnpm turbo run db:migrate --filter cnpj-db to apply schema migrations
- For development, use pnpm turbo run db:seed --filter cnpj-db to populate with sample data
- Monitor disk space: full CNPJ dataset requires ~150GB storage + indexes

## ETL Process Instructions
- Download RFB files: pnpm turbo run download --filter cnpj-downloader
- Process downloaded files: pnpm turbo run etl:process --filter cnpj-etl
- Monitor processing: tail -f logs/etl-process.log
- Verify data integrity: pnpm turbo run etl:validate --filter cnpj-etl
- Full ETL pipeline (download + process): pnpm turbo run etl:full --filter cnpj-etl

## Data Structure Overview

### RFB Source Files
- **Empresas**: Company registry data (CNPJ básico, razão social, natureza jurídica)
- **Estabelecimentos**: Establishment data (full CNPJ, addresses, status)
- **Sócios**: Partner/shareholder information 
- **Simples**: Simples Nacional tax regime data
- **CNAEs**: Economic activity classifications
- **Motivos**: Status change reasons
- **Países**: Country codes for international partners
- **Qualificações**: Partner qualification codes

### Database Tables
- companies: Main company registry (from Empresas)
- establishments: Branch/headquarters data (from Estabelecimentos)
- partners: Company partners/shareholders (from Sócios)
- simples: Tax regime information (from Simples)
- Reference tables: cnaes, countries, qualifications, reasons

## API Endpoints
- GET /api/cnpj/{cnpj}: Company details by CNPJ
- GET /api/companies/search: Search companies by name/CNAE
- GET /api/partners/{cnpj}: List company partners
- GET /api/stats/overview: Database statistics
- GET /api/health: Service health check

## Development Workflow
1. **Setup**: Clone repo, run pnpm install, setup database
2. **Data**: Download RFB files using cnpj-downloader
3. **ETL**: Process files using cnpj-etl service  
4. **API**: Start cnpj-api server for queries
5. **Dashboard**: Launch cnpj-dashboard for visualization
6. **Test**: Run test suite before committing changes

## Performance Considerations
- Use database indexes on CNPJ fields for fast lookups
- Implement pagination for large result sets
- Cache frequent queries in Redis (optional)
- Monitor memory usage during ETL processing
- Use streaming for large file processing

## PR Instructions
Title format: [<package_name>] <Title>

Examples:
- [cnpj-core] Add CNPJ validation improvements
- [cnpj-etl] Fix memory leak in file processing
- [cnpj-api] Add new search endpoints
- [cnpj-dashboard] Implement company details view

## Environment Variables
```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/cnpj_db"

# RFB Data Source
RFB_DOWNLOAD_URL="https://arquivos.receitafederal.gov.br/CNPJ/"
DATA_STORAGE_PATH="./data/rfb/"

# API Configuration  
API_PORT=3001
API_RATE_LIMIT=100

# Dashboard
VITE_API_BASE_URL="http://localhost:3001"
```

## Common Commands
- Install dependencies: `pnpm install`
- Start development: `pnpm turbo run dev`
- Build all packages: `pnpm turbo run build`
- Run tests: `pnpm turbo run test`
- Lint code: `pnpm turbo run lint`
- Type check: `pnpm turbo run type-check`
- Download RFB data: `pnpm run download:rfb`
- Process new data: `pnpm run etl:process`
- Start API server: `pnpm run api:start`
- Launch dashboard: `pnpm run dashboard:dev`

## Troubleshooting

### Common Issues
- **Out of memory during ETL**: Increase Node.js heap size or process files in smaller chunks
- **Database connection errors**: Check PostgreSQL service and connection strings
- **RFB download failures**: Verify network connectivity and RFB server availability
- **Type errors**: Run `pnpm turbo run type-check` to identify issues

### File Size Limits
- Monitor available disk space (>200GB recommended for full dataset)
- Configure proper temp directory for large file processing
- Implement cleanup routines for processed files

### Performance Tuning
- Create database indexes for frequently queried fields
- Use connection pooling for database access
- Implement proper logging levels (avoid debug in production)
- Monitor ETL progress with proper checkpoints