import { useLocation } from "react-router-dom";
import React, { useState } from 'react';
import { updateProgress } from 'components/DB';
import { Link } from "react-router-dom";

const AnswerTask = (user) => {
    const location = useLocation();
    const [actionResult, setActionResult] = useState({});
    const [validation, setValidation] = useState(false);
    const [message, setMessage] = useState([]);
    const goal_object = location.state.goalObject;
    const class_id = location.state.classId;
    const class_name = location.state.className;
    const uid = user.uid;
    
    const handleValidation = () => {
        let messageList = [];
        let expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi;
        var regex = new RegExp(expression);
        var isValidList = []

        goal_object.tasks.forEach((task) => {
            if (document.getElementById(task["task-id"]).checked) {
                if (task["evidenceRequired"]) {
                    if (!(document.getElementById(`evidence-${task["task-id"]}`).value === "")) {
                        if ((document.getElementById(`evidence-${task["task-id"]}`).value).match(regex)) {
                            isValidList.push(true); 
                        }
                        else {
                            isValidList.push(false);
                            messageList.push(`Task ${parseInt(task["task-id"])+1} : Evidence of completion (URL) must start with http(s)://`)
                        }}
                    else {
                        isValidList.push(false);
                        messageList.push(`Task ${parseInt(task["task-id"])+1} : Evidence of completion (URL) cannot be empty`)
                    }}
                else {
                    isValidList.push(true);
                }
            } else {
                isValidList.push(true);
            }
        })
        if (isValidList.includes(false)){
            setValidation(false);
            setMessage(messageList);
        }
        else {
            setValidation(true);
        }
    }
    
    const handleSubmit = () => {
        let progress = [];
        goal_object.tasks.forEach((task) => {
            let temp = {};
            temp["task-id"] = task["task-id"];
            if (document.getElementById(task["task-id"]).checked) {
                temp["completion"] = true;
            } else {
                temp["completion"] = false;
            }
            if (task["evidenceRequired"]){
                temp["evidence"]= document.getElementById(`evidence-${task["task-id"]}`).value;
            }
            progress.push(temp);
        })
        
        updateProgress(class_id, goal_object["goalId"], progress)
            .then(result => {
                if (result === "success") {
                    setActionResult({
                        success: true,
                        message: "Progress successfully updated"
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
                        <h2>Update daily progress</h2>
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
                        <Link to="/student/task-centre">
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
                        <h2>Update daily progress</h2>
                    </div>
                </div>
                <div>
                    <div className="row my-2">
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
                    <div className="row my-2">
                        <div className="col">
                            <h2>Tasks</h2>
                        </div>
                    </div>
                    {goal_object.tasks.map((taskObject) => {
                        if(Object.keys(taskObject.completion).includes(uid) && taskObject.completion[uid]){
                            return(
                                <div className="row my-2" key={taskObject["task-id"]}>
                                    <div className="col-sm-2 col-lg-2">
                                        <div className="form-check-lg">
                                            <input className="form-check-input position-static" type="checkbox" id={taskObject["task-id"]} value="" checked readOnly/>
                                        </div>
                                    </div>
                                    <div className="col-sm-5 col-lg-5"> 
                                        <div className="card">
                                            <div className="card-body">
                                                {taskObject.name}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-5 col-lg-5"> 
                                        {taskObject["evidenceRequired"] && 
                                            <input className="form-control" id={`evidence-${taskObject["task-id"]}`} type="text" value={taskObject.evidence[uid]} readOnly/>
                                        }
                                    </div>
                                </div>
                            );
                        }
                        else {
                            return(
                                <div className="row my-2" key={taskObject["task-id"]}>
                                    <div className="col-sm-2 col-lg-2">
                                        <div className="form-check-lg">
                                            <input className="form-check-input position-static" type="checkbox" id={taskObject["task-id"]} value="" />
                                        </div>
                                    </div>
                                    <div className="col-sm-5 col-lg-5"> 
                                        <div className="card">
                                            <div className="card-body">
                                                {taskObject.name}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-5 col-lg-5">
                                        {taskObject["evidenceRequired"] &&
                                            <div className="col"> 
                                                <input className="form-control" id={`evidence-${taskObject["task-id"]}`} type="text" placeholder="Link to your evidence" />
                                            </div>
                                        }
                                    </div>
                                    
                                </div>
                            );
                        } 
                    })} 
                    <div className="row">
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
                                            Do you want to submit your progress?
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
                                                {message.map((message) => {
                                                    return <p key={message}>{message}</p>
                                                }
                                                )}
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

export default AnswerTask;  
