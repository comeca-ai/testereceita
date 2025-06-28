# Configuração do Workspace CNPJ Agent

## pnpm-workspace.yaml
```yaml
packages:
  # Applications
  - 'apps/*'
  
  # Shared packages
  - 'packages/*'
  
  # Tools
  - 'tools/*'
  
  # Exclude test and temporary directories
  - '!**/test/**'
  - '!**/dist/**'
  - '!**/build/**'
  - '!**/data/**'

# Package catalogs for shared dependencies
catalog:
  # Core dependencies
  typescript: ^5.3.0
  vite: ^5.0.0
  vitest: ^1.0.0
  
  # Database
  prisma: ^5.7.0
  '@prisma/client': ^5.7.0
  
  # CNPJ processing
  csv-parser: ^3.0.0
  fast-csv: ^4.3.6
  
  # Validation
  zod: ^3.22.0
  
  # HTTP client/server
  express: ^4.18.0
  axios: ^1.6.0
  
  # React ecosystem
  react: ^18.2.0
  react-dom: ^18.2.0
  '@types/react': ^18.2.0
  '@types/react-dom': ^18.2.0

catalogs:
  # React 18 specific catalog
  react18:
    react: ^18.2.0
    react-dom: ^18.2.0
    '@types/react': ^18.2.0
    '@types/react-dom': ^18.2.0
    
  # Express server catalog  
  server:
    express: ^4.18.0
    '@types/express': ^4.17.0
    cors: ^2.8.5
    helmet: ^7.1.0
    
  # Database catalog
  database:
    prisma: ^5.7.0
    '@prisma/client': ^5.7.0
    pg: ^8.11.0
    '@types/pg': ^8.10.0
```

## turbo.json
```json
{
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "inputs": ["src/**/*.ts", "src/**/*.tsx", "test/**/*.ts", "**/*.test.*"],
      "outputs": ["coverage/**"]
    },
    "test:db": {
      "dependsOn": ["db:generate", "^build"],
      "inputs": ["src/**/*.ts", "prisma/**", "test/**/*.ts"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "dependsOn": ["^build"],
      "inputs": ["src/**/*.ts", "src/**/*.tsx", "*.js", "*.ts", "*.json"]
    },
    "type-check": {
      "dependsOn": ["^build"],
      "inputs": ["src/**/*.ts", "src/**/*.tsx", "*.ts", "tsconfig.json"]
    },
    "db:generate": {
      "inputs": ["prisma/schema.prisma"],
      "outputs": ["node_modules/.prisma/**", "prisma/generated/**"]
    },
    "db:migrate": {
      "dependsOn": ["db:generate"],
      "inputs": ["prisma/migrations/**", "prisma/schema.prisma"],
      "cache": false
    },
    "db:seed": {
      "dependsOn": ["db:migrate"],
      "cache": false
    },
    "etl:download": {
      "cache": false,
      "outputs": ["data/downloads/**"]
    },
    "etl:process": {
      "dependsOn": ["etl:download", "db:migrate"],
      "inputs": ["data/downloads/**"],
      "outputs": ["data/processed/**", "logs/**"],
      "cache": false
    },
    "etl:validate": {
      "dependsOn": ["etl:process"],
      "inputs": ["data/processed/**"],
      "outputs": ["logs/validation.log"]
    },
    "etl:full": {
      "dependsOn": ["etl:download", "etl:process", "etl:validate"],
      "cache": false
    }
  }
}
```

## package.json (root)
```json
{
  "name": "cnpj-agent",
  "version": "1.0.0",
  "private": true,
  "description": "CNPJ data processing agent with ETL pipeline and API",
  "packageManager": "pnpm@8.15.0",
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --parallel",
    "test": "turbo run test",
    "test:db": "turbo run test:db",
    "lint": "turbo run lint",
    "lint:fix": "turbo run lint -- --fix",
    "type-check": "turbo run type-check",
    "clean": "turbo run clean && rm -rf node_modules/.turbo",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "db:generate": "turbo run db:generate",
    "db:migrate": "turbo run db:migrate",
    "db:seed": "turbo run db:seed",
    "etl:download": "turbo run etl:download --filter=cnpj-downloader",
    "etl:process": "turbo run etl:process --filter=cnpj-etl",
    "etl:validate": "turbo run etl:validate --filter=cnpj-etl",
    "etl:full": "turbo run etl:full",
    "api:start": "turbo run start --filter=cnpj-api",
    "dashboard:dev": "turbo run dev --filter=cnpj-dashboard",
    "prepare": "husky install"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.0",
    "@commitlint/cli": "^18.4.0",
    "@commitlint/config-conventional": "^18.4.0",
    "eslint": "^8.56.0",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0",
    "prettier": "^3.1.0",
    "turbo": "^1.10.0",
    "typescript": "catalog:"
  },
  "dependencies": {
    "dotenv": "^16.3.0"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  },
  "commitlint": {
    "extends": ["@commitlint/config-conventional"]
  }
}
```

## tsconfig.json (root)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "incremental": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@cnpj/core": ["./packages/cnpj-core/src"],
      "@cnpj/types": ["./packages/cnpj-types/src"],
      "@cnpj/db": ["./packages/cnpj-db/src"],
      "@cnpj/processor": ["./packages/cnpj-processor/src"]
    }
  },
  "references": [
    { "path": "./apps/cnpj-api" },
    { "path": "./apps/cnpj-dashboard" },
    { "path": "./apps/cnpj-etl" },
    { "path": "./packages/cnpj-core" },
    { "path": "./packages/cnpj-types" },
    { "path": "./packages/cnpj-db" },
    { "path": "./packages/cnpj-processor" },
    { "path": "./tools/cnpj-downloader" }
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build",
    "data",
    "logs"
  ]
}
```

## .env.example
```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/cnpj_db"
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="cnpj_db"
DB_USER="cnpj_user"
DB_PASSWORD="secure_password"

# Receita Federal Data Sources
RFB_BASE_URL="https://arquivos.receitafederal.gov.br/CNPJ/"
RFB_MIRROR_URL="http://200.152.38.155/CNPJ/"
DATA_STORAGE_PATH="./data"
DOWNLOAD_CHUNK_SIZE="1048576"  # 1MB chunks
MAX_CONCURRENT_DOWNLOADS="3"

# ETL Configuration
ETL_BATCH_SIZE="10000"
ETL_MAX_MEMORY="8192"  # MB
ETL_TEMP_DIR="./data/temp"
ETL_LOG_LEVEL="info"
ETL_ENABLE_COMPRESSION="true"

# API Configuration
API_PORT="3001"
API_HOST="localhost"
API_CORS_ORIGIN="http://localhost:3000"
API_RATE_LIMIT_MAX="100"
API_RATE_LIMIT_WINDOW="900000"  # 15 minutes

# Dashboard Configuration
VITE_API_BASE_URL="http://localhost:3001"
VITE_APP_TITLE="CNPJ Data Explorer"
VITE_PAGINATION_SIZE="50"

# Monitoring and Logging
LOG_LEVEL="info"
LOG_FILE_PATH="./logs"
ENABLE_METRICS="true"
PROMETHEUS_PORT="9090"

# Performance Tuning
NODE_OPTIONS="--max-old-space-size=8192"
UV_THREADPOOL_SIZE="16"

# Development
NODE_ENV="development"
ENABLE_DEBUG="false"
ENABLE_PROFILING="false"
```