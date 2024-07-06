FROM mysql:latest

ENV MYSQL_ROOT_PASSWORD=admin@344

EXPOSE 3306

COPY ./tables.sql /docker-entrypoint-initdb.d/

CMD ["mysqld"]
