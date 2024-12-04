class DTO_UserStockRequest {
    constructor(id, stockId, userId, note = '', isBlocked = false, updatedAt = new Date()) {
      this.id = id;
      this.stockId = stockId;
      this.userId = userId;
      this.note = note;
      this.isBlocked = isBlocked;
      this.updatedAt = updatedAt;
    }
  }
  