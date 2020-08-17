const {Router} = require('express')
const {serializeCart, calculateTotalPrice} = require('../helpers/globalMethods')
const authCheck=require('../middleware/authCheck')
const router = Router()
const Order=require('../models/order')

router.get('/', authCheck,async (req, res) => {

  try {
    let orders= await Order.find({'user.userId':req.user._id}).populate('user.userId').lean();
   // console.log(orders);
    orders=orders.map((o,index)=>({
      ...o,
      index:index,
       totalPrice: o.courses.reduce((acc,item)=>{
        return acc+=item.course.price*item.count
      },0),

    }));


    res.render('orders', {
      title: 'Orders',
      isOrder: true,
      orders,
      allowedProtoProperties: {
        userId: true,
        email: true
      }
       })
  } catch (e) {
  }
})

router.post('/', authCheck,async (req, res) => {
  try {
    const user = await req.user.populate('cart.items.courseId').execPopulate();
    const courses = user.cart.items.map(item => ({
      count: item.count,
      course: {...item.courseId._doc}
    }));
    const order = new Order({
      user: {
        name: req.user.name,
        userId: req.user
      },
      courses: courses
    })
    await order.save();
    await user.clearCart();
    res.redirect('/orders')
  } catch (e) {
    console.log(e);
  }
})

module.exports = router;
