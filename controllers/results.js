const Results = require("../models/results");
const Users = require("../models/users");
const Answers = require("../models/answers");
const Domains = require("../models/domains");
const Courses = require("../models/courses");
const geoLib = require("geo-lib");
const Algorithm = require("../utils/percentageAlgorithm");
const checkGroup = require("../utils/checkGroup");

let checkgroup = true;
// Create a Result
exports.create = async (req, res) => {
  try {
    const { last_answer, user_id, disc_answers } = req.body;
    const course_types = ["BTS", "BUT", "CPGE", "Ecole Post-Bac", "Licence"];

    const user = await Users.findById(user_id); //Finding User in DB
    if (!user) return res.status(404).send("User Not Found");

    const answer = await Answers.findById(last_answer).populate("job"); //Finding answer for Job and Domain Id's

    const domain = await Domains.findById(answer.domain); //Finding Domain name for result
    const desc_answers_in_db = await Answers.find({
      _id: { $in: disc_answers },
    }).populate("question"); //Finding all discriminatory Answers In Db

    // Fetching all courses in DB from job, domain and language filters
    let courses = await Courses.find({
      job: answer.job,
      domain: answer.domain,
    });

    // Getting the First letters of disc answers for algorithms
    const first_disc_ans =
      desc_answers_in_db[1].answer.substring(0, 1) === "O" ? "P" : "G";
    const second_disc_ans =
      desc_answers_in_db[2].answer.substring(0, 1) === "O" ? "S" : "N";
    const third_disc_ans =
      desc_answers_in_db[4].answer.substring(0, 1) === "O" ? "L" : "C";
    const algo_object = Algorithm(
      `${first_disc_ans}${third_disc_ans}${second_disc_ans}`
    );
    // get star rating from zipcode
    courses = courses.map((item) => {
      if (item.zipcode) {
        if (user.address?.postal_code) {
          if (
            item._doc.zipcode.substring(0, 2) ==
            user.address.postal_code.substring(0, 2)
          ) {
            if (item._doc.selectivity.substring(0, 6) == "3 ou 4") {
              return {
                ...item._doc,
                selectivityrating: "4",
              };
            }
            if (item._doc.selectivity.substring(0, 6) == "1 ou 2") {
              return {
                ...item._doc,
                selectivityrating: "2",
              };
            }
            return {
              ...item._doc,
              selectivityrating: item._doc.selectivity
                ? item._doc.selectivity
                : "",
            };
          } else {
            if (
              // checkgroup
              checkGroup(
                item._doc.zipcode.substring(0, 2),
                user.address.postal_code.substring(0, 2)
              )
            ) {
              if (item._doc.selectivity.substring(0, 6) == "3 ou 4") {
                return {
                  ...item._doc,
                  selectivityrating: "4",
                };
              }
              if (item._doc.selectivity.substring(0, 6) == "1 ou 2") {
                return {
                  ...item._doc,
                  selectivityrating: "2",
                };
              }
              return {
                ...item._doc,
                selectivityrating: item._doc.selectivity
                  ? item._doc.selectivity
                  : "",
              };
            } else {
              if (item._doc.selectivity.substring(0, 6) == "3 ou 4") {
                return {
                  ...item._doc,
                  selectivityrating: "3",
                };
              }
              if (item._doc.selectivity.substring(0, 6) == "1 ou 2") {
                return {
                  ...item._doc,
                  selectivityrating: "1",
                };
              }
              return {
                ...item._doc,
                selectivityrating: item._doc.selectivity
                  ? item._doc.selectivity
                  : "",
              };
            }
          }
        } else {
          return {
            ...item._doc,
            selectivityrating: "1",
          };
        }
      } else {
        return item._doc;
      }
    });
    // ended get star rating from zipcode
    // Filtering Courses if user selects Close
    let distanceRatingIs = "";
    // if (desc_answers_in_db[3].answer === "Près") {
    //   courses = courses.map((item) => {
    //     let result = geoLib.distance({
    //       p1: { lat: user.address.lat, lon: user.address.lng },
    //       p2: { lat: item.gps_coordinates.lat, lon: item.gps_coordinates.lng },
    //     });
    //     if (result.distance >= 0 && result.distance <= 30) {
    //       distanceRatingIs = 5;
    //     } else if (result.distance >= 31 && result.distance <= 60) {
    //       distanceRatingIs = 4;
    //     } else if (result.distance >= 61 && result.distance <= 200) {
    //       distanceRatingIs = 3;
    //     } else if (result.distance >= 201 && result.distance <= 400) {
    //       distanceRatingIs = 2;
    //     } else {
    //       distanceRatingIs = 1;
    //     }
    //     return {
    //       ...item,
    //       distance: result.distance,
    //       distanceRatingIs,
    //     };
    //   });
    //   // filtering single course of each course_type
    //   // and mapping courseId and percentage for result
    //   courses = course_types
    //     .map((type) => {
    //       const filtered = courses.filter((c) => c.type_of_course === type);
    //       filtered.sort((a, b) => a.distance - b.distance);
    //       filtered[0] != null && (filtered[0].percentage = algo_object[type]);
    //       return filtered[0];
    //     })
    //     .filter((c) => c != null)
    //     .map((item) => ({
    //       courseId: item._id,
    //       percentage: item.percentage,
    //       selectivityrating: item.selectivityrating
    //         ? item.selectivityrating
    //         : "",
    //       distancerating: item.distanceRatingIs,
    //     }));
    // } else {
    // Filtering courses with algorithm and embedding percentage in them
    let filteredCourses = [];
    let newfilteredCourses = [];
    // initialize seperate array for type of courses
    let CPGE = [];
    let BTS = [];
    let BUT = [];
    let Ecole = [];
    let Licence = [];

    course_types.forEach((type) => {
      const filtered = courses.filter((c) => c.type_of_course === type);
      filtered.forEach((item) => {
        filteredCourses.push({
          ...item,
          percentage: algo_object[type],
        });
      });
    });

    // Mapping courseId and percentage for result

    // for distance Rating
    filteredCourses = filteredCourses.map((item) => {
      if (item.gps_coordinates) {
        if (user.address?.postal_code) {
          let result = geoLib.distance({
            p1: { lat: user.address.lat, lon: user.address.lng },
            p2: {
              lat: item.gps_coordinates.lat,
              lon: item.gps_coordinates.lng,
            },
          });
          if (result.distance >= 0 && result.distance <= 30) {
            distanceRatingIs = 5;
          } else if (result.distance >= 31 && result.distance <= 60) {
            distanceRatingIs = 4;
          } else if (result.distance >= 61 && result.distance <= 200) {
            distanceRatingIs = 3;
          } else if (result.distance >= 201 && result.distance <= 400) {
            distanceRatingIs = 2;
          } else {
            distanceRatingIs = 1;
          }
          return {
            ...item,
            distanceRatingIs,
            distance: result.distance,
          };
        } else {
          return {
            ...item,
            distanceRatingIs: 1,
          };
        }
      } else {
        return {
          ...item,
          distanceRatingIs: "N/A",
        };
      }
    });
    filteredCourses.sort((a, b) => a.distance - b.distance);
    courses = filteredCourses.map((item) => ({
      courseId: item._id,
      percentage: item.percentage,
      typeofcourse: item.type_of_course,
      selectivityrating: item.selectivityrating ? item.selectivityrating : "",
      distancerating: item.distanceRatingIs,
    }));
    console.log("desc_answers_in_db", desc_answers_in_db);

    const result = new Results({
      user: user_id,
      last_answer: answer.answer,
      example_of_job: answer.job.example_of_job,
      type_of_job: answer.job.type_of_job,
      domain: domain.name,
      desc_answers: desc_answers_in_db,
      courses,
    });
    const savedResult = await result.save();

    // Saving result to user Schema in DB
    await Users.findByIdAndUpdate(
      user_id,
      {
        $addToSet: {
          results: savedResult,
        },
      },
      { new: true }
    );
    const resultForResponse = await Results.findById(savedResult._id)
      .populate("courses.courseId")
      .populate({
        path: "courses.courseId",
        // this is for nested population . courseId has a property domain which is being populated
        populate: { path: "domain" },
      }); // Fetching results from DB for Response
    // console.log("desc_answers_in_db[5].answer", desc_answers_in_db[5].answer);
    // sort the courses on the base of last descrAnswer
    if (desc_answers_in_db[5].answer == "Prestige") {
      resultForResponse.courses.sort(
        // (a, b) => parseInt(b.selectivityrating) - parseInt(a.selectivityrating)
        // check rating criteria and distance criteria
        (a, b) => {
          a.selectivityrating = parseInt(a.selectivityrating);
          b.selectivityrating = parseInt(b.selectivityrating);
          a.distancerating = parseInt(a.distancerating);
          b.distancerating = parseInt(b.distancerating);

          if (a.selectivityrating === b.selectivityrating) {
            return b.distancerating - a.distancerating;
          }
          return a.selectivityrating > b.selectivityrating ? -1 : 1;
        }
      );
      // then sort by distance
    } else if (desc_answers_in_db[5].answer == "Coût") {
      resultForResponse.courses.sort(
        // (a, b) => parseInt(b.courseId.cost) - parseInt(a.courseId.cost)
        // check rating criteria and distance criteria
        (a, b) => {
          a.courseId.cost = parseInt(a.courseId.cost);
          b.courseId.cost = parseInt(b.courseId.cost);
          a.distancerating = parseInt(a.distancerating);
          b.distancerating = parseInt(b.distancerating);

          if (a.courseId.cost === b.courseId.cost) {
            return b.distancerating - a.distancerating;
          }
          return a.courseId.cost > b.courseId.cost ? -1 : 1;
        }
      );
    } else if (desc_answers_in_db[5].answer == "Langue") {
      resultForResponse.courses.sort(
        // (a, b) =>
        //   parseInt(b.courseId.languagestar) - parseInt(a.courseId.languagestar)

        // check rating criteria and after rating check distance criteria
        (a, b) => {
          a.courseId.languagestar = parseInt(a.courseId.languagestar);
          b.courseId.languagestar = parseInt(b.courseId.languagestar);
          a.distancerating = parseInt(a.distancerating);
          b.distancerating = parseInt(b.distancerating);

          if (a.courseId.languagestar === b.courseId.languagestar) {
            return b.distancerating - a.distancerating;
          }
          return a.courseId.languagestar > b.courseId.languagestar ? -1 : 1;
        }
      );
    } else if (desc_answers_in_db[5].answer == "Durée") {
      resultForResponse.courses.sort(
        // (a, b) => parseInt(b.courseId.duration) - parseInt(a.courseId.duration)
        // check rating criteria and after rating check distance criteria
        (a, b) => {
          a.courseId.duration = parseInt(a.courseId.duration);
          b.courseId.duration = parseInt(b.courseId.duration);
          a.distancerating = parseInt(a.distancerating);
          b.distancerating = parseInt(b.distancerating);

          if (a.courseId.duration === b.courseId.duration) {
            return b.distancerating - a.distancerating;
          }
          return a.courseId.duration > b.courseId.duration ? -1 : 1;
        }
      );
    } else {
      resultForResponse.courses.sort(
        (a, b) => parseInt(b.distancerating) - parseInt(a.distancerating)
      );
    }

    // seperate each type of course for sorting purpose

    resultForResponse.courses.forEach((item, i) => {
      if (item.courseId.type_of_course === "CPGE") {
        CPGE.push(item);
      }
      if (item.courseId.type_of_course === "BTS") {
        BTS.push(item);
      }
      if (item.courseId.type_of_course === "BUT") {
        BUT.push(item);
      }
      if (item.courseId.type_of_course === "Ecole Post-Bac") {
        Ecole.push(item);
      }
      if (item.courseId.type_of_course === "Licence") {
        Licence.push(item);
      }
    });

    // create data with type of course and all courses
    if (CPGE.length >= 1) {
      // limit the courses
      const getTenCourses = CPGE.slice(0, 10);
      newfilteredCourses.push({
        type: CPGE[0].courseId.type_of_course,
        percentage: CPGE[0].percentage,
        courses: [...getTenCourses],
      });
    }
    if (Licence.length >= 1) {
      // limit the courses
      const getTenCourses = Licence.slice(0, 10);
      newfilteredCourses.push({
        type: Licence[0].courseId.type_of_course,
        percentage: Licence[0].percentage,
        courses: [...getTenCourses],
      });
    }
    if (BTS.length >= 1) {
      // limit the courses
      const getTenCourses = BTS.slice(0, 10);
      newfilteredCourses.push({
        type: BTS[0].courseId.type_of_course,
        percentage: BTS[0].percentage,
        courses: [...getTenCourses],
      });
    }
    if (Ecole.length >= 1) {
      // limit the courses
      const getTenCourses = Ecole.slice(0, 10);
      newfilteredCourses.push({
        type: Ecole[0].courseId.type_of_course,
        percentage: Ecole[0].percentage,
        courses: [...getTenCourses],
      });
    }
    if (BUT.length >= 1) {
      // limit the courses
      const getTenCourses = BUT.slice(0, 10);
      newfilteredCourses.push({
        type: BUT[0].courseId.type_of_course,
        percentage: BUT[0].percentage,
        courses: [...getTenCourses],
      });
    }
    // sort type of course on the base of percentage
    newfilteredCourses.sort((a, b) => b.percentage - a.percentage);

    let newResult = {
      example_of_job: answer.job.example_of_job,
      type_of_job: answer.job.type_of_job,
      domain: domain.name,
      data: newfilteredCourses,
    };

    res.status(200).send({
      msg: "Ok",
      // result: resultForResponse,
      result: newResult,
    });
  } catch (error) {
    console.log("Error ----> ", error);
    res.status(500).send("Something Failed");
  }
};
