// Init
const router = require('express').Router();
const {
  createUser,
  updateUser,
  inviteUser,
  verifyUser,
  contactUs,
  verifyUserbySms
} = require('../controllers/users');
const { validateUser, isValidated } = require('../middleware/validators');

// Routes

// POST
router.post('/create', validateUser, isValidated, createUser); //Create a User
router.post('/verify', verifyUser); //Verify a User
router.post('/smsverify', verifyUserbySms); //Verify a User by Sms
router.post('/update', updateUser); //Create a User
router.post('/invite', inviteUser); //Create a User
router.post('/contact', contactUs); //Create a User

// Export
module.exports = router;
