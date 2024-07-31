/*create tables*/
CREATE DATABASE IF NOT EXISTS library;
USE library;

CREATE TABLE users (  
    user_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    name VARCHAR(200) NOT NULL,
    whatsapp BOOLEAN NOT NULL,
    number VARCHAR(13) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(256) NOT NULL,
    role ENUM('admin','sub-admin', 'user') NOT NULL,
);

CREATE TABLE authors (
    author_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    name VARCHAR(100) NOT NULL,
    about TEXT
);

CREATE TABLE categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE books (
    book_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    title VARCHAR(100) NOT NULL UNIQUE,
    publication_year VARCHAR(4) NOT NULL,
    available BOOLEAN DEFAULT(true) NOT NULL,
    status ENUM('available','reserved', 'borrowed') NOT NULL,
    rating DECIMAL(3,1),
    quantity INT NOT NULL,
    description TEXT,
    fk_author_id INT NOT NULL,
    fk_category_id INT NOT NULL,
    FOREIGN KEY(fk_author_id) REFERENCES authors(author_id),
    FOREIGN KEY(fk_category_id) REFERENCES categories(category_id)
);

CREATE TABLE loans (
    loan_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    loan_date DATETIME NOT NULL,
    return_date DATETIME NOT NULL,
    returned BOOLEAN NOT NULL,
    fk_book_id INT NOT NULL,
    fk_user_id INT NOT NULL,
    FOREIGN KEY(fk_book_id) REFERENCES books(book_id),
    FOREIGN KEY(fk_user_id) REFERENCES users(user_id)
);

CREATE TABLE reservations (
    reservation_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    reservation_date DATETIME NOT NULL,
    reservation_expiration_date DATETIME,
    active BOOLEAN NOT NULL,
    fk_book_id INT NOT NULL,
    fk_user_id INT NOT NULL,
    FOREIGN KEY(fk_book_id) REFERENCES books(book_id),
    FOREIGN KEY(fk_user_id) REFERENCES users(user_id)
);

CREATE TABLE fines (
    fine_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    amount DECIMAL(5,2) NOT NULL,
    paid BOOLEAN NOT NULL,
    due_date DATETIME NOT NULL,
    payment_date DATETIME,
    fk_user_id INT NOT NULL,
    fk_book_id INT NOT NULL,
    fk_loan_id INT NOT NULL,
    FOREIGN KEY(fk_user_id) REFERENCES users(user_id),
    FOREIGN KEY(fk_loan_id) REFERENCES loans(loan_id)
);

CREATE DATABASE IF NOT EXISTS library_tests;

CREATE TABLE library_tests.users LIKE library.users;

CREATE TABLE library_tests.authors LIKE library.authors;

CREATE TABLE library_tests.categories LIKE library.categories;

CREATE TABLE library_tests.books LIKE library.books;

CREATE TABLE library_tests.loans LIKE library.loans;

CREATE TABLE library_tests.reservations LIKE library.reservations;

CREATE TABLE library_tests.fines LIKE library.fines;