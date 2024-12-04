-- INSERT INTO JSON ARRAY
INSERT INTO user_detail (user_detail)
VALUES ('["tag1", "tag2", "tag3"]');
-- 更新整個JSON
UPDATE user_detail
SET user_data = '{"name": "UpdatedName", "age": 35, "city": "San Francisco"}'
WHERE user_id = 1;
-- 更新部分JSON
UPDATE user_detail
SET user_data = JSON_SET(user_data, '$.age', 36)
WHERE user_id = 1;
-- 假设 JSON 数据列中的某个属性上进行条件筛选
SELECT *
FROM user_detail
WHERE JSON_EXTRACT(user_data, '$.age') = 42;
