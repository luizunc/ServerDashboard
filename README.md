# 🎮 Dashboard - Minecraft Server Management

[![Version](https://img.shields.io/badge/version-0.1-blue.svg)](https://github.com/luizunc/ServerDashboard)  
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)  
[![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)  
[![React](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org/)

> Dashboard moderno e intuitivo para gerenciamento completo de servidores Minecraft

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Uso](#-uso)
- [API Endpoints](#-api-endpoints)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Contribuição](#-contribuição)
- [Licença](#-licença)
- [Autor](#-autor)
- [Suporte](#-suporte)

## 🎯 Sobre o Projeto

O **Dashboard** é uma solução completa para gerenciamento de servidores Minecraft, oferecendo uma interface web moderna e intuitiva para administradores gerenciarem jogadores, grupos e mensagens do servidor.

### Características Principais

- 🎨 **Interface Moderna**: Design responsivo e intuitivo  
- ⚡ **Performance**: Construído com React e Vite para máxima velocidade  
- 🔒 **Segurança**: Autenticação e validação de dados  
- 📊 **Dashboard Completo**: Visão geral de todos os aspectos do servidor  
- 🔧 **Fácil Configuração**: Setup simples e documentado  

## ✨ Funcionalidades

### 👥 Gerenciamento de Jogadores
- Visualização de todos os jogadores do servidor  
- Informações detalhadas de cada jogador  
- Histórico de atividades  
- Sistema de busca e filtros  

### 🏷️ Gerenciamento de Grupos
- Criação e edição de grupos/ranks  
- Configuração de permissões  
- Sistema de prefixos e visualizações  
- Hierarquia de grupos  

### 💬 Sistema de Mensagens
- Gerenciamento de mensagens do servidor  
- Edição de conteúdo e descrições  
- Sistema de chaves para organização  
- Histórico de alterações  

### 📊 Dashboard Analytics
- Estatísticas em tempo real  
- Gráficos de atividade  
- Monitoramento de performance  
- Relatórios detalhados  

## 🛠️ Tecnologias

### Frontend
- **React 18.2.0** – Biblioteca para interfaces de usuário  
- **React Router DOM** – Roteamento client-side  
- **Vite** – Build tool e dev server  
- **Lucide React** – Ícones modernos  
- **CSS3** – Estilização customizada  

### Backend
- **Node.js** – Runtime JavaScript  
- **Express.js** – Framework web  
- **MySQL2** – Driver para MySQL  
- **CORS** – Cross-origin resource sharing  
- **dotenv** – Gerenciamento de variáveis de ambiente  

### Banco de Dados
- **MySQL** – Sistema de gerenciamento de banco de dados  
- **Pool de Conexões** – Otimização de performance  

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (versão 18 ou superior)  
- [MySQL](https://www.mysql.com/) (versão 8.0 ou superior)  
- [Git](https://git-scm.com/) (para clonar o repositório)  

## 🚀 Instalação

### 1. Clone o repositório
\`\`\`bash
git clone https://github.com/luizunc/ServerDashboard.git
cd ServerDashboard
\`\`\`

### 2. Instale as dependências
\`\`\`bash
npm install
\`\`\`

### 3. Configure o banco de dados
Crie um banco de dados MySQL e configure as variáveis de ambiente (veja a seção [Configuração](#-configuração)).

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo \`.env\` na raiz do projeto:

\`\`\`env
# Configurações do Servidor
PORT=5000

# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=nome_db
\`\`\`

### Configuração do MySQL

1. Crie um banco de dados:
\`\`\`sql
CREATE DATABASE nome_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
\`\`\`

2. O sistema criará automaticamente as tabelas necessárias na primeira execução.

## 🎮 Uso

### Desenvolvimento

Para executar em modo de desenvolvimento:

\`\`\`bash
# Executa tanto o servidor quanto o cliente
npm run dev

# Ou execute separadamente:
npm run server  # Backend na porta 5000
npm run client  # Frontend na porta 3000
\`\`\`

### Produção

Para build de produção:

\`\`\`bash
npm run build
npm run preview
\`\`\`

### Acesso

- **Dashboard**: http://localhost:3000  
- **API**: http://localhost:5000  
- **Health Check**: http://localhost:5000/api/health  

## 🔌 API Endpoints

### Health Check
\`\`\`http
GET /api/health
\`\`\`

### Jogadores
\`\`\`http
GET    /api/players      # Listar todos os jogadores
GET    /api/players/:id  # Obter jogador específico
POST   /api/players      # Criar novo jogador
PUT    /api/players/:id  # Atualizar jogador
DELETE /api/players/:id  # Remover jogador
\`\`\`

### Grupos
\`\`\`http
GET    /api/groups      # Listar todos os grupos
GET    /api/groups/:id  # Obter grupo específico
POST   /api/groups      # Criar novo grupo
PUT    /api/groups/:id  # Atualizar grupo
DELETE /api/groups/:id  # Remover grupo
\`\`\`

### Mensagens
\`\`\`http
GET    /api/messages      # Listar todas as mensagens
GET    /api/messages/:id  # Obter mensagem específica
POST   /api/messages      # Criar nova mensagem
PUT    /api/messages/:id  # Atualizar mensagem
DELETE /api/messages/:id  # Remover mensagem
\`\`\`

## 📁 Estrutura do Projeto

```plaintext
ServerDashboard/
├── 📁 src/                    # Código fonte do frontend
│   ├── 📁 components/         # Componentes React reutilizáveis
│   ├── 📁 pages/              # Páginas da aplicação
│   ├── 📁 services/           # Serviços e utilitários
│   ├── App.jsx                # Componente principal
│   └── main.jsx               # Ponto de entrada
├── 📁 server/                 # Código fonte do backend
│   ├── 📁 config/             # Configurações
│   ├── 📁 routes/             # Rotas da API
│   └── index.js               # Servidor principal
├── 📁 dist/                   # Build de produção
├── 📁 node_modules/           # Dependências
├── .env                       # Variáveis de ambiente
├── .gitignore                 # Arquivos ignorados pelo Git
├── package.json               # Configurações do projeto
├── vite.config.js             # Configuração do Vite
└── README.md                  # Este arquivo
```

## 🤝 Contribuição

Contribuições são sempre bem-vindas! Para contribuir:

1. Faça um fork do projeto  
2. Crie uma branch para sua feature (\`git checkout -b feature/AmazingFeature\`)  
3. Commit suas mudanças (\`git commit -m 'Add some AmazingFeature'\`)  
4. Push para a branch (\`git push origin feature/AmazingFeature\`)  
5. Abra um Pull Request  

### Padrões de Código

- Use ESLint para manter consistência  
- Siga as convenções do React  
- Documente funções complexas  
- Teste suas alterações  

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Luiz Eduardo (eduzp)**  
- GitHub: [@eduzp](https://github.com/eduzp)

---

⭐ **Se este projeto foi útil para você, considere dar uma estrela!** ⭐

## 📞 Suporte

Para suporte e dúvidas:  
- Abra uma [issue](https://github.com/luizunc/ServerDashboard/issues)  
- Entre em contato: **eduarluiz21@gmail.com**  



