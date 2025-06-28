# Como acessar o Dashboard CNPJ

## 🚀 Iniciando o Dashboard

O dashboard está rodando em: **http://localhost:3002**

### Para acessar remotamente:
- **URL Externa**: http://195.35.17.156:3002

## 📋 Funcionalidades disponíveis:

### 1. **Pesquisa de CNPJ**
   - Busca rápida por CNPJ
   - Validação automática do formato
   - Resultados em tempo real

### 2. **Listagem de Empresas**
   - Visualização paginada
   - Filtros por razão social
   - Ordenação por capital social

### 3. **Detalhes da Empresa**
   - Dados cadastrais completos
   - Lista de estabelecimentos
   - Quadro societário
   - Histórico de alterações

### 4. **Estabelecimentos**
   - Matriz e filiais
   - Endereços completos
   - Situação cadastral
   - CNAE principal e secundários

### 5. **Sócios**
   - Quadro societário
   - Percentual de participação
   - Qualificação dos sócios

## 🔑 Credenciais de Acesso (se aplicável):
- Usuário: admin
- Senha: admin123

## 💡 Dicas de Uso:
1. Use a barra de pesquisa para buscar por CNPJ (formato: 00.000.000/0000-00)
2. Clique em qualquer empresa para ver detalhes completos
3. Use os filtros laterais para refinar resultados
4. Exporte dados em CSV ou PDF pelos botões de ação

## 🛠️ Comandos úteis:
```bash
# Iniciar o dashboard
pnpm run dashboard:dev

# Parar o dashboard
Ctrl + C

# Build para produção
pnpm run dashboard:build

# Preview da build
pnpm run dashboard:preview
```