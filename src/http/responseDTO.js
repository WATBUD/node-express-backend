class ResponseDTO {
  constructor(status, result = null, success) {
    this.Status = status;
    this.Result = result;
    this.Success = success;
  }

  // Static method for successful response
  static successResponse(result = null) {
    return new ResponseDTO("OK", result, true);
  }

  // Static method for error response
  static errorResponse(errorCode, result = null) {
    return new ResponseDTO(errorCode, result, false);
  }
}

export default ResponseDTO;
