ALTER TABLE stock_sphere.user_stock ADD CONSTRAINT stock_id_check CHECK (CHAR_LENGTH(stock_id)>=4);
