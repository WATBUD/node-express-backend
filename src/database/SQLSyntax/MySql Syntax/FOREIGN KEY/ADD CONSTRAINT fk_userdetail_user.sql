ALTER TABLE user_detail
ADD CONSTRAINT fk_userdetail_user FOREIGN KEY (ud_user_id) REFERENCES users (user_id);
