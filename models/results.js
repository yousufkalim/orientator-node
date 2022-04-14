const { Schema, model } = require("mongoose");

const courseSchema = new Schema({
  courseId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Course",
  },
  percentage: {
    type: String,
    required: true,
  },

  selectivityrating: {
    type: String,
  },
  distancerating: {
    type: String,
  },
});

const resultSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    last_answer: {
      type: String,
      required: true,
    },
    type_of_job: {
      type: String,
    },
    example_of_job: {
      type: String,
      required: true,
    },
    domain: {
      type: String,
      required: true,
    },
    desc_answers: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Answer",
      },
    ],

    courses: [courseSchema],
  },
  { timestamps: true }
);

module.exports = model("Result", resultSchema);
