import "./App.css";
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import firebase from "firebase/app";

import { getCurrentUser } from "components/DB";
import Layout from "./components/Layout/Layout"
import ErrorPage from "./components/Error/ErrorPage";

import TeacherPortal from "./components/Teacher/TeacherPortal";
import Performance from "./components/Teacher/StudentPerformance";
import StudentPortal from "./components/Student/StudentPortal";
import CouncillorPortal from "./components/Councillor/CouncillorPortal";
import StaffPortal from "./components/Staff/StaffPortal";
import ParentPortal from "./components/Parent/ParentPortal";
import AdminPortal from "./components/Admin/AdminPortal";
import UserManagement from "./components/Admin/UserManagement";
import ClassManagement from "./components/Admin/ClassManagement";
import ViewClass from "./components/Admin/ViewClass";
import CreateClass from "./components/Admin/CreateClass";
import LoginPortal from "./components/Login/LoginPortal";
import SurveyView from "./components/Teacher/SurveyView";
import SurveyCreator from "./components/Teacher/SurveyCreator";
import SurveyManagement from "./components/Teacher/SurveyManagement";
import SurveyCentre from "./components/Student/SurveyCentre";
import AnswerSurvey from "./components/Student/AnswerSurvey";
import DailyProgressManagement from "./components/Teacher/DailyProgressManagement"
import CreateGoal from "./components/Teacher/CreateGoal"
import ViewGoal from "./components/Teacher/ViewGoal";
import TaskCentre from "./components/Student/TaskCentre";
import AnswerTask from "./components/Student/AnswerTask";
import SurveyManagementCouncillor from "components/Councillor/SurveyManagementCouncillor";
import SurveyViewCouncillor from "components/Councillor/SurveyViewCouncillor";
import SurveyCreatorCouncillor from "components/Councillor/SurveyCreatorCouncillor";

const projectName = "Student Connect"

const firebaseConfig = {
  apiKey: "AIzaSyDyMkCnhq88QmFmJsrep63Gza_tQwYnXjc",
  authDomain: "student-connect-dev-a16b3.firebaseapp.com",
  databaseURL: "https://student-connect-dev-a16b3-default-rtdb.firebaseio.com",
  projectId: "student-connect-dev-a16b3",
  storageBucket: "student-connect-dev-a16b3.appspot.com",
  messagingSenderId: "325206337576",
  appId: "1:325206337576:web:ed601e715a192524c7ed1d"
};

const teacherRoutes = (user) => {
  return (
    <Switch>
      <Route exact path="/teacher/dashboard">
        <TeacherPortal {...user}/>
      </Route>
      <Route path="/teacher/daily-progress-management/create/:id">
        <CreateGoal />
      </Route>
      <Route path="/teacher/daily-progress-management/view/:id">
        <ViewGoal />
      </Route>
      <Route exact path="/teacher/daily-progress-management">
        <DailyProgressManagement/>
      </Route>
      <Route exact path="/teacher/survey-management">
        <SurveyManagement {...user}/>
      </Route>
      <Route exact path="/teacher/survey-management/create">
        <SurveyCreator {...user}/>
      </Route>
      <Route exact path="/teacher/survey-management/view/:surveyKey" render={({match}) => (
        <SurveyView {...user} surveyKey={match.params.surveyKey}/>
      )}/>
      <Route exact path="/teacher/performance/update">
        <Performance {...user}/>
      </Route>
      {/* Other ways a user may get to the dashboard */}
      <Route exact path="/">
        <Redirect to="/teacher/dashboard" />
      </Route>
      <Route exact path="/teacher">
        <Redirect to="/teacher/dashboard" />
      </Route>
      <Route exact path="/login">
        <Redirect to="/teacher/dashboard" />
      </Route>
      <Route>
        <ErrorPage errorCode={"404 - Not Found"} errorMessage={"The page you are looking for does not exist."}/>
      </Route>
    </Switch>
  );
}

const studentRoutes = (user) => {
  return (
    <Switch>
      <Route exact path="/student/dashboard">
        <StudentPortal {...user}/>
      </Route>
      <Route exact path="/student/task-centre/answer/:id">
        <AnswerTask {...user}/>
      </Route>
      <Route exact path="/student/task-centre">
        <TaskCentre  {...user}/>
      </Route>
      <Route exact path="/student/survey-centre">
        <SurveyCentre {...user}/>
      </Route>
      <Route exact path="/student/survey-centre/answer/:surveyKey" render={({match}) => (
        <AnswerSurvey {...user} surveyKey={match.params.surveyKey}/>
      )}/>
      {/* Other ways a user may get to the dashboard */}
      <Route exact path="/">
        <Redirect to="/student/dashboard" />
      </Route>
      <Route exact path="/student">
        <Redirect to="/student/dashboard" />
      </Route>
      <Route exact path="/login">
        <Redirect to="/student/dashboard" />
      </Route>
      <Route>
        <ErrorPage errorCode={"404 - Not Found"} errorMessage={"The page you are looking for does not exist."}/>
      </Route>
    </Switch>
  );
}

const councillorRoutes = (user) => {
  return (
    <Switch>
      <Route exact path="/councillor/dashboard">
        <CouncillorPortal {...user}/>
      </Route>
      <Route exact path="/councillor/survey-management">
        <SurveyManagementCouncillor {...user}/>
      </Route>
      <Route exact path="/councillor/survey-management/create">
        <SurveyCreatorCouncillor {...user}/>
      </Route>
      <Route exact path="/councillor/survey-management/view/:surveyKey" render={({match}) => (
        <SurveyViewCouncillor {...user} surveyKey={match.params.surveyKey}/>
      )}/>
      {/* Other ways a user may get to the dashboard */}
      <Route exact path="/">
        <Redirect to="/councillor/dashboard" />
      </Route>
      <Route exact path="/councillor">
        <Redirect to="/councillor/dashboard" />
      </Route>
      <Route exact path="/login">
        <Redirect to="/councillor/dashboard" />
      </Route>
      <Route>
        <ErrorPage errorCode={"404 - Not Found"} errorMessage={"The page you are looking for does not exist."}/>
      </Route>
    </Switch>
  );
}

const staffRoutes = (user) => {
  return (
    <Switch>
      <Route exact path="/staff/dashboard">
        <StaffPortal {...user}/>
      </Route>
      {/* Other ways a user may get to the dashboard */}
      <Route exact path="/">
        <Redirect to="/staff/dashboard" />
      </Route>
      <Route exact path="/staff">
        <Redirect to="/staff/dashboard" />
      </Route>
      <Route exact path="/login">
        <Redirect to="/staff/dashboard" />
      </Route>
      <Route>
        <ErrorPage errorCode={"404 - Not Found"} errorMessage={"The page you are looking for does not exist."}/>
      </Route>
    </Switch>
  );
}

const parentRoutes = (user) => {
  return (
    <Switch>
      <Route exact path="/parent/dashboard">
        <ParentPortal {...user}/>
      </Route>
      {/* Other ways a user may get to the dashboard */}
      <Route exact path="/">
        <Redirect to="/parent/dashboard" />
      </Route>
      <Route exact path="/parent">
        <Redirect to="/parent/dashboard" />
      </Route>
      <Route exact path="/login">
        <Redirect to="/parent/dashboard" />
      </Route>
      <Route>
        <ErrorPage errorCode={"404 - Not Found"} errorMessage={"The page you are looking for does not exist."}/>
      </Route>
    </Switch>
  );
}

const adminRoutes = (user) => {
  return (
    <Switch>
      <Route exact path="/admin/dashboard">
        <AdminPortal {...user}/>
      </Route>
      <Route exact path="/admin/user-management">
        <UserManagement {...user}/>
      </Route>
      <Route path="/admin/class-management/view/:id">
        <ViewClass />
      </Route>
      <Route exact path="/admin/class-management/create">
        <CreateClass />
      </Route>
      <Route exact path="/admin/class-management">
        <ClassManagement />
      </Route>
      {/* Other ways a user may get to the dashboard */}
      <Route exact path="/">
        <Redirect to="/admin/dashboard" />
      </Route>
      <Route exact path="/admin">
        <Redirect to="/admin/dashboard" />
      </Route>
      <Route exact path="/login">
        <Redirect to="/admin/dashboard" />
      </Route>
      <Route>
        <ErrorPage errorCode={"404 - Not Found"} errorMessage={"The page you are looking for does not exist."}/>
      </Route>
    </Switch>
  );
}

const defaultRoutes = () => {
  return (
    <Switch>
      <Route exact path="/login">
        <LoginPortal projectName={projectName} />
      </Route>
      <Route>
        <Redirect to="/login" />
      </Route>
    </Switch>
  );
}

function App() {
  const [role, setRole] = useState();
  if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
  } else {
      firebase.app(); // if already initialized, use that one
  }
  
  // Layout is our template wrapper component (with navbar and css etc)
  return (
    <BrowserRouter>
      <Layout role={role}>
        <Routes role={role} setRole={setRole}/>
      </Layout>
    </BrowserRouter>
  );
}

const Routes = ({setRole}) => {
  const [user, setUser] = useState();
  const [routes, setRoutes] = useState(<></>);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(authedUser => {
      if (authedUser) {
        // User successfully logged in at this stage
        authedUser.getIdToken()
        .then(token => {
          getCurrentUser(token)
          .then(user => {
            if (user) {
              setUser(user);
              setRole(user.role);
            } else {
              setRoutes(
              <ErrorPage 
                errorCode={"500 - Internal Server Error"} 
                errorMessage={"The admin server may not be accessible, or the logged-in user may not be configured properly."}
              />);
            }
          });
        });
      } else {
        // else if the user has no valid session
        setRole("none");
        setRoutes(defaultRoutes);
      }
    });
  }, [setRole]);

  useEffect(() => {
    if (!user) {
      return;
    }
    switch (user.role) {
      case "teacher":
        setRoutes(teacherRoutes(user));
        break;

      case "student":
        setRoutes(studentRoutes(user));
        break;

      case "councillor":
        setRoutes(councillorRoutes(user));
        break;

      case "staff":
        setRoutes(staffRoutes(user));
        break;

      case "parent":
        setRoutes(parentRoutes(user));
        break;

      case "admin":
        setRoutes(adminRoutes(user));
        break;

      default:
        setRole("none");
        setRoutes(defaultRoutes);
    }
  }, [user, setRole])
  return routes;
}

export default App;
