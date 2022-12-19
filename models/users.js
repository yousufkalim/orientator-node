const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    date_of_birth: {
      type: Date,
      required: true,
    },
    education_level: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    newsletter: {
      type: Boolean,
      defauult: false,
    },
    institute: {
      type: String,
      required: true,
      ref: "Institute",
    },
    country: {
      type: String,
    },
    customeAddress: {
      type: String,
    },
    customenewAddress: {
      type: String,
    },
    address: {
      lat: {
        type: String,
      },
      lng: {
        type: String,
      },
      label: {
        type: String,
      },
      city: {
        type: String,
      },
      postal_code: {
        type: String,
      },
    },
    otp: { type: String },
    smsOtp: { type: String },
    results: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Result",
      },
    ],
  },
  { timestamps: true }
);

module.exports = model("User", userSchema);
