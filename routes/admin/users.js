// Init
const router = require("express").Router();
const {
  getOneUser,
  getAllUsers,
  getAllUsersData,
  getAllUsersDataWithResult,
  deleteUser,
} = require("../../controllers/admin/users");

// Routes

// GET
router.get("/all-users", getAllUsers); //Get All User
router.get("/single-user/:_id", getOneUser); //Get A User

router.get("/getallusers", getAllUsersData); //Get All Users Data
router.get("/getalluserswithresult", getAllUsersDataWithResult); //Get All Users Data

// DELETE
router.delete("/:_id", deleteUser); //Delete A User

// Export
module.exports = router;
