const path = require('path');
ObjectId = require('mongodb').ObjectID;

const Question = require(`../models/Question`);
const Answer = require(`../models/Answer`);
const ErrorResponse = require(`../utils/errorResponse`);
const asynchandler = require(`../middleware/async`);

// @desc GetAnswers according to teachers category
//@route GET /api/v1/answer
//@route GET /api/v1/instructor/:bootcampId/courses
// @access Private
exports.getQuestions = asynchandler(async (req, res, next) => {
  const question = await Question.find({}).populate('user').populate('answer');
  let data;

  // await Question.aggregate([
  //   {
  //     $lookup: {
  //       from: 'User', // collection name in db
  //       localField: 'user',
  //       foreignField: '_id',
  //       as: 'user'
  //     }
  //   }
  // ]).exec(function (err, data) {
  //   data = data;
  //   // students contain WorksnapsTimeEntries
  // });
  return res.status(200).json({
    success: true,
    data: question
    // count: question.length,
    // data: question
  });
  // if (req.params.bootcampId) {
  //   const question = await Question.find({ bootcamp: req.params.bootcampId });

  //   return res.status(200).json({
  //     success: true,
  //     count: question.length,
  //     data: question
  //   });
  // } else {
  //   res.status(200).json(res.advancedResults);
  // }
});

// @desc Get single student
// @route GET /api/v1/student/:id
// @access Pulic
// exports.getStudent = asynchandler(async (req, res, next) => {
//   const student = await Student.findById(req.params.id).populate({
//     path: 'user',
//     select: 'name _id'
//   });

//   if (!student) {
//     return next(
//       new ErrorResponse(`No student witht the id of ${req.params.id}`),
//       404
//     );
//   }
//   res.status(200).json({
//     success: true,
//     count: student.length,
//     data: student
//   });
// });

// @desc Answer Question
//@route PUT /api/v1/answer/answerquestion
// @access Private
exports.answerQuestion = asynchandler(async (req, res, next) => {
  console.log(req.user._id);
  req.body.user = req.user._id;
  console.log('coming here');
  console.log(req.user);

  // Make sure user is course owner
  if (req.user.role !== 'teacher') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to add`, 401)
    );
  }

  const answer = await Answer.create({
    description: req.body.description,
    user: req.user._id,
    questionID: req.body.questionID
  });
  console.log(answer);

  const question = await Question.findByIdAndUpdate(
    req.body.questionID,
    { $push: { answer: answer._id } },
    {
      new: true,
      runValidators: true
    }
  );

  console.log(question);
  res.status(200).json({
    success: true,
    data: question,
    answer: answer,
    user: req.user
  });
});

// @desc Update Student
//@route PUT /api/v1/student/:id
// @access Private
// exports.updateStudent = asynchandler(async (req, res, next) => {
//   let student = await Student.find({ _id: req.params.id });

//   if (!student || student.length <= 0) {
//     return next(
//       new ErrorResponse(`No student witht the id of ${req.params.id}`),
//       404
//     );
//   }
//   // Make sure user is course owner
//   if (
//     student[0].user.toString() !== req.user.id &&
//     req.user.role !== 'student'
//   ) {
//     return next(
//       new ErrorResponse(`User ${req.user.id} is not authorized to update`, 401)
//     );
//   }

//   student = await Student.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true
//   });
//   res.status(200).json({
//     success: true,
//     data: student
//   });
// });

// @desc Delete course
//@route Delete /api/v1/courses/:id
// @access Private
// exports.deleteCourse = asynchandler(async (req, res, next) => {
//   const course = await Course.findById(req.params.id);

//   if (!course) {
//     return next(
//       new ErrorResponse(`No course witht the id of ${req.params.bootcampId}`),
//       404
//     );
//   }
//   // Make sure user is course owner
//   if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
//     return next(
//       new ErrorResponse(
//         `User ${req.user.id} is not authorized to delete course ${course._id}`,
//         401
//       )
//     );
//   }

//   await course.remove();
//   res.status(200).json({
//     success: true,
//     data: {}
//   });
// });
