FROM mysql:latest

# Defina a senha do root
ENV MYSQL_ROOT_PASSWORD=admin@344

# Exponha a porta 3306
EXPOSE 3306

# Copie o arquivo tables.sql para o diretório de inicialização do MySQL
COPY ./tables.sql /docker-entrypoint-initdb.d/

# Inicialize o MySQL
CMD ["mysqld"]
