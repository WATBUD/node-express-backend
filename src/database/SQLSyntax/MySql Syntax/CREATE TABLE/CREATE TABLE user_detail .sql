CREATE TABLE user_detail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    age INT,
    birthday DATE,
    profile_picture VARCHAR(255),
    interests TEXT,
    personal_description TEXT,
    location VARCHAR(100),
    relationship_status ENUM('Single', 'Married', 'Divorced', 'Other'),
    looking_for ENUM('Friendship', 'Dating', 'Long-term Relationship', 'Other'),
    privacy_settings JSON, -- You might store this as JSON or in a separate table
    social_links JSON, -- You might store this as JSON or in a separate table
    match_preferences JSON -- You might store this as JSON or in a separate table
);