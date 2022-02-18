import { useLocation } from "react-router-dom";
import { useState } from 'react';
import React from 'react';
import { Link } from "react-router-dom";
import { Bar } from 'react-chartjs-2';
import { deleteGoal } from 'components/DB';


const ViewGoal = () => {
    const location = useLocation();
    const [actionResult, setActionResult] = useState({});
    const goal_object = location.state.goalObject;
    const class_id = location.state.classId;
    const class_name = location.state.className;
    const students = location.state.studentList;
    const student_count = students.length;
    let progress = [];
    let completed = [];
    let notCompleted = [];
    let notAnswered = [];
    let studentsCompletedNotAnswered = [];

    //convert goal object 
    students.forEach((student)=>{
        let progress_object = {};
        progress_object["uid"]=student["uid"];
        progress_object["displayName"]=student["displayName"];
        progress_object["email"]=student["email"];
        progress_object["studentId"]=student["studentId"];
        progress_object["task"] = {};
        goal_object.tasks.forEach((task) => {
            if ((Object.keys(task["completion"]).includes(student["uid"])) && (task["completion"][student["uid"]])) {
                progress_object["task"][task["task-id"]] = "completed";
            } else if (Object.keys(task["completion"]).includes(student.uid)){
                progress_object["task"][task["task-id"]] = "notCompleted";
            } else {
                progress_object["task"][task["task-id"]] = "notAnswered";
            }
        });
        progress.push(progress_object);
    });

    // extract students who have completed all tasks
    progress.forEach((student) => {
        let count = 0;
        let temp = {};
        (Object.values(student["task"])).forEach((value) => {
            if (value === "completed"){
                count += 1;
            }
        });
        if(count === Object.values(student["task"]).length) {
            temp["uid"] = student["uid"];
            temp["displayName"] = student["displayName"];
            temp["email"] = student["email"];
            temp["studentId"] = student["studentId"];
            completed.push(temp);
            studentsCompletedNotAnswered.push(student["uid"]);
        }
    });
    //extract students who have not answered the progress
    progress.forEach((student) => {
        let count = 0;
        let temp = {};
        (Object.values(student["task"])).forEach((value)=>{
            if (value === "notAnswered"){
                count += 1;
            }
        });
        if(count === Object.values(student["task"]).length) {
            temp["uid"] = student["uid"];
            temp["displayName"] = student["displayName"];
            temp["email"] = student["email"];
            temp["studentId"] = student["studentId"];
            notAnswered.push(temp);
            studentsCompletedNotAnswered.push(student["uid"]);
        }
    });
    //extract students who have not completed the goal
    progress.forEach((student) => {
        if (!studentsCompletedNotAnswered.includes(student["uid"])) {
            let temp = {};
            temp["uid"] = student["uid"];
            temp["displayName"] = student["displayName"];
            temp["email"] = student["email"];
            temp["studentId"] = student["studentId"];
            temp["tasks"] = {};
            (Object.keys(student["task"])).forEach((taskId) => {
                temp["tasks"][taskId] = student["task"][taskId];
            });
            notCompleted.push(temp);
        }
    });

    // delete a goal
    const handleDelete = () => {
        deleteGoal(class_id, goal_object["goalId"])
            .then(result => {
                if (result === "success") {
                    setActionResult({
                        success: true,
                        message: "Goal successfully deleted"
                    });
                } else {
                    setActionResult({
                        success: false,
                        message: result
                    });
                }
            });
    };

    if (actionResult.success){
        return (
            <div className="container rounded mt-4 p-2">
                <div className="row my-3">
                    <div className="col">
                        <h2>View Results</h2>
                    </div>
                </div>
                <div className="row my-3">
                    <div className="col">
                        <div className="alert alert-success" role="alert">
                            {actionResult.message}
                        </div>
                    </div>
                </div>
                <div className="row my-3">
                    <div className="col">
                        <Link to="/teacher/daily-progress-management">
                            <button type="button" className="btn btn-primary" id="return">Back</button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }
    if (!actionResult.success){
        return (
            <div className="container rounded mt-4 p-2">
                <div className="row my-3">
                    <div className="col">
                        <h2>View Results</h2>
                    </div>
                </div>
                <div>
                    <div className="row my-3">
                        <div className="col">
                            <label htmlFor="disabledTextInput">Class name</label>
                        </div>
                        <div className="col">
                            <input className="form-control" id="class_name" type="text" placeholder={class_name} disabled />
                        </div> 
                        <div className="col">
                            <label>Due date&nbsp;</label>
                        </div>
                        <div className="col">
                            <input className="form-control" id="due_date" type="text" placeholder={goal_object.due} disabled />
                        </div> 
                    </div>
                    <div className="my-5">
                        <div className="row my-3">
                            <div className="col">
                                <h4>Overall Progress</h4>
                            </div>
                        </div>
                        <div className="row my-3">
                            <div className="col">
                                <div className="progress">
                                    <div className="progress-bar" role="progressbar" 
                                        style={{width:((completed.length/student_count)*100).toString()+"%"}} 
                                        aria-valuenow={completed.length.toString()} aria-valuemin="0" aria-valuemax={student_count.toString()}>
                                        {Math.round(((completed.length/student_count)*100)).toString()+"%"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="my-5">
                        <div className="row my-3">
                            <div className="col">
                                <h4>Individual Task Progress</h4>
                            </div>
                        </div>
                        <div className="row my-3">
                            <div className="col">
                                {ViewBarGraph(goal_object, student_count)}
                            </div>
                        </div >
                    </div>
                    <div>
                        {TableCompleted("Completed", goal_object, completed)}
                    </div>
                    <div>
                        {TableNotCompleted("Not Completed", goal_object, notCompleted, students)}
                    </div>
                    <div>
                        {TableNotAnswered("Not Answered", notAnswered, students)}
                    </div>
                    
                    <div className="row">
                        <div className="col">
                            <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#exampleModal">
                                Delete
                            </button>
                            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                <div className="modal-dialog">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title" id="exampleModalLabel">Confirmation</h5>
                                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                        <div className="modal-body">
                                            Do you want to delete the goal?
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                                            <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={()=>handleDelete()}>Delete</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>           
                </div>                
            </div>
        );
    }
}
export default ViewGoal;

// bar chart
const ViewBarGraph = (goal, student_count) => {
    const xlabel = [];
    let row_data = [];
    let tot_data = [];
    
    //set data
    goal["tasks"].forEach((task)=>{
        xlabel.push(task["name"])
    })
    goal["tasks"].forEach((task) => {
        let count = 0;
        Object.keys(task["completion"]).forEach((uid) => {
            if (task["completion"][uid]) {
                count += 1;
            }
        })
        row_data.push(count)
    })
    goal["tasks"].forEach(() => {
        tot_data.push(student_count)
    })
    
    const state = {
        labels: xlabel,
        datasets: [{
            label: 'Total',
            data : tot_data
        },
        {
            label: 'Completed',
            data:  row_data,
            borderColor: 'rgba(0,0,0,1)', 
            backgroundColor: 'rgba(75,192,192,1)'  
        }]
    }
    return (
        <div>
          <Bar
            data={state}
          />
        </div>
    );
}

// table for students who have completed all tasks
const TableCompleted = (title, goal, student_list) => {
    return (
        <div>
            <div className="row">
                <div className="col text-left">
                    <h4>{title}</h4>
                </div>
            </div>
            <div className="row">
                <div className="col table-responsive">
                    <table className="table table-sm table-bordered table-hover">
                        <thead className="thead-dark">
                            <tr>
                                <th scope="col">Student ID</th>
                                <th scope="col">Name</th>
                                {goal["tasks"].map((task)=>{
                                    return (<th scope="col" key={task["task-id"]}>{task["name"]}</th>);
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {TableBodyCompleted(goal["tasks"], student_list)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// table body for students who have not completed all tasks
const TableBodyCompleted = (tasks, student_list) => {
    return (
        student_list.map((student) => {
            return(
                <tr key={student["uid"]}>
                    <td><span>{student["studentId"]}</span></td>
                    <td><span>{student["displayName"]}</span></td>
                    {tasks.map((task) => {
                        if (task["evidenceRequired"]) {
                            return( 
                                <td key={task["task-id"]}><a href={task["evidence"][student["uid"]]} target="_blank" rel="noopener noreferrer"><span>&#10004;</span></a></td> 
                            );
                        } else {
                            return( 
                                <td key={task["task-id"]}><span>&#10004;</span></td> 
                            );
                        }
                    })}
                </tr>
            );
        })
    );
}

// table for students who have not completed all tasks
const TableNotCompleted = (title, goal, student_list) => {
    return (
        <div>
            <div className="row">
                <div className="col text-left">
                    <h4>{title}</h4>
                </div>
            </div>
            <div className="row">
                <div className="col table-responsive">
                    <table className="table table-sm table-bordered table-hover">
                        <thead className="thead-dark">
                            <tr>
                                <th scope="col">Student ID</th>
                                <th scope="col">Name</th>
                                {goal["tasks"].map((task)=>{
                                    return (<th scope="col" key={task["task-id"]}>{task["name"]}</th>);
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {TableBodyNotCompleted(goal["tasks"], student_list)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// table body for students who have not completed all tasks
const TableBodyNotCompleted = (tasks, student_list) => {
    return (
        student_list.map((student) => {
            return(
                <tr key={student["uid"]}>
                    <td><span>{student["studentId"]}</span></td>
                    <td><span>{student["displayName"]}</span></td>
                    {tasks.map((task) => {
                        if (student["tasks"][task["task-id"]]==="completed"){
                            if (task["evidenceRequired"]) {
                                return( 
                                    <td key={task["task-id"]}><a href={task["evidence"][student["uid"]]} target="_blank" rel="noopener noreferrer"><span>&#10004;</span></a></td> 
                                );
                            } else {
                                return( 
                                    <td key={task["task-id"]}><span>&#10004;</span></td> 
                                );
                            }   
                        } else {
                            return( 
                                <td key={task["task-id"]}><span>&#10008;</span></td> 
                            );
                        }
                    })}
                </tr>
            );
        })
    );
}

// table for students who have not answered the goal
const TableNotAnswered = (title, student_list) => {
    return (
        <div>
            <div className="row">
                <div className="col text-left">
                    <h4>{title}</h4>
                </div>
            </div>
            <div className="row">
                <div className="col table-responsive">
                    <table className="table table-sm table-bordered table-hover">
                        <thead className="thead-dark">
                            <tr>
                                <th scope="col">Student ID</th>
                                <th scope="col">Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {TableBodyNotAnswered(student_list)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// table body for students who have completed all tasks or who have not answered the goal
const TableBodyNotAnswered = (student_list) => {
    return (
        student_list.map((student)=>{
            return(
                <tr key={student["uid"]}>
                    <td><span>{student["studentId"]}</span></td>
                    <td><span className="capitalise">{student["displayName"]}</span></td>
                </tr>  
            );
        })
    );
}
