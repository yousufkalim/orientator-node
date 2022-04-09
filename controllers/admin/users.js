const Users = require("../../models/users");

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const { pageNumber, pageSize } = req.query;

    //Fetching Users from database in descending order according to date
    const users = await Users.find()
      .sort("-createdAt")
      .skip(pageNumber * pageSize)
      .limit(parseInt(pageSize));

    const totalUsers = await Users.find().countDocuments();

    res.status(200).send({ msg: "All Users", users, totalUsers });
  } catch (error) {
    console.log("Error ----> ", error);
    res.status(500).send("Something Failed");
  }
};

// Get One User By id
exports.getOneUser = async (req, res) => {
  try {
    //Fetching User From DB
    const user = await Users.findById(req.params._id);
    if (!user) return res.status(404).send("User not Found");
    res.status(200).send({ msg: "User Fetched", user });
  } catch (error) {
    console.log("Error ----> ", error);
    res.status(500).send("Something Failed");
  }
};

// Delete One User By id
exports.deleteUser = async (req, res) => {
  try {
    //Deleting User From DB
    const user = await Users.findByIdAndRemove(req.params._id);
    if (!user) return res.status(404).send("User not Found");
    res.status(200).send("User Deleted");
  } catch (error) {
    console.log("Error ----> ", error);
    res.status(500).send("Something Failed");
  }
};

// Get One User By id
exports.getAllUsersData = async (req, res) => {
  try {
    // Fetching User From DB
    const users = await Users.find();
    if (!users) return res.status(404).send("User not Found");

    res.status(200).send({ msg: "Users Fetched", users });
  } catch (error) {
    console.log("Error ----> ", error);
    res.status(500).send("Something Failed");
  }
};
// Get One User By id
exports.getAllUsersDataWithResult = async (req, res) => {
  try {
    // Fetching User From DB
    const users = await Users.aggregate([
      {
        $unwind: {
          path: "$results",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "results",
          pipeline: [
            {
              $project: {
                courses: 0,
                example_of_job: 0,
              },
            },
          ],
          localField: "results",
          foreignField: "_id",
          as: "userResult",
        },
      },
      {
        $unwind: {
          path: "$userResult",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    if (!users) return res.status(404).send("User not Found");

    res.status(200).send({ msg: "Users Fetched", users });
  } catch (error) {
    console.log("Error ----> ", error);
    res.status(500).send("Something Failed");
  }
};
