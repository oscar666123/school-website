import { useLocation } from "react-router-dom";
import React, { useState, useRef } from 'react';
import { Link } from "react-router-dom";
import DatePicker from 'react-datepicker';
import { createGoal } from 'components/DB';
import "react-datepicker/dist/react-datepicker.css";


const CreateGoal = () => {
    const location = useLocation();
    const [dueDate, setDueDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [actionResult, setActionResult] = useState({});
    const [validation, setValidation] = useState(false);
    const [message, setMessage] = useState("");
    const taskInput = useRef();
    const evidenceCheck = useRef();
    const curr_goalId = location.state.currGoalId;
    const class_id = location.state.classId;

    const handleAdd = () => {
        const newTask = taskInput.current.value;
        const evidenceRequired = evidenceCheck.current.checked
        if (newTask) {
            setTasks(tasks => [...tasks, {"task": newTask, "evidence": evidenceRequired }]);
            taskInput.current.value = "";
            evidenceCheck.current.checked = false;
        }   
    }

    const handleDelete = (index) => {
        let newTasks = [...tasks];
        newTasks.splice(index, 1);
        setTasks(newTasks);
    }

    const handleValidation = () => {
        if (tasks.length === 0) {
            setValidation(false);
            setMessage("Include at least one task");
        } else {
            setValidation(true);   
        }
    }

    const handleSubmit = () => {
        const next_goal_id = (parseInt(curr_goalId) + 1).toString();
        let output = {};
        output["due"]= dueDate.toLocaleString("en-GB", { year: 'numeric', month: '2-digit', day: '2-digit' });
        output["goalId"] = next_goal_id.toString();
        output["task"]={};
        tasks.forEach((task, index) => {
            const task_id = index.toString();
            output["task"][task_id]={};
            output["task"][task_id]["name"]=task["task"];
            output["task"][task_id]["task-id"]=task_id;
            output["task"][task_id]["evidenceRequired"]=task["evidence"];
            output["task"][task_id]["completion"]= {"<uid>": false};
            if (task["evidence"]) {
                output["task"][task_id]["evidence"]= {"<uid>": ""};
            }
        });
        
        createGoal(class_id,output)
        .then(result => {
            if (result === "success") {
                setActionResult({
                    success: true,
                    message: "Goal successfully created"
                });
            } else {
                setActionResult({
                    success: false,
                    message: result
                });
            }
        });
    }
        
    if (actionResult.success){
        return (
            <div className="container rounded mt-4 p-2">
                <div className="row my-3">
                    <div className="col">
                        <h2>Create a daily progress goal</h2>
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
        );
    }
    if (!actionResult.success){
        return (
            <div className="container rounded mt-4 p-2">    
                <div className="row my-2">
                    <div className="col">
                        <h2>Create a daily progress goal</h2>
                    </div>
                </div>
                <div>
                    <div className="row my-2">
                        <div className="col">
                            <label htmlFor="disabledTextInput">Class name</label>
                        </div>
                        <div className="col">
                        <input className="form-control" id="name" type="text" placeholder={location.state.className} disabled />
                        </div> 
                        <div className="col">
                            <label>Due date&nbsp;</label>
                        </div>
                        <div className="col">
                            <DatePicker dateFormat="dd/MM/yyyy" selected={dueDate} onChange={date => setDueDate(date)} />  
                        </div>
                    </div>
                    <div className="row my-2">
                        <div className="col">
                            <h2>Add a task</h2>
                        </div>
                    </div>
                    <div className="row my-2">
                        <div className="col-sm-6 col-lg-7">
                            <input className="form-control" ref={taskInput} aria-label="add-task" type="text" placeholder="Input a task" />
                        </div>
                        <div className="col-sm-3 col-lg-3">
                            <div className="form-group form-check">
                                <input type="checkbox" className="form-check-input" ref={evidenceCheck} id="evidence" />
                                <label className="form-check-label" htmlFor="exampleCheck1">Evidence required</label>
                            </div>
                        </div>
                        <div className=" col-sm-3 col-lg-2"> 
                            <button type="submit" className="btn btn-primary" id="add-task" onClick={() => handleAdd()}>Add</button>
                        </div>
                    </div>
                    <div>
                        {tasks.map((task, index) => {
                            return(
                                <div className="row my-2" key={index}>
                                    <div className="col-sm-6 col-lg-7"> 
                                        <div className="card">
                                            <div className="card-body">
                                            {task["task"]}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-3 col-lg-3">
                                        <div className="form-group form-check">
                                            <input type="checkbox" className="form-check-input" id={`evidence-${index}`} checked={task["evidence"]? "checked":""} readOnly/>
                                            <label className="form-check-label" htmlFor={`evidence-${index}`}>Evidence required</label>
                                        </div>
                                    </div>
                                    <div className="col-sm-3 col-lg-2">
                                        <button type="submit" className="btn btn-primary" id="delete-task" onClick={() => handleDelete(index)}>Delete</button>
                                    </div>
                                </div>
                            );
                        })}                                    
                    </div>
                    <div className="row my-2">
                        <div className="col">
                            <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#exampleModal" onClick={() => {handleValidation()}}>
                                Submit
                            </button>
                            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="#exampleModalLabel" aria-hidden="true">
                                {(validation)?(
                                <div className="modal-dialog">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title" id="exampleModalLabel">Confirmation</h5>
                                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                        <div className="modal-body">
                                            Do you want to create a new goal?
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                                            <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={()=>handleSubmit()}>Submit</button>
                                        </div>
                                    </div>
                                </div>)
                                :(
                                    <div className="modal-dialog">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title" id="exampleModalLabel">Validation</h5>
                                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                                    <span aria-hidden="true">&times;</span>
                                                </button>
                                            </div>
                                            <div className="modal-body">
                                                {message}
                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>                
            </div>
        );
    }
}

export default CreateGoal;  
