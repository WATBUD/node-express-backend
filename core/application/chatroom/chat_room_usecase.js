// chatroomUsecase.js

class ChatroomUsecase {
    constructor(service) {
        this.service = service;
    }

    async createChatroom(dto) {
        const userInfo = await this._findUserByFirebaseUID(dto.creatorID);
        dto.creatorID = userInfo.firebaseUID;
        dto.nickname = userInfo.nickname;

        return this.service.createChatroom(dto);
    }

    async getChatroomByID(id) {
        return this.service.getChatroomByID(id);
    }

    async getChatrooms(userID) {
        return this.service.getChatrooms(userID);
    }

    async getMessages(chatroomID) {
        const messages = await this.service.getMessages(chatroomID);
        if (!messages || messages.length === 0) {
            return [];
        }

        const resultMessages = [];
        for (const message of messages) {
            let nickname = '不存在的使用者';
            const userInfo = await this._findUserByFirebaseUID(message.senderID);
            if (userInfo) {
                nickname = userInfo.nickname;
            }

            const resultMessage = {
                id: message.id,
                chatroomID: message.chatroomID,
                senderID: message.senderID,
                nickname: nickname,
                type: message.type,
                data: message.data,
                createdAt: message.createdAt,
                updatedAt: message.updatedAt,
            };
            resultMessages.push(resultMessage);
        }

        return resultMessages;
    }

    async updateChatroom(chatroomID, title, avatar) {
        return this.service.updateChatroom(chatroomID, title, avatar);
    }

    async sendMessage(dto) {
        return this.service.sendMessage(dto);
    }

    async removeUserFromChatroom(dto) {
        return this.service.removeUserFromChatroom(dto);
    }

    async addUserToChatroom(dto) {
        return this.service.addUserToChatroom(dto);
    }

    async _findUserByFirebaseUID(firebaseUID) {
        // Mocking user lookup. Replace with actual implementation.
        // Example:
        // return await userService.findUserByFirebaseUID(firebaseUID);
        return {
            firebaseUID: firebaseUID,
            nickname: 'Mocked User'
        };
    }
}

// Export the class for use in other modules
module.exports = ChatroomUsecase;
