import React, { useEffect, useState } from 'react';
import { getClassesForStudent } from 'components/DB';

const StudentPortal = (user) => {
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        getClassesForStudent().then(classes => setClasses(classes))
        .catch(e => {return;});
    }, [user.studentId]);

    const unpackStudentClasses = () => {
        if (!classes || classes.length === 0) {
            return (
                <tr>
                    <td>You are not enrolled in any classes</td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            );
        }
        return classes.map(Class => {
            let classPerformance = "No grade yet";
            if (Class.performanceObj[user.uid]) {
                classPerformance = Class.performanceObj[user.uid];
            }
            return (
                <tr key={Class.classId}>
                    <td>{Class.name}</td>
                    <td>{Class.teachers[0].displayName}</td>
                    <td>{classPerformance}</td>
                    <td>{unpackProgress(Class, user.uid)}</td>
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
                        <h2>Student Dashboard</h2>
                    </div>
                </div>
            </div>
            <div className="container rounded mt-4 p-2">
                <div className="row">
                    <div className="col">
                        <h5 className="capitalise">Hello{user.displayName ? " " + user.displayName : ""},</h5>
                        <span>Your class overviews can be found below.</span>
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
                    </div>
                </div>
            </div>
        </>
    );
}

export default StudentPortal;