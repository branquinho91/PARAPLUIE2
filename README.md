# PARAPLUIE2

PARAPLUIE2 é uma API desenvolvida com TypeORM e Express.js para gerenciar movimentações de produtos entre filiais de uma rede de farmácias. O sistema oferece autenticação de usuários, controle de acesso baseado em perfis e operações CRUD para usuários, produtos e movimentações.

Este projeto foi desenvolvido como parte do trabalho de conclusão do Módulo 2 do programa Desenvolvedor FullStack Mobile do curso DEVinHouse SENAI Clamed V3.

A API serve como backend para o aplicativo PARAPLUIE Farmácias, fornecendo a infraestrutura necessária para a gestão eficiente de estoque e transferências entre unidades.

## Índice

- [Descrição](#descrição)
- [Funcionalidades](#funcionalidades)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Rodando o Projeto](#rodando-o-projeto)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Licença](#licença)
- [Contato](#contato)

## Descrição

PARAPLUIE2 é um sistema de gerenciamento de movimentações de produtos entre filiais. Ele permite que administradores, filiais e motoristas gerenciem usuários, produtos e movimentações de forma eficiente e segura.

## Funcionalidades

- Autenticação de usuários com JWT
- Controle de acesso baseado em perfis (Admin, Filial, Motorista)
- CRUD de usuários
- CRUD de produtos
- Movimentação de produtos entre filiais
- Logs de atividades

## Pré-requisitos

- Node.js (versão 18.x)
- PostgreSQL

## Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/PARAPLUIE2.git
   ```
   ```
   cd PARAPLUIE2
   ```

1. ```bash
   npm install
   ```

## Configuração

1. Crie um arquivo .env na raiz do projeto com as seguintes variáveis de ambiente (baseado no .env-example):

```
  DB_HOST=localhost
  DB_PORT=5432
  DB_USERNAME=postgres
  DB_PASSWORD=admin
  DB_NAME=PARAPLUIE2

  NODE_ENV=development
  EMAIL_HOST=
  EMAIL_PORT=
  EMAIL_USER=
  EMAIL_PASSWORD=

  JWT_SECRET=sua_chave_secreta
  LOG_LEVEL=info

  PORT=3333
```

## Rodando o Projeto

1. ```bash
   npm run migration:run
   ```

2. ```bash
   npm run start
   ```

3.
```plaintext
O servidor estará rodando em http://localhost:3333.
```

## Estrutura do Projeto

```plaintext
PARAPLUIE2/
├── src/
│   ├── config/
│   │   └── winston.ts
│   ├── controllers/
│   │   ├── AuthController.ts
│   │   ├── MovementController.ts
│   │   ├── ProductController.ts
│   │   └── UserController.ts
│   ├── data-source.ts
│   ├── entities/
│   │   ├── Branch.ts
│   │   ├── Driver.ts
│   │   ├── Movement.ts
│   │   ├── Product.ts
│   │   └── User.ts
│   ├── index.ts
│   ├── middlewares/
│   │   ├── auth.ts
│   │   └── handleError.ts
│   ├── migrations/
│   │   ├── 1739910156343-CreateTableUsers.ts
│   │   ├── 1739910219836-CreateTableBranches.ts
│   │   ├── 1739910232693-CreateTableDrivers.ts
│   │   ├── 1740239987582-CreateTableProducts.ts
│   │   ├── 1740240041853-CreateTableMovements.ts
│   │   └── 1740437240166-CreateColumnTableMovements.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── movement.routes.ts
│   │   ├── product.routes.ts
│   │   └── user.routes.ts
│   ├── utils/
│   │   ├── AppError.ts
│   │   ├── movementStatusEnum.ts
│   │   ├── profileEnum.ts
│   │   └── validateEmail.ts
│   └── README.md
├── .env
├── .env-example
├── .gitignore
├── logs.txt
├── package.json
├── tsconfig.json
└── README.md
```

## Tecnologias Utilizadas

- Node.js
- Express.js
- TypeORM
- PostgreSQL
- JWT (JSON Web Token)
- Winston (para logs)
- Typescript

## Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo LICENSE para mais detalhes.

## Contato

- Nome: Gustavo Branquinho
- Email pessoal: gustavobranquinho2@gmail.com
- Email acadêmico: gustavo_branquinho@estudante.sesisenai.org.br
- LinkedIn: [Gustavo Branquinho](https://www.linkedin.com/in/gustavobranquinho2)
