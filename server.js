const express = require('express');
const dotenv = require('dotenv');
const morgan = require(`morgan`);
const colors = require(`colors`);
const fileupload = require('express-fileupload');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const cluster = require('cluster');
const bodyParser = require('body-parser');

const connectDb = require(`./config/db`);
const errorHandler = require(`./middleware/error`);

dotenv.config({ path: './config/config.env' });
//require('./services/passport');
const auth = require(`./routes/auth`);
const instructor = require('./routes/instructor');
const student = require('./routes/student');
const category = require('./routes/category');
const question = require('./routes/question');
const answer = require('./routes/answer');
const user = require('./routes/user');
const lesson = require(`./routes/lesson`);
const billing = require(`./routes/billing`);
const passport = require('passport');
const review = require('./routes/review');

// if (cluster.isMaster) {
//   cluster.fork();
//   // cluster.fork();
//   // cluster.fork();
//   // cluster.fork();
// } else {
//Connect to db
connectDb();

const app = express();

//Body parser
app.use(express.json());
app.use(bodyParser.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

app.use(cookieParser());

//Sanitize data
app.use(mongoSanitize());

//Set security headers
app.use(helmet());
// Prevent XSS attacks
app.use(xss());

//Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});

app.use(limiter);

//Prevent http param pollution
app.use(hpp());

// app.use((req, res, next) => {
//   res.append('Access-Control-Allow-Origin', ['*']);
//   res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//   res.append('Access-Control-Allow-Headers', 'Content-Type');
//   next();
// });

//Enable CORS
app.use(
  cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Origin',
      'x-access-token',
      'XSRF-TOKEN'
    ],
    preflightContinue: false
  })
);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());

//Mount routers

app.use(`/api/v1/auth`, auth);
app.use(`/api/v1/instructor`, instructor);
app.use(`/api/v1/student`, student);
app.use(`/api/v1/category`, category);
app.use(`/api/v1/question`, question);
app.use(`/api/v1/answer`, answer);
app.use(`/api/v1/user`, user);
app.use(`/api/v1/lesson`, lesson);
app.use(`/api/v1/billing`, billing);
app.use(`/api/v1/review`, review);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(
  PORT,
  console.log(
    `Server running on in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
      .bold
  )
);

//Handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  //Close server & exit process
  server.close(() => process.exit(1));
});
//}
