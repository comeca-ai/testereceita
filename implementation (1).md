# Guia de Implementação do Agente CNPJ

Este documento lista **passo a passo** todas as tarefas necessárias para colocar o agente CNPJ em funcionamento, indicando **quando** e **onde** executar cada arquivo ou comando do monorepo.

> **Pré-requisitos**
> - Node.js ≥ 18
> - pnpm ≥ 9
> - PostgreSQL ≥ 14 (local ou remoto)
> - Espaço em disco ≥ 200 GB

---

## 1. Instalar dependências
```bash
pnpm install
```

---

## 2. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz e copie o exemplo:
```bash
cp .env.example .env
```
Edite os valores de `DATABASE_URL` e `RFB_BASE_PATH` conforme sua máquina/servidor.

---

## 3. Verificar pacotes no workspace
Garanta que todos os pacotes estejam visíveis para Vite, ESLint e TS:
```bash
# exemplo para o pacote core
pnpm install --filter cnpj-core
```
Repita para outros pacotes se necessário (`cnpj-etl`, `cnpj-api`, `cnpj-dashboard`).

---

## 4. Download dos arquivos da Receita Federal
```bash
# Dentro do monorepo raiz
pnpm run download:rfb               # chama tools/cnpj-downloader
```
Os ZIPs serão salvos em `packages/cnpj-downloader/downloads/`.

---

## 5. Processar ETL completo
```bash
pnpm run etl:full --filter cnpj-etl # orquestra parse, load e validação
```
O banco SQLite temporário é criado em `packages/cnpj-etl/tmp/` antes de ser migrado para PostgreSQL.

---

## 6. Executar migrações Prisma
```bash
pnpm turbo run db:migrate --filter cnpj-db
```

---

## 7. Semear dados de exemplo (opcional)
```bash
pnpm turbo run db:seed --filter cnpj-db
```

---

## 8. Iniciar a API REST
```bash
pnpm run api:start --filter cnpj-api
```
A API sobe em `http://localhost:3000`.

---

## 9. Iniciar o dashboard React
Abra um novo terminal e execute:
```bash
pnpm run dashboard:dev --filter cnpj-dashboard
```
O Vite abre em `http://localhost:5173`.

---

## 10. Executar todos os testes
```bash
pnpm turbo run test
```
Para um pacote específico, por exemplo `cnpj-core`:
```bash
pnpm turbo run test --filter cnpj-core
```

---

## 11. Lint + Type-check
```bash
pnpm turbo run lint
pnpm turbo run type-check
```

---

## 12. Configurar execução mensal automática (Linux)
No host de produção, crie o script `/opt/cnpj-agent/update.sh`:
```bash
#!/usr/bin/env bash
cd /opt/cnpj-agent
pnpm run download:rfb
pnpm run etl:full --filter cnpj-etl
systemctl restart cnpj-api.service   # reinicia a API carregando banco novo
```
Torne-o executável:
```bash
chmod +x /opt/cnpj-agent/update.sh
```
Adicione ao cron (executar dia 1 às 02h):
```bash
0 2 1 * * /opt/cnpj-agent/update.sh >> /var/log/cnpj-update.log 2>&1
```

---

## 13. Deploy em produção
1. **Docker**: construa com `docker build -f Dockerfile .` e rode `docker compose up -d`.
2. **Bare-metal**: crie serviços systemd separados para `cnpj-api` e, opcionalmente, para o cron de atualização.

---

> **Pronto!** O agente CNPJ está funcional, atualizado e pronto para servir consultas via API ou ser integrado por MCP.