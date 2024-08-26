# 📚 Introdução

Este projeto, denominado **Atlas Library**, é uma aplicação de gerenciamento de biblioteca, desenvolvida com o intuito de facilitar o acesso e a organização de livros para bibliotecas públicas e seus usuários. A aplicação permite operações como empréstimos, reservas, gestão de multas e notificações por e-mail.

# 🖥️ Tecnologias e Dependências

A aplicação utiliza as seguintes tecnologias e dependências:

- **Node.js**: Ambiente de execução do JavaScript no servidor.
- **Express**: Framework para construção de APIs REST.
- **MYSQL**: Banco de dados SQL.
- **Docker**: Contêinerização da aplicação.
- **bcrypt**: Para funções de criptografia de dados.
- **dotenv:** Para o uso de variáveis de ambiente.
- **nodemailer:** Para enviar os e-mails
- **Jest**: Framework de testes. ****

# 🐳 Repositório no Docker

O projeto está configurado para ser executado em um ambiente Docker. O repositório do Docker inclui uma melhor explicação para facilitar a configuração e execução dos serviços necessários, caso deseje executar o projeto com o docker basta clicar no link :  [Atlas Library](https://hub.docker.com/repository/docker/riuri/node_api/general).

# 🔑 Variáveis de Ambiente

O projeto utiliza várias variáveis de ambiente para configurar diferentes aspectos da aplicação. O arquivo `env.example` contêm exemplos e definições dessas variáveis. É importante configurar corretamente essas variáveis para o funcionamento adequado da aplicação.

Elas podem ser definidas no arquivo `.env` ou diretamente no seu sistema.

- **`PORT`**: Porta que será usada para rodar a API. Exemplo: `3000`.
- **`MYSQL_HOST`**: Host do banco de dados MySQL. Geralmente é o nome do serviço definido no Docker Compose.
- **`MYSQL_ROOT_PASSWORD`**: Senha do usuário root do MySQL. Defina uma senha segura para acesso ao banco de dados.
- **`MYSQL_DATABASE`**: Nome do banco de dados a ser utilizado pela aplicação.
- **`MYSQL_USER`**: Usuário do banco de dados. Este usuário deve ter permissões adequadas para acessar e manipular o banco de dados.
- **`MYSQL_PASSWORD`**: Senha do usuário do banco de dados. Certifique-se de que a senha é segura.
- **`EMAIL_USER`**: Usuário de e-mail para a API Nodemailer. Este é o e-mail que será usado para enviar notificações. Exemplo: `your_email@example.com`.
- **`EMAIL_PASSWORD`**: Senha para o serviço SMTP. Esta senha deve ser a do e-mail configurado no `EMAIL_USER`. Exemplo: `email_password`.
- **`RETURN_INTERVAL_DAYS`**: Intervalo de tempo em dias para a devolução de cada livro. Exemplo: `14` (para duas semanas).
- **`RESERVATION_ACTIVE_TIME_DAYS`**: Intervalo de tempo em dias que uma reserva de livro pode ficar ativa. Exemplo: `7` (para uma semana).
- **`FINE_AMOUNT`**: Valor da multa a ser aplicada por atrasos na devolução dos livros. Este valor deve ser em decimal.

Para mais informações sobre o Nodemailer, acesse: [Nodemailer⁠](https://www.nodemailer.com/).

# 💾 Banco de Dados

O banco de dados utilizado é o MYSQL. O arquivo `tables.sql` contém as definições das tabelas e índices utilizados na aplicação.

# 🗂️ Estrutura de pastas

O projeto segue a seguinte estrutura de pastas para manter todo o código organizado 

```markdown

└── 📁atlas_library
    └── 📁.vscode          # Configurações específicas do editor VS Code.
    └── 📁db               # Arquivos relacionados ao banco de dados.
    └── 📁src              # Pasta principal contendo o código-fonte da aplicação.
        └── app.js         # Arquivo de inicialização da aplicação, configurando middlewares, rotas e outros componentes essenciais.
        └── 📁controllers  # Controladores que definem a lógica de negócios e manipulam as requisições e respostas da API.
        └── 📁middlewares  # Middlewares que processam as requisições antes de chegarem aos controladores, como autenticação e validação.
        └── 📁models       # Definições dos modelos de dados usados pela aplicação, geralmente representando tabelas do banco de dados.
        └── 📁routes       # Definições das rotas da API, mapeando URLs para controladores específicos.
        └── server.js      # Arquivo que configura e inicia o servidor, escutando em uma porta específica.
        └── 📁services     # Serviços que contêm lógica de negócio que pode ser reutilizada entre diferentes partes da aplicação.
        └── 📁utils        # Funções utilitárias e helpers que podem ser usados em várias partes do código.
        └── 📁__test__     # Testes automatizados para verificar a funcionalidade do código, usando frameworks de teste.

```

# 🛣️ Rotas da API

As rotas da API estão definidas na pasta `src/routes`, e sempre que possível, com a maioria das operações realizadas por meio de solicitações `GET`, `POST`, `PATCH` e `DELETE` em recursos de página e banco de dados. Os corpos de solicitação e resposta são codificados como JSON.

## Respostas da API

As respostas da API seguem o padrão JSON. Um exemplo de resposta bem-sucedida pode ser:

```json
[
  {
    "author_id": 2,
    "name": "Gabriel García Márquez",
    "about": "Gabriel García Márquez foi um renomado escritor colombiano, ganhador do Prêmio Nobel de Literatura em 1982. Sua obra é marcada pelo realismo mágico, uma fusão de elementos fantásticos com a realidade."
  }
]

```

Em caso de erro, a estrutura será similar, porém com um campo `message` explicando o erro:

```json
{
  "message": "author not found, check the id and try again"
}

```

Erros são tratados de maneira uniforme na aplicação, garantindo que todas as respostas de erro sigam um formato padronizado. Utilizamos middlewares para captura e formatação dos erros.

## Rotas

| **Método** | **Rota** | **Status Code** | **Resposta** |
| --- | --- | --- | --- |
| GET | /authors | 200 | Uma lista de todos os Autores |
| POST | /author | 201 | Id do autor criado |
| PATCH | /author/update/:authorId | 204 | Atualiza um autor |
| DELETE | /author/:authorId | 204 | Deleta um autor |
| GET | /author/:authorId | 200 | Retorna os dados de um autor específico |
| GET | /users | 200 | Uma lista de todos os Usuários |
| POST | /user | 201 | Id do usuário criado |
| DELETE | /user/:userId | 204 | Deleta um usuário |
| GET | /user/:userId | 200 | Retorna os dados de um usuário específico |
| PATCH | /user/update/:userId | 204 | Atualiza um usuário |
| POST | /user/login | 200 | Autenticação de usuário, retorna um token |
| GET | /books | 200 | Uma lista de todos os Livros |
| POST | /book | 201 | Id do livro criado |
| DELETE | /book/:bookId | 204 | Deleta um livro |
| GET | /book/:bookId | 200 | Retorna os dados de um livro específico |
| PATCH | /book/update/:bookId | 204 | Atualiza um livro |
| GET | /book/availability/:bookId | 200 | Verifica a disponibilidade de um livro |
| GET | /categories | 200 | Uma lista de todas as Categorias |
| POST | /category | 201 | Id da categoria criada |
| DELETE | /category/:categoryId | 204 | Deleta uma categoria |
| GET | /category/:categoryId | 200 | Retorna os dados de uma categoria específica |
| PATCH | /category/update/:categoryId | 204 | Atualiza uma categoria |
| POST | /fine | 201 | Id da multa criada |
| DELETE | /fine/:fineId | 204 | Deleta uma multa |
| GET | /fine/:fineId | 200 | Retorna os dados de uma multa específica |
| GET | /fines | 200 | Uma lista de todas as Multas |
| PATCH | /fine/paidFine/:fineId | 204 | Marca uma multa como paga |
| POST | /fine/user/:userId | 200 | Multas de um usuário específico |
| GET | /loans | 200 | Uma lista de todos os Empréstimos |
| POST | /loan | 201 | Id do empréstimo criado |
| DELETE | /loan/:loanId | 204 | Deleta um empréstimo |
| GET | /loan/user/:userId | 200 | Retorna os empréstimos de um usuário específico |
| GET | /loan/:loanId | 200 | Retorna os dados de um empréstimo específico |
| PATCH | /loan/return/:loanId | 204 | Atualiza o status de devolução de um empréstimo |
| GET | /loan/extend/:loanId | 200 | Estende a data de devolução de um empréstimo |
| GET | /reservations | 200 | Uma lista de todas as Reservas |
| POST | /reservation | 201 | Id da reserva criada |
| DELETE | /reservation/:reservationId | 204 | Deleta uma reserva |
| GET | /reservation/user/:userId | 200 | Retorna as reservas de um usuário específico |
| GET | /reservation/:reservationId | 200 | Retorna os dados de uma reserva específica |
| PATCH | /reservation/update/:reservationId | 204 | Atualiza uma reserva |

# 📥 Variáveis das Requisições

## Nomenclatura

As variáveis nas requisições seguem uma convenção de nomenclatura clara e consistente.

- **CamelCase:** para parâmetros de rota e query.

## Variáveis Comuns

Essas variáveis são frequentemente encontradas em várias rotas da API.

| Variável | Tipo | Descrição |
| --- | --- | --- |
| userId | Number | ID do usuário. |
| loanId | Number | ID do empréstimo. |
| fineId | Number | ID da multa. |
| bookId | Number | ID do livro. |
| insertId | Number | ID retornado na criação(post) de todas as rotas |
| reservationId | Number | ID da reserva |

## Variáveis Específicas por Rota

### Rota: `/user`

| **Variável** | **Tipo** | **Descrição** |
| --- | --- | --- |
| number | String | Número de telefone do usuário. |
| name | String | Nome do usuário. |
| email | String | Endereço de email do usuário. |
| role | String | admin, sub-admin, user |
| password | String | senha do usuário |
| Whatsapp | Boolean | true para usuários que tem WhatsApp e false para usuários que não tem |

### Rota: `/author`

| **Variável** | **Tipo** | **Descrição** |
| --- | --- | --- |
| authorId | Number | ID do autor |
| name | String | Nome do autor. |
| about | String | Descrição do autor. |

### Rota: `/category`

| **Variável** | **Tipo** | **Descrição** |
| --- | --- | --- |
| categoryId | String | ID da categoria |
| name | String | nome da categoria |

### Rota: `/book`

| **Variável** | **Tipo** | **Descrição** |
| --- | --- | --- |
| title | String | Título do livro |
| publication_year | String | Ano de publicação do livro |
| available | Boolean | Indica se o livro está disponível |
| status | ENUM | Status atual do livro ('available','reserved', 'borrowed’) |
| rating | Number | Avaliação média do livro |
| quantity | Number | Quantidade de cópias do livro |
| description | String | Descrição ou sinopse do livro |
| authorId | Number | ID do autor do livro |
| categoryId | Number | ID da categoria do livro |

### Rota: `/fine`

| **Variável** | **Tipo** | **Descrição** |
| --- | --- | --- |
| paid | Boolean | true para multa paga |
| payment_date | DATETIME | data quando o pagamento foi realizado |
| due_date | DATATIME | data da multa |

# 🚨 Status code de erros

Os erros retornado da API seguem uma estrutura padrão e JSON, com dois campos sendo o `message` e o `details`, eles respectivamente representam uma descrição do erro e detalhes em caso  de erros específicos como no exemplo abaixo.

```json
{
  "message": "User already exists",
  "details": {
    "duplicated_field": "name"
  }
}
```

| Status Code | Tipo | Descrição |
| --- | --- | --- |
| 400 | Bad Request | A solicitação está malformada ou possui parâmetros inválidos. |
| 401 | Unauthorized | Acesso não autorizado, é necessário autenticação. |
| 404 | Not Found | O recurso solicitado não foi encontrado. |
| 409 | Conflit | Existe um conflito com o estado atual do recurso, como dados duplicados. |
| 500 | Internal Server Error | Ocorreu um erro inesperado no servidor. |

# ⏰ Crons Jobs

O sistema possui diversas tarefas agendadas (cron jobs) que executam operações periódicas, como envio de notificações e limpeza de dados temporários. Esses jobs estão configurados no serviço `cronJobsService.js`.

# 📫 Emails Enviados pela API

A API envia emails para notificações de reservas, empréstimos vencidos e outras atividades importantes. O serviço responsável pelo envio de emails é o `notificationService.js`, que utiliza configurações definidas nas variáveis de ambiente para conexão com o servidor de email.

# 📊 Métricas e Logs

As métricas de desempenho são captadas em um arquivo `performance_metrics.csv` e os logs de erro em em um arquivo `error_<data do erro>.log`,  os arquivos de log são deletados após 2 dias   caso deseje um valor maior pode alterar no arquivo `performance.js` que está localizado na pasta `utils`

# 🧪 Testes

O projeto Atlas Library utiliza o framework Jest para realizar testes automatizados. Os testes são cruciais para garantir a qualidade e a confiabilidade do código. Aqui estão alguns detalhes sobre a estrutura de testes:

- Os testes estão localizados na pasta `src/__test__`.
- Tipos de Testes: Incluem testes unitários para funções individuais e testes de integração para verificar a interação entre diferentes partes do sistema.
- Cobertura: Os testes visam cobrir os principais componentes da aplicação, incluindo controladores, serviços e modelos.
- Execução: Os testes podem ser executados usando o comando `npm test`.

É importante manter os testes atualizados à medida que novas funcionalidades são adicionadas ou modificadas no projeto.

# 🔄 Fluxo da Aplicação

O Atlas Library segue um fluxo de aplicação típico de uma API REST. Aqui está uma visão geral do fluxo principal:

1. Requisição do Cliente: O cliente (por exemplo, um navegador ou aplicativo móvel) envia uma requisição HTTP para uma rota específica da API.
2. Roteamento: O servidor recebe a requisição e a encaminha para o controlador apropriado com base na rota solicitada.
3. Middleware: Antes de chegar ao controlador, a requisição passa por middlewares que podem realizar tarefas como autenticação, validação de dados, etc.
4. Controlador: O controlador processa a requisição, interagindo com os serviços e modelos necessários para executar a lógica de negócios.
5. Acesso ao Banco de Dados: Se necessário, o controlador utiliza modelos para interagir com o banco de dados MySQL.
6. Resposta: Após o processamento, o controlador envia uma resposta HTTP de volta ao cliente,  no formato JSON.
7. Tratamento de Erros: Em caso de erros durante o processo, o sistema captura e trata adequadamente, retornando uma resposta de erro apropriada.

Este fluxo se repete para cada requisição feita à API, garantindo um processamento consistente e eficiente das operações da biblioteca.