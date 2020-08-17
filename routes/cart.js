const {Router}=require('express');
const Course=require('../models/course')
const authCheck=require('../middleware/authCheck')
const router=Router();
const {serializeCart,calculateTotalPrice}=require('../helpers/globalMethods')


router.get('/',authCheck,async (req, res) => {
  const user=await req.user.populate('cart.items.courseId').execPopulate();
 const courses=serializeCart(user.cart);
 const totalPrice=calculateTotalPrice(courses);
  res.render('cart',{
    title:'Cart',
    isCart:true,
    courses:courses,
    totalPrice:totalPrice
  })
})

router.delete('/remove/:id',authCheck, async (req,res)=>{
  await req.user.removeFromCart(req.params.id);
  const user= await req.user.populate('cart.items.courseId').execPopulate();
  const courses=serializeCart(user.cart);
  const totalPrice=calculateTotalPrice(courses);

  res.status(200).json({courses:courses,totalPrice:totalPrice});
})

router.post('/add',authCheck,async (req, res) =>{
  const course=await Course.findById(req.body.id);

  await req.user.addToCart(course);

  res.redirect('/cart')
} )

module.exports =router;
