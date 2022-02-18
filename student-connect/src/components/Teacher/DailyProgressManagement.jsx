import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { getClassesForTeacher } from 'components/DB';



const viewGoalButton = (class_id, students, class_name, goal) => {
    return (
        <Link to={{pathname: `/teacher/daily-progress-management/view/${class_id}-${goal.goalId}`, 
            state:{classId: class_id, className: class_name, studentList: students, goalObject: goal}}}>
            <button type="button" className="btn btn-info btn-sm btn-block mb-3">{goal.due}</button>
        </Link>
    );
};

const createGoalButton = (class_id, class_name, latest_goal_id) => {
    return (
        <Link to={{pathname: `/teacher/daily-progress-management/create/${class_id}`, 
            state:{classId: class_id, className: class_name, currGoalId: latest_goal_id}}}> 
            <button type="button" className="btn btn-primary btn-sm btn-block mb-3">Add</button>
        </Link>
    );
};


const DailyProgressManagement = () => {
    const [classes, setClasses] = useState();

    useEffect(() => {
        getClassesForTeacher()
        .then(classes => {
            setClasses(classes);
        });
    }, []);

    if (!classes) {
        return <></>
    }
    return (
        <div className="container rounded mt-4 p-2">
            <div className="row">
                <div className="col">
                    <h2>Active Daily Goals</h2>
                </div>
            </div>
            {classes.map((classObject) => {
                return(
                    <div key={classObject.classId}>
                        <div className="row-3 text-left">
                            <h2>{classObject.name}</h2>
                            <div className="row">
                                <div className="col-2">
                                    {createGoalButton(classObject.classId, classObject.name, (classObject.goals[(classObject.goals.length-1)]).goalId)}
                                </div>
                                <div className="col">
                                    <div className="row">
                                        {classObject.goals.map((goalObject) => {
                                            if((goalObject.goalId !== "0")) {
                                                return (
                                                    <div className="col-lg-2 col-md-3 col-4" key={classObject.classId+goalObject.goalId}>
                                                        {viewGoalButton(classObject.classId, classObject.students, classObject.name, goalObject)}
                                                    </div>
                                                )
                                            }
                                            else {
                                                return <React.Fragment key={goalObject.goalId}></React.Fragment>;
                                            }
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    )
}

export default DailyProgressManagement;