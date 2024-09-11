// dto.js

class DTO_CreateChatroomRequest {
    constructor(baseID, boardID, title, creatorID, avatar = '', type, nikename = '') {
        this.baseID = baseID;
        this.boardID = boardID;
        this.title = title;
        this.creatorID = creatorID;
        this.avatar = avatar;
        this.type = type;
        this.nikename = nikename;
    }
}

class DTO_MessagesResult {
    constructor(id, chatroomID, senderID, avatar, nickname, type, data, createdAt, updatedAt) {
        this.id = id;
        this.chatroomID = chatroomID;
        this.senderID = senderID;
        this.avatar = avatar;
        this.nickname = nickname;
        this.type = type;
        this.data = data;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

class DTO_SendMessageRequest {
    constructor(chatroomID, senderID, type, data) {
        this.chatroomID = chatroomID;
        this.senderID = senderID;
        this.type = type;
        this.data = data;
    }
}

class DTO_LeaveChatroomRequest {
    constructor(chatroomID, userID) {
        this.chatroomID = chatroomID;
        this.userID = userID;
    }
}

class DTO_AddOrRemoveChatRoomUserRequest {
    constructor(chatroomID, userID) {
        this.chatroomID = chatroomID;
        this.userID = userID;
    }
}

// Export classes for use in other modules
module.exports = {
    DTO_CreateChatroomRequest,
    DTO_MessagesResult,
    DTO_SendMessageRequest,
    DTO_LeaveChatroomRequest,
    DTO_AddOrRemoveChatRoomUserRequest
};
