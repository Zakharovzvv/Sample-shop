const {Router} = require('express');
const Course = require('../models/course')
const authCheck=require('../middleware/authCheck')
const {validationResult} = require('express-validator')
const  {addEditCourseValidator}=require('../helpers/validators')
const router = Router();

router.get('/', authCheck,(req, res) => {
  res.render('add', {
    title: 'Add new course',
    isAdd: true,
    addError: req.flash('addError')
  });
});

router.post('/', authCheck,addEditCourseValidator,async (req, res) => {
  const {title, price, url} = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
 //   req.flash('addError', errors.array()[0].msg);
    return res.status(422).render('add', {
      title: 'Add new course',
      isAdd: true,
      addError:errors.array()[0].msg,
      data:{
        title,
        price,
        url
      }
    });

  }

  const course = new Course({title: title, price: price, url: url,userId:req.user});
  try {
    await course.save();
    res.redirect('/courses');

  } catch (e) {
    console.log(e);
  }

})

module.exports = router;
