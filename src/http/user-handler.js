
import ResponseDTO from './api-response-dto.js';

const userHandler = (UserService) => {  return {
  checkUserlogin: async (req, res) => {
    const input = {
      ...req.params,
      ...req.body,
      ...req.user,
    };
    const result = await UserService.checkUserLogin(input);
    return res.json(result);
  },
  getTagGroupDetails: async (req, res) => {
    try {
      const tableData = await UserService.getAssignViewTable("v_tag_group_detail");
      res.json(tableData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateUserPassword: async (req, res) => {
    const { userId, password } = req.body;
    try {
      const updatedUser = await UserService.updateUserPassword(
        userId,
        password
      );
      res.send(updatedUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getUserById: async (req, res) => {
    //const userId = req.params.id;
    const userId = req.user.user_id;
    try {
      const user = await UserService.getUserById(userId);
      res.send(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateUserPasswordById: async (req, res) => {
    //const userId = req.params.id;
    const userId = req.user.user_id;
    const password = req.body.password;
    try {
      const updatedUser = await UserService.updateUserPassword(
        userId,
        password
      );
      res.send(updatedUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateUserAvatar: async (req, res) => {
    try {
      await UserService.userUploadAvatar(req, res);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
};

export default userHandler;
