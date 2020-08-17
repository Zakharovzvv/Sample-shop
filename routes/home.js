const {Router}=require('express');

const router=Router()

router.get('/',(req,res)=> {
  res.render('index', {
    title: 'Courses main page',
    isHome: true
  })
})

module.exports =router;
