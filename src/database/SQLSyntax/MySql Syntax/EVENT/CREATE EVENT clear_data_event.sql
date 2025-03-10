
-- USE stock_sphere;

DELIMITER $$

CREATE EVENT clear_request_logs
ON SCHEDULE EVERY 5 MINUTE
STARTS '2023-09-13 10:36:39.000'
ENABLE
DO BEGIN
    DELETE FROM stock_sphere.request_logs
    WHERE ClientIp IN ('::1','127.0.0.1');
END $$

DELIMITER ;;