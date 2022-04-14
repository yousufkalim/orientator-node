const Users = require("../../models/users");
const Answers = require("../../models/answers");
const mongoose = require("mongoose");

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
      {
        $lookup: {
          from: "answers",
          localField: "userResult.desc_answers",
          foreignField: "_id",
          as: "userResult.desc_answers",
        },
      },
      {
        $lookup: {
          from: "questions",
          localField: "userResult.desc_answers.question",
          foreignField: "_id",
          as: "userResult.question",
        },
      },
    ]);

    const ansUpdate = () => {
      return new Promise((resolve, reject) => {
        let updatedUsers = [];
        let lastIndex = users.length - 1;
        users.map(async (user, index) => {
          Answers.findById(user.userResult.last_answer, (err, ans) => {
            if (err) {
            }

            if (ans) {
              user.userResult.last_answer = ans.answer;
            }

            updatedUsers.push(user);
            if (index === lastIndex) {
              resolve(updatedUsers);
            }
          });
        });
      });
    };

    let newusers = await ansUpdate();
    console.log(newusers);

    if (!users) return res.status(404).send("User not Found");

    res.status(200).send({ msg: "Users Fetched", users: newusers });
  } catch (error) {
    console.log("Error ----> ", error);
    res.status(500).send("Something Failed");
  }
};
