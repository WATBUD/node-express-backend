import { avatarUpload } from '../../Uploads/UploadService.js';

const UserController = (UserService) => {
  return {
    getTagGroupDetails: async (req, res) => {
      try {
        const tableData = await UserService.getAssignViewTable("V_TagGroupDetail");
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
      const userId = req.params.id;
      try {
        const user = await UserService.getUserById(userId);
        res.send(user);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    updateUserPasswordById: async (req, res) => {
      const userId = req.params.id;
      const password = req.body.password;
      try {
        const updatedUser = await UserService.updateUserPassword(userId, password);
        res.send(updatedUser);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    updateUserAvatar: (req, res, next) => {
      avatarUpload.single("avatar")(req, res, function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        } else {
          return res.status(200).json({ message: "Avatar updated successfully." });
        }
        next();
      });
    }
  };
};

export default UserController;
