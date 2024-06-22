import cors from "cors";
import db from "./connect.js";
import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
// import multer from 'multer';
import cookieParser from "cookie-parser";
import session from "express-session";

const app = express();
app.use(cookieParser());

app.use(express.json());
// app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3002'],
    methods: ["GET,POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(
  session({
    secret: "amar",
    saveUninitialized: true,
    resave: false,
  })
);
const getDateString = (dateString) => {
  const dd = String(dateString.getDate()).padStart(2, "0");
  const mm = String(dateString.getMonth() + 1).padStart(2, "0"); //January is 0!
  const yyyy = dateString.getFullYear();
  return yyyy + "-" + mm + "-" + dd;
  };

// function getDate(){
//   const today = new Date();
// const formatDate = today.toISOString().split('T')[0];
// console.log(formatDate);
// return formatDate;

// }

function getDate() {
  const today = new Date();
  // Convert to Sri Lanka time zone
  const sriLankaDate = new Date(today.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }));
  const formatDate = sriLankaDate.toISOString().split('T')[0];
  console.log(formatDate);
  return formatDate;
}

app.get("/", (req, res) => {
  res.send("hi");
});



//get All users
app.get("/api/users", (req, res) => {
  const sqlInsert2 = "select * from user;";

  db.query(sqlInsert2, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});


//signup or register
app.post("/api/signup", (req, res) => {
  const data = req.body.data;
  console.log(data);

  const sqlCheckEmail = "SELECT * FROM user WHERE email = ?;";
  const sqlCheckUsername = "SELECT * FROM user WHERE username = ?;";
  const role = "Student";

  // Check if email is already taken
  db.query(sqlCheckEmail, [data.email], (errEmail, resultEmail) => {
    if (errEmail) {
      console.log(errEmail);
    } else {
      if (resultEmail[0]) {
        res.send({ msg: "Email is already taken" });
      } else {
        // Check if username is already taken
        db.query(sqlCheckUsername, [data.username], (errUsername, resultUsername) => {
          if (errUsername) {
            console.log(errUsername);
          } else {
            if (resultUsername[0]) {
              res.send({ msg: "Username is already taken" });
            } else {
              // Neither email nor username is taken, proceed with registration
              const sqlInsertUser =
                "INSERT INTO user (email, name, password,role, state, username) VALUES (?, ?, ?, ?, ?,?);";
              db.query(
                sqlInsertUser,
                [data.email, data.name, data.password, role, "ACTIVE", data.username],
                (errInsert, resultInsert) => {
                  if (errInsert) {
                    console.log(errInsert);
                  } else {
                    res.send({ email: data.email, role: data.role });
                    console.log(resultInsert);
                  }
                }
              );
            }
          }
        });
      }
    }
  });
});




//get User by email and password
app.get("/api/user/:email/:password", (req, res) => {
  console.log(req.params.email);
  const email = req.params.email;
  const password = req.params.password;
  console.log(email);
  const sqlInsert2 = "select * from user where email =? AND password=?;";

  db.query(sqlInsert2,[email,password], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//get User by email and password for teacher or admin
app.get("/api/userA/:email/:password", (req, res) => {
  console.log(req.params.email);
  const email = req.params.email;
  const password = req.params.password;
  console.log(email);

  const sqlQuery = "SELECT user.*,teacher.verified as verified FROM user Left join teacher on user.id = teacher.user_id WHERE email = ? AND password = ? AND (role = 'teacher' OR role = 'admin')";

  db.query(sqlQuery, [email, password], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error retrieving user data.");
    } else {
      // Check if any user records are found
      if (result.length === 0) {
        // No user found with provided email, password, and role 'teacher' or 'admin'
        res.status(401).send("Unauthorized: Invalid email or password");
      } else {
        // User found, check if the role is 'teacher' and verified
        const user = result[0];
        console.log(user);
        if (user.role == 'Teacher' && user.verified == 0) {
          res.status(403).send("Forbidden: You're not yet verified as a teacher.");
        } else {
          // Authorized user
          res.status(200).send(result);
        }
      }
    }
  });
});

//get User count
app.get("/api/userCount", (req, res) => {
  const sqlInsert2 = "select count(id) as userCount from user;";

  db.query(sqlInsert2, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});



//get Course count
app.get("/api/CourseCount", (req, res) => {
  const sqlInsert2 = "select count(id) as courseCount from course;";

  db.query(sqlInsert2, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});


//get Student count
app.get("/api/studentCount", (req, res) => {
  const sqlInsert2 = "select count(id) as studentCount from user where role = 'student';";

  db.query(sqlInsert2, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});


//get Teacher count
app.get("/api/teacherCount", (req, res) => {
  const sqlInsert2 = "select count(id) as teacherCount from teacher;";

  db.query(sqlInsert2, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//make user inactive
app.put("/api/userInactive", (req, res) => {
  const data = req.body.data; // send data as data: blah blah blah
  
  const sqlInsert1 = "update user set state='INACTIVE'  where id=?;";
  db.query(sqlInsert1, [data.user_id], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});

//get student info
app.get("/api/students", (req, res) => {
  const sqlInsert2 = "select * from user where role='Student';";

  db.query(sqlInsert2, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});


//get teacher info
app.get("/api/teachers", (req, res) => {
  const sqlInsert2 = "SELECT user.*, teacher.* FROM user JOIN teacher ON user.id = teacher.user_id WHERE user.role = 'Teacher';";

  db.query(sqlInsert2, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});



//verify teacher
app.put("/api/verifyTeacher/:id", (req, res) => {
  const id = req.params.id;
  
  const sqlInsert1 = "update teacher set verified=1  where id=?;";
  db.query(sqlInsert1, [id], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});

//get All Courses
app.get("/api/allCourses", (req, res) => {
  const sqlInsert2 = "select course.*,user.name from course Inner join teacher on course.teacher_id=teacher.id Inner Join user on teacher.user_id=user.id;";

  db.query(sqlInsert2, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

app.get("/api/allCoursesV1", (req, res) => {
  let sqlQuery = "SELECT course.*, user.name,( SELECT AVG(rating) FROM rating  WHERE rating.course_id = course.id  ) AS avg_rating, (Select Count(*) FROM enrolment where enrolment.course_id =course.id) AS enrolmentCount,( SELECT Count(rating) FROM rating  WHERE rating.course_id = course.id  ) AS ratingCount FROM course INNER JOIN teacher ON course.teacher_id = teacher.id INNER JOIN user ON teacher.user_id = user.id";

  // Extract query parameters from the request object
  const { subject, language, sortBy, searchTerm } = req.query;

  // Construct the WHERE clause based on the selected dropdown values
  let whereClause = [];
  if (subject && subject !== 'all') {
    whereClause.push(`course.subject = '${subject}'`);
  }
  if (language && language !== 'all') {
    whereClause.push(`course.language = '${language}'`);
  }

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  whereClause.push(`SUBSTRING(course.updated_date, 1, 4) IN ('${currentYear}', '${previousYear}')`);

  if (searchTerm) {
    whereClause.push(`(course.title LIKE '%${searchTerm}%' OR course.subject LIKE '%${searchTerm}%' OR course.language LIKE '%${searchTerm}%')`);
  }

  // Add the WHERE clause to the SQL query if any filters are applied
  if (whereClause.length > 0) {
    sqlQuery += " WHERE " + whereClause.join(" AND ");
  }

  // Append the ORDER BY clause based on the selected sorting option
  if (sortBy === "lowest") {
    sqlQuery += " ORDER BY course.amount ASC";
  } else if (sortBy === "highest") {
    sqlQuery += " ORDER BY course.amount DESC";
  } else if (sortBy === "toprated") {
    sqlQuery += " ORDER BY avg_rating DESC";
  } 
  else if (sortBy === "popular") {
    sqlQuery += " ORDER BY enrolmentCount DESC";
  } else {
    // Default sorting by course ID or any other default criteria
    sqlQuery += " ORDER BY course.id DESC";
  }

  // Execute the constructed SQL query
  db.query(sqlQuery, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//get All recent Courses
app.get("/api/raddCourses", (req, res) => {
  const sqlInsert2 = "select course.*,user.name from course Inner join teacher on course.teacher_id=teacher.id Inner Join user on teacher.user_id=user.id ORDER BY course.id DESC LIMIT 3;";

  db.query(sqlInsert2, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});


//get All pouplar Courses
app.get("/api/mostEnroled", (req, res) => {
  const sqlInsert2 = " Select (Select Count(*) FROM enrolment where enrolment.course_id =course.id) AS enrolmentCount ,course.*,user.name from course Inner join teacher on course.teacher_id=teacher.id Inner Join user on teacher.user_id=user.id WHERE STR_TO_DATE(course.updated_date, '%Y-%m-%d') >= DATE_SUB(NOW(), INTERVAL 2 YEAR) ORDER BY enrolmentCount DESC LIMIT 4;";

  db.query(sqlInsert2, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//get CourseCount for a teacher
app.get("/api/courseForTeacher/:id", (req, res) => {
  const id = req.params.id;
  const sqlInsert2 = "select count(course.id) as courseCount from course Inner join teacher on course.teacher_id=teacher.id Inner Join user on teacher.id=user.id  where teacher.user_id = ? ;";

  db.query(sqlInsert2,[id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//get All Courses For a Teacher
app.get("/api/allcoursesForTeacher/:id", (req, res) => {
  const id = req.params.id;
  const sqlInsert2 = "SELECT course.*, user.name,( SELECT AVG(rating) FROM rating  WHERE rating.course_id = course.id  ) AS avg_rating,( SELECT Count(rating) FROM rating  WHERE rating.course_id = course.id  ) AS ratingCount, (Select Count(*) FROM enrolment where enrolment.course_id =course.id) AS enrolmentCount FROM course INNER JOIN teacher ON course.teacher_id = teacher.id INNER JOIN user ON teacher.user_id = user.id where teacher.user_id = ?;";

  db.query(sqlInsert2,[id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});
//add course
app.post("/api/addCourse", (req, res) => {
  const data = req.body.data; // send data as data: blah blah blah
  // console.log(req);
  const formattedDate = getDate();
  console.log(data);
  const sqlInsert1 = "insert into course (title,amount, description,language, state,subject, updated_date, teacher_id, credits,hours, img_path ) values (?,?,?,?,?,?,?,?,?,?,?);";
  db.query(sqlInsert1, [data.title, 
    data.amount, data.description, data.language,"ACTIVE",data.subject, 
    formattedDate,data.teacher_id,data.credits, data.hours, data.img_path], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});

//edit Course
app.put("/api/editCourse", (req, res) => {
  const data = req.body.data; // send data as data: blah blah blah
  // console.log(req);
  const formattedDate = getDate();

  const sqlInsert1 = "update course set title=? ,amount=?, description=?,language=?, state=?,subject=?, updated_date=?, teacher_id=?, credits= ?,hours=?, img_path=? where id=?;";
  db.query(sqlInsert1, [data.title, 
    data.amount, data.description, data.language,"ACTIVE",data.subject, 
    formattedDate,data.teacher_id,data.credits, data.hours, data.img_path, data.course_id], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});

//delete course
// delete course
app.delete("/api/deleteCourse/:id", (req, res) => {
  const courseId = req.params.id;

  // Check if there are any enrollments for the course
  const sqlCheckEnrollments = "SELECT COUNT(*) AS numEnrollments FROM enrolment WHERE course_id = ?";

  db.query(sqlCheckEnrollments, [courseId], (err, enrollmentResult) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error checking enrollments.");
    } else {
      const numEnrollments = enrollmentResult[0].numEnrollments;

      // If there are no enrollments, delete the course
      if (numEnrollments === 0) {
        const sqlDeleteCourse = "DELETE FROM course WHERE id = ?";

        db.query(sqlDeleteCourse, [courseId], (deleteErr, deleteResult) => {
          if (deleteErr) {
            console.log(deleteErr);
            res.status(500).send("Error deleting course.");
          } else {
            res.status(200).send("Course deleted successfully.");
            console.log("Course deleted successfully.");
          }
        });
      } else {
        res.status(403).send("Cannot delete course with existing enrolments.");
      }
    }
  });
});



//get a specific Course
app.get("/api/course", (req, res) => {
  const data =  req.body.data;
  const sqlInsert2 = "select course.*,user.name from course,teacher,user where course.teacher_id=teacher.id  and teacher.user_id= user.id and course.id=? ;";

  db.query(sqlInsert2,[data.course_id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//save Enrolment
app.post("/api/saveEnrolment", (req, res) => {
  const data = req.body.data;
  console.log(req);
  const formattedDate = getDate();

  const sqlInsert2 =
    "insert into enrolment (enroled_date, course_id,user_id) values (?,?,?);";

  db.query(
    sqlInsert2,
    [
      formattedDate,
      data.course_id,
      data.user_id,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});

//edit Enrolment
app.put("/api/ediEnrolment", (req, res) => {
  const data = req.body.data;
  console.log(req);
  const formattedDate = getDate();

  const sqlInsert2 =
    "update enrolment set enroled_date = ? , course_id = ?, user_id= ? where id= ?;";

  db.query(
    sqlInsert2,
    [
      formattedDate,
      data.course_id,
      data.user_id,
      data.enrolment_id
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});


//get All Enrolments
app.get("/api/getAllEnrolments", (req, res) => {
  const sqlInsert2 = "select course.title,course.id,user.name as tname,user.id as tId,enrolment.enroled_date,s.name as sname,s.id as sId from enrolment left join course on course.id= enrolment.course_id Inner join teacher on course.teacher_id=teacher.id Inner Join user on teacher.user_id=user.id Inner Join user as s on enrolment.user_id = s.id;";

  db.query(sqlInsert2, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//get All enrolments for a user
app.get("/api/enrolmentForUser", (req, res) => {
  const user_id = req.query.user_id;
  const sqlInsert2 = "select course.*,user.name from course Inner join enrolment on course.id= enrolment.course_id Inner join teacher on course.teacher_id=teacher.id Inner Join user on teacher.user_id=user.id where course.id=enrolment.course_id and enrolment.user_id=?;";

  db.query(sqlInsert2,[user_id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//get All enrolments for a course
app.get("/api/enrolmentForTeacher/:id", (req, res) => {
  const user_id = req.params.id;
  const sqlInsert2 = "select course.*,user.name from course Inner join enrolment on course.id= enrolment.course_id Inner join teacher on course.teacher_id=teacher.id Inner Join user on teacher.user_id=user.id where teacher.user_id=?;";

  db.query(sqlInsert2,[user_id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//get All enrolment Count for a user
app.get("/api/enrolmentCountForTeacher/:id", (req, res) => {
  const id = req.params.id;
  const sqlInsert2 = "select count(enrolment.id) as studentCount from course Inner join enrolment on course.id= enrolment.course_id Inner join teacher on course.teacher_id=teacher.id Inner Join user on teacher.user_id=user.id where teacher.user_id=?;";

  db.query(sqlInsert2,[id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//get All enrolments for a course
app.get("/api/enrolmentForCourse", (req, res) => {
  const data = req.body.data;
  const sqlInsert2 = "select user.* from user,enrolment where user.id=enrolment.user_id and enrolment.course_id=?;";

  db.query(sqlInsert2,[data.course_id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//get enrolments for a user and course
app.post("/api/enrolmentForCourseByUser", (req, res) => {
  const data = req.body.data;
  const sqlInsert2 = "select count(1) from enrolment where course_id =? and user_id=?;";

  db.query(sqlInsert2,[data.course_id,data.user_id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//get number of enrolments for a course
app.get("/api/countEnrolmentForCourse", (req, res) => {
  const courseId = req.query.id;
  const sqlInsert2 = "select count(user.id) as userCount  from user,enrolment where user.id=enrolment.user_id and enrolment.course_id=?;";

  db.query(sqlInsert2,[courseId], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//add a course to wishlist
app.post("/api/addToWishlist", (req,res) =>{
const data = req.body.data;

const sqlInsert = "Insert into wishlist(course_id,user_id) values (?,?)" ;

db.query(sqlInsert,[data.course_id, data.user_id], (err, result) => {
  if (err) {
    console.log(err);
  } else {
    res.send(result);
    console.log(result);
  }
});
});


//get Wishlist for user
app.get("/api/wishlistCourses/:id", (req, res) => {
  const id = req.params.id;
  const sqlInsert2 = "select course.*,user.name from course Inner join teacher on course.teacher_id=teacher.id Inner Join user on teacher.user_id=user.id Inner join wishlist on wishlist.course_id = course.id where wishlist.user_id =?;";

  db.query(sqlInsert2,[id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//get Wishlist for user for a course
app.post("/api/wishlistCourseForUser", (req, res) => {
  const data = req.body.data;
  const sqlInsert2 = "select * from wishlist where wishlist.course_id = ? and wishlist.user_id =?;";

  db.query(sqlInsert2,[data.course_id,data.user_id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});


//delete Wishlist for user
app.delete("/api/deleteWishlistCourse/:id/:user_id", (req, res) => {
  const id = req.params.id;
  const user_id = req.params.user_id;
  const sqlInsert2 = "delete  from  wishlist where course_id= ? and user_id= ?;";

  db.query(sqlInsert2,[id,user_id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//add rating for a course by a user
// app.post("/api/courseratingByUser", (req,res) =>{
//   const data = req.body.data;
//   const formattedDate = getDate();
  
//   const sqlInsert = "Insert into rating(course_id,user_id,description,level,date_added) values (?,?,?,?,?)" ;
  
//   db.query(sqlInsert,[data.course_id, data.user_id, data.description,data.level,formattedDate], (err, result) => {
//     if (err) {
//       console.log(err);
//     } else {
//       res.send(result);
//       console.log(result);
//     }
//   });
//   });


//add rating for a course by a user
app.post("/api/courseratingByUser", (req, res) => {
  const data = req.body.data;
  const formattedDate = getDate();

  // Check if the user has already rated the course
  const sqlSelect = "SELECT * FROM rating WHERE course_id = ? AND user_id = ?";
  db.query(sqlSelect, [data.course_id, data.user_id], (err, rows) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    } else {
      if (rows.length > 0) {
        // User has already rated this course
        res.status(400).send("You have already rated this course");
      } else {
        // User has not rated this course; proceed with inserting the new rating
        const sqlInsert =
          "INSERT INTO rating (course_id, user_id, comment, rating, date_added) VALUES (?, ?, ?, ?, ?)";
        db.query(
          sqlInsert,
          [data.course_id, data.user_id, data.comment, data.rating, formattedDate],
          (insertErr, result) => {
            if (insertErr) {
              console.log(insertErr);
              res.status(500).send("Internal Server Error");
            } else {
              res.send(result);
              console.log(result);
            }
          }
        );
      }
    }
  });
});


//get all ratings for a course
app.get("/api/getRatingForCourse/:id", (req, res) => {
  // const data = req.body.data;
  const id = req.params.id;
  const sqlInsert2 = "select rating.id,rating.rating,rating.comment,rating.date_added,user.name from rating  left join course on rating.course_id = course.id left join user on rating.user_id = user.id where course.id=?;";

  db.query(sqlInsert2,[id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});


//add advertisement
app.post("/api/addAdvertisement", (req,res) =>{
  const data = req.body.data;
  const formattedDate = getDate();
  const datePaid = data.state === 'Paid' ? formattedDate : null;
  const sqlInsert = "Insert into advertisement(img_path,city,description,email,language,mobile,name,subject,type,state,mode,course_fee,verified,date_added,date_paid) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)" ;
  
  db.query(sqlInsert,[data.img_path, data.city,data.description,data.email,data.language,data.mobile,data.name,data.subject,data.type,data.state,data.course_fee,data.mode,0,formattedDate,datePaid], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
  });
  
  //verify ad
app.put("/api/verifyAd/:id", (req, res) => {
  const id = req.params.id;
  
  const sqlInsert1 = "update advertisement set verified=1  where id=?;";
  db.query(sqlInsert1, [id], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});

//get All advertisements
app.get("/api/getAllAdvertisement", (req, res) => {
  const sqlInsert2 = "select * from advertisement WHERE state = 'Paid';";

  db.query(sqlInsert2,[], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//get All premium advertisements
app.get("/api/getAllPrAdvertisement", (req, res) => {
  const sqlInsert2 = "select * from advertisement WHERE state = 'Paid' AND verified = 1 AND type = 'Premium' Order By date_added DESC ;";

  db.query(sqlInsert2,[], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});


//get All advertisements
app.get("/api/getAllAds", (req, res) => {
  const sqlInsert2 = "select * from advertisement;";

  db.query(sqlInsert2,[], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//get All verified and paid advertisements 
app.get("/api/getAllAdvertisements", (req, res) => {
  let sqlQuery = "SELECT * from advertisement WHERE state = 'Paid' AND verified = 1 ";

  // Extract query parameters from the request object
  const { subject, language, city,mode,courseFee } = req.query;

  // Construct the WHERE clause based on the selected dropdown values
  let whereClause = [];
  if (subject && subject !== 'all') {
    whereClause.push(`advertisement.subject = '${subject}'`);
  }
  if (language && language !== 'all') {
    whereClause.push(`advertisement.language = '${language}'`);
  }
  if (city && city != 'Any') {
    whereClause.push(`advertisement.city = '${city}'`);
  }
  if(mode && mode !='all'){
    whereClause.push(`advertisement.mode = '${mode}'`);
  }


  // if (searchTerm) {
  //   whereClause.push(`(course.title LIKE '%${searchTerm}%' OR course.subject LIKE '%${searchTerm}%' OR course.language LIKE '%${searchTerm}%')`);
  // }

  // Add the WHERE clause to the SQL query if any filters are applied
  if (whereClause.length > 0) {
    sqlQuery +=  " AND " + whereClause.join(" AND ");
  }

  // // Append the ORDER BY clause based on the selected sorting option
  if (courseFee === "lowest") {
    sqlQuery += " ORDER BY advertisement.course_fee ASC";
  } else if (courseFee === "highest") {
    sqlQuery += " ORDER BY advertisement.course_fee DESC";
  // } else if (sortBy === "toprated") {
  //   sqlQuery += " ORDER BY avg_rating DESC";
  // } 
  // else if (sortBy === "popular") {
  //   sqlQuery += " ORDER BY enrolmentCount DESC";
  } else {
    // Default sorting by course ID or any other default criteria
    sqlQuery += " ORDER BY advertisement.id DESC";
  }

  // Execute the constructed SQL query
  db.query(sqlQuery, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//get Advertisment for an ad type
app.get("/api/getAdvertisement", (req, res) => {
  const data = req.body.data;
  const sqlInsert2 = "select * from advertisement  where type=? and state='paid';";

  db.query(sqlInsert2,[data.type], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});


//edit advertisement
app.put("/api/editAd", (req, res) => {
  const data = req.body.data; // send data as data: blah blah blah
  console.log('kxkkx',data);
  const formattedDate = getDate();
  const datePaid = data.state == 'Paid' ? (data.date_paid == '' ? formattedDate : data.date_paid ): null;
  const sqlInsert1 = "update advertisement set img_path=? ,city=?, description=?,email=?, language=?, mobile=?,name=?, subject=?,type=?, state=?,date_paid=?  where id=?;";
  db.query(sqlInsert1, [data.img_path, 
    data.city, data.description, data.email,data.language,data.mobile,data.name,data.subject, 
    data.type,data.state,datePaid,data.id], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});



//delete advertisement
app.delete("/api/deleteAd", (req, res) => {
  const data = req.body.data;
  const sqlInsert2 = "delete  from  advertisement where id= ?;";

  db.query(sqlInsert2,[data.id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//get all doubts for group
app.get("/api/getAllDoubts", (req,res) =>{
  const id = req.query.group_id;
  
  const sqlInsert = "Select doubt.*,user.name from doubt Inner join user on doubt.user_id = user.id where group_id = ?" ;
  
  db.query(sqlInsert,[id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
  });

  //get all doubts for group
app.get("/api/getAllGroupsDoubts", (req,res) =>{

  const sqlInsert = "Select doubt.*,user.name, (Select name from groups where id = doubt.group_id) AS groupName, (Select name from user where id = doubt.user_id) AS postedBy  from doubt Inner join user on doubt.user_id = user.id " ;
  
  db.query(sqlInsert,[], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
  });


//add doubt
app.post("/api/addDoubt", (req,res) =>{
  const data = req.body.data;
  
  const sqlInsert = "Insert into doubt(description,img_path,topic,user_id,group_id) values (?,?,?,?,?)" ;
  
  db.query(sqlInsert,[data.description, data.img_path,data.topic,data.user_id,data.group_id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
  });

//edit doubt
app.put("/api/editDoubt", (req, res) => {
  const data = req.body.data; // send data as data: blah blah blah
  
  const sqlInsert1 = "update doubt set description=?, img_path=? ,city=?, topic=?  where id=?;";
  db.query(sqlInsert1, [data.description,data.img_path, 
    data.city,data.city,data.topic,data.id], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});

//report a doubt
app.post("/api/reportOrLikeDoubt", (req, res) => {
  const data = req.body.data;

  // Check if there is already an existing row with the given answer_id and user_id
  const sqlCheck = "SELECT * FROM answer_report WHERE answer_id = ? AND user_id = ?";
  db.query(sqlCheck, [data.answer_id, data.user_id], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }

    if (rows.length > 0) {
      // If a row exists, update it
      const sqlUpdate = "UPDATE answer_report SET reason = ?, isLiked = ? WHERE answer_id = ? AND user_id = ?";
      db.query(sqlUpdate, [data.reason, data.isLiked, data.answer_id, data.user_id], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Internal Server Error");
        }
        console.log("Row updated:", result);
        res.send(result);
      });
    } else {
      // If no row exists, insert a new row
      const sqlInsert = "INSERT INTO answer_report (answer_id, reason, isLiked, user_id) VALUES (?, ?, ?, ?)";
      db.query(sqlInsert, [data.answer_id, data.reason, data.isLiked, data.user_id], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Internal Server Error");
        }
        console.log("New row inserted:", result);
        res.send(result);
      });
    }
  });
});


//get report doubt details for answer
app.get("/api/reportOrLikeDoubtForUser/:id", (req, res) => {
  const id = req.params.id;
  const sqlInsert2 = "Select * from answer_report left join user on user.id=answer_report.user_id where answer_id = ? AND reason IS NOT NULL AND reason !='';";

  db.query(sqlInsert2,[id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//get report doubt details for answer
app.get("/api/likeCountForAnswer/:id", (req, res) => {
  const id =  req.params.id;
  const sqlInsert2 = "Select count(id) from answer_report where answer_id = ?;";

  db.query(sqlInsert2,[id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});


// //get report doubt details for answer
// app.post("/api/likeAnswer", (req, res) => {
//   const id =  req.body.data;
//   const sqlInsert2 = "insert into  answer_report(answer_id,reason,isLiked,user_id) values (?,?,?,?) where answer_id = ?;";

//   db.query(sqlInsert2,[id], (err, result) => {
//     if (err) {
//       console.log(err);
//     } else {
//       res.send(result);
//       console.log(result);
//     }
//   });
// });

//deleteDoubt
app.delete("/api/deleteDoubt/:id", (req, res) => {
  const doubtId = req.params.id;
  const sqlCheckAnswers = "SELECT COUNT(*) AS numAnswers FROM answer WHERE doubt_id = ?";
  db.query(sqlCheckAnswers, [doubtId], (err, answerResult) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error checking answers.");
    } else {
      const numAnswers = answerResult[0].numAnswers;


      if (numAnswers === 0) {
        const sqlDeleteDoubt = "DELETE FROM doubt WHERE id = ?";

        db.query(sqlDeleteDoubt, [doubtId], (deleteErr, deleteResult) => {
          if (deleteErr) {
            console.log(deleteErr);
            res.status(500).send("Error deleting course.");
          } else {
            res.status(200).send("Doubt deleted successfully.");
            console.log("Doubt deleted successfully.");
          }
        });
      } else {
        res.status(403).send("Cannot delete doubt with existing answers.");
      }
    }
  });
});

//get answer for doubt
app.get("/api/getAllAnswersForDoubt", (req,res) =>{
  const doubt_id = req.query.doubt_id;
  const user_id = req.query.user_id;
  const sqlInsert = "Select answer.*,user.name,(Select count(id) from answer_report where answer_id = answer.id AND isliked = 1) AS likeCount, "
  + " (SELECT answer_report.isLiked  FROM answer_report WHERE answer_id = answer.id AND user_id = ?) AS isLiked, "
  + " ( SELECT answer_report.reason FROM answer_report WHERE answer_id = answer.id AND user_id = ? ) AS reason from answer Inner join doubt on answer.doubt_id = doubt.id Inner join user on answer.user_id = user.id where answer.doubt_id = ?" ;
  
  db.query(sqlInsert,[user_id,user_id,doubt_id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
  });


//add answer
app.post("/api/addAnswer", (req,res) =>{
  const data = req.body.data;
  
  const sqlInsert = "Insert into answer(description,img_path,voice_path,user_id,doubt_id) values (?,?,?,?,?)" ;
  
  db.query(sqlInsert,[data.description, data.img_path,data.voice_path,data.user_id,data.doubt_id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
  });

//edit answer
app.put("/api/editAnswer", (req, res) => {
  const data = req.body.data; // send data as data: blah blah blah
  
  const sqlInsert1 = "update answer set description=?, img_path=? ,city=?, voice_path=?  where id=?;";
  db.query(sqlInsert1, [data.description,data.img_path, 
    data.city,data.city,data.topic,data.id], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});


//delete Answer
app.delete("/api/deleteAnswer/:id", (req, res) => {
  const answerId = req.params.id;
  const sqlCheckReports = "SELECT COUNT(*) AS numAnswerReports FROM answer_report WHERE answer_id = ?";
  db.query(sqlCheckReports, [answerId], (err, answerResult) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error checking answers.");
    } else {
      const numAnswers = answerResult[0].numAnswerReports;


      if (numAnswers === 0) {
        const sqlDeleteAnswer = "DELETE FROM answer WHERE id = ?";

        db.query(sqlDeleteAnswer, [answerId], (deleteErr, deleteResult) => {
          if (deleteErr) {
            console.log(deleteErr);
            res.status(500).send("Error deleting answer.");
          } else {
            res.status(200).send("Answer deleted successfully.");
            console.log("Answer deleted successfully.");
          }
        });
      } else {
        res.status(403).send("Cannot delete answer with existing reports.");
      }
    }
  });
});


//Get all groups
app.get("/api/getAllGroups", (req, res) => {
  const sqlInsert2 = "select * from groups;";
  db.query(sqlInsert2, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});
//GroupMemberCount
app.get("/api/getGroupCountByGroupId", (req, res) => {
  const group_id = req.query.group_id;
  console.log(group_id);
  const sqlInsert2 = "select count(id) as groupCount from group_user where group_id =?;";
  db.query(sqlInsert2,[group_id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//create group
app.post("/api/createGroup", (req,res) =>{
  const data = req.body.data;
  
  const sqlInsert = "Insert into groups(name,img_path) values (?,?)" ;
  
  db.query(sqlInsert,[data.name,data.img_path], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
  });

//Join Group
app.post("/api/joinGroup", (req,res) =>{
  const data = req.body.data;
  
  const sqlInsert = "Insert into group_user(group_id,user_id) values (?,?)" ;
  
  db.query(sqlInsert,[data.group_id,data.user_id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
  });

  //get Group for a user_id
  app.get("/api/getGroupByUserId", (req, res) => {
    const user_id = req.query.user_id;
    const sqlInsert2 = "select * from group_user  where user_id=?";
    db.query(sqlInsert2,[user_id], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    });
  });


//edit group
app.put("/api/editGroup", (req, res) => {
  const data = req.body.data; // send data as data: blah blah blah
  
  const sqlInsert1 = "update groups set name=?, img_path=?  where id=?;";
  db.query(sqlInsert1, [data.name,data.img_path,data.group_id], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});


//deleteGroup
app.delete("/api/deleteGroup/:id", (req, res) => {
  const id = req.params.id;
  const sqlInsert2 = "delete  from  groups where id= ?;";

  db.query(sqlInsert2,[id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//getSubtopic by courseId
app.get("/api/subTopicbyCourseId/:id", (req, res) => {
  const id = req.params.id;
  const sqlInsert2 = "select sub_topic.* from sub_topic where course_id =? ;";

  db.query(sqlInsert2,[id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//get All Sub topic
app.get("/api/subTopic", (req, res) => {
  const sqlInsert2 = "select sub_topic.*,course.title as courseName   from sub_topic Inner join course on course.id=sub_topic.course_id;";

  db.query(sqlInsert2, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//get All Sub topic For all Courses for 1 teacher
app.get("/api/subTopicForTeacher/:id", (req, res) => {
  const id = req.params.id;
  const sqlInsert2 = "select sub_topic.*,course.title as courseName,course.id   from sub_topic Inner join course on course.id=sub_topic.course_id Inner join teacher on teacher.id = course.teacher_id where teacher.user_id = ?;";

  db.query(sqlInsert2,[id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//deleteEnrolment
app.delete("/api/deleteEnrolment/:id", (req, res) => {
  const id = req.params.id;
  const sqlInsert2 = "delete  from  enrolment where id= ?;";

  db.query(sqlInsert2,[id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//add subtopic
app.post("/api/addSubtopic", (req,res) =>{
  const data = req.body.data;
  
  const sqlInsert = "Insert into sub_topic(title,description,file_path,file_type,course_id) values (?,?,?,?,?)" ;
  
  db.query(sqlInsert,[data.title,data.description,data.file_path,data.file_type,data.course_id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
  });


//edit subtopic
app.put("/api/editSubtopic", (req, res) => {
  const data = req.body.data; // send data as data: bla h blah blah
  
  const sqlInsert1 = "update sub_topic set title=?, description = ?, file_path=?, file_type=? where id=?;";
  db.query(sqlInsert1, [data.title,data.description,data.file_path,data.file_type, data.subtopic_id], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});


//deleteSubtopic
app.delete("/api/deleteSubtopic/:id", (req, res) => {
  const id = req.params.id;
  const sqlInsert2 = "delete  from  sub_topic where id= ?;";

  db.query(sqlInsert2,[id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//delete student
app.delete("/api/student/:id", (req, res) => {
  const id = req.params.id;

  // Check if the student is enrolled in any course
  const checkEnrollmentQuery = "SELECT * FROM enrolment WHERE user_id = ?";
  db.query(checkEnrollmentQuery, [id], (err, enrollmentResult) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error checking enrollment status");
      return;
    }

    if (enrollmentResult.length > 0) {
      res.status(400).send("Student is enrolled in one or more courses. Please unenroll the student from all courses before deleting their account.");
      return;
    }

    const deleteUserQuery = "DELETE FROM user WHERE id = ?";
    db.query(deleteUserQuery, [id], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error deleting user");
        return;
      }
      res.send(result);
      console.log(result);
    });
  });
});

//delete teacher
app.delete("/api/teacher/:id/:userId", (req, res) => {
  const teacherId = req.params.id;
  const userId = req.params.userId;

  // Check if the teacher has any courses associated with them
  const checkCoursesQuery = "SELECT * FROM course WHERE teacher_id = ?";
  db.query(checkCoursesQuery, [teacherId], (err, courseResult) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error checking courses");
      return;
    }

    // If there are courses associated with the teacher, send an error response
    if (courseResult.length > 0) {
      res.status(400).send("Teacher has one or more courses associated with them. Please delete all courses associated with this teacher before deleting the teacher's account.");
      return;
    }

    // If no courses are associated, proceed with deleting the teacher
    const deleteUserQuery = "DELETE FROM teacher WHERE user_id = ?";
    db.query(deleteUserQuery, [userId], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error deleting teacher");
        return;
      }
      // If the teacher is successfully deleted, delete the corresponding user from the user table
      const deleteRelatedUserQuery = "DELETE FROM user WHERE id = ?";
      db.query(deleteRelatedUserQuery, [userId], (err, userResult) => {
        if (err) {
          console.log(err);
          res.status(500).send("Error deleting related user");
          return;
        }
        // Send a success response if both deletions were successful
        res.send({ teacherResult: result, userResult });
        console.log("Teacher and related user deleted successfully");
      });
    });
  });
});




// //create teacher
// app.post("/api/createTeacher", (req,res) =>{
//   const data = req.body.data;
  
//   const sqlInsert = "Insert into teacher(qualification,city,mobile_no,nic,status,user_id) values (?,?,?,?,?,?)" ;
  
//   db.query(sqlInsert,[
//     data.qualification,
//     data.city,
//     data.mobile_no,
//     data.nic,
//     data.status,
//     data.user_id], (err, result) => {
//     if (err) {
//       console.log(err);
//     } else {
//       res.send(result);
//       console.log(result);
//     }
//   });
//   });



//create teacher
  // app.post("/api/createTeacher", (req, res) => {
  //   const userData = req.body.data;
  //   const role = "Teacher";
  //   const uname = userData.name + "Teach";
  
  //   // Create a new user first
  //   const userInsert = "INSERT INTO user (username, name, password, email,state, role) VALUES (?, ?, ? ,?, ?, ?)";
  
  //   db.query(userInsert, [uname,userData.name, userData.password, userData.email,"ACTIVE", role], (userErr, userResult) => {
  //     if (userErr) {
  //       console.log(userErr);
  //       res.status(500).send("Error creating user");
  //     } else {
  //       // Use the generated user_id to create a teacher
  //       const user_id = userResult.insertId;
  //       const teacherData = req.body.data;
  
  //       const teacherInsert = "INSERT INTO teacher (qualification, city,subject, mobile_no, nic,verified, user_id) VALUES (?, ?, ?, ?, ?, ?,?)";
  
  //       db.query(teacherInsert, [
  //         teacherData.qualification,
  //         teacherData.city,
  //         teacherData.subject,
  //         teacherData.mobile_no,
  //         teacherData.nic,
  //         0,
  //         user_id, // Use the generated user_id
  //       ], (teacherErr, teacherResult) => {
  //         if (teacherErr) {
  //           console.log(teacherErr);
  //           res.status(500).send("Error creating teacher");
  //         } else {
  //           res.send(teacherResult);
  //           console.log(teacherResult);
  //         }
  //       });
  //     }
  //   });
  // });
  
  
  app.post("/api/createTeacher", (req, res) => {
    const userData = req.body.data;
    const role = "Teacher";
    const uname = userData.name + "Teach";
  
    // SQL queries to check if the email or username already exists
    const sqlCheckEmail = "SELECT id FROM user WHERE email = ?;";
    const sqlCheckUsername = "SELECT id FROM user WHERE username = ?;";
  
    
  
    // Check if the email already exists
    db.query(sqlCheckEmail, [userData.email], (emailErr, emailResults) => {
      if (emailErr) {
        console.log(emailErr);
        return res.status(500).send("Error checking email");
      }
  
      if (emailResults.length > 0) {
        // Email is already taken
        return res.status(400).send("Email is already taken");
      } else {
        // Check if the username already exists
        db.query(sqlCheckUsername, [uname], (usernameErr, usernameResults) => {
          if (usernameErr) {
            console.log(usernameErr);
            return res.status(500).send("Error checking username");
          }
  
          if (usernameResults.length > 0) {
            // Username is already taken
            return res.status(400).send("Username is already taken");
          } else {
            // Proceed to create a new user
            const userInsert = "INSERT INTO user (username, name, password, email, state, role) VALUES (?, ?, ?, ?, ?, ?)";
  
            db.query(userInsert, [uname, userData.name, userData.password, userData.email, "ACTIVE", role], (userErr, userResult) => {
              if (userErr) {
                console.log(userErr);
                return res.status(500).send("Error creating user");
              } else {
                const userId = userResult.insertId; // Get the new user_id
                createTeacher(userId); // Create teacher with the new user_id
              }
            });
          }
        });
      }
    });

    // Function to create a new teacher if user creation is successful
    const createTeacher = (userId) => {
      const teacherInsert = "INSERT INTO teacher (qualification, city, subject, mobile_no, nic, verified, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
  
      db.query(teacherInsert, [
        userData.qualification,
        userData.city,
        userData.subject,
        userData.mobile_no,
        userData.nic,
        0,
        userId,
      ], (teacherErr, teacherResult) => {
        if (teacherErr) {
          console.log(teacherErr);
          return res.status(500).send("Error creating teacher");
        } else {
          console.log(teacherResult);
          return res.send(teacherResult);
        }
      });
    };
  });
  

// Edit user
// app.put("/api/editUser", (req, res) => {
//   const data = req.body.data; // Send data as data: blah blah blah
//   console.log(data);
//   const sqlCheckEmail = "SELECT * FROM user WHERE email = ?;";
//   const sqlCheckUsername = "SELECT * FROM user WHERE username = ?;";
//   const sqlUpdateUser = "UPDATE user SET email=?, name=?,username = ?, password=? WHERE id=?;";
//   db.query(sqlUpdateUser, [data.email, data.name,data.username, data.password, data.user_id], (err, result) => {
//     if (err) {
//       console.log(err);
//       res.status(500).send("Error updating user.");
//     } else {
//       if (data.role === "Teacher") {
//         const sqlUpdateTeacher = "update teacher set qualification= ?,subject =? ,city=?,mobile_no=?,nic=? WHERE user_id=?;";
//         db.query(sqlUpdateTeacher, [
//           data.qualification,
//           data.subject,
//           data.city,
//           data.mobile_no,
//           data.nic,
//           data.user_id], (err, teacherResult) => {
//           if (err) {
//             console.log(err);
//             res.status(500).send("Error updating teacher details.");
//           } else {
//             console.log("User and teacher details updated successfully.");
//             res.send(teacherResult);
//           }
//         });
//       } else {
//         console.log("User details updated successfully.");
//         res.send(result);
//       }
//     }
//   });
// });

app.put("/api/editUser", (req, res) => {
  const data = req.body.data; // Assuming data is sent in the format: { email: ..., username: ..., etc. }
  console.log(data);

  const sqlCheckEmail = "SELECT id FROM user WHERE email = ? AND id != ?;";
  const sqlCheckUsername = "SELECT id FROM user WHERE username = ? AND id != ?;";
  const sqlUpdateUser = "UPDATE user SET email=?, name=?, username=?, password=? WHERE id=?;";
  const sqlUpdateTeacher = "UPDATE teacher SET qualification=?, subject=?, city=?, mobile_no=?, nic=? WHERE user_id=?;";

  // Check if the email is already taken by another user
  db.query(sqlCheckEmail, [data.email, data.user_id], (err, emailResults) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error checking email.");
    }

    if (emailResults.length > 0) {
      return res.status(400).send("Email is already in use.");
    }

    // Check if the username is already taken by another user
    db.query(sqlCheckUsername, [data.username, data.user_id], (err, usernameResults) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Error checking username.");
      }

      if (usernameResults.length > 0) {
        return res.status(400).send("Username is already in use.");
      }

      // Proceed with updating the user
      db.query(sqlUpdateUser, [data.email, data.name, data.username, data.password, data.user_id], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Error updating user.");
        }

        if (data.role === "Teacher") {
          // Update teacher details if the user is a teacher
          db.query(sqlUpdateTeacher, [
            data.qualification,
            data.subject,
            data.city,
            data.mobile_no,
            data.nic,
            data.user_id
          ], (err, teacherResult) => {
            if (err) {
              console.log(err);
              return res.status(500).send("Error updating teacher details.");
            }

            console.log("User and teacher details updated successfully.");
            res.send(teacherResult);
          });
        } else {
          console.log("User details updated successfully.");
          res.send(result);
        }
      });
    });
  });
});



// //get Income for admin
// app.get("/api/getIncomeForAdmin", (req, res) => {
//   const sqlInsert2 = "select SUM((course.amount)*0.3) AS income from enrolment left join course on enrolment.course_id = course.id;";

//   db.query(sqlInsert2, (err, result) => {
//     if (err) {
//       console.log(err);
//     } else {
//       res.send(result);
//       console.log(result[0]);
//     }
//   });
// });

//get Income for admin
app.get("/api/getIncomeForAdmin", (req, res) => {
  const currentMonth = new Date().getMonth() + 1;
  const { month, year } = req.query;
  let sqlQuery = "SELECT SUM((course.amount) * 0.3) AS income FROM enrolment LEFT JOIN course ON enrolment.course_id = course.id ";

  // Check if month and year parameters are provided
  if (month && year) {
    sqlQuery += ` AND MONTH(STR_TO_DATE(enroled_date, '%Y-%m-%d')) = MONTH(STR_TO_DATE('${year}-${month}-01', '%Y-%m-%d'))`;
    sqlQuery += ` AND YEAR(STR_TO_DATE(enroled_date, '%Y-%m-%d')) = YEAR(STR_TO_DATE('${year}-${month}-01', '%Y-%m-%d'))`;
  }
  else if (year) {
    sqlQuery += ` AND YEAR(STR_TO_DATE(enroled_date, '%Y-%m-%d')) = YEAR(STR_TO_DATE('${year}-01-01', '%Y-%m-%d'))`;
  }
  db.query(sqlQuery, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});


//get Income for teacher
app.get("/api/getIncomeForTeacher/:id", (req, res) => {
  const id = req.params.id;
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const sqlInsert2 = "select SUM((course.amount)*0.7) AS income from enrolment left join course on enrolment.course_id = course.id Inner join teacher on course.teacher_id = teacher.id where teacher.user_id = ? AND SUBSTRING(enroled_date, 6, 2) = ?  AND SUBSTRING(enroled_date, 1, 4) = ? ;";

  db.query(sqlInsert2,[id,currentMonth,currentYear], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//get Income for ads
app.get("/api/getIncomeForAds", (req, res) => {
  const { month,year } = req.query;
  
  // Modify the SQL query to filter by the month if provided
  let sqlQuery = "SELECT SUM(CASE WHEN type = 'premium' THEN 1000 ELSE 500 END) AS income FROM advertisement WHERE state = 'paid'";
  if (month && year) {
    sqlQuery += ` AND MONTH(STR_TO_DATE(date_paid, '%Y-%m-%d')) = MONTH(STR_TO_DATE('${year}-${month}-01', '%Y-%m-%d'))`;
    sqlQuery += ` AND YEAR(STR_TO_DATE(date_paid, '%Y-%m-%d')) = YEAR(STR_TO_DATE('${year}-${month}-01', '%Y-%m-%d'))`;
  }
  else if (year) {
    sqlQuery += ` AND YEAR(STR_TO_DATE(date_paid, '%Y-%m-%d')) = YEAR(STR_TO_DATE('${year}-01-01', '%Y-%m-%d'))`;
  }

  console.log('xmmm',sqlQuery);
  db.query(sqlQuery, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//get course and revenue for report
app.get("/api/getRevenueDetais", (req, res) => {
  const { month,user_id } = req.query;
  
  // Modify the SQL query to filter by the month if provided
  let sqlQuery = "Select course.*,(Select Count(*) FROM enrolment where enrolment.course_id =course.id AND  SUBSTRING(enroled_date, 6, 2) = ? ) AS enrolmentCount from course inner join teacher on teacher.id = course.teacher_id inner join user on user.id = teacher.user_id where teacher.user_id = ?";

  db.query(sqlQuery,[month,user_id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//get course and revenue for report
app.get("/api/getRevenueDetailsForAll", (req, res) => {
  const { month,user_id,year } = req.query;
  
  // Modify the SQL query to filter by the month if provided
  let sqlQuery = "Select course.*,(Select Count(*) FROM enrolment where enrolment.course_id =course.id AND  SUBSTRING(enroled_date, 6, 2) = ? AND SUBSTRING(enroled_date, 1, 4) = ? ) AS enrolmentCount,user.name as tname from course inner join teacher on teacher.id = course.teacher_id inner join user on user.id = teacher.user_id";

  db.query(sqlQuery,[month,year], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

// //get Revenue for ads
// app.get("/api/getIncomeByCourseId", (req, res) => {

//   const currentMonth = new Date().getMonth() + 1; // Get current month (1-indexed)
// const course_id = req.query.course_id;
// console.log(course_id);

// // Calculate the range of months (3 months before and 3 months after the current month)
// let startMonth = currentMonth - 3;
// let endMonth = currentMonth + 3;
// // if (startMonth <= 0) {
// //   startMonth += 12;
// // }
// // if (endMonth <= 0) {
// //   endMonth += 12;
// // }

// // Generate an array of month labels for the range
// const monthLabels = [];
// for (let i = startMonth; i <= endMonth; i++) {
//   const month = i > 0 ? (i < 10 ? `0${i}` : `${i}`) : (i + 12); // Adjust for negative months
//   monthLabels.push(month);
// }
  
//   // Modify the SQL query to filter by the month if provided
//   // let sqlQuery = "(SELECT COUNT(*) FROM enrolment WHERE enrolment.course_id = course.id AND SUBSTRING(enroled_date, 6, 2) = ?) AS enrolmentCount, (course.amount * 0.7 * (SELECT COUNT(*) FROM enrolment WHERE enrolment.course_id = course.id AND SUBSTRING(enroled_date, 6, 2) = ?)) AS revenue from course where course.id = ? ";
//   let sqlQuery = "SELECT course.id, course.title, ";
//   for (let i = startMonth; i <= endMonth; i++) {
//     console.log(startMonth);
//     console.log(endMonth);
//     let adjustedMonth = i % 12; // Ensure the adjusted month falls within 1 to 12
//     if (adjustedMonth <= 0) adjustedMonth += 12; // If adjusted month is 0 or negative, add 12
//     // sqlQuery += `(course.amount * 0.7 * (SELECT COUNT(*) FROM enrolment WHERE enrolment.course_id = course.id AND SUBSTRING(enroled_date, 6, 2) = '${i < 10 ? `0${i}` : `${i}`}')) AS revenue_${i}, `;
//      sqlQuery += `(course.amount * 0.7 * (SELECT COUNT(*) FROM enrolment WHERE enrolment.course_id = course.id AND SUBSTRING(enroled_date, 6, 2) = '${adjustedMonth < 10 ? `0${adjustedMonth}` : `${adjustedMonth}`}')) AS revenue_${adjustedMonth}, `;
//   }
//   sqlQuery = sqlQuery.slice(0, -2); // Remove trailing comma
  
//   // Append the rest of the SQL query
//   sqlQuery += ` FROM course WHERE course.id = ${course_id}`;
//   db.query(sqlQuery, (err, result) => {
//     if (err) {
//       console.log(err);
//     } else {
//       res.send(result);
//       console.log(result);
//     }
//   });
// });

app.get("/api/getIncomeByCourseId", (req, res) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Get current month (1-indexed)
  const currentYear = currentDate.getFullYear();
  const course_id = req.query.course_id;

  // Calculate the range of months (3 months before and after the current month)
  let startMonth, endMonth;
  if (currentMonth >= 4) {
      startMonth = currentMonth - 3;
      endMonth = currentMonth + 3;
  } else {
      startMonth = currentMonth - 3 + 12; // Adjust for months before April
      endMonth = currentMonth + 3;
  }

  // Generate an array of month labels for the range
  const monthLabels = [];
  for (let i = startMonth; i <= endMonth; i++) {
    console.log(i);
    let adjustedMonth = i; // Month index without adjustments
    let adjustedYear = currentYear; // Year without adjustments

    // Adjust the year if the month is less than 1 (January) or greater than 12 (December)
    if (adjustedMonth < 1) {
        adjustedMonth += 12;
        adjustedYear--;
    } else if (adjustedMonth > 12) {
        adjustedMonth -= 12;
        adjustedYear++;
    }
      const month = adjustedMonth < 10 ? `0${adjustedMonth}` : `${adjustedMonth}`;
      monthLabels.push(`${adjustedYear}-${month}`);
  }

  console.log(monthLabels);
  // Construct the SQL query
  let sqlQuery = `SELECT course.id, course.title, `;
  monthLabels.forEach((month) => {
    const monthNumber = parseInt(month.split('-')[1]); 
      sqlQuery += `(course.amount * 0.7 * (SELECT COUNT(*) FROM enrolment WHERE enrolment.course_id = course.id AND SUBSTRING(enroled_date, 1, 7) = '${month}')) AS revenue_${monthNumber}, `;
  });
  sqlQuery = sqlQuery.slice(0, -2); // Remove trailing comma
  sqlQuery += ` FROM course WHERE course.id = ${course_id}`;

  // Execute the query
  db.query(sqlQuery, (err, result) => {
      if (err) {
          console.log(err);
          res.status(500).send("Internal Server Error");
      } else {
          console.log(result);
          res.send(result);
      }
  });
});





app.get("/api/getIncomeForAdminDash", (req, res) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  let sqlQuery = "SELECT SUM((course.amount) * 0.3) AS income FROM enrolment LEFT JOIN course ON enrolment.course_id = course.id where SUBSTRING(enroled_date, 6, 2) = ?  AND SUBSTRING(enroled_date, 1, 4) = ? ";
  
  db.query(sqlQuery,[currentMonth,currentYear], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});



//get Income for ads
app.get("/api/getIncomeForAdsDash", (req, res) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  // Modify the SQL query to filter by the month if provided
  let sqlQuery = "SELECT SUM(CASE WHEN type = 'premium' THEN 1000 ELSE 500 END) AS income FROM advertisement WHERE state = 'paid' AND SUBSTRING(date_paid, 6, 2) = ?  AND SUBSTRING(date_paid, 1, 4) = ? ";


  db.query(sqlQuery,[currentMonth,currentYear], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});








































app.post("/api/addpackage", (req, res) => {
  const data = req.body.data;
  console.log(req);

  const sqlInsert2 =
    "insert into packages (packagetype, albumtype,outdoorphoto,photoframe,videotype,price) values (?,?,?,?,?,?);";

  db.query(
    sqlInsert2,
    [
      data.packagetype,
      data.albumtype,
      data.outdoorphoto,
      data.photoframe,
      data.videotype,
      data.price,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});



app.post("/api/addprinter", (req, res) => {
  const data = req.body.data;
  console.log(req);

  const sqlInsert2 =
    "insert into printers  (name, phonenumber,address,email,company) values (?,?,?,?,?);";

  db.query(
    sqlInsert2,
    [
      data.name,
      data.phone,
      data.address,
      data.email,
      data.company
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});

app.put("/api/updateprinter", (req, res) => {
  const data = req.body.data;
  console.log(req);

  const sqlInsert2 =
    "update printers set name=?, phonenumber=?,address=?,email=?,company=?  where idprinters=?;";

  db.query(
    sqlInsert2,
    [
      data.name,
      data.phone,
      data.address,
      data.email,
      data.company,
      data.idprinters
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});

app.put("/api/updatepackage", (req, res) => {
  const data = req.body.data;
  console.log(req);

  const sqlInsert2 =
    "update  packages set packagetype = ?, albumtype=?,outdoorphoto=?,photoframe=?,videotype=?,price=? where id=?;";

  db.query(
    sqlInsert2,
    [
      data.packagetype,
      data.albumtype,
      data.outdoorphoto,
      data.photoframe,
      data.videotype,
      data.price,
      data.id
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});

app.post("/api/deletepackage", (req, res) => {
  const data = req.body.data;
  console.log(data);

  const sqlInsert2 =
    "delete from packages where id=?;";

  db.query(
    sqlInsert2,
    [
      data.id
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});

app.post("/api/deleteprinter", (req, res) => {
  const data = req.body.data;
  console.log(data);

  const sqlInsert2 =
    "delete from printers where idprinters=?;";

  db.query(
    sqlInsert2,
    [
      data.idprinters
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});

app.post("/api/addfreelancerpay", (req, res) => {
  const data = req.body.data;
  const total =parseInt(data.dailypay) +parseInt(data.additions)
  console.log(total);

  const sqlInsert2 =
    "insert into freelancerpayment (freelancerid,name,position,date,eventid,dailypay,additions,total,paymethod,status) values (?,?,?,?,?,?,?,?,?,?);";

  db.query(
    sqlInsert2,
    [
      data.freelancerid,
      data.name,
      data.position,
      data.date,
      data.eventid,
      data.dailypay,
      data.additions,
      total,
      data.paymethod,
      "Paid",
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});

app.post("/api/addstaffpay", (req, res) => {
  const data = req.body.data;
  const total =parseInt(data.salary) +parseInt(data.additions)
  console.log(total);

  const sqlInsert2 =
    "insert into staffpayment (staffid,name,position,date,salary,additions,total,paymethod) values (?,?,?,?,?,?,?,?);";

  db.query(
    sqlInsert2,
    [
      data.staffid,
      data.name,
      data.position,
      data.date,
      data.salary,
      data.additions,
      total,
      data.paymethod,
  
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});

app.post("/api/addprinterpay", (req, res) => {
  const data = req.body.data;
  const total =parseInt(data.salary) +parseInt(data.additions)
  console.log(total);

  const sqlInsert2 =
    "insert into printerpayment (printerid,name,paydate,total,paymethod) values (?,?,?,?,?);";

  db.query(
    sqlInsert2,
    [
      data.printerid,
      data.name,
      data.date,
      data.total,
    
      data.paymethod,
  
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});

app.put("/api/updatecustomerpay", (req, res) => {
  const data = req.body.data;
  console.log(data);
  const date=getDateString(new Date())

  const sqlInsert2 =
    "update customerpayment set orderid=?,customerid=?,paystatus=?,date=?,total=?,advance=?,halfpay=?,balance=?  where paymentid=?;";

  db.query(
    sqlInsert2,
    [
      data.orderid,
      data.customerid,
      data.paystatus,
      date,
      data.total,
      data.advance,
      data.halfpay,
      parseInt(data.total)-parseInt(data.advance)-parseInt(data.halfpay),
      data.paymentid,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});

app.post("/api/addcustomerpay", (req, res) => {
  const data = req.body.data;
  console.log(data);
  const date=getDateString(new Date())


  const sqlInsert2 =
    "insert into customerpayment (orderid,customerid,paystatus,date,total,advance,halfpay,balance) values (?,?,?,?,?,?,?,?);";

  db.query(
    sqlInsert2,
    [
    
      data.orderid,
      data.customerid,
      data.paystatus,
      date,
      data.total,
      data.advance,
      data.halfpay,
      parseInt(data.total)-parseInt(data.advance)-parseInt(data.halfpay)
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});

app.post("/api/addfreelancer", (req, res) => {
  const data = req.body.data;
  console.log(req);

  const sqlInsert2 =
    "insert into freelancers (freelancerid, name,position,nic,phone,address,dailypay,gender) values (?,?,?,?,?,?,?,?);";

  db.query(
    sqlInsert2,
    [
      data.freelancerid,
      data.name,
      data.position,
      data.nic,
      data.phone,
      data.address,
      data.dailypay,
      data.gender,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);

        const sqlInsert3 =
          "insert into fieldworkers (id, name,position,nic,phone,address,dailypay,gender) values (?,?,?,?,?,?,?,?);";

        db.query(
          sqlInsert3,
          [
            data.freelancerid,
            data.name,
            data.position,
            data.nic,
            data.phone,
            data.address,
            data.dailypay,
            data.gender,
          ],
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              console.log(result);
              res.send(result);
            }
          }
        );
      }
    }
  );
});

app.post("/api/addfreelancer2", (req, res) => {
  const data = req.body.data;
  console.log(req);

  const sqlInsert2 =
    "insert into freelancers2 (freelancerid, name,position,nic,phone,address,dailypay,gender) values (?,?,?,?,?,?,?,?);";

  db.query(
    sqlInsert2,
    [
      data.freelancerid,
      data.name,
      data.position,
      data.nic,
      data.phone,
      data.address,
      data.dailypay,
      data.gender,
    ]
    
  );
});

app.post("/api/addstaff", (req, res) => {
  const data = req.body.data;
  console.log(req);

  const sqlInsert2 =
    "insert into staffs ( name,nic,position,phone,address,salary,gender) values (?,?,?,?,?,?,?);";

  db.query(
    sqlInsert2,
    [
      data.name,
      data.nic,
      data.position,
      data.phone,
      data.address,
      data.salary,
      data.gender,
    ]
    
  );
});

app.post("/api/addinventory", (req, res) => {
  const data = req.body.data;
  console.log(req);

  const sqlInsert2 =
    "insert into inventory ( product,quantity,status) values (?,?,?);";

  db.query(
    sqlInsert2,
    [ data.product, data.quantity, data.status],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});

app.post("/api/addstaff", (req, res) => {
  const data = req.body.data;
  console.log(req);

  const sqlInsert2 =
    "insert into staffs (staffid, name,position,nic,phone,address,salary,gender) values (?,?,?,?,?,?,?,?);";

  db.query(
    sqlInsert2,
    [
      data.staffid,
      data.name,
      data.position,
      data.nic,
      data.phone,
      data.address,
      data.salary,
      data.gender,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});

app.post("/api/addevent", (req, res) => {
  const data = req.body.data;
  console.log(req);

  const sqlInsert2 =
    "insert into event (orderid, cameraman,assistant,date,camera,light,stand,properties) values (?,?,?,?,?,?,?,?);";

  db.query(
    sqlInsert2,
    [
      data.orderid,
      data.cameraman,
      data.assistant,
      data.date,
      data.camera,
      data.light,
      data.stand,
      data.properties,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);

        const sqlInsert3 = "update orders set eventadded=? where orderid=?;";

        db.query(sqlInsert3, ["true", data.orderid], (err, result) => {
          if (err) {
            console.log(err);
          } else {
            res.send(result);
            console.log(result);
          }
        });
      }
    }
  );
});

app.post("/api/bookorder", (req, res) => {
  const data = req.body.data;
  console.log(req);

  const sqlInsert2 =
    "insert into orders (name,functiontype,expecteddate, video,phone,venue,photoframe,packagetype,status,userid,eventadded,comments) values (?,?,?,?,?,?,?,?,?,?,?,?);";

  db.query(
    sqlInsert2,
    [
      data.name,
      data.functiontype,
      data.expecteddate,
      data.video,
      data.phone,
      data.venue,
      data.photoframe,
      data.packagetype,
      data.status,
      data.userid,
      "false",
      data.comments
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});

app.post("/api/bookorder2", (req, res) => {
  const data = req.body.data;
  console.log(req);

  const sqlInsert2 =
    "insert into orders (name,functiontype,expecteddate, video,phone,venue,photoframe,packagetype,status,userid,eventadded,customercomments) values (?,?,?,?,?,?,?,?,?,?,?,?);";

  db.query(
    sqlInsert2,
    [
      data.name,
      data.functiontype,
      data.expecteddate,
      data.video,
      data.phone,
      data.venue,
      data.photoframe,
      data.packagetype,
      data.status,
      data.userid,
      "false",
data.comments    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});

app.get("/api/vieworders/:customerid", (req, res) => {
  const userid = req.params.customerid;;
  const status1 = "Pending";
  const status2 = "Ongoing";

  const data = req.body.data;
  console.log(req);

  const sqlInsert2 =
    "select * from orders where userid=? and (status=? or status=?);";

  db.query(sqlInsert2, [userid, status1, status2], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

app.get("/api/viewfreelancerpayment", (req, res) => {
  // const userid = 2;
  // const status1 = "Pending";
  // const status2 = "Ongoing";

  const data = req.body.data;
  console.log(req);

  const sqlInsert2 = "select * from freelancerpayment ;";

  db.query(sqlInsert2, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

app.get("/api/viewstaffpayment", (req, res) => {
  // const userid = 2;
  // const status1 = "Pending";
  // const status2 = "Ongoing";

  const data = req.body.data;
  console.log(req);

  const sqlInsert2 = "select * from staffpayment ;";

  db.query(sqlInsert2, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

app.get("/api/viewPrinterpayment", (req, res) => {
  // const userid = 2;
  // const status1 = "Pending";
  // const status2 = "Ongoing";

  const data = req.body.data;
  console.log(req);

  const sqlInsert2 = "select * from printerpayment ;";

  db.query(sqlInsert2, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

app.get("/api/viewcustomerpayment", (req, res) => {
  // const userid = 2;
  // const status1 = "Pending";
  // const status2 = "Ongoing";

  const data = req.body.data;
  console.log(req);

  const sqlInsert2 = "select * from customerpayment ;";

  db.query(sqlInsert2, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

// app.get("/api/users", (req, res) => {
//   const sqlInsert2 = "select email from user;";

//   db.query(sqlInsert2, (err, result) => {
//     if (err) {
//       console.log(err);
//     } else {
//       res.send(result);
//       console.log(result);
//     }
//   });
// });

app.get("/api/getfreelancer/:id", (req, res) => {
  const id = req.params.id;
  console.log(id);

  const sqlInsert2 = "select * from freelancers where freelancerid=?;";

  db.query(sqlInsert2, id, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

app.get("/api/login", (req, res) => {
  console.log(1, req.session);
  if (req.session.user) {
    const sqlSelect = "Select email, type,userid from user where email=?";
    db.query(sqlSelect, req.session.user, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log("hiiiiiii");

        // res.send(result[0]);
        req.session.email = result[0].email;
        req.session.type = result[0].type;
        req.session.userid = result[0].userid;

        console.log(result[0].userid)
        res.send({
          loggedIn: true,
          user: req.session.user,
          email: req.session.email,
          type: req.session.type,
          userid:result[0].userid
        });
      }
    });
    // res.send({loggedIn:true,user:req.session.user})
  } else {
    res.send({ loggedIn: false });
  }
});

app.post("/api/login", (req, res) => {
  const credentials = req.body.credentials;
  console.log(credentials);
  const sqlSelect = "SELECT * from user where email= ?;";
  db.query(sqlSelect, [credentials.email], (err, result) => {
    if (err) {
      console.log(err);
      return;
    }

    if (result.length > 0) {
      console.log(result[0].userid);
      bcrypt.compare(
        credentials.password,
        result[0].password,
        (err, response) => {
          if (response) {
            console.log("req.session.user");
            req.session.user = result[0].email;
            console.log(0, req.session);

            res.send({
              session: req.session,
              type: result[0].type,
              email: result[0].email,
              userid:result[0].userid,
            });
          } else {
            res.send({ message: "Incorrect Username/Password." });
          }
        }
      );
      // res.send(credentials.username);
    } else {
      console.log("hello")
      res.send({ message: "User doesn't exist" });
    }
  });
});

app.post("/api/addavailabilityrecord", (req, res) => {
  const workerid = req.body.workerid;
  const date = req.body.date;
  const status = req.body.status;
  const position = req.body.position;

  console.log(req);

  const sqlInsert2 =
    "insert into availability(workerid, date,status,position) values (?,?,?,?);";

  db.query(sqlInsert2, [workerid, date, status, position], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

app.get("/api/viewallorders", (req, res) => {
  // const status = 'Pending'

  const data = req.body.data;
  console.log(req);

  const sqlInsert2 = "select * from orders where status=? ;  ";

  db.query(sqlInsert2,['Pending'],(err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

app.get("/api/viewpackages", (req, res) => {
  // const status = 'Pending'

  const data = req.body.data;
  console.log(req);

  const sqlInsert2 = "select * from packages ;  ";

  db.query(sqlInsert2,['Pending'],(err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});


app.get("/api/ongoingorders", (req, res) => {
  // const status = 'Pending'

  const data = req.body.data;
  console.log(req);

  const sqlInsert2 = "select * from orders where status=?;  ";

  db.query(sqlInsert2,['Ongoing'],(err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

app.get("/api/availableworkers/:date", (req, res) => {
  // const status = 'Pending'

  const date = req.params.date;
  console.log(req);

  const sqlInsert2 =
    " select * from (select fieldworkers.id,fieldworkers.position,T1.date from fieldworkers left join ( select * from availability where date=?) as T1 on fieldworkers.id=T1.workerid) as T where T.date is NULL;";

  db.query(sqlInsert2, date, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

app.get("/api/viewallevents", (req, res) => {
  // const status = 'Pending'

  const data = req.body.data;
  console.log(req);

  const sqlInsert2 = "select * from event;  ";

  db.query(sqlInsert2, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

app.get("/api/viewallfreelancers", (req, res) => {
  // const status = 'Pending'

  const data = req.body.data;
  console.log(req);

  const sqlInsert2 = "select * from freelancers;  ";

  db.query(sqlInsert2, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

app.get("/api/viewallstaffs", (req, res) => {
  // const status = 'Pending'

  const data = req.body.data;
  console.log(req);

  const sqlInsert2 = "select * from staffs;  ";

  db.query(sqlInsert2, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

app.get("/api/printers", (req, res) => {
  // const status = 'Pending'

  const data = req.body.data;
  console.log(req);

  const sqlInsert2 = "select * from printers;  ";

  db.query(sqlInsert2, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

app.get("/api/viewallfreelancers2", (req, res) => {
  // const status = 'Pending'

  const data = req.body.data;
  console.log(req);

  const sqlInsert2 = "select * from freelancers2;  ";

  db.query(sqlInsert2, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

app.get("/api/freelancersbyposition/:position", (req, res) => {
  const position = req.params.position;

  // const data = req.body.data

  const sqlInsert2 = "select * from fieldworkers where position=?;";

  db.query(sqlInsert2, position, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

app.get("/api/viewallstaffs", (req, res) => {
  // const status = 'Pending'

  const data = req.body.data;
  console.log(req);

  const sqlInsert2 = "select * from staffs;  ";

  db.query(sqlInsert2, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

app.get("/api/inventory", (req, res) => {
  // const status = 'Pending'

  const data = req.body.data;
  console.log(req);

  const sqlInsert2 = "select * from inventory;  ";

  db.query(sqlInsert2, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

app.get("/api/pastorders/:userid", (req, res) => {
  const userid = req.params.userid;
  const status = "Closed";

  const data = req.body.data;
  console.log(req);

  const sqlInsert2 = "select * from orders where userid=? and status=?";

  db.query(sqlInsert2, [userid, status], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});
app.get("/api/allpastorders", (req, res) => {
  
  const status = "Closed";

  const data = req.body.data;
  console.log(req);

  const sqlInsert2 = "select * from orders where  status=?";

  db.query(sqlInsert2, [status], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});
app.get("/api/currentorders", (req, res) => {
  const userid = 27;
  const status = "Closed";

  const data = req.body.data;
  console.log(req);

  const sqlInsert2 = "select * from orders where status = ?;";

  db.query(sqlInsert2, "Ongoing", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

app.post("/api/report", (req, res) => {
  

  const data = req.body.reportdata;
  console.log(req);

  const sqlInsert2 = "select functiontype,sum(price) as revenue from (orders inner join packages using (packagetype)) where  expecteddate>=? and expecteddate<=? group by functiontype";

  db.query(sqlInsert2, [data.startdate,data.enddate], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});
app.post("/api/report2", (req, res) => {
  

  const data = req.body.reportdata;
  console.log(req);

  const sqlInsert2 = "(select month_name, sum(price) as revenue from (select *,DATE_FORMAT(expecteddate, '%M') as month_name from orders ) as mytab inner join packages as newtab group by month_name)  "
  

  db.query(sqlInsert2, [data.startdate,data.enddate], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

app.get("/api/pendingorders", (req, res) => {
  const userid = 27;
  const status = "Closed";

  const data = req.body.data;
  console.log(req);

  const sqlInsert2 = "select * from orders where status = ?;";

  db.query(sqlInsert2, "Pending", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

app.get("/api/outofstock", (req, res) => {


  const data = req.body.data;
  console.log(req);

  const sqlInsert2 = "select * from inventory where status = ?;";

  db.query(sqlInsert2, "outofstock", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

app.get("/api/logout", (req, res) => {
  res.clearCookie('user_id');

  res.send({ message: "cookie cleared" });
});


// app.post("/api/signup", (req, res) => {
//   const data = req.body;
//   // console.log(req);

//   const sqlInsert1 = "select * from user where email=?;";
//   db.query(sqlInsert1, [data.email], (err, result) => {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log(result[0]==null)
//       if (result[0]) {
//         res.send({ msge: "Email is already taken" });
//       } else {
//         const sqlInsert2 =
//           "insert into user (email, password,type) values (?,?,?);";

//         db.query(
//           sqlInsert2,
//           [data.email, data.password, "customer"],
//           (err, result) => {
//             if (err) {
//               console.log(err);
//             } else {
//               res.send({ email: data.email, type: "customer" });
//               console.log(result);
//             }
//           }
//         );
       
//       }

     
//     }
//   });


// });

app.put("/api/acceptorder", (req, res) => {
  const data = req.body;
  console.log(req);

  const sqlInsert2 = "update orders set status =? where orderid=?;";

  db.query(sqlInsert2, [data.status, data.orderid], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

app.put("/api/closeorder", (req, res) => {
  const data = req.body;
  console.log(req);

  const sqlInsert2 = "update orders set status =? where orderid=?;";

  db.query(sqlInsert2, [data.status, data.orderid], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

app.post("/api/Cancelorder", (req, res) => {
  const data = req.body;
  console.log(req);

  const sqlInsert2 = "delete from orders where orderid=?;";

  db.query(sqlInsert2, [data.orderid], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      const sqlInsert2 = "delete from event where orderid=?;";

      db.query(sqlInsert2, [data.orderid], (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.send(result);
          console.log(result);
    
          
        }
      });


    }
  });
});

app.post("/api/deleteinventory", (req, res) => {
  const data = req.body;
  console.log(req);

  const sqlInsert2 = "delete from inventory where itemid=?;";

  db.query(sqlInsert2, [data.itemid], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

app.post("/api/deletefreelancer", (req, res) => {
  const data = req.body;
  console.log(req);

  const sqlInsert2 = "delete from freelancers where freelancerid=?;";

  db.query(sqlInsert2, [data.freelancerid], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

app.post("/api/deleteevent", (req, res) => {
  const data = req.body;
  console.log(req);

  const sqlInsert2 = "delete from event where eventid=?;";

  db.query(sqlInsert2, [data.eventid], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      const sqlInsert3 = "update orders set eventadded=?  where orderid=?;";

      db.query(sqlInsert3, ["false", data.orderid], (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.send(result);
          console.log(result);
        }
      });
    }
  });
});

app.put("/api/updatefreelancer", (req, res) => {
  const data = req.body.data;
  console.log(data);

  const sqlInsert2 =
    "update freelancers  set name=?,position=?,nic=?,phone=?,address=?,dailypay=?,gender=? where freelancerid=?;";

  db.query(
    sqlInsert2,
    [
      data.name,
      data.position,
      data.nic,
      data.phone,
      data.address,
      data.dailypay,
      data.gender,
      data.freelancerid,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        const sqlInsert3 =
          "update fieldworkers  set name=?,position=?,nic=?,phone=?,address=?,dailypay=?,gender=? where id=?;";

        db.query(
          sqlInsert3,
          [
            data.name,
            data.position,
            data.nic,
            data.phone,
            data.address,
            data.dailypay,
            data.gender,
            data.freelancerid,
          ],
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              res.send(result);

              console.log(result);
            }
          }
        );
      }
    }
  );
});

app.put("/api/updatefreelancer2", (req, res) => {
  const data = req.body.data;
  console.log(data);

  const sqlInsert2 =
    "update freelancers2  set name=?,position=?,nic=?,phone=?,address=?,dailypay=?,gender=? where freelancerid=?;";

  db.query(
    sqlInsert2,
    [
      data.name,
      data.position,
      data.nic,
      data.phone,
      data.address,
      data.dailypay,
      data.gender,
      data.freelancerid,
    ],
   
  );
});

app.put("/api/updatestaff", (req, res) => {
  const data = req.body.data;
  console.log(data);

  const sqlInsert2 =
    "update staffs  set name=?,position=?,nic=?,phone=?,address=?,salary=?,gender=? where staffid=?;";

  db.query(
    sqlInsert2,
    [
      data.name,
      data.position,
      data.nic,
      data.phone,
      data.address,
      data.salary,
      data.gender,
      data.staffid,
      
    ],
   
  );
});

app.post("/api/updateevent", (req, res) => {
  const data = req.body.data;
  console.log(req);

  const sqlInsert2 =
    "update event set cameraman=?,  assistant=?,date=?,camera=?,light=?,stand=?,properties=?  where eventid=?;";

  db.query(
    sqlInsert2,
    [
      data.cameraman,
      data.assistant,
      data.date,
      data.camera,
      data.light,
      data.stand,
      data.properties,
      data.eventid,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        res.send(result);
      }
    }
  );
});

app.post("/api/updateavailabilityrecord", (req, res) => {
  const workerid = req.body.workerid;
  const date = req.body.date;
  const position = req.body.position;

  console.log(req);

  const sqlInsert1 = "delete from  availability where workerid=? and date=?;";

  db.query(sqlInsert1, [workerid, date], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      const sqlInsert2 =
        "insert into availability(workerid, date,status,position) values (?,?,?,?);";

      db.query(
        sqlInsert2,
        [workerid, date, "Unavailable", position],
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            res.send(result);
            console.log(result);
          }
        }
      );
    }
  });
});

app.put("/api/updateorder", (req, res) => {
  const data = req.body.data;
  console.log(data.comments);

  const sqlInsert2 =
    "update orders  set name=?,functiontype=?,expecteddate=?,packagetype=?,phone=?,photoframe=?,venue=?, video=?, comments=? where orderid=?;";

  db.query(
    sqlInsert2,
    [
      data.name,
      data.functiontype,
      data.expecteddate,
      data.packagetype,
      data.phone,
      data.photoframe,
      data.venue,
      data.video,
      data.comments,
      data.orderid,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        res.send(result);
      }
    }
  );
});

app.put("/api/updateorder", (req, res) => {
  const data = req.body.data;
  console.log(data.comments);

  const sqlInsert2 =
    "update orders  set name=?,functiontype=?,expecteddate=?,packagetype=?,phone=?,photoframe=?,venue=?, video=?, comments=? where orderid=?;";

  db.query(
    sqlInsert2,
    [
      data.name,
      data.functiontype,
      data.expecteddate,
      data.packagetype,
      data.phone,
      data.photoframe,
      data.venue,
      data.video,
      data.comments,
      data.orderid,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        res.send(result);
      }
    }
  );
});

app.put("/api/updateorder2", (req, res) => {
  const data = req.body.data;
  console.log(data.comments);

  const sqlInsert2 =
    "update orders  set name=?,functiontype=?,expecteddate=?,packagetype=?,phone=?,photoframe=?,venue=?, video=?, customercomments=? where orderid=?;";

  db.query(
    sqlInsert2,
    [
      data.name,
      data.functiontype,
      data.expecteddate,
      data.packagetype,
      data.phone,
      data.photoframe,
      data.venue,
      data.video,
      data.comments,
      data.orderid,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        res.send(result);
      }
    }
  );
});

app.put("/api/updateinventory", (req, res) => {
  const data = req.body.data;
  console.log(data);

  const sqlInsert2 =
    "update inventory  set product=?,quantity=?,status=? where itemid=?;";

  db.query(
    sqlInsert2,
    [data.product, data.quantity, data.status, data.itemid],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        res.send(result);
      }
    }
  );
});

app.listen(3001, () => {
  console.log("Yey, your server is running on port 3001");
});
