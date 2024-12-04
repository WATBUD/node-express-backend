-- CREATE VIEW V_UsersDetail2 AS
SELECT 
u.*,
ud.*
FROM users u
JOIN user_detail ud