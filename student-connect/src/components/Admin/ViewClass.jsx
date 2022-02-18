import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { deleteClass } from 'components/DB';
import { AgGridReact} from 'ag-grid-react';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";


const ViewClass = () => {
    const [actionResult, setActionResult] = useState({});
    const location = useLocation();
    const classObject = location.state;
    const studentRows = classObject["students"];
    const teacherRows = classObject["teachers"];

    const columns = [
        { headerName: "Student ID", field: "studentId", sortable: true,flex: 1,maxWidth: 150, filter: true},
        { headerName: "Name", field: "displayName", sortable: true, flex: 1, maxWidth: 150, filter: true},
        { headerName: "Email", field: "email", sortable: true, flex: 1, maxWidth: 400, filter: true},
        { headerName: "Year Level", field: "yearLevel", sortable: true, flex: 1, maxWidth: 100},
        ];
    
    const columns_teacher = [
        { headerName: "Name", field: "displayName", sortable: true, flex: 1, maxWidth: 400, filter: true},
        { headerName: "Email", field: "email", sortable: true, flex: 1, maxWidth: 400, filter: true},
        ];
    
    const handleDelete = () => {
        deleteClass(classObject["classId"])
            .then(result => {
                if (result === "success") {
                    setActionResult({
                        success: true,
                        message: "Class successfully deleted"
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
                            <h2>View Class Detail</h2>
                        </div>
                    </div>
                    <div className="row my-4">
                        <div className="col">
                            <h4>Basic Information</h4>
                        </div>
                    </div>
                    <div className="row my-2">
                        <div className="col">
                            <label>Class ID&nbsp;</label>
                        </div>
                        <div className="col">
                            <input className="form-control" id="classId" type="text" placeholder={classObject["classId"]} disabled />
                        </div>
                        <div className="col">
                            <label>Year Level&nbsp;</label>
                        </div>
                        <div className="col">
                            <input className="form-control" id="term" type="text" placeholder={classObject["yearLevel"]} disabled/>
                        </div>
                    </div>
                    <div className="row my-2">   
                        <div className="col">
                            <label>Department&nbsp;</label>
                        </div>
                        <div className="col">
                            <input className="form-control" id="department" type="text" placeholder={classObject["department"]} disabled/>
                        </div>
                        <div className="col">
                            <label>Subject&nbsp;</label>
                        </div>
                        <div className="col">
                            <input className="form-control" id="name" type="text" placeholder={classObject["name"]} disabled/>
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
                                <AgGridReact columnDefs={columns_teacher} rowData={teacherRows} pagination={true} paginationPageSize={20} />
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
                                <AgGridReact columnDefs={columns} rowData={studentRows} pagination={true} paginationPageSize={20} />
                            </div> 
                        </div>
                        <div className="col"></div>
                    </div> 
                    <div className="row my-2">
                        <div className="col">
                            <button type="button" className="btn btn-danger" data-toggle="modal" data-target="#exampleModal" >
                                Delete
                            </button>
                            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="#exampleModalLabel" aria-hidden="true">
                                    <div className="modal-dialog">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title" id="exampleModalLabel">Confirmation</h5>
                                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                                    <span aria-hidden="true">&times;</span>
                                                </button>
                                            </div>
                                            <div className="modal-body">
                                                Do you want to delete a class?
                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                                                <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={()=>handleDelete()}>Delete</button>
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

export default ViewClass;