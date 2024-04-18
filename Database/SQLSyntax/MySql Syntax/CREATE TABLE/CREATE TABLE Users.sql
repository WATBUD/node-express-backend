CREATE TABLE Users (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL,
    Password VARCHAR(100) NOT NULL
);

INSERT INTO Users (Username, Password) VALUES
('YC', '123456'),
('Louis', '123456'),
('Test1', '123456'),
('Test2', '123456');