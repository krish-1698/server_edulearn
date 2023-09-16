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
    origin: "http://localhost:3000",
    methods: ["GET,POST", "PUT"],
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

function getDate(){
  const today = new Date();
const formatDate = today.toISOString().split('T')[0];
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
  const data = req.body;

  const sqlCheckEmail = "SELECT * FROM user WHERE email = ?;";
  const sqlCheckUsername = "SELECT * FROM user WHERE username = ?;";

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
                "INSERT INTO user (email, name, password, role, state, username) VALUES (?, ?, ?, ?, ?, ?);";
              db.query(
                sqlInsertUser,
                [data.email, data.name, data.password, data.role, data.state, data.username],
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

//get All Courses
app.get("/api/allCourses", (req, res) => {
  const sqlInsert2 = "select * from course;";

  db.query(sqlInsert2, (err, result) => {
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

  const sqlInsert1 = "insert into course (title,amount, description,language, state,subject, updated_date, teacher_id, credits,hours, img_path ) values (?,?,?,?,?,?,?,?,?,?,?);";
  db.query(sqlInsert1, [data.title, 
    data.amount, data.description, data.language,data.state,data.subject, 
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
    data.amount, data.description, data.language,data.state,data.subject, 
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
  const data = req.body;
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


//get All enrolments for a user
app.get("/api/enrolmentForUser", (req, res) => {
  const data = req.body.data;
  const sqlInsert2 = "select course.* from course,enrolment where course.id=enrolment.course_id and enrolment.user_id=?;";

  db.query(sqlInsert2,[data.user_id], (err, result) => {
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

//get number of enrolments for a course
app.get("/api/countEnrolmentForCourse", (req, res) => {
  const data = req.body.data;
  const sqlInsert2 = "select count(user.id) as userCount  from user,enrolment where user.id=enrolment.user_id and enrolment.course_id=?;";

  db.query(sqlInsert2,[data.course_id], (err, result) => {
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
app.get("/api/wishlistCourses", (req, res) => {
  const data = req.body.data;
  const sqlInsert2 = "select course.* from course,wishlist where course.id=wishlist.course_id and wishlist.user_id =?;";

  db.query(sqlInsert2,[data.user_id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

//delete Wishlist for user
app.delete("/api/deleteWishlistCourse", (req, res) => {
  const data = req.body.data;
  const sqlInsert2 = "delete  from  wishlist where id= ?;";

  db.query(sqlInsert2,[data.id], (err, result) => {
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
        res.status(400).send("User has already rated this course");
      } else {
        // User has not rated this course; proceed with inserting the new rating
        const sqlInsert =
          "INSERT INTO rating (course_id, user_id, description, level, date_added) VALUES (?, ?, ?, ?, ?)";
        db.query(
          sqlInsert,
          [data.course_id, data.user_id, data.description, data.level, formattedDate],
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
  const sqlInsert2 = "select * from rating  where course.id=?;";

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
  
  const sqlInsert = "Insert into advertisement(img_path,city,description,email,language,mobile,name,subject,type,state) values (?,?,?,?,?,?,?,?,?,?)" ;
  
  db.query(sqlInsert,[data.img_path, data.city,data.description,data.email,data.language,data.mobile,data.name,data.subject,data.type,data.state], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
  });
  

//get All advertisements
app.get("/api/getAllAdvertisement", (req, res) => {
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
  
  const sqlInsert1 = "update adevertisement set img_path=? ,city=?, description=?,email=?, language=?, mobile=?,name=?, subject=?,type=?, state=?  where id=?;";
  db.query(sqlInsert1, [data.img_path, 
    data.city, data.description, data.email,data.language,data.mobile,data.name,data.subject, 
    data.type,data.state,  data.advertisement_id,data.id], (err, result) => {
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


//deleteDoubt
app.delete("/api/deleteDoubt", (req, res) => {
  const data = req.body.data;
  const sqlInsert2 = "delete  from  doubt where id= ?;";

  db.query(sqlInsert2,[data.id], (err, result) => {
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

//edit doubt
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


//deleteDoubt
app.delete("/api/deleteAnswer", (req, res) => {
  const data = req.body.data;
  const sqlInsert2 = "delete  from  answer where id= ?;";

  db.query(sqlInsert2,[data.id], (err, result) => {
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
  
  const sqlInsert = "Insert into group(name) values (?)" ;
  
  db.query(sqlInsert,[data.name], (err, result) => {
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


//edit group
app.put("/api/editGroup", (req, res) => {
  const data = req.body.data; // send data as data: blah blah blah
  
  const sqlInsert1 = "update group set name=?  where id=?;";
  db.query(sqlInsert1, [data.name,data.group_id], (err, result) => {
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
app.delete("/api/deleteGroup", (req, res) => {
  const data = req.body.data;
  const sqlInsert2 = "delete  from  group where id= ?;";

  db.query(sqlInsert2,[data.id], (err, result) => {
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
  
  const sqlInsert = "Insert into sub_topic(file_path,file_type,course_id) values (?,?,?)" ;
  
  db.query(sqlInsert,[data.file_path,data.file_type,data.course_id], (err, result) => {
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
  
  const sqlInsert1 = "update sub_topic set file_path=?, file_type=?, course_id=?  where id=?;";
  db.query(sqlInsert1, [data.file_path,data.file_type, 
    data.course_id, data.subtopic_id], (err, result) => {
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
app.delete("/api/deleteSubtopic", (req, res) => {
  const data = req.body.data;
  const sqlInsert2 = "delete  from  subtopic where id= ?;";

  db.query(sqlInsert2,[data.id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});






//create teacher
app.post("/api/createTeacher", (req,res) =>{
  const data = req.body.data;
  
  const sqlInsert = "Insert into teacher(qualification,city,mobile_no,nic,status,user_id) values (?,?,?,?,?,?)" ;
  
  db.query(sqlInsert,[
    data.qualification,
    data.city,
    data.mobile_no,
    data.nic,
    data.status,
    data.user_id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
  });


// Edit user
app.put("/api/editUser", (req, res) => {
  const data = req.body.data; // Send data as data: blah blah blah
  
  const sqlUpdateUser = "UPDATE user SET email=?, name=?, password=?, role=?, username=? WHERE id=?;";
  db.query(sqlUpdateUser, [data.email, data.name, data.password, data.role, data.username, data.user_id], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error updating user.");
    } else {
      if (data.role === "teacher") {
        const sqlUpdateTeacher = "update teacher set qualification= ? ,city=?,mobile_no=?,nic=?,status=? WHERE user_id=?;";
        db.query(sqlUpdateTeacher, [
          data.qualification,
          data.city,
          data.mobile_no,
          data.nic,
          data.status,
          data.user_id], (err, teacherResult) => {
          if (err) {
            console.log(err);
            res.status(500).send("Error updating teacher details.");
          } else {
            console.log("User and teacher details updated successfully.");
            res.send(teacherResult);
          }
        });
      } else {
        console.log("User details updated successfully.");
        res.send(result);
      }
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
