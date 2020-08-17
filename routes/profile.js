const {Router} = require('express');
const router = Router();
const User = require('../models/user')
const authCheck = require('../middleware/authCheck')

router.get('/', authCheck, (req, res) => {
  res.render('profile', {
    title: 'Profile',
    isProfile: true,
    user: req.user.toObject()
  })
})

router.post('/', authCheck, async (req, res) => {

  try {
    const user = await User.findById(req.user._id)

    const toChange = {
      name: req.body.name
    }
    if (req.file) {
      toChange.avatarUrl = req.file.path
    }

    Object.assign(user, toChange)
    await user.save()
    res.redirect('/profile')
  } catch (e) {
    console.log(e)
  }
})
module.exports = router
