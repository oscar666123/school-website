import { getClassesForStudent } from 'components/DB';
import { getParentStudents } from 'components/DB';
import React, { useState, useEffect } from 'react';

const ParentPortal = (user) => {
    const [students, setStudents] = useState([]);
    const [studentId, setStudentId] = useState();
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        getParentStudents().then(students => setStudents(students))
        .catch(e => {return;});
    }, [setStudents, user.students]);

    useEffect(() => {
        if (!studentId) {
            return;
        }
        getClassesForStudent(studentId).then(classes => setClasses(classes));
    }, [studentId]);

    const unpackStudentClasses = () => {
        return classes.map(Class => {
            let classPerformance = "No grade yet";
            const student = students.find(e => e.studentId === studentId);
            if (Class.performanceObj[student.uid]) {
                classPerformance = Class.performanceObj[student.uid];
            }
            return (
                <tr key={Class.classId}>
                    <td>{Class.name}</td>
                    <td>{Class.teachers[0].displayName}</td>
                    <td>{classPerformance}</td>
                    <td>{unpackProgress(Class, student.uid)}</td>
                </tr>
            );
        });
    }

    const unpackProgress = (Class, studentUid) => {
        let incompleteTasks = [];
        Class.goals.forEach(goal => {
            goal.tasks.forEach(task => {
                if (task.completion[studentUid] !== true) {
                    incompleteTasks.push(task);
                }
            });
        })
        if (incompleteTasks.length === 0) {
            return <span>All active tasks completed</span>;
        }
        return (<ul>
            {
                incompleteTasks.map((task, i) => {
                    return <li key={i}>{task.name}</li>;
                })
            }
        </ul>);
    }

    return (
        <>
            <div className="container rounded mt-5 p-2">
                <div className="row">
                    <div className="col">
                        <h2>Parent Dashboard</h2>
                    </div>
                </div>
            </div>
            <div className="container rounded mt-4 mb-2 p-2">
                <div className="row mb-1">
                    <div className="col">
                        <h5 className="capitalise">Hello{user.displayName ? " " + user.displayName : ""},</h5>
                        <span>Please select your child below to view their progress and performance</span>
                        <br/>
                        <div className="row mt-4 justify-content-center">
                            <div className="col-4 text-left">
                                <select disabled={students.length < 1 ? true : false} className="form-control" id="student" value={studentId} onChange={e => setStudentId(e.target.value)}>
                                    <option hidden value="">{students.length > 0 ? "Select Child": "No children enrolled"}</option>
                                    {students.map(stud => {
                                        return <option key={stud.uid} value={stud.studentId}>{stud.displayName}</option>
                                    })}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                {studentId ?
                    <div className="row mt-3">
                        <div className="col table-responsive text-left">
                            <table className="table table-sm table-bordered table-hover" style={{marginBottom: 0}}>
                                <thead className="thead-dark">
                                    <tr>
                                        <th scope="col">Class Name</th>
                                        <th scope="col">Teacher</th>
                                        <th scope="col">Current Grade</th>
                                        <th scope="col">Incomplete tasks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {unpackStudentClasses()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    :
                    <></>
                }
                
            </div>
        </>
    );
}

export default ParentPortal;