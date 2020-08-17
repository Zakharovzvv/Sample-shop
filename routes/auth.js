const {Router} = require('express');
const User = require('../models/user')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');
const keys = require('../keys');
const regEmail = require('../emails/registration')
const resetEmail = require('../emails/reset')
const {validationResult} = require('express-validator')
const {registerValidator,loginValidator} =require('../helpers/validators')

const router = Router();
const transporter = nodemailer.createTransport(sendgrid({
  auth: {api_key: keys.SENDGRID_API_KEY}
}));

router.get('/login', async (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    isLogin: true,
     loginError: req.flash('loginError'),
     registerError: req.flash('registerError'),
  })
})
router.post('/login',loginValidator,async (req, res) => {
  try {
    const {email, password} = req.body;
 //   const candidate = await User.findOne({email});
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('loginError', errors.array()[0].msg);
      return res.status(422).redirect('/auth/login#login');
    }

    req.session.user = req.tempUser;
    req.session.isAuthenticated = true;
    req.session.save(err => {
      if (err) {
        throw err
      } else {
        res.redirect('/')
      }
    })
    req.tempUser=undefined;

    // if (candidate) {
    //   const passOk = await bcrypt.compare(password, candidate.password);
    //   if (passOk) {
    //
    //   } else {
    //     req.flash('loginError', 'Incorrect password');
    //     res.redirect('/auth/login')
    //   }
    // } else {
    //   req.flash('loginError', 'Incorrect email');
    //   res.redirect('/auth/login')
    // }
  } catch (e) {
    console.log(e);
  }


})
router.post('/register',registerValidator , async (req, res) => {
  try {
    const {name, email, password, confirm} = req.body;
  //  const candidate = await User.findOne({email});
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('registerError', errors.array()[0].msg);
      return res.status(422).redirect('/auth/login#register');
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name, email, password: hashPassword,
      items: []
    })
    await user.save(()=>{res.redirect('/auth/login#login')});
    await transporter.sendMail(regEmail(email))

    // if (candidate) {
    //   req.flash('registerError', 'Email already exist');
    //   res.redirect('/auth/login#login');
    // } else {
    //  }
  } catch (e) {
    console.log(e);
  }

})
router.get('/logout', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login#login')
  })

})
router.get('/reset', (req, res) => {
  res.render('auth/reset', {
    title: "Reset password",
    resetError:req.flash('resetError')
  })
})
router.post('/reset', (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        req.flash('resetError', 'Something wrong. Please try again')
        return res.redirect('/auth/reset')
      } else {
        const token = buffer.toString('hex');
        const candidate = await User.findOne({email: req.body.email})

        if (candidate) {
          candidate.resetToken = token,
            candidate.tokenExpire = Date.now() + 60 * 60 * 1000;
          await candidate.save();
          await transporter.sendMail(resetEmail(candidate.email, token));
          res.redirect('/auth/login')

        } else {
          req.flash('resetError', 'Email did not find')
          return res.redirect('/auth/reset')
        }
      }
    })
  } catch (e) {
    console.log(e)
  }
})
router.get('/password:token', (req, res) => {
  const token = req.params.token;
  if (!token) {
    req.flash('resetError', 'Token missed')
    return res.redirect('/auth/login')
  }

  try {
    const user = User.findOne({
      resetToken: token,
      resetTokenExpire: {$gt: Date.now()}
    })

    if (!user) {
      req.flash('resetError', 'User did not found')
      res.redirect('/auth/login')

    } else {
      res.render('auth/password', {
        title: 'Reset password',
        token,
        userId: req.userId.toString(),
        resetError: req.flash('resetError')
      })
    }

  } catch (e) {
    console.log(e);
  }
})

router.post('/password', async (req, res) => {
  const token = req.params.token;
  try {
    const user = User.findOne({
      resetToken: token,
      resetTokenExpire: {$gt: Date.now()},
      _id: req.body.userId
    })

    if (!user) {
      req.flash('resetError', 'Token expire')
      res.redirect('/auth/login')

    } else {
      user.password = await bcrypt.hash(req.body.password, 10);
      user.resetToken = undefined;
      user.resetTokenExpire = undefined;
      await user.save();
      res.redirect('/auth/login')
    }

  } catch (e) {
    console.log(e);
  }
})

module.exports = router
