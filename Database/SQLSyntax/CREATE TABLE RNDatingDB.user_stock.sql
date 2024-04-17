CREATE TABLE RNDatingDB.user_stock (
	ud_user_id int auto_increment NOT NULL,
	gender varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
	birthday date NULL,
	user_has_tag json NULL,
	profile_picture varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
	interests text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
	personal_description text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
	location varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
	relationship_status enum('Single','Married','Divorced','Other') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
	looking_for enum('Friendship','Dating','Long-term Relationship','Other') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
	privacy_settings json NULL,
	social_links json NULL,
	is_banned tinyint(1) DEFAULT 0 NULL,
	CONSTRAINT `PRIMARY` PRIMARY KEY (ud_user_id),
	CONSTRAINT stock_user_fk FOREIGN KEY (ud_user_id) REFERENCES RNDatingDB.users(user_id) ON DELETE RESTRICT ON UPDATE RESTRICT
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci
COMMENT='';
