class ResponseDTO {
  constructor(status, result = null, success) {
    this.status = status;
    this.result = result;
    this.success = success;
  }

  // Static method for successful response
  static successResponse(result = null) {
    return new ResponseDTO("OK", result, true);
  }

  // Static method for error response
  static errorResponse(error_code, result = null) {
    return new ResponseDTO(error_code, result, false);
  }
}

export default ResponseDTO;
