// entities.js

class Entity_Chatroom {
    constructor(id, baseID, boardID, title, lastMsg = '', lastMsgTime = new Date(), lastMsgSender = '', avatar = '', creatorID = '', createdAt = new Date(), updatedAt = new Date(), personalConfig = [], type = '') {
        this.id = id;
        this.baseID = baseID;
        this.boardID = boardID;
        this.title = title;
        this.lastMsg = lastMsg;
        this.lastMsgTime = lastMsgTime;
        this.lastMsgSender = lastMsgSender;
        this.avatar = avatar;
        this.creatorID = creatorID;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.personalConfig = personalConfig;
        this.type = type; // "private" or "board"
    }
}

class ChatroomPersonalConfig {
    constructor(unreadCount = 0, notificationOn = true, userID = '', isMuted = false, isHidden = false, isPinned = false) {
        this.unreadCount = unreadCount;
        this.notificationOn = notificationOn;
        this.userID = userID;
        this.isMuted = isMuted;
        this.isHidden = isHidden;
        this.isPinned = isPinned;
    }
}

class Entity_Message {
    constructor(id, chatroomID, senderID, type, data, createdAt = new Date(), updatedAt = new Date()) {
        this.id = id;
        this.chatroomID = chatroomID;
        this.senderID = senderID;
        this.type = type;
        this.data = data;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

// Export classes for use in other modules
module.exports = {
    Entity_Chatroom,
    ChatroomPersonalConfig,
    Entity_Message
};
