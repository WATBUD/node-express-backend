SELECT u.Username, us.IsBanned
FROM Users u
JOIN UserStatus us ON u.ID = us.UserID
-- WHERE u.ID = ?; -- 替换为你要查询的用户ID