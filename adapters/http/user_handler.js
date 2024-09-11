
const NewUserHandler = (UserService) => {  return {
    checkUserlogin: async (req, res) => {
      const { account, password } = req.body;
      if (!account || !password) {
        return res.status(400).json({ message: 'Account and password are required' });
      }

      const result = await UserService.checkUserLogin(account, password);

      if(!result.success){
        return res.json({ message: result.message });
      }
      if (typeof result === 'string') {
        return res.status(401).json({ message: result });
      } else {
        return res.json({ token: result.token });
      }
    },
    getTagGroupDetails: async (req, res) => {
      try {
        const tableData = await UserService.getV_TagGroupDetail();
        res.json(tableData);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    updateUserPassword: async (req, res) => {
      const { userId, password } = req.body;
      try {
        const updatedUser = await UserService.updateUserPassword(userId, password);
        res.send(updatedUser);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    getUserById: async (req, res) => {
      //const userId = req.params.id;
      const userId = req.user.user_id
      try {
        const user = await UserService.getUserById(userId);
        res.send(user);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    updateUserPasswordById: async (req, res) => {
      //const userId = req.params.id;
      const userId = req.user.user_id
      const password = req.body.password;
      try {
        const updatedUser = await UserService.updateUserPassword(userId, password);
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

export default NewUserHandler;
