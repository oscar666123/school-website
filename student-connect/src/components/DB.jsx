import firebase from 'firebase/app';

const adminServer = "http://localhost:4600";

export const getUsers = async () => {
    let users;

    // Getting logged-in user's token to authenticate request with admin server
    let authenticationToken = null;
    await firebase.auth().currentUser
    .getIdToken()
    .then(token => {
        authenticationToken = token;
    });
    await fetch(adminServer+"/users", {headers: new Headers({ "authorisation": authenticationToken}) })
    .then(res => {
        if (!res.ok) {
            // This will cause the execution to jump to the .catch section
            throw new Error(res.status, "Fetching users failed");
        }
        return res.json();
    })
    .then(data => {
        users = data.users;
    })
    .catch(error => console.log(error));
    return users;
}

export const createUser = async newUser => {
    if (!newUser) {
        return;
    }
    if (!newUser.email || !newUser.password || !newUser.role || !newUser.displayName) {
        throw new Error("Create user failed - missing user details");
    }
    newUser.role = newUser.role.toLowerCase();
    // Default message to display if none is returned by the admin server
    let result = "Failed to create new user";

    // Getting logged-in user's token to authenticate request with admin server
    let authenticationToken = null;
    await firebase.auth().currentUser
    .getIdToken()
    .then(token => {
        authenticationToken = token;
    });
    await fetch(adminServer+"/create/user", { 
        method: "post",
        headers: new Headers({
            "content-type": "application/json",
            "authorisation": authenticationToken
        }),
        body: JSON.stringify({
            newUser: newUser
        })
    })
    .then(res => {
        if (res.status === 204) {
            result = "success";
        } else {
            return res.json();
        }
    })
    .then(error => {
        if (error) {
            result = error.errorMessage;
        }
    })
    .catch(error => console.log(error));
    return result;
}

export const deleteUser = async uid => {
    if (!uid) {
        return;
    }
    // Default message to display if none is returned by the admin server
    let result = "Failed to delete user";

    // Getting logged-in user's token to authenticate request with admin server
    let authenticationToken = null;
    await firebase.auth().currentUser
    .getIdToken()
    .then(token => {
        authenticationToken = token;
    });
    await fetch(adminServer+"/delete/user/"+uid, { 
        method: "delete",
        headers: new Headers({
            "authorisation": authenticationToken
        })
    })
    .then(res => {
        if (res.status === 204) {
            result = "success";
        } else {
            return res.json();
        }
    })
    .then(error => {
        if (error) {
            result = error.errorMessage;
        }
    })
    .catch(error => console.log(error));
    return result;
}

export const getCurrentUser = async (authenticationToken) => {
    if (!authenticationToken) {
        return;
    }
    let user;
    await fetch(adminServer+"/user/current", { headers: new Headers({ "authorisation": authenticationToken })})
    .then(res => {
        if (res.ok) {
            return res.json();
        } else {
            return null;
        }
    })
    .then(data => {
        if (data) {
            user = data.user;
        }
    })
    .catch(error => console.log(error));
    return user;
}

export const getClasses = async () => {
    let classes;
    
    // Getting logged-in user's token to authenticate request with admin server
    let authenticationToken = null;
    await firebase.auth().currentUser
    .getIdToken()
    .then(token => {
        authenticationToken = token;
    });
    await fetch(adminServer+"/classes", {headers: new Headers({ "authorisation": authenticationToken}) })
    .then(res => {
        if (!res.ok) {
            // This will cause the execution to jump to the .catch section
            throw new Error(res.status, "Fetching classes failed");
        }
        return res.json();
    })
    .then(data => {
        classes = data.classes;
    })
    .catch(error => console.log(error));
    return classes;
}

export const getSurveys = async () => {
    let surveys;

    // Getting logged-in user's token to authenticate request with admin server
    let authenticationToken = null;
    await firebase.auth().currentUser
    .getIdToken()
    .then(token => {
        authenticationToken = token;
    });
    await fetch(adminServer+"/surveys", {headers: new Headers({ "authorisation": authenticationToken}) })
    .then(res => {
        if (!res.ok) {
            // This will cause the execution to jump to the .catch section
            throw new Error(res.status, "Fetching users failed");
        }
        return res.json();
    })
    .then(data => {
        surveys = data.surveys;
    })
    .catch(error => console.log(error));
    return surveys;
}

export const createSurvey = async newSurvey => {
    if (!newSurvey) {
        return;
    }
    // Default message to display if none is returned by the admin server
    let result = "Failed to create new survey";

    // Getting logged-in user's token to authenticate request with admin server
    let authenticationToken = null;
    await firebase.auth().currentUser
    .getIdToken()
    .then(token => {
        authenticationToken = token;
    });
    await fetch(adminServer+"/create/survey", { 
        method: "post",
        headers: new Headers({
            "content-type": "application/json",
            "authorisation": authenticationToken
        }),
        body: JSON.stringify({
            newSurvey: newSurvey
        })
    })
    .then(res => {
        if (res.status === 204) {
            result = "success";
        } else {
            return res.json();
        }
    })
    .then(error => {
        if (error) {
            result = error.errorMessage;
        }
    })
    .catch(error => console.log(error));
    return result;
}

export const addClassToSurvey = async (surveyKey, classId) => {
    if (!surveyKey || !classId) {
        return;
    }
    // Default message to display if none is returned by the admin server
    let result = "Failed to create new survey";

    // Getting logged-in user's token to authenticate request with admin server
    let authenticationToken = null;
    await firebase.auth().currentUser
    .getIdToken()
    .then(token => {
        authenticationToken = token;
    });
    await fetch(adminServer+"/survey/add/class", { 
        method: "post",
        headers: new Headers({
            "content-type": "application/json",
            "authorisation": authenticationToken
        }),
        body: JSON.stringify({
            surveyKey: surveyKey,
            classId: classId
        })
    })
    .then(res => {
        if (res.status === 204) {
            result = "success";
        } else {
            return res.json();
        }
    })
    .then(error => {
        if (error) {
            result = error.errorMessage;
        }
    })
    .catch(error => console.log(error));
    return result;
}

export const addStudentToSurvey = async (surveyKey, studentId) => {
    if (!surveyKey || !studentId) {
        return;
    }
    // Default message to display if none is returned by the admin server
    let result = "Failed to create new survey";

    // Getting logged-in user's token to authenticate request with admin server
    let authenticationToken = null;
    await firebase.auth().currentUser
    .getIdToken()
    .then(token => {
        authenticationToken = token;
    });
    await fetch(adminServer+"/survey/add/student", { 
        method: "post",
        headers: new Headers({
            "content-type": "application/json",
            "authorisation": authenticationToken
        }),
        body: JSON.stringify({
            surveyKey: surveyKey,
            studentId: studentId
        })
    })
    .then(res => {
        if (res.status === 204) {
            result = "success";
        } else {
            return res.json();
        }
    })
    .then(error => {
        if (error) {
            result = error.errorMessage;
        }
    })
    .catch(error => console.log(error));
    return result;
}

export const answerSurvey = async (surveyKey, uid, responses) => {
    if (!surveyKey || !uid || !responses) {
        return "Not enough info to answer the survey";
    }
    // Default message to display if none is returned by the admin server
    let result = "Failed to answer survey";

    // Getting logged-in user's token to authenticate request with admin server
    let authenticationToken = null;
    await firebase.auth().currentUser
    .getIdToken()
    .then(token => {
        authenticationToken = token;
    });
    await fetch(adminServer+"/survey/answer", { 
        method: "post",
        headers: new Headers({
            "content-type": "application/json",
            "authorisation": authenticationToken
        }),
        body: JSON.stringify({
            surveyKey: surveyKey,
            uid: uid,
            responses: responses
        })
    })
    .then(res => {
        if (res.status === 204) {
            result = "success";
        } else {
            return res.json();
        }
    })
    .then(error => {
        if (error) {
            result = error.errorMessage;
        }
    })
    .catch(error => console.log(error));
    return result;
}

export const deleteSurvey = async surveyKey => {
    if (!surveyKey) {
        return;
    }
    // Default message to display if none is returned by the admin server
    let result = "Failed to delete survey";

    // Getting logged-in user's token to authenticate request with admin server
    let authenticationToken = null;
    await firebase.auth().currentUser
    .getIdToken()
    .then(token => {
        authenticationToken = token;
    });
    await fetch(adminServer+"/delete/survey/"+surveyKey, { 
        method: "delete",
        headers: new Headers({
            "authorisation": authenticationToken
        })
    })
    .then(res => {
        if (res.status === 204) {
            result = "success";
        } else {
            return res.json();
        }
    })
    .then(error => {
        if (error) {
            result = error.errorMessage;
        }
    })
    .catch(error => console.log(error));
    return result;
}

export const getClassesForTeacher = async () => {
    let classes;
    
    // Getting logged-in user's token to authenticate request with admin server
    let authenticationToken = null;
    await firebase.auth().currentUser
    .getIdToken()
    .then(token => {
        authenticationToken = token;
    });
    await fetch(adminServer+"/classes/teacher", {headers: new Headers({ "authorisation": authenticationToken}) })
    .then(res => {
        if (!res.ok) {
            // This will cause the execution to jump to the .catch section
            throw new Error(res.status, "Fetching classes failed");
        }
        return res.json();
    })
    .then(data => {
        classes = data.classes;
    })
    .catch(error => console.log(error));
    return classes;
}

export const getClassesForStudent = async (studentId = null) => {
    let classes;
    
    // Getting logged-in user's token to authenticate request with admin server
    let authenticationToken = null;
    await firebase.auth().currentUser
    .getIdToken()
    .then(token => {
        authenticationToken = token;
    });
    await fetch(adminServer+"/classes/student" + (studentId ? "/"+studentId : ""), {headers: new Headers({ "authorisation": authenticationToken}) })
    .then(res => {
        if (!res.ok) {
            // This will cause the execution to jump to the .catch section
            throw new Error(res.status, "Fetching classes failed");
        }
        return res.json();
    })
    .then(data => {
        classes = data.classes;
    })
    .catch(error => console.log(error));
    return classes;
}

export const createGoal = async (classId, goal) => {
    if (!classId || !goal) {
        return;
    }
    // Default message to display if none is returned by the admin server
    let result = "Failed to create new goal";

    // Getting logged-in user's token to authenticate request with admin server
    let authenticationToken = null;
    await firebase.auth().currentUser
    .getIdToken()
    .then(token => {
        authenticationToken = token;
    });
    await fetch(adminServer+"/create/goal", { 
        method: "post",
        headers: new Headers({
            "content-type": "application/json",
            "authorisation": authenticationToken
        }),
        body: JSON.stringify({
            classId: classId,
            goal: goal
        })
    })
    .then(res => {
        if (res.status === 204) {
            result = "success";
        } else {
            return res.json();
        }
    })
    .then(error => {
        if (error) {
            result = error.errorMessage;
        }
    })
    .catch(error => console.log(error));
    return result;
}

export const updateProgress = async (classId, goalId, progress) => {
    if (!classId || !goalId || !progress) {
        return;
    }
    // Default message to display if none is returned by the admin server
    let result = "Failed to update progress";

    // Getting logged-in user's token to authenticate request with admin server
    let authenticationToken = null;
    await firebase.auth().currentUser
    .getIdToken()
    .then(token => {
        authenticationToken = token;
    });
    await fetch(adminServer+"/update/progress", { 
        method: "post",
        headers: new Headers({
            "content-type": "application/json",
            "authorisation": authenticationToken
        }),
        body: JSON.stringify({
            classId: classId,
            goalId: goalId,
            progress: progress,
        })
    })
    .then(res => {
        if (res.status === 204) {
            result = "success";
        } else {
            return res.json();
        }
    })
    .then(error => {
        if (error) {
            result = error.errorMessage;
        }
    })
    .catch(error => console.log(error));
    return result;
}

export const deleteGoal = async (classId, goalId) => {
    if (!classId || !goalId ) {
        return;
    }
    // Default message to display if none is returned by the admin server
    let result = "Failed to delete goal";

    // Getting logged-in user's token to authenticate request with admin server
    let authenticationToken = null;
    await firebase.auth().currentUser
    .getIdToken()
    .then(token => {
        authenticationToken = token;
    });
    await fetch(adminServer+"/delete/goal", { 
        method: "delete",
        headers: new Headers({
            "content-type": "application/json",
            "authorisation": authenticationToken
        }),
        body: JSON.stringify({
            classId: classId,
            goalId: goalId
        })
    })
    .then(res => {
        if (res.status === 204) {
            result = "success";
        } else {
            return res.json();
        }
    })
    .then(error => {
        if (error) {
            result = error.errorMessage;
        }
    })
    .catch(error => console.log(error));
    return result;
}

export const createClass = async (classId, classObject) => {
    if (!classId || !classObject) {
        return;
    }
    // Default message to display if none is returned by the admin server
    let result = "Failed to create new class";

    // Getting logged-in user's token to authenticate request with admin server
    let authenticationToken = null;
    await firebase.auth().currentUser
    .getIdToken()
    .then(token => {
        authenticationToken = token;
    });
    await fetch(adminServer+"/create/class", { 
        method: "post",
        headers: new Headers({
            "content-type": "application/json",
            "authorisation": authenticationToken
        }),
        body: JSON.stringify({
            classId: classId,
            classObject: classObject,
        })
    })
    .then(res => {
        if (res.status === 204) {
            result = "success";
        } else {
            return res.json();
        }
    })
    .then(error => {
        if (error) {
            result = error.errorMessage;
        }
    })
    .catch(error => console.log(error));
    return result;
}

export const deleteClass = async (classId) => {
    if (!classId) {
        return;
    }
    // Default message to display if none is returned by the admin server
    let result = "Failed to delete class";

    // Getting logged-in user's token to authenticate request with admin server
    let authenticationToken = null;
    await firebase.auth().currentUser
    .getIdToken()
    .then(token => {
        authenticationToken = token;
    });
    await fetch(adminServer+"/delete/class", { 
        method: "delete",
        headers: new Headers({
            "content-type": "application/json",
            "authorisation": authenticationToken
        }),
        body: JSON.stringify({
            classId: classId,
        })
    })
    .then(res => {
        if (res.status === 204) {
            result = "success";
        } else {
            return res.json();
        }
    })
    .then(error => {
        if (error) {
            result = error.errorMessage;
        }
    })
    .catch(error => console.log(error));
    return result;
}

export const getUsersStudents = async () => {
    let studentUsers;

    // Getting logged-in user's token to authenticate request with admin server
    let authenticationToken = null;
    await firebase.auth().currentUser
    .getIdToken()
    .then(token => {
        authenticationToken = token;
    });
    await fetch(adminServer+"/users/student", {headers: new Headers({ "authorisation": authenticationToken}) })
    .then(res => {
        if (!res.ok) {
            // This will cause the execution to jump to the .catch section
            throw new Error(res.status, "Fetching student users failed");
        }
        return res.json();
    })
    .then(data => {
        studentUsers = data.studentUsers;
    })
    .catch(error => console.log(error));
    return studentUsers;
}

export const getUsersTeachers = async () => {
    let teacherUsers;

    // Getting logged-in user's token to authenticate request with admin server
    let authenticationToken = null;
    await firebase.auth().currentUser
    .getIdToken()
    .then(token => {
        authenticationToken = token;
    });
    await fetch(adminServer+"/users/teacher", {headers: new Headers({ "authorisation": authenticationToken}) })
    .then(res => {
        if (!res.ok) {
            // This will cause the execution to jump to the .catch section
            throw new Error(res.status, "Fetching teacher users failed");
        }
        return res.json();
    })
    .then(data => {
        teacherUsers = data.teacherUsers;
    })
    .catch(error => console.log(error));
    return teacherUsers;
}

export const getTermInfo = async () => {
    let termInfo;

    // Getting logged-in user's token to authenticate request with admin server
    let authenticationToken = null;
    await firebase.auth().currentUser
    .getIdToken()
    .then(token => {
        authenticationToken = token;
    });
    await fetch(adminServer+"/term/current", {headers: new Headers({ "authorisation": authenticationToken}) })
    .then(res => {
        if (!res.ok) {
            // This will cause the execution to jump to the .catch section
            throw new Error(res.status, "Fetching term failed");
        }
        return res.json();
    })
    .then(data => {
        // data has the properties "term" and "year"
        termInfo = data;
    })
    .catch(error => console.log(error));
    return termInfo;
}

export const getDepartments = async () => {
    let departments;

    // Getting logged-in user's token to authenticate request with admin server
    let authenticationToken = null;
    await firebase.auth().currentUser
    .getIdToken()
    .then(token => {
        authenticationToken = token;
    });
    await fetch(adminServer+"/departments", {headers: new Headers({ "authorisation": authenticationToken}) })
    .then(res => {
        if (!res.ok) {
            // This will cause the execution to jump to the .catch section
            throw new Error(res.status, "Fetching users failed");
        }
        return res.json();
    })
    .then(data => {
        departments = data.departments;
    })
    .catch(error => console.log(error));
    return departments;
}

export const getClassesByDepartment = async (year, term, yearLevel, department) => {
    let classes;

    // Getting logged-in user's token to authenticate request with admin server
    let authenticationToken = null;
    await firebase.auth().currentUser
    .getIdToken()
    .then(token => {
        authenticationToken = token;
    });
    await fetch(adminServer+"/classes/department", {
        headers: new Headers({
            "content-type": "application/json",
            "authorisation": authenticationToken
        }),
        method: "post",
        body: JSON.stringify({
            year: year,
            term: term,
            yearLevel: yearLevel,
            department: department
        })
    })
    .then(res => {
        if (!res.ok) {
            // This will cause the execution to jump to the .catch section
            throw new Error(res.status, "Fetching users failed");
        }
        return res.json();
    })
    .then(data => {
        classes = data.classes;
    })
    .catch(error => console.log(error));
    return classes;
}

export const getPerformanceHistoryByDepartment = async (year, term, yearLevel) => {
    let performance;

    // Getting logged-in user's token to authenticate request with admin server
    let authenticationToken = null;
    await firebase.auth().currentUser
    .getIdToken()
    .then(token => {
        authenticationToken = token;
    });
    await fetch(adminServer+`/performance/department?year=${year}&term=${term}&yearLevel=${yearLevel}`, {headers: new Headers({ "authorisation": authenticationToken}) })
    .then(res => {
        if (!res.ok) {
            // This will cause the execution to jump to the .catch section
            throw new Error(res.status, "Fetching users failed");
        }
        return res.json();
    })
    .then(data => {
        performance = data.performanceDepartments;
    })
    .catch(error => console.log(error));
    return performance;
}

export const updateStudentPerformance = async (classId, studentId, grade) => {
    // Default message to display if none is returned by the admin server
    let result = "Failed to create new survey";
    if (!classId || !studentId || !grade) {
        return result;
    }

    // Getting logged-in user's token to authenticate request with admin server
    let authenticationToken = null;
    await firebase.auth().currentUser
    .getIdToken()
    .then(token => {
        authenticationToken = token;
    });
    await fetch(adminServer+"/performance/update", { 
        method: "post",
        headers: new Headers({
            "content-type": "application/json",
            "authorisation": authenticationToken
        }),
        body: JSON.stringify({
            newPerformance: {
                classId: classId,
                studentId: studentId,
                grade: grade
            }
        })
    })
    .then(res => {
        if (res.status === 204) {
            result = "success";
        } else {
            return res.json();
        }
    })
    .then(error => {
        if (error) {
            result = error.errorMessage;
        }
    })
    .catch(error => console.log(error));
    return result;
}

export const linkParent = async (parentUid, studentId) => {
    if (!parentUid || !studentId) {
        return;
    }
    // Default message to display if none is returned by the admin server
    let result = "Failed to link student to parent";

    // Getting logged-in user's token to authenticate request with admin server
    let authenticationToken = null;
    await firebase.auth().currentUser
    .getIdToken()
    .then(token => {
        authenticationToken = token;
    });
    await fetch(adminServer+"/parent/link", { 
        method: "post",
        headers: new Headers({
            "content-type": "application/json",
            "authorisation": authenticationToken
        }),
        body: JSON.stringify({
            parentUid: parentUid,
            studentId: studentId
        })
    })
    .then(res => {
        if (res.status === 204) {
            result = "success";
        } else {
            return res.json();
        }
    })
    .then(error => {
        if (error) {
            result = error.errorMessage;
        }
    })
    .catch(error => console.log(error));
    return result;
}

export const getParentStudents = async () => {
    let students;

    // Getting logged-in user's token to authenticate request with admin server
    let authenticationToken = null;
    await firebase.auth().currentUser
    .getIdToken()
    .then(token => {
        authenticationToken = token;
    });
    await fetch(adminServer+"/parent/students", {headers: new Headers({ "authorisation": authenticationToken}) })
    .then(res => {
        if (!res.ok) {
            // This will cause the execution to jump to the .catch section
            throw new Error(res.status, "Fetching parent students failed");
        }
        return res.json();
    })
    .then(data => {
        students = data.students;
    })
    .catch(error => console.log(error));
    return students;
}