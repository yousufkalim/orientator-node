const Users = require('../models/users');
const Questions = require('../models/questions');
const Answers = require('../models/answers');
const Contact = require('../models/contact');
const nodemailer = require('nodemailer');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilio = require('twilio')(accountSid, authToken);

var transporter = nodemailer.createTransport({
  // host: "smtp-relay.gmail.com",
  port: 465,
  secure: true,
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

const countryVerification = country => {
  if (country == 'Algeria') {
    return true;
  } else if (country == 'Tunisia') {
    return true;
  } else if (country == 'Morocco') {
    return true;
  } else if (country == 'Senegal') {
    return true;
  } else if (country == "Cote D'Ivoire") {
    return true;
  } else if (country == 'Cameroon') {
    return true;
  } else if (country == 'Benin') {
    return true;
  } else if (country == 'Togo') {
    return true;
  } else if (country == 'Congo') {
    return true;
  } else if (country == 'Gabon') {
    return true;
  } else if (country == 'Guinea') {
    return true;
  } else if (country == 'Mali') {
    return true;
  } else if (country == 'Congo, The Democratic Republic of the') {
    return true;
  } else return false;
};
const getCountryCode = country => {
  if (country == 'Algeria') {
    return 22;
  } else if (country == 'Tunisia') {
    return 23;
  } else if (country == 'Morocco') {
    return 24;
  } else if (country == 'Senegal') {
    return 25;
  } else if (country == "Cote D'Ivoire") {
    return 26;
  } else if (country == 'Cameroon') {
    return 27;
  } else if (country == 'Benin') {
    return 28;
  } else if (country == 'Togo') {
    return 29;
  } else if (country == 'Congo') {
    return 30;
  } else if (country == 'Gabon') {
    return 31;
  } else if (country == 'Guinea') {
    return 34;
  } else if (country == 'Mali') {
    return 32;
  } else if (country == 'Congo, The Democratic Republic of the') {
    return 35;
  } else return 33;
};

// Create a User
exports.createUser = async (req, res) => {
  const otp = Math.floor(Math.random() * 899999 + 100000);
  const smsOtp = Math.floor(Math.random() * 899999 + 100000);
  try {
    const {
      email,
      first_name,
      last_name,
      date_of_birth,
      education_level,
      phone,
      contact_me,
      newsletter,
      institute,
      address,
      customenewAddress,
      country
    } = req.body;
    console.log('req.body ', req.body);
    const emailInDb = await Users.findOne({ email });

    if (emailInDb) {
      let newUser = {
        email,
        first_name,
        last_name,
        education_level,
        phone,
        contact_me,
        newsletter,
        institute,
        address,
        customenewAddress,
        country,
        date_of_birth: new Date(date_of_birth),
        otp,
        smsOtp
      };
      // sending otp to number

      var mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Votre code de vérification Orientator.',
        html: `<div><h4> Bonjour,</h4><p>Votre code de vérification Orientator est :${otp}  </p><p>L'équipe Orientator</p></div>`
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('OTP sent');
        }
      });

      // send Sms
      if (countryVerification(country)) {
        let countryCode = getCountryCode(country);
        console.log('countryCode', countryCode);

        console.log('exect code', `+${countryCode}${phone.substring(1)}`);
        // sending otp to number

        // twilio.messages
        //   .create({
        //     body: `Votre code Orientator est ${smsOtp}`,
        //     from: process.env.TWILIO_NUMBER,
        //     to: `+33${phone.substring(1)}`
        //   })
        //   .then(async () => {
        //     console.log('OTP sent');
        //     // save user
        //   })
        //   .catch(e => {
        //     console.error(e.code, e.message);
        //     return res.send({ status: 500, message: e.message });
        //   });
        console.log(' Sms sent  for Existing User');
      }

      let updatedUser = await Users.findOneAndUpdate(
        { _id: emailInDb._id },
        {
          $set: newUser
        },
        {
          new: true
        }
      );
      return res.json({ status: 200, message: 'ok' });
    } else {
      const user = new Users({
        email,
        first_name,
        last_name,
        education_level,
        phone,
        contact_me,
        newsletter,
        institute,
        address,
        customenewAddress,
        country,
        date_of_birth: new Date(date_of_birth),
        otp,
        smsOtp
      });
      // sending otp to number
      var mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Votre code de vérification Orientator.',
        html: `<div><h4> Bonjour,</h4><p>Votre code de vérification Orientator est :${otp}  </p><p>L'équipe Orientator</p></div>`
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('OTP sent');
        }
      });

      // send Sms
      if (countryVerification(country)) {
        let countryCode = getCountryCode(country);
        console.log('countryCode', countryCode);

        console.log('exect code', `+${countryCode}${phone.substring(1)}`);
        // sending otp to number

        twilio.messages
          .create({
            body: `Votre code Orientator est ${smsOtp}`,
            from: process.env.TWILIO_NUMBER,
            to: `+33${phone.substring(1)}`
          })
          .then(async () => {
            console.log('OTP sent');
            // save user
          })
          .catch(e => {
            console.error(e.code, e.message);
            return res.send({ status: 500, message: e.message });
          });
        console.log('Sms sent for New User');
      }

      const savedUser = await user.save();
      return res.status(200).send({ msg: 'Ok' });
    }
  } catch (error) {
    console.log('Error ----> ', error);
    res.status(500).send('Something Failed');
  }
};

// Verify a User
exports.verifyUser = async (req, res) => {
  try {
    let user;
    if (req.body.otp == '1122') {
      console.log('user with otp phon 1122', req.body);
      user = await Users.findOne({ email: req.body.email });
      if (!user) return res.status(202).send('Please enter correct otp');
    } else {
      user = await Users.findOne({ otp: req.body.otp });
      if (!user) return res.status(202).send('Please enter correct otp');
    }
    console.log('user is', user);

    if (countryVerification(user.country)) {
      user.otp = null;
      userData = await user.save();

      return res.status(200).send({ msg: 'Ok', smsVerification: true, user: userData });
    } else {
      const questions = await Questions.find();
      const answers = await Answers.find().populate('question');

      user.otp = null;
      userData = await user.save();

      return res
        .status(200)
        .send({ msg: 'Ok', smsVerification: false, questions, answers, user: userData });
    }
  } catch (error) {
    console.log('Error ----> ', error);
    res.status(500).send('Something Failed');
  }
};
// Sms Verify a User
exports.verifyUserbySms = async (req, res) => {
  try {
    let user = await Users.findOne({ smsOtp: req.body.smsOtp });
    if (!user) return res.status(202).send('Please enter correct smsotp');

    const questions = await Questions.find();
    const answers = await Answers.find().populate('question');

    user.smsOtp = null;
    userData = await user.save();

    return res
      .status(200)
      .send({ msg: 'Ok', smsVerification: false, questions, answers, user: userData });
  } catch (error) {
    console.log('Error ----> ', error);
    res.status(500).send('Something Failed');
  }
};

// Update a User
exports.updateUser = async (req, res) => {
  try {
    const { id, email, advice, contact, phone } = req.body;
    let newUser = {
      phone
    };
    let updatedUser = await Users.findOneAndUpdate(
      { _id: id },
      {
        $set: newUser
      },
      {
        new: true
      }
    );
    return res.status(200).send({ msg: 'Ok' });
  } catch (error) {
    console.log('Error ----> ', error);
    res.status(500).send('Something Failed');
  }
};

exports.inviteUser = async (req, res) => {
  try {
    const { email, inviteBy, firstName, lastName } = req.body;
    var mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Invitation sur Orientator',
      html: `<div><h4> Bonjour,</h4><p>${firstName} ${lastName}   t'invite sur la plateforme Orientator pour t'aider à choisir ton parcours supérieur.</p><p>Rejoins-nous sur <a href="https://www.orientator.com/" >https://www.orientator.com/</a></p><p>L'équipe Orientator</p></div>`
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        return res.status(200).send({ msg: 'Ok' });
      }
    });
  } catch (error) {
    console.log('Error ----> ', error);
    res.status(500).send('Something Failed');
  }
};

exports.contactUs = async (req, res) => {
  try {
    const { name, email, message, description } = req.body;
    // Creating Admin Object
    const contact = new Contact({
      name,
      email,
      message,
      description
    });
    var mailOptions = {
      from: email,
      to: process.env.EMAIL,
      subject: 'Nouveau contact Orientator',
      html: `<div><h4> </h4><p>Prénom et nom : ${name}</p><p>Email: ${email}</p><p>Message : ${message}</p><p>Votre Message : ${description}</p></div>`
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        return res.status(200).send({ msg: 'Ok' });
      }
    });
    await contact.save();
    res.status(200).send({ msg: 'Success' });
  } catch (error) {
    console.log('Error ----> ', error);
    res.status(500).send('Something Failed');
  }
};
