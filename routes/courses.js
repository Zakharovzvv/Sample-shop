const {Router} = require('express');
const Course = require('../models/course')
const authCheck = require('../middleware/authCheck')
const {validationResult} = require('express-validator')
const  {addEditCourseValidator}=require('../helpers/validators')
const router = Router()

function isOwner(course, req) {
  return course.userId.toString() === req.user._id.toString();
}

router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().populate('userId', 'email name').select('price title url id').lean();
    res.render('courses', {
      title: 'All courses',
      isAll: true,
      courses,
      userId: req.user ? req.user._id.toString() : null
    });
  } catch (e) {
    console.log(e);
  }
})

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).lean();

    res.render('course', {
      title: `Course ${course.title}`,
      layout: 'empty',
      course
    })
  } catch (e) {
    console.log(e);
  }
})

router.get('/:id/edit', authCheck, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect('/');
  }
  try {
    const course = await Course.findById(req.params.id).lean();
    if (!isOwner(course, req)) {
      return res.redirect('/courses')
    }
    res.render('course-edit', {
      title: `Edit course ${course.title}`,
      course,
      editError: req.flash('editError')
    })
  } catch (e) {
    console.log(e);

  }

})

router.post('/remove', authCheck, async (req, res) => {
  try {
    await Course.deleteOne({_id: req.body.id});
    console.log(req.body.id);
    res.redirect('/courses');
  } catch (e) {
    console.log(e);
  }
})

router.post('/edit', authCheck,addEditCourseValidator, async (req, res) => {
  const {id} = req.body;
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
      req.flash('editError', errors.array()[0].msg);
    return res.status(422).redirect(`/courses/${id}/edit?allow=true`)
  }

  try {

    delete req.body.id;
    const course = await Course.findById(id);
    if (!isOwner(course, req)) {
      return res.redirect('/courses')
    }
    Object.assign(course,req.body)
    await course.save();
    res.redirect('/courses');
  } catch (e) {
    console.log(e);
  }
})

module.exports = router;
