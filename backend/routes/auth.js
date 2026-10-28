'use strict';

const express = require('express');
const router  = express.Router();
const { register, login, getProfile, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerUser, loginUser } = require('../middleware/validate');

router.post('/register',         registerUser, register);
router.post('/login',            loginUser,    login);
router.get('/profile',           protect,      getProfile);
router.put('/profile',           protect,      updateProfile);
router.put('/change-password',   protect,      changePassword);

module.exports = router;
