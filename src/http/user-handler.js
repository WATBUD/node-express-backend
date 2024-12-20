
import ResponseDTO from './api-response-dto.js';

const userHandler = (UserService) => {  return {
  checkUserlogin: async (req, res) => {
    const { UserAccount, Password } = req.body;

    // Validate that both UserAccount and Password are provided
    if (!UserAccount || !Password) {
      return res
        .status(400)
        .json(
          ResponseDTO.errorResponse(
            "MISSING_CREDENTIALS",
            "Account and password are required"
          )
        );
    }

    // Call the UserService to check the login credentials
    const result = await UserService.checkUserLogin(UserAccount, Password);

    // Handle unsuccessful login (when `result.success` is false)
    if (!result.success) {
      return res.json(
        ResponseDTO.errorResponse("LOGIN_FAILED", result.message)
      );
    }

    // Handle case when `result` is a string (e.g., error message)
    if (typeof result === "string") {
      return res
        .status(401)
        .json(ResponseDTO.errorResponse("INVALID_CREDENTIALS", result));
    }

    // Successful login, return the token
    return res.json(ResponseDTO.successResponse({ token: result.token }));
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
