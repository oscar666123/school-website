import { addClassToSurvey } from 'components/DB';
import { getDepartments } from 'components/DB';
import { addStudentToSurvey } from 'components/DB';
import { getClassesByDepartment } from 'components/DB';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSurveys, deleteSurvey } from '../DB';

const handleAddClass = (classId, surveyKey, setPageState) => {
    if (!classId || !surveyKey) {
        alert("Class needs to be selected");
        return;
    }
    addClassToSurvey(surveyKey, classId)
    .then(result => {
        if (result !== "success") {
            alert(result);
            return;
        }
        setPageState(0);
    })
    .catch(e => console.log(e));
}

const handleAddStudent = (studentId, surveyKey, setPageState) => {
    if (!studentId || !surveyKey) {
        alert("A valid student ID must be entered");
        return;
    }
    addStudentToSurvey(surveyKey, studentId)
    .then(result => {
        if (result !== "success") {
            alert(result);
            return;
        }
        setPageState(0);
    })
    .catch(e => console.log(e));
}

const DisplayOptions = ({method, surveyKey, setPageState}) => {
    const [classes, setClasses] = useState([]);
    const [yearLevel, setYearLevel] = useState(12);
    const [departments, setDepartments] = useState([]);
    const [department, setDepartment] = useState();
    const [classId, setClassId] = useState();

    useEffect(() => {
        getDepartments().then(departments => setDepartments(departments)).catch(e => console.log(e));
    }, []);

    useEffect(() => {
        if (!yearLevel || !department) {
            return;
        }
        setClasses([]);
        getClassesByDepartment("current", "current", yearLevel, department)
        .then(data => { 
            if (data.length === 0) {
                return;
            }
            setClasses(data);
        })
        .catch(e => console.log(e));
    }, [yearLevel, department]);

    if (method === "class") {
        return (
            <>
                <div className="col mt-2">
                    <label htmlFor="yearLevel">Year Level</label>
                    <select className="form-control" id="yearLevel" value={yearLevel} onChange={e => setYearLevel(e.target.value)}>
                        <option value={12}>12</option>
                        <option value={11}>11</option>
                        <option value={10}>10</option>
                        <option value={9}>9</option>
                        <option value={8}>8</option>
                        <option value={7}>7</option>
                    </select>
                </div>
                <div className="col mt-2">
                    <label htmlFor="department">Department</label>
                    <select className="form-control" id="department" value={department} onChange={e => setDepartment(e.target.value)}>
                        <option hidden value={undefined}>Select Department</option>
                        {departments.map(department => {
                            return <option key={department} value={department}>{department}</option>
                        })}
                    </select>
                </div>
                {/* Force next columns to break to new line */}
                <div className="w-100"></div>
                <div className="col mt-3">
                    <label htmlFor="classElement">Class Name</label>
                    {yearLevel && department ?
                        classes.length > 0 ? 
                            <select className="form-control" id="classElement" value={classId} onChange={e => setClassId(e.target.value)}>
                                <option hidden value={undefined}>Select Class</option>
                                {classes.map(classObj => {
                                    return <option key={classObj.classId} value={classObj.classId}>{classObj.name}</option>
                                })}
                            </select>
                            :
                            <select disabled className="form-control" id="className">
                                <option>No classes found</option>
                            </select>
                        :
                        <select disabled className="form-control" id="className">
                            <option>Refine search</option>
                        </select>
                    }
                </div>
                <>
                    {/* Force next columns to break to new line */}
                    <div className="w-100"></div>
                    <div className="col-7 mt-5">
                        <button className="btn btn-primary btn-block" type='reset' 
                            onClick={() => handleAddClass(classId, surveyKey, setPageState)}>
                            Confirm
                        </button>
                    </div>
                </>
            </>
        );
    } else if (method === "student") {
        return (
            <>
                <div className="col mt-2">
                    <label htmlFor="studentId">Student ID</label>
                    <input type="number" className="form-control" id="studentId" placeholder="123456789"/>
                </div>
                {/* Force next columns to break to new line */}
                <div className="w-100"></div>
                <div className="col-7 mt-5">
                    <button className="btn btn-primary btn-block" type='reset' 
                        onClick={() => handleAddStudent(document.getElementById("studentId").value, surveyKey, setPageState)}>
                        Confirm
                    </button>
                </div>
            </>
        );
    } else {
        return <></>;
    }
}

const SurveyManagementCouncillor = user => {
    const [surveys, setSurveys] = useState([]);
    const [pageState, setPageState] = useState(0);
    const [key, setKey] = useState();
    const [method, setMethod] = useState();
    
    useEffect (() => {
        const sleep = async(ms) => {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        // Forcing the page to wait for sleepSeconds before fetching data since database may not have updated yet
        if (pageState === 0) {
            setSurveys([]);
            const sleepMilliseconds = 250;
            sleep(sleepMilliseconds).then(() => {
                getSurveys().then(result => {
                    setSurveys(result);
                });
            });
        }
    }, [pageState]);
    

    let surveyDate = unix => {
        let date = new Date(unix)
        return(date.toDateString())
    }

    if(pageState === 1) {
        return (
            <>
                <div className="container container-smaller rounded mt-5 p-2">
                    <div className="row">
                        <div className="col">
                            <h2>Add Students to Survey</h2>
                        </div>
                    </div>
                </div>
                <div className="container container-smaller rounded mt-4 p-2">
                    <div className="row justify-content-center">
                        <div className="col">
                            <h5>Student details</h5>
                        </div>
                    </div>
                    <div className="row mb-2 justify-content-center text-left">
                        <div className="col mt-3">
                            <label htmlFor="user-role">Method</label>
                            <select className="form-control" id="user-role" value={method} onChange={e => setMethod(e.target.value)}>
                                <option hidden value={undefined}>Select Adding Method</option>
                                <option value="class">Add whole class</option>
                                <option value="student">Add individual student</option>
                            </select>
                        </div>
                        {/* Force next columns to break to new line */}
                        <div className="w-100"></div>
                        <DisplayOptions method={method} surveyKey={key} setPageState={setPageState} />
                        {/* Force next columns to break to new line */}
                        <div className="w-100"></div>
                        <div className="col-7 mt-3">
                            <button className="btn btn-primary btn-block" onClick={() => {setMethod(); setPageState(0)}}>Cancel</button>
                        </div>
                    </div>
                </div>
            </>
        );
    } else {
        return (
            <>
                <div className="container rounded mt-5 p-2">
                    <div className="row">
                        <div className="col">
                            <h2>Your Surveys</h2>
                        </div>
                    </div>
                </div>
                <div className="container text-left rounded mt-4 p-2 ">
                    <div className="row">
                        <div className="col table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                    <th scope="col-2">#</th>
                                    <th scope="col-6">Label</th>
                                    <th scope="col-2">Created On</th>
                                    <th scope="col-2">Students</th>
                                    <th scope="col-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        surveys.length > 0 ? 
                                        surveys.map((e, index) => (
                                            <tr key={index} className="clickable-row">
                                                <th scope="row">{index + 1}</th>
                                                <td> <Link to={"/councillor/survey-management/view/"+e.key}>{e.title}</Link></td>
                                                <td>{surveyDate(e['created-on'])}</td>
                                                <td>{e.students ? e.students.length : 0 }</td>
                                                <td style={{maxWidth: "220px"}}>
                                                    <button onClick={() => {setKey(e.key); setPageState(1);}} className="btn btn-sm btn-primary">Add Students</button>
                                                    <Link to={"/councillor/survey-management/view/"+e.key}><button className="btn btn-sm btn-secondary ml-2">View Responses</button></Link>
                                                    <button onClick={() => deleteSurvey(e.key).then(result => {
                                                        if (result !== "success") {
                                                            alert("Survey could not be deleted\n"+result);
                                                            return;
                                                        }
                                                        getSurveys().then(updatedSurveys => {
                                                            setSurveys(updatedSurveys);
                                                        });
                                                    })} className="btn btn-sm btn-danger ml-2">Delete</button>
                                                </td>
                                            </tr>
                                        )) :
                                        (
                                            <tr>
                                                <td style={{width: "64px"}}/>
                                                <td style={{width: "270px"}}>
                                                    <h5 style={{
                                                        color: "#00000040"
                                                    }}>No active surveys</h5>
                                                </td>
                                                <td style={{width: "250px"}}/><td style={{width: "172px"}}/><td style={{width: "367px"}}/>
                                            </tr>
                                        )
                                    }
                                </tbody>
                            </table>
                            </div>
                        </div>
                    <div className="row mt-2 justify-content-center">
                        <div className="col-2">
                            <Link to="/councillor/survey-management/create">
                                <button className="btn btn-primary btn-block">
                                    Create Survey
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    
}

export default SurveyManagementCouncillor;