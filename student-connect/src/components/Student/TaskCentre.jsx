import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { getClassesForStudent } from 'components/DB';


const answerTaskButton = (class_id, class_name, goal, uid) => {
    let completion_check = [];

    goal.tasks.forEach((task) => {
        if (Object.keys(task.completion).includes(uid)){
            if (task.completion[uid]){
                completion_check.push(true);
            }
            else{
                completion_check.push(false);
            }
        }
        else{
            completion_check.push(false);
        }
    });
    if (completion_check.includes(false)){
        return (
            <Link to={{pathname: `/student/task-centre/answer/${class_id}-${goal.goalId}`, 
                state:{classId: class_id, className: class_name, goalObject: goal}}}>
                <button type="button" className="btn btn-info btn-sm btn-block mb-3">{goal.due}</button>
            </Link>
        );
    } else {
        return(
            <button disabled type="button" className="btn btn-secondary btn-sm btn-block">{goal.due}</button>
        );
    }  
}

const TaskCentre = (user) => {
    const [classes, setClasses] = useState();
    const uid = user.uid;

    useEffect(() => {
        getClassesForStudent()
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
                    <h2>Active Goals</h2>
                </div>
            </div>
            {classes.map((classObject) => {
                return(
                    <div key={classObject.classId}>
                        <div className="row text-left">
                            <div className="col">
                                <h2>{classObject.name}</h2>
                            </div>
                        </div>
                        <div className="row">
                            {classObject.goals.length > 1 ?
                                classObject.goals.map((goalObject) => {
                                    if((goalObject.goalId !== "0")) {
                                        return (
                                            <div className="col-lg-2 col-md-3 col-4" key={classObject.classId+goalObject.goalId}>
                                                {answerTaskButton(classObject.classId, classObject.name, goalObject, uid)}
                                            </div>
                                        );
                                    } else {
                                        return <React.Fragment key={goalObject.goalId}></React.Fragment>;
                                    }})
                                :
                                <h5 className="col text-left" key={classObject.classId+"0"}>
                                    There are no active goals for this class
                                </h5>
                            }  
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default TaskCentre;