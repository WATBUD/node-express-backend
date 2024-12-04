// chatroomController.js
import chatroomUsecase from '../usecases/chatroomUsecase.js';

export const createChatroom = async (req, res) => {
    try {
        const chatroom = await chatroomUsecase.createChatroom(req.body);
        res.status(201).json(chatroom);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { chatroom_id } = req.params;
        const { user_id } = req.query;
        const { type, data } = req.body;

        const request = {
            ChatroomID: chatroom_id,
            SenderID: user_id,
            Type: type,
            Data: data,
        };

        const message = await chatroomUsecase.sendMessage(request);
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { chatroom_id } = req.params;
        const messages = await chatroomUsecase.getMessages(chatroom_id);
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getChatroomByID = async (req, res) => {
    try {
        const { chatroom_id } = req.params;
        const chatroom = await chatroomUsecase.getChatroomByID(chatroom_id);
        if (!chatroom) {
            res.status(404).json({ error: 'Chatroom not found' });
        } else {
            res.status(200).json(chatroom);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getChatrooms = async (req, res) => {
    try {
        const { user_id } = req.params;
        let chatrooms = await chatroomUsecase.getChatrooms(user_id);
        if (!chatrooms) {
            chatrooms = [];
        }
        res.status(200).json(chatrooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateChatroom = async (req, res) => {
    try {
        const { chatroom_id } = req.params;
        const { title, avatar } = req.body;

        const result = await chatroomUsecase.updateChatroom(chatroom_id, title, avatar);
        if (result.error) {
            if (result.error === "chatroom not found") {
                res.status(404).json({ error: result.error });
            } else {
                res.status(500).json({ error: result.error });
            }
        } else {
            res.status(200).json({ message: "Chatroom updated successfully" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const leaveChatroom = async (req, res) => {
    try {
        const { chatroom_id } = req.params;
        const { user_id } = req.query;

        const request = {
            ChatroomID: chatroom_id,
            UserID: user_id,
        };

        await chatroomUsecase.removeUserFromChatroom(request);
        res.status(200).json({ message: "User left the chatroom successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const addUserToChatroom = async (req, res) => {
    try {
        const { chatroom_id } = req.params;
        const { user_id } = req.query;

        const request = {
            ChatroomID: chatroom_id,
            UserID: user_id,
        };

        await chatroomUsecase.addUserToChatroom(request);
        res.status(200).json({ message: "User joined the chatroom successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
