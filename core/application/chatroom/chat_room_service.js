// chatroomService.js

class ChatroomService {
    constructor(repo) {
        this.repo = repo;
    }

    async createChatroom(dto) {
        const personalConfig = {
            notificationOn: true,
            userID: dto.creatorID,
            isMuted: false,
            isHidden: false,
            isPinned: false,
        };

        const chatroom = {
            title: dto.title,
            creatorID: dto.creatorID,
            baseID: dto.baseID,
            boardID: dto.boardID,
            avatar: dto.avatar,
            lastMsg: `${dto.nickname}_已創建聊天室`,
            lastMsgSender: dto.nickname,
            lastMsgTime: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            type: 'private',
            personalConfig: [personalConfig],
        };

        return this.repo.createChatroom(chatroom);
    }

    async getChatroomByID(id) {
        return this.repo.getChatroomByID(id);
    }

    async getChatrooms(userID) {
        return this.repo.getChatrooms(userID);
    }

    async updateChatroom(chatroomID, title, avatar) {
        const existingChatroom = await this.repo.getChatroomByID(chatroomID);
        if (!existingChatroom) {
            throw new Error('Chatroom not found');
        }
        existingChatroom.avatar = avatar;
        existingChatroom.title = title;

        return this.repo.updateChatroom(existingChatroom);
    }

    isUserInChatroom(chatroom, userID) {
        return chatroom.personalConfig.some(config => config.userID === userID);
    }

    async sendMessage(dto) {
        const chatroomData = await this.repo.getChatroomByID(dto.chatroomID);
        if (!chatroomData) {
            throw new Error('Chatroom does not exist');
        }
        if (!this.isUserInChatroom(chatroomData, dto.senderID)) {
            throw new Error('User is not a member of the chatroom');
        }

        const currentTime = new Date();
        const message = {
            chatroomID: dto.chatroomID,
            senderID: dto.senderID,
            type: dto.type,
            data: dto.data,
            createdAt: currentTime,
            updatedAt: currentTime,
        };

        const savedMessage = await this.repo.sendMessage(message);
        chatroomData.lastMsg = dto.data;
        chatroomData.lastMsgTime = currentTime;
        chatroomData.lastMsgSender = dto.senderID;

        await this.repo.updateChatroom(chatroomData);

        return savedMessage;
    }

    async getMessages(chatroomID) {
        return this.repo.getMessages(chatroomID);
    }

    async removeUserFromChatroom(dto) {
        const chatroom = await this.repo.getChatroomByID(dto.chatroomID);
        if (!chatroom) {
            throw new Error('Chatroom does not exist');
        }
        if (chatroom.creatorID !== dto.userID) {
            throw new Error('No permission');
        }

        await this.repo.removeUserFromChatroom(dto);
    }

    async addUserToChatroom(dto) {
        const chatroomData = await this.repo.getChatroomByID(dto.chatroomID);
        if (!chatroomData) {
            throw new Error('Chatroom does not exist');
        }
        if (chatroomData.personalConfig.some(config => config.userID === dto.userID)) {
            throw new Error('User already exists in chatroom');
        }

        const personalConfig = {
            userID: dto.userID,
            unreadCount: 0,
            notificationOn: true,
            isMuted: false,
            isHidden: false,
            isPinned: false,
        };

        chatroomData.personalConfig.push(personalConfig);

        await this.repo.addUserToChatroom(dto.chatroomID, chatroomData.personalConfig);
    }
}

// Export the class for use in other modules
module.exports = ChatroomService;
