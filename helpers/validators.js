const User=require('../models/user')
const {body} = require('express-validator');
const bcrypt = require('bcryptjs')

exports.registerValidator = [
  body('name').isLength({min: 3}).withMessage('Name must be minimum 3 letters').trim(),
  body('email').isEmail().withMessage('Input correct email').custom(async (value,{req})=>{
    try {
      const user =await User.findOne({email: value});
      if (user) {
        return Promise.reject('User already exist')
      }
    } catch (e) {
      console.log(e);
    }
  }).normalizeEmail(),
  body('password', 'Password must be minimum 6 characters')
    .isLength({min: 6}).isAlphanumeric().trim(),
  body('confirm').custom((value, {req}) => {
    if (value != req.body.password) {
      throw new Error('Passwords must be equal')
    } else {
      return true
    }
  }).trim()
]

exports.loginValidator=[
  body('email').isEmail().withMessage('Input correct email').custom(async (value,{req})=>{
    try {
      const user =await User.findOne({email: value});
      if (!user) {
        return Promise.reject('Email do not registered')
      }else {
        req.tempUser=user;
      }
    } catch (e) {
      console.log(e);
    }
  }).normalizeEmail(),
  body('password').custom(async (value, {req}) => {
    try {
      if (!req.tempUser){return }
      const passOk = await bcrypt.compare(value, req.tempUser.password);
      if (!passOk) {
        return Promise.reject('Incorrect password')
      }
    } catch (e) {
      console.log(e);
    }
  }).trim()

]

exports.addEditCourseValidator=[
  body('title').isLength({min:3}).withMessage('Title must be minimum 3 letters').trim(),
  body('price').isNumeric().withMessage('Please, input correct price'),
  body('url','Please, input correct URL').isURL()

]
