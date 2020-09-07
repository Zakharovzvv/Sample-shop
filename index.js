const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const csrf=require('csurf');
const flash=require('connect-flash')
const sesion=require('express-session');
const MongoStore=require('connect-mongodb-session')(sesion)
const exhbs = require('express-handlebars');
const helmet=require('helmet')
const compression=require('compression');
const homeRoute = require('./routes/home');
const addRoute = require('./routes/add');
const ordersRoute = require('./routes/orders');
const coursesRoute = require('./routes/courses');
const cartRoute = require('./routes/cart');
const loginRoute = require('./routes/auth');
const profileRoute = require('./routes/profile');
const varMiddleware=require('./middleware/variables')
const userMiddleware=require('./middleware/user')
const keys=require('./keys')
const error404Handler=require('./middleware/errors')
const fileMiddleware=require('./middleware/file')


const port = process.env.PORT || 3000;

const app = express();
const hbs = exhbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
  helpers:require('./helpers/hbs-helpers')
});

const store= new MongoStore({
  collection:'sessions',
  uri:keys.MONGODB_URI
})


app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');
// app.use(async (req, res, next) => {
//     try {
//       const user = await User.findById('5f35596d38d9980ce8706628');
//       req.user = user;
//       next();
//     } catch (e) {
//       console.log(e);
//     }
//   }
// )

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.urlencoded({extended: true}));
app.use(sesion({
secret:keys.SECRET_KEY,
  resave:false,
  saveUninitialized:false,
  store
}))

app.use(fileMiddleware.single('avatar'));
app.use(csrf());
app.use(flash());
app.use(varMiddleware);
app.use(userMiddleware);


app.use('/', homeRoute);
app.use('/add', addRoute);
app.use('/courses', coursesRoute);
app.use('/cart', cartRoute);
app.use('/orders', ordersRoute);
app.use('/auth', loginRoute);
app.use('/profile', profileRoute);

app.use(error404Handler);

app.use(helmet());
app.use(compression())

// async function checkUser() {
//   const candidate = await User.findOne();
//   if (!candidate) {
//     const user = new User({
//       name: 'test',
//       email: 'test@test.com',
//       cart: {items: []}
//     })
//     await user.save();
//   }
// }

async function start() {


  try {
    await mongoose.connect(keys.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    })
    //await checkUser();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    })
  } catch (e) {
    console.log(e);
  }

}
start();



