const {Schema, model} = require('mongoose')

const userSchema = new Schema({
  name:String,
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  resetToken:String,
  tokenExpire:Date,
  avatarUrl:String,
  cart: {
    items: [{
      count: {
        type: Number,
        required: true,
        default: 1
      },
      courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true

      }
    }]
  }
})


userSchema.methods.addToCart = function (course) {
  const items = [...this.cart.items];
  const idx = items.findIndex(item => {
    return item.courseId.toString() === course.id.toString()
  });
  if (idx >= 0) {
    items[idx].count++;
  } else {
    items.push({
      count: 1,
      courseId: course.id
    })
  }
  this.cart = {items};
  return this.save();
}

userSchema.methods.removeFromCart = function (id) {
  let items = [...this.cart.items];
  const idx = items.findIndex(item =>  item.courseId.toString() === id);

  if (idx < 0) {
    console.log(`Element ${id} did not found`)
  } else {
    if (items[idx].count > 1) {
      items[idx].count--;
    } else {
      items=items.filter(item => item.courseId.toString() !== id)
    }
    this.cart = {items};
    return this.save();
  }
}
userSchema.methods.clearCart=function (){
  this.cart={items:[]};
  this.save();
}

module.exports = model('User', userSchema)
