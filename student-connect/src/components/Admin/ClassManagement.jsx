import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { getClasses } from 'components/DB';

const ClassManagement = () => {
    const [classes, setClasses] = useState();

    useEffect(() => {
        getClasses()
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
                    <h2>Class Management</h2>
                </div>
            </div>
            <div className="container rounded mt-4 p-2">
                <div className="row">
                    <div className="col table-responsive">
                        <table className="table table-sm table-bordered table-hover">
                            <thead className="thead-dark">
                                <tr>
                                    <th className="text-left" scope="col">Class ID</th>
                                    <th scope="col">Year Level</th>
                                    <th className="text-left" scope="col">Department</th>
                                    <th className="text-left" scope="col">Subject Name</th>
                                    <th scope="col">Detail</th>
                                </tr>
                            </thead>
                            <tbody>
                                {TableBody(classes)}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <Link to={{pathname: "/admin/class-management/create"}}>
                            <button type="button" className="btn btn-primary" id="show-detail">
                                Create New Class
                            </button>  
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ClassManagement;

const TableBody = (classes) => {
    return (
        classes.map((classObject) => {
            return(
                <tr key={classObject["classId"]}>
                    <td className="text-left"><span>{classObject["classId"]}</span></td>
                    <td><span>{classObject["yearLevel"]}</span></td>
                    <td className="text-left"><span>{classObject["department"]}</span></td>
                    <td className="text-left"><span>{classObject["name"]}</span></td>
                    <td>
                        <Link to={{pathname: `/admin/class-management/view/${classObject["classId"]}`, state:classObject}}>
                            <button type="button" className="btn btn-primary" id="show-detail">
                                View
                            </button>
                        </Link>
                    </td>
                </tr>
            );
        })
        );
}