const admin = require("firebase-admin");
const express = require("express");

const PORT = process.env.PORT || 4600;

// Firebase setup
const serviceAccount = require("../keys/student-connect-dev-a16b3-firebase-adminsdk-1vhnw-b57754a9d6.json");
const fb = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://student-connect-dev-a16b3-default-rtdb.firebaseio.com"
});
const auth = fb.auth();
const db = fb.database();

const allowCORS = (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
  res.set('Access-Control-Allow-Headers', 'Content-Type, authorisation');
  next();
}

const getUserByToken = async token => {
  let user;
  await auth.verifyIdToken(token)
  .then(decodedIdToken => {
    return auth.getUser(decodedIdToken.uid);
  })
  .then(userRecord => {
    user = userRecord.toJSON();
  })
  .catch(error => console.log(error));
  return user;
}

const authentication = async (req, res, next) => {
  // If this is a preflight request, continue without authentication (it won't match any routes with its request method)
  if (req.method === "OPTIONS") {
    return next();
  }
  // Getting the current user's token from the request
  const authToken = req.headers.authorisation;
  if (!authToken) {
    const errorMessage = "User has not provided an authentication token with request";
    console.log("(url: "+req.url+") [Auth] - " + errorMessage);
    res.status(401);
    res.json({ errorMessage: errorMessage });
    return;
  }
  const user = await getUserByToken(authToken).catch(error => console.log(error));
  if (!user) {
    const errorMessage = "No user found with provided authentication token";
    console.log("(url: "+req.url+") [Auth] - " + errorMessage);
    res.status(400);
    res.json({ errorMessage: errorMessage });
    return;
  }
  if (!users) {
    const errorMessage = "Cannot read database";
    console.log("(url: "+req.url+") [Auth] - " + errorMessage);
    res.status(500);
    res.json({ errorMessage: errorMessage });
    return;
  }
  let currentUser = null;
  users.forEach(u => {
    if (user.uid === u.uid) {
      currentUser = u;
    }
  });
  if (!currentUser) {
    const errorMessage = "Current user not found in database";
    console.log("(url: "+req.url+") [Auth] - " + errorMessage);
    res.status(400);
    res.json({ errorMessage: errorMessage });
    return;
  }
  res.locals.currentUser = currentUser;
  next();
}

const app = express();

// Should only need the following header if running server and React both on localhost (CORS)
app.use(allowCORS);

// Needed to be able to extract POST body data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure every user that accesses the server is authenticated in Firebase (including in DB)
app.use(authentication);

const propertiesToArray = (parent, storeKey=false) => {
  if (!parent) {
    return [];
  }
  let children = Object.keys(parent);
  let newParent = children.map(child => {
    if (storeKey) {
      parent[child].key = child;
    }
    return parent[child];
  });
  return newParent;
}

const calculatePerformance = (yearLevel, term, year) => {
  const performanceDepartments = {};

  const classMatch = year+"-t"+term+"-y"+yearLevel;
  const substringLength = yearLevel < 10 ? 10 : 11;
  let departmentResults = {};
  classes.forEach(Class => {
    if (Class.classId.substring(0, substringLength) !== classMatch) {
      // If the class isn't from the desired term/year, continue to next class
      return;
    }
    let classGrades = [], classGradesSum = 0;
    let classLowest, classMedian, classAverage, classHighest;
    if (Class.performance.length === 0) {
      // Continue onto the next class if there is no performance recorded
      return;
    }
    Class.performance.forEach(grade => {
      classGradesSum += Number(grade);
      classGrades.push(grade);
      if (!classLowest || grade < classLowest) {
        classLowest = grade;
      }
      if (!classHighest || grade > classHighest) {
        classHighest = grade;
      }
    });
    if (classGradesSum.length === 0) {
      // Continue onto the next class if there are no results
      return;
    }
    classGrades.sort();
    const middleInd = Math.floor(classGrades.length/2);
    classMedian = classGrades[middleInd];
    classAverage = classGradesSum/classGrades.length;

    if (departmentResults[Class.department]) {
      departmentResults[Class.department].push({
        lowest: classLowest,
        median: classMedian,
        average: classAverage,
        highest: classHighest
      });
    } else {
      departmentResults[Class.department] = [{
        lowest: classLowest,
        median: classMedian,
        average: classAverage,
        highest: classHighest
      }]
    }
  });
  if (!departmentResults) {
    return null;
  }
  // For each department, sum the individual result categories and store into departmentResults for that department
  const departments = Object.keys(departmentResults);
  Object.values(departmentResults).forEach((departRes, i) => {
    // Get the average grades for each department
    let lowest = 0, median = 0, average = 0, highest = 0;
    departRes.forEach(obj => {
      lowest += obj.lowest;
      median += obj.median;
      average += obj.average;
      highest += obj.highest;
    });
    lowest /= departRes.length;
    median /= departRes.length;
    average /= departRes.length;
    highest /= departRes.length;
    performanceDepartments[departments[i]] = {
      lowest: lowest,
      median: median,
      average: average,
      highest: highest
    };
  });
  return performanceDepartments;
}


/*     Database Listeners     */
// Admin Information such as current term and year
let adminInfo;
const adminRef = db.ref("admin");
adminRef.on("value", snapshot => {
  adminInfo = snapshot.val();
}, error => console.log("(/admin listener) - [DB] Admin read failed: " + error.code));

// Users
let users;
const userRef = db.ref("user");
userRef.on("value", snapshot => {
  users = propertiesToArray(snapshot.val());
}, error => console.log("(/user listener) - [DB] Users read failed: " + error.code));

// Classes
let classes;
const classRef = db.ref("class");
classRef.on("value", snapshot => {
  // Since the result from DB is one big object, we split this up into an object with arrays for easier access
  let tmpClasses = propertiesToArray(snapshot.val()).map(Class => {
    Class.goals = propertiesToArray(Class.goal).map(goal => {
      goal.tasks = propertiesToArray(goal.task);
      // stripping the old singular property now that we have the plural version
      delete(goal.task);
      return goal;
    });
    Class.performanceObj = Class.performance;
    Class.performance = propertiesToArray(Class.performance);
    delete(Class.goal);
    Class.students = propertiesToArray(Class.student);
    delete(Class.student);
    Class.teachers = propertiesToArray(Class.teacher);
    delete(Class.teacher);
    // To replace the user IDs returned in the class with actual user objects
    let tmpStudents = [];
    Class.students.forEach(student => {
      users.forEach(user => {
        if (user.uid === student.uid) {
          tmpStudents.push(user);
        }
      });
    });
    Class.students = tmpStudents;
    let tmpTeachers = [];
    Class.teachers.forEach(teacher => {
      users.forEach(user => {
        if (user.uid === teacher.uid) {
          tmpTeachers.push(user);
        }
      });
    });
    Class.teachers = tmpTeachers;
    return Class;
  });
  classes = tmpClasses;
}, error => console.log("(/class listener) - [DB] Classes read failed: " + error.code));

// Surveys
let surveys;
const surveyRef = db.ref("survey");
surveyRef.on("value", snapshot => {
  surveys = propertiesToArray(snapshot.val(), true).map(survey => {
    survey.questions = survey.questions.map(question => {
      question.responses = propertiesToArray(question.responses);
      return question;
    });
    return survey;
  });
}, error => console.log("(/survey listener) - [DB] Survey read failed: " + error.code));


/*     App Routes     */
app.get("/user/current", async (req, res) => {
  res.status(200);
  res.json({ user: res.locals.currentUser });
});

app.get("/term/current", async (req, res) => {
  res.status(200);
  res.json({ termInfo: {
    year: adminInfo.year,
    term: adminInfo.term
  }});
});

app.get("/users", async (req, res) => {
  const currentUser = res.locals.currentUser;

  // Ensuring user is authorised to perform this action
  const authorisedRoles = ["admin"];
  const authed = authorisedRoles.includes(currentUser.role);
  if (!authed) {
    const errorMessage = "User is not authorised to perform this action";
    console.log("(/users) [Auth] - " + errorMessage);
    res.status(401);
    res.json({ errorMessage: errorMessage });
    return;
  }
  res.status(200);
  res.json({
    users: users
  });
});

app.get("/classes", async (req, res) => {
  const currentUser = res.locals.currentUser;

  // Ensuring user is authorised to perform this action
  const authorisedRoles = ["admin"];
  const authed = authorisedRoles.includes(currentUser.role);
  if (!authed) {
    const errorMessage = "User is not authorised to perform this action";
    console.log("(/classes) [Auth] - " + errorMessage);
    res.status(401);
    res.json({ errorMessage: errorMessage });
    return;
  }
  res.status(200);
  res.json({
    classes: classes
  });
});

app.get("/surveys", async (req, res) => {
  const currentUser = res.locals.currentUser;

  // Ensuring user is authorised to perform this action
  const authorisedRoles = ["student", "teacher", "councillor"];
  const authed = authorisedRoles.includes(currentUser.role);
  if (!authed) {
    const errorMessage = "User is not authorised to perform this action";
    console.log("(/surveys) [Auth] - " + errorMessage);
    res.status(401);
    res.json({ errorMessage: errorMessage });
    return;
  }

  let surveysCurrentUser = [];
  if (currentUser.role === "teacher" || currentUser.role === "councillor") {
    surveys.forEach(survey => {
      if (survey.creator.uid === currentUser.uid) {
        surveysCurrentUser.push(survey);
      }
    });
  } else if (currentUser.role === "student") {
    surveys.forEach(survey => {
      if (survey.students) {
        survey.students.forEach(student => {
          if (student.uid === currentUser.uid) {
            surveysCurrentUser.push(survey);
          }
        });
      }
    });
  }

  res.status(200);
  res.json({
    surveys: surveysCurrentUser
  });
});

app.post("/create/survey", async (req, res) => {
  const currentUser = res.locals.currentUser;

  // Ensuring user is authorised to perform this action
  const authorisedRoles = ["admin", "teacher", "councillor"];
  const authed = authorisedRoles.includes(currentUser.role);
  if (!authed) {
    const errorMessage = "User is not authorised to perform this action";
    console.log("(/create/survey) [Auth] - " + errorMessage);
    res.status(401);
    res.json({ errorMessage: errorMessage });
    return;
  }

  const newSurvey = req.body.newSurvey;
  if (!newSurvey) {
    const errorMessage = "Could not get valid 'newSurvey' from request body";
    console.log("(/create/survey) - " + errorMessage);
    res.status(400);
    res.json({ errorMessage: errorMessage });
    return;
  }
  // Add survey to the DB
  await surveyRef.push({
    ...newSurvey
  }, error => {
    if (error) {
      const errorMessage = "New survey could not be created: " + error;
      console.log("(/create/survey) - [DB] " + errorMessage);
      res.status(500);
      res.json({ errorMessage: errorMessage });
      return;
    }
  });
  res.sendStatus(204);
  return;
});

app.post("/survey/add/class", async (req, res) => {
  const currentUser = res.locals.currentUser;

  // Ensuring user is authorised to perform this action
  const authorisedRoles = ["teacher", "councillor"];
  const authed = authorisedRoles.includes(currentUser.role);
  if (!authed) {
    const errorMessage = "User is not authorised to perform this action";
    console.log("(/survey/add/class) [Auth] - " + errorMessage);
    res.status(401);
    res.json({ errorMessage: errorMessage });
    return;
  }

  const surveyKey = req.body.surveyKey;
  const classId = req.body.classId;

  if (!surveyKey || !classId) {
    const errorMessage = "Could not get 'surveyKey' or 'classId' from request body";
    console.log("(/survey/add/class) - " + errorMessage);
    res.status(400);
    res.json({ errorMessage: errorMessage });
    return;
  }

  let survey;
  surveys.forEach(surv => {
    if (surv.key === surveyKey) {
      survey = surv;
    }
  });
  if (!survey) {
    const errorMessage = "Could not find survey with key '"+surveyKey+"'";
    console.log("(/survey/add/class) - " + errorMessage);
    res.status(400);
    res.json({ errorMessage: errorMessage });
    return;
  }
  let surveyStudents = survey.students || [];

  let Class;
  classes.forEach(ClassObj => {
    if (ClassObj.classId === classId) {
      Class = ClassObj;
    }
  })

  if (!Class) {
    const errorMessage = "Could not find class with classId '"+classId+"'";
    console.log("(/survey/add/class) - " + errorMessage);
    res.status(400);
    res.json({ errorMessage: errorMessage });
    return;
  }

  if (Class.students.length < 1) {
    const errorMessage = "No students could be found in the class '"+classId+"'";
    console.log("(/survey/add/class) - " + errorMessage);
    res.status(400);
    res.json({ errorMessage: errorMessage });
    return;
  }
  
  let existsInSurvey = false;
  Class.students.forEach(classStudent => {
    existsInSurvey = false;
    surveyStudents.forEach(surveyStudent => {
      if (surveyStudent.uid == classStudent.uid) {
        existsInSurvey = true;
      }
    });
    if (!existsInSurvey) {
      surveyStudents.push({uid: classStudent.uid, answered: false});
    }
  });

  // Update the student list with the class's students
  await surveyRef.child(surveyKey).child("students").set(surveyStudents, error => {
    if (error) {
      const errorMessage = "Survey students could not be updated";
      console.log("(/survey/add/class) - [DB] " + errorMessage);
      res.status(500);
      res.json({ errorMessage: errorMessage });
      return;
    }
  });
  res.sendStatus(204);
  return;
});

app.post("/survey/add/student", async (req, res) => {
  const currentUser = res.locals.currentUser;

  // Ensuring user is authorised to perform this action
  const authorisedRoles = ["teacher", "councillor"];
  const authed = authorisedRoles.includes(currentUser.role);
  if (!authed) {
    const errorMessage = "User is not authorised to perform this action";
    console.log("(/survey/add/student) [Auth] - " + errorMessage);
    res.status(401);
    res.json({ errorMessage: errorMessage });
    return;
  }

  const surveyKey = req.body.surveyKey;
  const studentId = req.body.studentId;

  if (!surveyKey || !studentId) {
    const errorMessage = "Could not get 'surveyKey' or 'studentId' from request body";
    console.log("(/survey/add/student) - " + errorMessage);
    res.status(400);
    res.json({ errorMessage: errorMessage });
    return;
  }

  let survey;
  surveys.forEach(surv => {
    if (surv.key === surveyKey) {
      survey = surv;
    }
  });
  if (!survey) {
    const errorMessage = "Could not find survey with key '"+surveyKey+"'";
    console.log("(/survey/add/student) - " + errorMessage);
    res.status(400);
    res.json({ errorMessage: errorMessage });
    return;
  }
  let surveyStudents = survey.students || [];

  let student;
  users.forEach(user => {
    if (user.role === "student" && user.studentId === studentId) {
      student = user;
    }
  })

  if (!student) {
    const errorMessage = "Could not find student with studentId '"+studentId+"'";
    console.log("(/survey/add/student) - " + errorMessage);
    res.status(400);
    res.json({ errorMessage: errorMessage });
    return;
  }
  
  let existsInSurvey = false;
  surveyStudents.forEach(surveyStudent => {
    if (surveyStudent.uid == student.uid) {
      existsInSurvey = true;
    }
  });
  if (!existsInSurvey) {
    surveyStudents.push({uid: student.uid, answered: false});
  }

  // Update the student list with the class's students
  await surveyRef.child(surveyKey).child("students").set(surveyStudents, error => {
    if (error) {
      const errorMessage = "Survey students could not be updated";
      console.log("(/survey/add/student) - [DB] " + errorMessage);
      res.status(500);
      res.json({ errorMessage: errorMessage });
      return;
    }
  });
  res.sendStatus(204);
  return;
});

app.post("/survey/answer", async (req, res) => {
  const currentUser = res.locals.currentUser;

  // Ensuring user is authorised to perform this action
  const authorisedRoles = ["student"];
  const authed = authorisedRoles.includes(currentUser.role);
  if (!authed) {
    const errorMessage = "User is not authorised to perform this action";
    console.log("(/survey/answer) [Auth] - " + errorMessage);
    res.status(401);
    res.json({ errorMessage: errorMessage });
    return;
  }
  const surveyKey = req.body.surveyKey;
  const uid = req.body.uid;
  const responses = req.body.responses;

  if (!surveyKey || !uid || !responses) {
    const errorMessage = "Could not get 'surveyKey', 'uid' or 'responses' from request body";
    console.log("(/survey/answer) - " + errorMessage);
    res.status(400);
    res.json({ errorMessage: errorMessage });
    return;
  }

  // Update the survey questions with the student's responses
  let answeredQuestion = false;
  for (let i=0; i<responses.length; i++) {
    if (responses[i] === "" || responses[i] === "-nodeResponseNone") {
      continue;
    } else if (typeof(responses[i]) !== "string") {
      let empty = true;
      responses[i].forEach(response => {
        if (response === '1') {
          empty = false;
        }
      });
      if (empty) {
        continue;
      }
    }
    answeredQuestion = true;
    await surveyRef.child(surveyKey).child("questions").child(i).child("responses").child(uid).set({
      uid: uid,
      response: responses[i]
    }, error => {
      if (error) {
        const errorMessage = "Survey responses could not be stored";
        console.log("(/survey/answer) - [DB] " + errorMessage);
        res.status(500);
        res.json({ errorMessage: errorMessage });
        return;
      }
    });
  }
  await surveyRef.child(surveyKey).child("allResponses").child(uid).set({
    uid: uid,
    name: currentUser.displayName,
    responses: responses
  }, error => {
    if (error) {
      const errorMessage = "Survey responses could not be stored";
      console.log("(/survey/answer) - [DB] " + errorMessage);
      res.status(500);
      res.json({ errorMessage: errorMessage });
      return;
    }
  });

  if (answeredQuestion) {
    // Store that the student has responded to the survey
    let indexOfStudent = -1;
    surveys.forEach(survey => {
      if (survey.key === surveyKey) {
        indexOfStudent = survey.students.findIndex(student => student.uid === uid);
      }
    });
    if (indexOfStudent === -1) {
      const errorMessage = "Could not get student in survey to store that they have answered, but responses were stored";
      console.log("(/survey/answer) - " + errorMessage);
      res.status(400);
      res.json({ errorMessage: errorMessage });
      return;
    }
    await surveyRef.child(surveyKey).child("students").child(indexOfStudent).update({answered: true}, error => {
      if (error) {
        const errorMessage = "Survey responses could not be stored";
        console.log("(/survey/answer) - [DB] " + errorMessage);
        res.status(500);
        res.json({ errorMessage: errorMessage });
        return;
      }
    });
  }
  
  res.sendStatus(204);
  return;
});

app.delete("/delete/survey/:surveyKey", async (req, res) => {
  const currentUser = res.locals.currentUser;

  // Ensuring user is authorised to perform this action
  const authorisedRoles = ["admin", "teacher", "councillor"];
  const authed = authorisedRoles.includes(currentUser.role);
  if (!authed) {
    const errorMessage = "User is not authorised to perform this action";
    console.log("(/delete/survey) [Auth] - " + errorMessage);
    res.status(401);
    res.json({ errorMessage: errorMessage });
    return;
  }

  const surveyKey = req.params.surveyKey;
  if (!surveyKey) {
    const errorMessage = "Could not get 'surveyKey' from request url";
    console.log("(/delete/survey) - " + errorMessage);
    res.status(400);
    res.json({ errorMessage: errorMessage });
    return;
  }

  // Delete from DB
  await surveyRef.child(surveyKey).set(null, error => {
    if (error) {
      const errorMessage = "Survey could not be deleted: " + error.errorInfo.message;
      console.log("(/delete/survey) - [DB] " + errorMessage);
      res.status(500);
      res.json({ errorMessage: errorMessage });
      return;
    }
  })
  .catch(error => console.log(error));
  console.log("(/delete/survey) - Successfully deleted survey");
  res.sendStatus(204);
  return;
});

app.post("/create/user", async (req, res) => {
  const currentUser = res.locals.currentUser;

  // Ensuring user is authorised to perform this action
  const authorisedRoles = ["admin"];
  const authed = authorisedRoles.includes(currentUser.role);
  if (!authed) {
    const errorMessage = "User is not authorised to perform this action";
    console.log("(/create/user) [Auth] - " + errorMessage);
    res.status(401);
    res.json({ errorMessage: errorMessage });
    return;
  }

  const newUser = req.body.newUser;
  if (!newUser || !newUser.role || !newUser.email || !newUser.password || !newUser.displayName
    || newUser.role == "student" && (!newUser.yearLevel || !newUser.studentId)) {
    const errorMessage = "Could not get valid 'newUser' from request body";
    console.log("(/create/user) - " + errorMessage);
    res.status(400);
    res.json({ errorMessage: errorMessage });
    return;
  }
  await auth.createUser({
    email: newUser.email,
    password: newUser.password,
    displayName: newUser.displayName
  })
  .then(async userRecord => {
    console.log("(/create/user) - [Auth] Successfully created new user: ", userRecord.uid);
    // Add user to the DB with the specified role
    await userRef.child(userRecord.uid).set({
      email: userRecord.email,
      displayName: userRecord.displayName,
      role: newUser.role,
      uid: userRecord.uid,
      yearLevel: newUser.role === "student" ? newUser.yearLevel : null,
      studentId: newUser.role === "student" ? newUser.studentId : null
    }, error => {
      if (error) {
        const errorMessage = "New user could not be created: " + error;
        console.log("(/create/user) - [DB] " + errorMessage);
        res.status(500);
        res.json({ errorMessage: errorMessage });
        return;
      }
    });
    console.log("(/create/user) - Successfully created user: ", newUser.email);
    res.sendStatus(204);
    return;
  })
  .catch(error => {
    const errorMessage = "New user could not be created: " + error;
    console.log("(/create/user) - [Auth] " + errorMessage);
    res.status(500);
    res.json({ errorMessage: errorMessage });
    return;
  });
});

app.delete("/delete/user/:uid", async (req, res) => {
  const currentUser = res.locals.currentUser;

  // Ensuring user is authorised to perform this action
  const authorisedRoles = ["admin"];
  const authed = authorisedRoles.includes(currentUser.role);
  if (!authed) {
    const errorMessage = "User is not authorised to perform this action";
    console.log("(/delete/user) [Auth] - " + errorMessage);
    res.status(401);
    res.json({ errorMessage: errorMessage });
    return;
  }

  const uid = req.params.uid;
  if (!uid) {
    const errorMessage = "Could not get 'uid' from request url";
    console.log("(/delete/user) - " + errorMessage);
    res.status(400);
    res.json({ errorMessage: errorMessage });
    return;
  }

  //Confirm the current user isn't the one being deleted
  if (uid === currentUser.uid) {
    const errorMessage = `Currently logged in user '${currentUser.email}' will not be deleted`;
    console.log("(/delete/user) - " + errorMessage);
    res.status(400);
    res.json({ errorMessage: errorMessage });
    return;
  }

  // Delete from Auth
  await auth.deleteUser(uid)
  .then(() => {
    // May or may not want to do something here in the future
  })
  .catch(error => {
    const errorMessage = "User could not be deleted: " + error.errorInfo.message;
    console.log("(/delete/user) - [Auth] " + errorMessage);
    res.status(500);
    res.json({ errorMessage: errorMessage });
    return;
  });

  // Tracking which user is being deleted in an easier to read format
  let userEmail;
  users.forEach(user => {
    if (user.uid === uid) {
      userEmail = user.email;
    }
  });

  // Delete from DB
  await userRef.child(uid).set(null, error => {
    if (error) {
      const errorMessage = "User could not be deleted: " + error.errorInfo.message;
      console.log("(/delete/user) - [DB] " + errorMessage);
      res.status(500);
      res.json({ errorMessage: errorMessage });
      return;
    }
  })
  .catch(error => console.log(error));
  console.log("(/delete/user) - Successfully deleted user: ", userEmail);
  res.sendStatus(204);
  return;
});

app.get("/departments", async (req, res) => {
  const currentUser = res.locals.currentUser;

  // Ensuring user is authorised to perform this action
  const authorisedRoles = ["admin", "staff", "teacher", "councillor"];
  const authed = authorisedRoles.includes(currentUser.role);
  if (!authed) {
    const errorMessage = "User is not authorised to perform this action";
    console.log("(/departments) [Auth] - " + errorMessage);
    res.status(401);
    res.json({ errorMessage: errorMessage });
    return;
  }
  let departments = [];
  classes.forEach(Class => {
    if (!departments.includes(Class.department)) {
      departments.push(Class.department);
    }
  });
  res.status(200);
  res.json({
    departments: departments
  });
});

app.get("/performance/department", async (req, res) => {
  const currentUser = res.locals.currentUser;
  const year = req.query.year === "current" ? adminInfo.year : Number(req.query.year);
  const term = req.query.term === "current" ? adminInfo.term : Number(req.query.term);
  const yearLevel = req.query.yearLevel;

  // Ensuring user is authorised to perform this action
  const authorisedRoles = ["admin", "staff"];
  const authed = authorisedRoles.includes(currentUser.role);
  if (!authed) {
    const errorMessage = "User is not authorised to perform this action";
    console.log("(/performance/department) [Auth] - " + errorMessage);
    res.status(401);
    res.json({ errorMessage: errorMessage });
    return;
  }

  if (!yearLevel) {
    const errorMessage = "Could not get 'yearLevel' from query string";
    console.log("(/performance/department) - " + errorMessage);
    res.status(400);
    res.json({ errorMessage: errorMessage });
    return;
  }
  // Get the results for each department for the current term/year
  const performanceDepartments = calculatePerformance(yearLevel, term, year);
  if (performanceDepartments === null || Object.keys(performanceDepartments).length === 0) {
    const errorMessage = "No performance data exists for the specified term";
    res.status(200);
    res.json({ errorMessage: errorMessage });
    return;
  }
  res.status(200);
  res.json({
    performanceDepartments: performanceDepartments
  });
});

app.post("/performance/update", async (req, res) => {
  const currentUser = res.locals.currentUser;

  // Ensuring user is authorised to perform this action
  const authorisedRoles = ["teacher"];
  const authed = authorisedRoles.includes(currentUser.role);
  if (!authed) {
    const errorMessage = "User is not authorised to perform this action";
    console.log("(/performance/update) [Auth] - " + errorMessage);
    res.status(401);
    res.json({ errorMessage: errorMessage });
    return;
  }

  const newPerformance = req.body.newPerformance;
  if (!newPerformance) {
    const errorMessage = "Could not get valid 'newPerformance' from request body";
    console.log("(/performance/update) - " + errorMessage);
    res.status(400);
    res.json({ errorMessage: errorMessage });
    return;
  }
  // Update the student's performance in the DB
  let user;
  users.forEach(u => {
    if (u.role == "student" && u.studentId === newPerformance.studentId) {
      user = u;
    }
  });
  if (!user) {
    const errorMessage = "Could not find user based on the studentId '" + newPerformance.studentId + "'";
    console.log("(/performance/update) - " + errorMessage);
    res.status(400);
    res.json({ errorMessage: errorMessage });
    return;
  }
  let Class;
  classes.forEach(c => {
    if (c.classId === newPerformance.classId) {
      Class = c;
    }
  });
  if (!Class) {
    const errorMessage = "Couldn't find the class with classId '" + newPerformance.classId + "'";
    console.log("(/performance/update) - [DB] " + errorMessage);
    res.status(500);
    res.json({ errorMessage: errorMessage });
    return;
  }
  await classRef.child(Class.classId).child("performance").child(user.uid).set(Number(newPerformance.grade), error => {
    if (error) {
      const errorMessage = "Student performance could not be updated: " + error;
      console.log("(/performance/update) - [DB] " + errorMessage);
      res.status(500);
      res.json({ errorMessage: errorMessage });
      return;
    }
  });
  res.sendStatus(204);
  return;
});

app.get("/classes/teacher", async (req, res) => {
  const currentUser = res.locals.currentUser;

  // Ensuring user is authorised to perform this action
  const authorisedRoles = ["teacher"];
  const authed = authorisedRoles.includes(currentUser.role);
  if (!authed) {
    const errorMessage = "User is not authorised to perform this action";
    console.log("(/classes/teacher) [Auth] - " + errorMessage);
    res.status(401);
    res.json({ errorMessage: errorMessage });
    return;
  }
  // Capture all the classes the user teaches
  const currentTerm = adminInfo.year+"-t"+adminInfo.term;
  let teacherClasses = [];
  classes.forEach(classObj => {
    if (classObj.teachers) {
      classObj.teachers.forEach(teacher => {
        if (teacher.uid === currentUser.uid && classObj.classId.substring(0,7) === currentTerm) {
          teacherClasses.push(classObj);
        }
      });
    }
  })
  res.status(200);
  res.json({
    classes: teacherClasses
  });
});

app.get("/classes/student", async (req, res) => {
  const currentUser = res.locals.currentUser;

  // Ensuring user is authorised to perform this action
  const authorisedRoles = ["student"];
  const authed = authorisedRoles.includes(currentUser.role);
  if (!authed) {
    const errorMessage = "User is not authorised to perform this action";
    console.log("(/classes/student) [Auth] - " + errorMessage);
    res.status(401);
    res.json({ errorMessage: errorMessage });
    return;
  }
  // Capture all the classes the user is a student for
  const currentTerm = adminInfo.year+"-t"+adminInfo.term;
  let studentClasses = [];
  classes.forEach(classObj => {
    if (classObj.students) {
      classObj.students.forEach(student => {
        if (student.uid === currentUser.uid && classObj.classId.substring(0,7) === currentTerm) {
          studentClasses.push(classObj);
        }
      });
    }
  })
  res.status(200);
  res.json({
    classes: studentClasses
  });
});

app.get("/classes/student/:studentId", async (req, res) => {
  const currentUser = res.locals.currentUser;

  // Ensuring user is authorised to perform this action
  const authorisedRoles = ["parent"];
  const authed = authorisedRoles.includes(currentUser.role);
  if (!authed) {
    const errorMessage = "User is not authorised to perform this action";
    console.log("(/classes/student/:studentId) [Auth] - " + errorMessage);
    res.status(401);
    res.json({ errorMessage: errorMessage });
    return;
  }
  const studentId = req.params.studentId;
  if (!studentId) {
    const errorMessage = "Could not get valid studentId parameter from request url";
    console.log("(/classes/student/:studentId) - " + errorMessage);
    res.status(401);
    res.json({ errorMessage: errorMessage });
    return;
  }

  const currentTerm = adminInfo.year+"-t"+adminInfo.term;
  let studentClasses = [];
  // Capture all the classes the user is a student for
  classes.forEach(classObj => {
    if (classObj.students) {
      classObj.students.forEach(student => {
        if (classObj.classId.substring(0,7) === currentTerm) {
          if (student.studentId === studentId) {
            studentClasses.push(classObj);
          }
        }
      });
    }
  });
  res.status(200);
  res.json({
    classes: studentClasses
  });
});

app.post("/classes/department", async (req, res) => {
  const currentUser = res.locals.currentUser;

  // Ensuring user is authorised to perform this action
  const authorisedRoles = ["admin", "staff", "teacher", "councillor"];
  const authed = authorisedRoles.includes(currentUser.role);
  if (!authed) {
    const errorMessage = "User is not authorised to perform this action";
    console.log("(/classes/department) [Auth] - " + errorMessage);
    res.status(401);
    res.json({ errorMessage: errorMessage });
    return;
  }

  const year = req.body.year === "current" ? adminInfo.year : req.body.year;
  const term = req.body.term === "current" ? adminInfo.term : req.body.term;
  const yearLevel = req.body.yearLevel;
  const department = req.body.department.toLowerCase().replace(" ", "_");
  const matchString = year+"-t"+term+"-y"+yearLevel+"-"+department;
  const substringLength = matchString.length;
  
  // Capture all the classes that are present in the given department for the given term
  let departmentClasses = [];
  classes.forEach(classObj => {
    if (classObj.classId.substring(0,substringLength) === matchString) {
          departmentClasses.push(classObj);
    }
  })
  res.status(200);
  res.json({
    classes: departmentClasses
  });
});

app.post("/create/goal", async (req, res) => {
  const currentUser = res.locals.currentUser;

  // Ensuring user is authorised to perform this action
  const authorisedRoles = ["teacher"];
  const authed = authorisedRoles.includes(currentUser.role);
  if (!authed) {
    const errorMessage = "User is not authorised to perform this action";
    console.log("(/create/goal) [Auth] - " + errorMessage);
    res.status(401);
    res.json({ errorMessage: errorMessage });
    return;
  }
  const classId = req.body.classId;
  const goal = req.body.goal;
  if (!classId || !goal || !goal.goalId) {
    const errorMessage = "Could not get 'classId' or valid 'goal' from request body";
    console.log("(/create/goal) - " + errorMessage);
    res.status(400);
    res.json({ errorMessage: errorMessage });
    return;
  }
  
  // Add goal to the class with the specified classId
  await classRef.child(classId).child("goal").child(goal.goalId).set({
    ...goal
  }, error => {
    if (error) {
      const errorMessage = "New goal could not be created: " + error;
      console.log("(/create/goal) - [DB] " + errorMessage);
      res.status(500);
      res.json({ errorMessage: errorMessage });
      return;
    }
  });
  res.sendStatus(204);
  return;
});

app.delete("/delete/goal", async (req, res) => {
  const currentUser = res.locals.currentUser;

  // Ensuring user is authorised to perform this action
  const authorisedRoles = ["teacher"];
  const authed = authorisedRoles.includes(currentUser.role);
  if (!authed) {
    const errorMessage = "User is not authorised to perform this action";
    console.log("(/delete/goal) [Auth] - " + errorMessage);
    res.status(401);
    res.json({ errorMessage: errorMessage });
    return;
  }
  const classId = req.body.classId;
  const goalId = req.body.goalId;
  if (!classId || !goalId) {
    const errorMessage = "Could not get 'classId' o 'goalId' from request body";
    console.log("(/delete/goal) - " + errorMessage);
    res.status(400);
    res.json({ errorMessage: errorMessage });
    return;
  }
  
  // Delete goal with the specified classId and goalId
  await classRef.child(classId).child("goal").child(goalId).remove(
    error => {
    if (error) {
      const errorMessage = "Goal could not be deleted: " + error;
      console.log("(/delete/goal) - [DB] " + errorMessage);
      res.status(500);
      res.json({ errorMessage: errorMessage });
      return;
    }
  });
  res.sendStatus(204);
  return;
});

app.post("/update/progress", async (req, res) => {
  const currentUser = res.locals.currentUser;

  // Ensuring user is authorised to perform this action
  const authorisedRoles = ["student"];
  const authed = authorisedRoles.includes(currentUser.role);
  if (!authed) {
    const errorMessage = "User is not authorised to perform this action";
    console.log("(/update/progress) [Auth] - " + errorMessage);
    res.status(401);
    res.json({ errorMessage: errorMessage });
    return;
  }
  const classId = req.body.classId;
  const goalId = req.body.goalId;
  const progress = req.body.progress;
  if (!classId || !goalId || !progress) {
    const errorMessage = "Could not get 'classId', 'goalId' or valid 'task' from request body";
    console.log("(/update/progress) - " + errorMessage);
    res.status(400);
    res.json({ errorMessage: errorMessage });
    return;
  }
  // Create an object to update completion of multiple tasks
  let updates = {}
  progress.forEach(task => {
    let path = classId+"/goal/"+goalId+ "/task/" + task["task-id"] + "/completion/"+ currentUser["uid"];
    let value = task["completion"];
    updates[path] = value;
  })
  progress.forEach(task => {
    if (!(task["evidence"]===undefined)){
      let path = classId+"/goal/"+goalId+ "/task/" + task["task-id"] + "/evidence/"+ currentUser["uid"];
      let value = task["evidence"];
      updates[path] = value;
    }
  })

  // Update the student's completion to the task
  await classRef.update(updates
    , error => {
    if (error) {
      const errorMessage = "Progress could not be updated: " + error;
      console.log("(/update/progress) - [DB] " + errorMessage);
      res.status(500);
      res.json({ errorMessage: errorMessage });
      return;
    }
  });
  res.sendStatus(204);
  return;
});

app.post("/create/class", async (req, res) => {
  const currentUser = res.locals.currentUser;

  // Ensuring user is authorised to perform this action
  const authorisedRoles = ["admin"];
  const authed = authorisedRoles.includes(currentUser.role);
  if (!authed) {
    const errorMessage = "User is not authorised to perform this action";
    console.log("(/create/class) [Auth] - " + errorMessage);
    res.status(401);
    res.json({ errorMessage: errorMessage });
    return;
  }
  const classId = req.body.classId;
  const classObject = req.body.classObject;
  if (!classObject) {
    const errorMessage = "Could not get 'class id' or 'class object' from request body";
    console.log("(/create/class) - " + errorMessage);
    res.status(400);
    res.json({ errorMessage: errorMessage });
    return;
  }
  
  // Add goal to the class with the specified classId
  await classRef.child(classId).set({
    ...classObject
  }, error => {
    if (error) {
      const errorMessage = "New class could not be created: " + error;
      console.log("(/create/class) - [DB] " + errorMessage);
      res.status(500);
      res.json({ errorMessage: errorMessage });
      return;
    }
  });
  res.sendStatus(204);
  return;
});

app.delete("/delete/class", async (req, res) => {
  const currentUser = res.locals.currentUser;

  // Ensuring user is authorised to perform this action
  const authorisedRoles = ["admin"];
  const authed = authorisedRoles.includes(currentUser.role);
  if (!authed) {
    const errorMessage = "User is not authorised to perform this action";
    console.log("(/delete/class) [Auth] - " + errorMessage);
    res.status(401);
    res.json({ errorMessage: errorMessage });
    return;
  }
  const classId = req.body.classId;
  if (!classId) {
    const errorMessage = "Could not get 'classId' o 'goalId' from request body";
    console.log("(/delete/goal) - " + errorMessage);
    res.status(400);
    res.json({ errorMessage: errorMessage });
    return;
  }
  
  // Delete class with the specified classId
  await classRef.child(classId).remove(
    error => {
    if (error) {
      const errorMessage = "Class could not be deleted: " + error;
      console.log("(/delete/class) - [DB] " + errorMessage);
      res.status(500);
      res.json({ errorMessage: errorMessage });
      return;
    }
  });
  res.sendStatus(204);
  return;
});

app.get("/users/student", async (req, res) => {
  const currentUser = res.locals.currentUser;

  // Ensuring user is authorised to perform this action
  const authorisedRoles = ["admin"];
  const authed = authorisedRoles.includes(currentUser.role);
  if (!authed) {
    const errorMessage = "User is not authorised to perform this action";
    console.log("(/users) [Auth] - " + errorMessage);
    res.status(401);
    res.json({ errorMessage: errorMessage });
    return;
  }
 
  // Capture all the students
  const userRole = "student"
  let studentUsers = [];
  users.forEach(userObj => {
    if (userObj.role == userRole) {
      studentUsers.push(userObj);
        }
  });

  res.status(200);
  res.json({
    studentUsers: studentUsers
  });
});

app.get("/users/teacher", async (req, res) => {
  const currentUser = res.locals.currentUser;

  // Ensuring user is authorised to perform this action
  const authorisedRoles = ["admin"];
  const authed = authorisedRoles.includes(currentUser.role);
  if (!authed) {
    const errorMessage = "User is not authorised to perform this action";
    console.log("(/users) [Auth] - " + errorMessage);
    res.status(401);
    res.json({ errorMessage: errorMessage });
    return;
  }

  // Capture all the teachers
  const userRole = "teacher"
  let teacherUsers = [];
  users.forEach(userObj => {
    if (userObj.role == userRole) {
      teacherUsers.push(userObj);
        }
  });

  res.status(200);
  res.json({
    teacherUsers: teacherUsers
  });
});

app.post("/parent/link", async (req, res) => {
  const currentUser = res.locals.currentUser;

  // Ensuring user is authorised to perform this action
  const authorisedRoles = ["admin"];
  const authed = authorisedRoles.includes(currentUser.role);
  if (!authed) {
    const errorMessage = "User is not authorised to perform this action";
    console.log("(/parent/link) [Auth] - " + errorMessage);
    res.status(401);
    res.json({ errorMessage: errorMessage });
    return;
  }
  const parentUid = req.body.parentUid;
  const studentId = req.body.studentId;
  if (!parentUid|| !studentId) {
    const errorMessage = "Could not get 'parentUid' or 'studentId' from request body";
    console.log("(/parent/link) - " + errorMessage);
    res.status(400);
    res.json({ errorMessage: errorMessage });
    return;
  }

  let studentExists = false
  users.forEach(user => {
    if (user.role === "student" && user.studentId === studentId) {
      studentExists = true;
    }
  });
  if (!studentExists) {
    const errorMessage = "Student 'studentId' does not exist";
    console.log("(/parent/link) - " + errorMessage);
    res.status(400);
    res.json({ errorMessage: errorMessage });
    return;
  }
  
  let updatedStudents = [];
  let studentAlreadyLinked = false;
  users.forEach(user => {
    if (user.uid === parentUid) {
      if (user.students) {
        user.students.forEach(studId => {
          if (studId === studentId) {
            studentAlreadyLinked = true;
          }
        });
        if (!studentAlreadyLinked) {
          console.log(user.students);
          updatedStudents = user.students;
          updatedStudents.push(studentId);
        }
      } else {
        updatedStudents.push(studentId);
      }
    }
  });
  if (studentAlreadyLinked) {
    const errorMessage = `Student '${studentId}' is already linked to parent`;
    console.log("(/parent/link) - " + errorMessage);
    res.status(400);
    res.json({ errorMessage: errorMessage });
    return;
  }

  // Add goal to the class with the specified classId
  await userRef.child(parentUid).update({"students": updatedStudents}, error => {
    if (error) {
      const errorMessage = "Student could not be linked to parent: " + error;
      console.log("(/parent/link) - [DB] " + errorMessage);
      res.status(500);
      res.json({ errorMessage: errorMessage });
      return;
    }
  });
  res.sendStatus(204);
  return;
});


app.get("/parent/students", async (req, res) => {
  const currentUser = res.locals.currentUser;

  // Ensuring user is authorised to perform this action
  const authorisedRoles = ["parent"];
  const authed = authorisedRoles.includes(currentUser.role);
  if (!authed) {
    const errorMessage = "User is not authorised to perform this action";
    console.log("(/parent/students) [Auth] - " + errorMessage);
    res.status(401);
    res.json({ errorMessage: errorMessage });
    return;
  }

  const studentIds = currentUser.students;
  if (!studentIds || studentIds.length < 1) {
    const errorMessage = "Parent has no students enrolled";
    console.log("(/parent/students) - " + errorMessage);
    res.status(400);
    res.json({ errorMessage: errorMessage });
    return;
  }
  const students = [];
  users.forEach(user => {
    studentIds.forEach(studId => {
      if (user.role === "student" && user.studentId === studId) {
        students.push(user);
      }
    });
  });
  res.status(200);
  res.json({
    students: students
  });
});



/*     Server Listening     */
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});