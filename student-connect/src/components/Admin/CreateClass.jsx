import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { createClass } from 'components/DB';
import { getUsersStudents } from 'components/DB';
import { getUsersTeachers } from 'components/DB';
import { AgGridReact} from 'ag-grid-react';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";


const CreateClass = () => {
    const [actionResult, setActionResult] = useState({});
    const [gridApiTeacher, setGridApiTeacher] = useState("");
    const [gridApi, setGridApi] = useState("");
    const [validation, setValidation] = useState(false);
    const [message, setMessage] = useState([]);
    const [studentRows, setStudentRows] = useState([]);
    const [teacherRows, setTeacherRows] = useState([]);
    const [selectedYearLevel, setSelectedYearLevel] = useState("");

    useEffect(() => {
        getUsersStudents()
        .then(studentUsers => {
            let temp = [];
            studentUsers.forEach((user) => {
                user["yearLevel"] = parseInt(user["yearLevel"]);
                temp.push(user);
            })
            temp.sort((a, b) => {
                if (a.studentId > b.studentId) {
                    return 1;
                } else if (a.studentId === b.studentId) {
                    return 0;
                } else {
                    return -1;
                }
            });
            setStudentRows(temp);
        });
    }, []);

    useEffect(() => {
        getUsersTeachers()
        .then(teacherUsers => {
            setTeacherRows(teacherUsers);
        });
    }, []);

    const columns = [
        { headerName: "Student ID", field: "studentId", sortable: true,flex: 1,maxWidth: 150, checkboxSelection: true, filter: true},
        { headerName: "Name", field: "displayName", sortable: true, flex: 1, maxWidth: 150, filter: true},
        { headerName: "Email", field: "email", sortable: true, flex: 1, maxWidth: 400, filter: true},
        { headerName: "Year Level", field: "yearLevel", sortable: true, flex: 1, maxWidth: 100, filter: 'agNumberColumnFilter'},
        ];
    
    const columns_teacher = [
        { headerName: "Name", field: "displayName", sortable: true, flex: 1, maxWidth: 400, checkboxSelection: true, filter: true},
        { headerName: "Email", field: "email", sortable: true, flex: 1, maxWidth: 400, filter: true},
        ];

    const handleSubmit = () => {

        const createClassId = () => {
            const year = document.getElementById("year").value
            const term = `t${document.getElementById("term").value}`;
            const yearLevel = `y${document.getElementById("yearLevel").value}`;
            let temp_arr = [];
            (document.getElementById("department").value.split(" ")).forEach((word) =>{
                temp_arr.push(word.toLowerCase())
            })
            const department = temp_arr.join("_")
            let temp_arr2 = [];
            (document.getElementById("name").value.split(" ")).forEach((word) =>{
                temp_arr2.push(word.toLowerCase())
            })
            const name = temp_arr2.join("_")
            return `${year}-${term}-${yearLevel}-${department}-${name}`
        }

        const createTeacherStudentObject = () => {
            const [teachers, students] = getSelectedRowData();
            let teacherObject = {}
            let studentObject = {}
            teachers.forEach((teacher) => {
                teacherObject[teacher["uid"]] = {};
                teacherObject[teacher["uid"]]["uid"] = teacher["uid"];                
            });
            students.forEach((student) => {
                studentObject[student["uid"]] = {};
                studentObject[student["uid"]]["uid"] = student["uid"];                
            });

            return [teacherObject, studentObject]
        }
        
        const classId = createClassId();
        const [teacherObject, studentObject] = createTeacherStudentObject();
        let classObject = {};

        classObject["classId"] = classId;
        classObject["yearLevel"] = document.getElementById("yearLevel").value;
        classObject["department"] = document.getElementById("department").value;
        classObject["name"] = document.getElementById("name").value;
        classObject["teacher"] =  teacherObject;
        classObject["student"] =  studentObject;
        classObject["goal"] =  { "0": {"goalId": "0"}}
        classObject["performance"] =  { "<uid>": ""}

        createClass(classId, classObject)
            .then(result => {
                if (result === "success") {
                    setActionResult({
                        success: true,
                        message: "Class successfully created"
                    });
                } else {
                    setActionResult({
                        success: false,
                        message: result
                    });
                }
        });
    }

    const onGridReadyTeacher = params => {
        setGridApiTeacher(params.api);
    }

    const onGridReady = params => {
        setGridApi(params.api);
    }

    const getSelectedRowData = () => {
        let selectedNodesTeacher = gridApiTeacher.getSelectedNodes();
        let selectedDataTeacher = selectedNodesTeacher.map(node => node.data);
        let selectedNodes = gridApi.getSelectedNodes();
        let selectedData = selectedNodes.map(node => node.data);
        return [selectedDataTeacher, selectedData];
    }

    const handleValidation = () => {
        const [teacher, student] = getSelectedRowData();
        let isValidList = [];
        let message = [];
        
        //year validation
        if ((document.getElementById("year").value === "")) {
            isValidList.push(false);
            message.push("Year cannot be empty");
        } else {
            const re = /^\d{4}$/;
            if ((document.getElementById("year").value).match(re)){
                isValidList.push(true);
            } else {
                isValidList.push(false);
                message.push("Year must be four digits");
            }
        }

        //department validation
        if ((document.getElementById("department").value === "")) {
            isValidList.push(false);
            message.push("Department cannot be empty");
        } else {
            isValidList.push(true);
        }

        //name validation
        if ((document.getElementById("name").value === "")) {
            isValidList.push(false);
            message.push("Subject cannot be empty");
        } else {
            isValidList.push(true);
        }

        // teacher validation
        if (teacher.length===0){
            isValidList.push(false);
            message.push("Must select one or more teachers");
        } else {
            isValidList.push(true);
        }
        // student validation
        if (student.length===0){
            isValidList.push(false);
            message.push("Must select one or more students");
        } else {
            isValidList.push(true);
        }
        if (isValidList.includes(false)){
            setValidation(false);
            setMessage(message);
        } else {
            setValidation(true);
        }   
    };
        
    if (actionResult.success){
        return (
            <div className="container rounded mt-4 p-2">
                <div className="row my-3">
                    <div className="col">
                        <h2>Create a new class</h2>
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
                        <Link to="/admin/class-management">
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
                        <h2>Create a new class</h2>
                    </div>
                </div>
                <div className="row my-4">
                    <div className="col">
                        <h4>Basic Information</h4>
                    </div>
                </div>
                <div className="row my-2">
                    <div className="col">
                        <label>Year&nbsp;</label>
                    </div>
                    <div className="col">
                        <input className="form-control" id="year" type="text" placeholder="2021" required />
                    </div>
                    <div className="col">
                        <label>Term&nbsp;</label>
                    </div>
                    <div className="col">
                        <select className="form-control" id="term">
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                        </select>
                   </div>
                    <div className="col">
                        <label>Year Level&nbsp;</label>
                    </div>
                    <div className="col">
                        <select className="form-control" id="yearLevel" onChange = {(e) => setSelectedYearLevel(e.target.value)}>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                            <option value="10">10</option>
                            <option value="11">11</option>
                            <option value="12">12</option>
                        </select>
                    </div>   
                </div>
                <div className="row my-2">   
                    <div className="col">
                        <label>Department&nbsp;</label>
                    </div>
                    <div className="col">
                        <input className="form-control" id="department" type="text" placeholder="Mathematics" />
                    </div>
                    <div className="col">
                        <label>Subject&nbsp;</label>
                    </div>
                    <div className="col">
                        <input className="form-control" id="name" type="text" placeholder="Maths B" />
                    </div> 
                </div>
                <div className="row my-4">
                    <div className="col">
                        <h4>Teacher</h4>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                    </div>
                    <div className="col-xs-10 col-sm-10 col-lg-8">
                        <div className="ag-theme-balham" style={{height: "400px", maxWidth: "100%"}}>
                            <AgGridReact columnDefs={columns_teacher} rowData={teacherRows} pagination={true} paginationPageSize={20} rowSelection={'multiple'}  onGridReady={onGridReadyTeacher}/>
                        </div> 
                    </div>
                    <div className="col"></div>
                </div> 
                <div className="row my-4">
                    <div className="col">
                        <h4>Student</h4>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                    </div>
                    <div className="col-xs-10 col-sm-10 col-lg-8">
                        <div className="ag-theme-balham" style={{height: "400px", maxWidth: "100%"}}>
                            <AgGridReact columnDefs={columns} rowData={selectedYearLevel? studentRows.filter(row => row.yearLevel === parseInt(selectedYearLevel)):studentRows} pagination={true} paginationPageSize={20} rowSelection={'multiple'} onGridReady={onGridReady}/>
                        </div> 
                    </div>
                    <div className="col"></div>
                </div> 
                <div className="row my-2">
                    <div className="col">
                        <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#exampleModal" onClick={handleValidation}>
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
                                            Do you want to create a class?
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
        );
    }
}

export default CreateClass;  