import { useEffect, useState } from 'react';
import React from 'react';
import { updateStudentPerformance } from 'components/DB';
import { getDepartments } from 'components/DB';
import { getClassesByDepartment } from 'components/DB';
import { getTermInfo } from 'components/DB';

const pageAlert = (actionResult, setActionResult) => {
    if (!actionResult) {
        return <></>;
    }
    return (
        <div className={"alert alert-"+(actionResult.success ? "success" : "danger")+" alert-dismissible fade show"} role="alert">
            {actionResult.message}
            <button type="button" className="close" aria-label="Close" onClick={() => setActionResult()}>
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    );
}

const handleAddPerformance = (setActionResult, resetFields) => {
    const classId = document.getElementById("classElement").value;
    const studentId = document.getElementById("studentId").value;
    const grade = document.getElementById("grade").value;

    resetFields();

    if (!classId ||!studentId || !grade) {
        alert("Performance not updated - missing details");
        return;
    }

    if (grade < 0 || grade > 100) {
        alert("Performance not updated - Grade must be a percentage between 0 and 100");
        return;
    }

    updateStudentPerformance(classId, studentId, grade)
    .then(result => {
        if (result === "success") {
            setActionResult({
                success: true,
                message: "Performance successfully updated for student id '"+studentId+"' with grade '"+grade+"'"
            });

        } else {
            setActionResult({
                success: false,
                message: result
            });
        }
    });
    return;
}

const StudentPerformance = () => {
    const [actionResult, setActionResult] = useState();
    const [validYears, setValidYears] = useState([]);
    const validYearRange = 5; // 5 years into the past
    const [searchParams, setSearchParams] = useState({year: "current", term: "current", yearLevel: undefined, department: undefined});
    const [departments, setDepartments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [Class, setClass] = useState();
    const [students, setStudents] = useState([]);
    const [student, setStudent] = useState();
    const [studentId, setStudentId] = useState();

    const resetFields = () => {
        setClasses([]);
        setClass();
        setStudents([]);
        setStudent();
        setStudentId();
    }

    useEffect(() => {
        const fetch = async () => {
            const data = await getTermInfo();
            let vYears = [];
            // Allowing the user to select the year as a dropdown of up to 5 years into the past
            for (let i=0; i<=validYearRange; i++) {
                vYears.push(data.termInfo.year-i);
            }
            setValidYears(vYears);
        }
        fetch();
    }, []);

    useEffect(() => {
        const fetch = async () => {
            const response = await getDepartments();
            setDepartments(response);
        }
        fetch();
    }, []);
    
    useEffect(() => {
        const fetch = async () => {
            const response = await getClassesByDepartment(searchParams.year, searchParams.term, searchParams.yearLevel, searchParams.department);
            setClasses(response);
        }
        if (searchParams.yearLevel === undefined || searchParams.department === undefined) {
            return;
        }
        setClasses([]);
        setClass();
        setStudents([]);
        setStudent();
        setStudentId();
        fetch();
    }, [searchParams]);

    useEffect(() => {
        if (!Class) {
            return;
        }
        classes.forEach(classObj => {
            if (classObj.classId === Class) {
                setStudents(classObj.students.sort((a,b) => {
                    if (a.displayName < b.displayName) {
                        return -1
                    } else {
                        return 1;
                    }
                }));
            }
        });
    }, [Class, classes]);

    useEffect(() => {
        if (!student) {
            return;
        }
        students.forEach(stud => {
            if (stud.studentId === student) {
                setStudentId(stud.studentId);
            }
        });
    }, [student, students]);

    return (
        <>           
            {pageAlert(actionResult, setActionResult)} 
                <div className="container container-smaller rounded mt-5 p-2">
                    <div className="row">
                        <div className="col">
                            <h2>Update Student Performance</h2>
                        </div>
                    </div>
                </div>
                <form>
                <div className="container container-smaller rounded mt-4 p-2">
                    <div className="row justify-content-center">
                        <div className="col">
                            <h5>New Student Grade</h5>
                        </div>
                    </div>
                    <div className="row text-left">
                        <div className="col mt-3">
                            <label htmlFor="year">Year</label>
                            <select className="form-control" id="year" value={searchParams.year} onChange={e => setSearchParams(oldSearchParams => {
                                return {
                                    ...oldSearchParams,
                                    year: e.target.value
                                }
                            })}>
                                <option value="current">Current</option>
                                {validYears.map(year => {
                                    return <option key={year} value={year}>{year}</option>
                                })}
                            </select>
                        </div>
                        <div className="col mt-3">
                            <label htmlFor="term">Term</label>
                            <select className="form-control" id="term" value={searchParams.term} onChange={e => setSearchParams(oldSearchParams => {
                                return {
                                    ...oldSearchParams,
                                    term: e.target.value
                                }
                            })}>
                                <option value="current">Current</option>
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                                <option value={4}>4</option>
                            </select>
                        </div>
                        <div className="w-100"></div>
                        <div className="col mt-3">
                            <label htmlFor="yearLevel">Year Level</label>
                            <select className="form-control" id="yearLevel" value={searchParams.yearLevel} onChange={e => setSearchParams(oldSearchParams => {
                                return {
                                    ...oldSearchParams,
                                    yearLevel: e.target.value
                                }
                            })}>
                                <option hidden value={undefined}>Year</option>
                                <option value={7}>7</option>
                                <option value={8}>8</option>
                                <option value={9}>9</option>
                                <option value={10}>10</option>
                                <option value={11}>11</option>
                                <option value={12}>12</option>
                            </select>
                        </div>
                        <div className="col mt-3">
                            <label htmlFor="department">Department</label>
                            <select className="form-control" id="department" value={searchParams.department} onChange={e => setSearchParams(oldSearchParams => {
                                return {
                                    ...oldSearchParams,
                                    department: e.target.value
                                }
                            })}>
                                <option hidden value={undefined}>Department</option>
                                {departments.map(department => {
                                    return <option key={department} value={department}>{department}</option>
                                })}
                            </select>
                        </div>
                        <div className="w-100"></div>
                        <div className="col mt-3">
                            <label htmlFor="classElement">Class Name</label>
                            {searchParams.yearLevel && searchParams.department ?
                                classes.length > 0 ? 
                                    <select className="form-control" id="classElement" value={Class} onChange={e => setClass(e.target.value)}>
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
                        <div className="w-100"></div>
                        <div className="col mt-3">
                            <label htmlFor="studentId">Student Name</label>
                            {Class ?
                                students.length > 0 ?
                                    <select className="form-control" id="studentName" value={student} onChange={e => setStudent(e.target.value)}>
                                    <option hidden value={undefined}>Select Student</option>
                                        {students.map(student => {
                                            return <option key={student.studentId} value={student.studentId}>{student.displayName}</option>
                                        })}
                                    </select>
                                    :
                                    <select disabled className="form-control" id="className">
                                        <option>No students found</option>
                                    </select>
                                :
                                <select disabled className="form-control" id="className">
                                    <option>Refine search</option>
                                </select>
                            }
                        </div>
                        <div className="w-100"></div>
                        <div className="col mt-3">
                            <label htmlFor="grade">Student ID</label>
                            <input readOnly className="form-control" id="studentId" value={studentId || ""}/>
                        </div>
                        <div className="col mt-3">
                            <label htmlFor="grade">Grade</label>
                            <input type="number" className="form-control" id="grade"/>
                        </div>
                    </div>
                    <div className="row justify-content-center mb-2">
                        <div className="col-7 mt-5">
                            <button className="btn btn-primary btn-block" type='reset' 
                                onClick={() => handleAddPerformance(setActionResult, resetFields)}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}

export default StudentPerformance;

