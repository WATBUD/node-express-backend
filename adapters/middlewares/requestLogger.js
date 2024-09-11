// middlewares/requestLogger.js
const requestLogger = (sharedService) => {
  return async (req, res, next) => {
    const logdata = {
      path: req.path,
      method: req.method,
      client_ip: req.ip || '',     
      created_at: new Date(),      
      backend_language: 'Node.js', 
    };
    
    try {
      await sharedService.createRequestLog(logdata);
    } catch (error) {
      console.error('Error saving request log:', error);
    }

    next();
  };
};

export default requestLogger;
