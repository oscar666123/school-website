import './UserManagement.css';
import { useEffect, useState } from 'react';
import { getUsers, deleteUser, createUser } from 'components/DB';
import React from 'react';
import { linkParent } from 'components/DB';
//import Dropdown from 'react-bootstrap/Dropdown';

const pageAlert = (actionResult, setActionResult) => {
    if (!actionResult) {
        return <></>;
    }
    return (
        <div className={"alert alert-"+(actionResult.success ? "success" : "danger")+" alert-dismissible fade show"} role="alert">
            {actionResult.message}
            <button type="button" className="close" aria-label="Close" onClick={() => setActionResult()}>
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    );
}

const deleteModal = (userToDelete, setActionResult) => {
    if (!userToDelete) {
        return <></>;
    }
    return (
        <div className="modal fade" id="confirmationModal" tabIndex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="confirmationModalLabel">Delete User</h5>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        Are you sure you want to delete the user '{userToDelete.email}'?
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                        <button type="button" className="btn btn-danger" data-dismiss="modal" 
                            onClick={() => handleDeleteUser(userToDelete.uid, userToDelete.email, setActionResult)}>
                            Delete User
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const handleDeleteUser = async (uid, email, setActionResult) => {
    if (uid) {
        const result = await deleteUser(uid);
        if (result === "success") {
            setActionResult({
                success: true,
                message: "User '"+email+"' successfully deleted"
            });
        } else {
            setActionResult({
                success: false,
                message: result
            });
        }
    }
}

const handleCreateUser = (setActionResult, setPageState) => {
    const role = document.getElementById("user-role").value;
    const email = document.getElementById("user-email").value;
    const password = document.getElementById("user-password").value;
    const displayName = document.getElementById("user-display-name").value;
    const yearLevel = document.getElementById("user-year-level").value;
    const studentId = document.getElementById("user-student-id").value;

    if (!email || !password || !displayName || !role 
        || (role === "student" && (!yearLevel || !studentId))) {
        alert("User not created - missing details");
        return;
    }
    
    const emailRegex = "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$";
    const emailPass = email.match(emailRegex);

    if (!emailPass) {
        alert("Email does not match the required format (user@site.com)");
        return;
    }

    const newUser = {email, password, displayName, role, yearLevel, studentId};
    if (role !== "student") {
        delete newUser.yearLevel;
        delete newUser.studentId;
    }

    createUser(newUser)
    .then(result => {
        if (result === "success") {
            setActionResult({
                success: true,
                message: "User '"+email+"' successfully created"
            });
            setPageState(0);
        } else {
            setActionResult({
                success: false,
                message: result
            });
        }
    });
}

const displayFields = (role, setActionResult, setPageState) => {
    const unpackYears = () => {
        let years = [];
        for(let i=7; i < 13; i++) {
            years.push(<option value={i} key={i}>{i}</option>);
        }
        return years;
    }
    switch(role) {
        case "":
            return <></>;
            
        case "student":
            return (
                <>
                    {/* Force next columns to break to new line */}
                    <div className="w-100"/>
                    <div className="col mt-3">
                        <label htmlFor="user-year">Year Level</label>
                        <select className="form-control" id="user-year-level">
                            <option hidden value="">Select Year</option>
                            {unpackYears()}
                        </select>
                    </div>
                    <div className="col mt-3">
                        <label htmlFor="user-student-id">Student ID</label>
                        <input type="number" min="0" className="form-control" id="user-student-id" placeholder="123456789"/>
                    </div>
                    {/* Force next columns to break to new line */}
                    <div className="w-100"/>
                    <div className="col mt-3">
                        <label htmlFor="user-email">Email</label>
                        <input type="email" className="form-control" id="user-email" placeholder="user@site.com"/>
                    </div>
                    <div className="col mt-3">
                        <label htmlFor="user-password">Password</label>
                        <input type="password" className="form-control" id="user-password" placeholder="*******"/>
                    </div>
                    {/* Force next columns to break to new line */}
                    <div className="w-100"/>
                    <div className="col mt-3">
                        <label htmlFor="user-display-name">Display Name</label>
                        <input className="form-control" id="user-display-name" placeholder="John Smith"/>
                    </div>
                    {/* Force next columns to break to new line */}
                    <div className="w-100"/>
                    <div className="col-7 mt-5">
                        <button className="btn btn-primary btn-block" 
                            onClick={() => handleCreateUser(setActionResult, setPageState)}>
                                Confirm
                        </button>
                    </div>
                </>
            );

        default:
            return (
                <>
                    {/* Force next columns to break to new line */}
                    <div className="w-100"/>
                    <div className="col mt-3">
                        <label htmlFor="user-email">Email</label>
                        <input type="email" className="form-control" id="user-email" placeholder="user@site.com"/>
                    </div>
                    <div className="col mt-3">
                        <label htmlFor="user-password">Password</label>
                        <input type="password" className="form-control" id="user-password" placeholder="*******"/>
                    </div>
                    {/* Force next columns to break to new line */}
                    <div className="w-100"/>
                    <div className="col mt-3">
                        <label htmlFor="user-display-name">Display Name</label>
                        <input className="form-control" id="user-display-name" placeholder="John Smith"/>
                    </div>
                    {/* Force next columns to break to new line */}
                    <div className="w-100"/>
                    <div className="col-7 mt-5">
                        <button className="btn btn-primary btn-block" 
                            onClick={() => handleCreateUser(setActionResult, setPageState)}>
                                Confirm
                        </button>
                    </div>
                    {/* Need these hidden fields to silently process the empty values before discarding them */}
                    <input readOnly hidden type="number" min="0" id="user-student-id"/>
                    <input readOnly hidden id="user-year-level"/>
                </>
            );
    }
}

const UserManagement = () => {
    const [userRows, setUserRows] = useState();
    const [pageState, setPageState] = useState();
    const [actionResult, setActionResult] = useState();
    const [userToDelete, setUserToDelete] = useState();
    const [newRole, setNewRole] = useState("");

    useEffect(() => {
        // If an action happens to a user, rebuild the table
        unpackUsers(setUserToDelete)
        .then(users => {
            setUserRows(users);
        });
    }, [actionResult]);

    if (pageState === 1) {
        return (
            <>
                {pageAlert(actionResult, setActionResult)}
                {deleteModal(userToDelete, setActionResult)}
                <div className="container container-smaller rounded mt-5 p-2">
                    <div className="row">
                        <div className="col">
                            <h2>Create User</h2>
                        </div>
                    </div>
                </div>
                <div className="container container-smaller rounded mt-4 p-2">
                    <div className="row justify-content-center">
                        <div className="col">
                            <h5>New User Details</h5>
                        </div>
                    </div>
                    <div className="row mb-2 justify-content-center text-left">
                        <div className="col mt-3">
                            <label htmlFor="user-role">Role</label>
                            <select className="form-control" id="user-role" value={newRole} onChange={e => setNewRole(e.target.value)}>
                                <option hidden value="">Select Role</option>
                                <option value="teacher">Teacher</option>
                                <option value="student">Student</option>
                                <option value="councillor">Councillor</option>
                                <option value="staff">Staff</option>
                                <option value="parent">Parent</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    {displayFields(newRole, setActionResult, setPageState)}
                        {/* Force next columns to break to new line */}
                        <div className="w-100"></div>
                        <div className="col-7 mt-3">
                            <button className="btn btn-primary btn-block" onClick={() => setPageState(0)}>Cancel</button>
                        </div>
                    </div>
                </div>
            </>
        );
    } else if (pageState === 2) {
        return <ParentLink actionResult={actionResult} setActionResult={setActionResult} setPageState={setPageState} />
    } else {
        return (
            <>
                {pageAlert(actionResult, setActionResult)}
                {deleteModal(userToDelete, setActionResult)}
                <div className="container rounded mt-5 p-2">
                    <div className="row">
                        <div className="col">
                            <h2>User Management</h2>
                        </div>
                    </div>
                </div>
                <div className="container rounded my-4 p-2">
                    <div className="row">
                        <div className="col table-responsive">
                            <table className="table table-sm table-bordered table-hover">
                                <thead className="thead-dark">
                                    <tr>
                                        <th scope="col">Email</th>
                                        <th scope="col">Display Name</th>
                                        <th scope="col">Role</th>
                                        <th scope="col">User Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userRows}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="row my-2">
                        <div className="col">
                            {/* Button to switch the page state from user list to create a new user */}
                            <button className="btn btn-primary" onClick={() => setPageState(1)}>Create New User</button>
                            <button className="btn btn-primary ml-4" onClick={() => setPageState(2)}>Link Student to Parent</button>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

const handleLinkParent = (parentUid, studentId, setActionResult, setPageState) => {

    if (!parentUid || !studentId) {
        alert("Student not linked to parent - missing details");
        return;
    }

    linkParent(parentUid, studentId)
    .then(result => {
        if (result === "success") {
            setActionResult({
                success: true,
                message: "Student '"+studentId+"' successfully linked to parent"
            });
            setPageState(0);
        } else {
            setActionResult({
                success: false,
                message: result
            });
        }
    });
}

const displayParentFields = (parentUid, setActionResult, setPageState) => {
    if (!parentUid) {
            return <></>;
    }
    return (
        <>
            {/* Force next columns to break to new line */}
            <div className="w-100"/>
            <div className="col mt-3">
                <label htmlFor="user-student-id">Student ID</label>
                <input type="number" min="0" className="form-control" id="student-id" placeholder="123456789"/>
            </div>
            {/* Force next columns to break to new line */}
            <div className="w-100"/>
            <div className="col-7 mt-5">
                <button className="btn btn-primary btn-block" 
                    onClick={() => handleLinkParent(parentUid, document.getElementById("student-id").value, setActionResult, setPageState)}>
                        Confirm
                </button>
            </div>
        </>
    );
}

const ParentLink = ({actionResult, setActionResult, setPageState}) => {
    const [parents, setParents] = useState([]);
    const [parentUid, setParentUid] = useState();

    useEffect(() => {
        getUsers()
        .then(users => {
            const tmpParents = [];
            users.forEach(user => {
                if (user.role === "parent") {
                    tmpParents.push(user);
                }
            });
            setParents(tmpParents);
        })
        .catch(error => console.log(error));
    }, []);
    
    return (
        <>
            {pageAlert(actionResult, setActionResult)}
            <div className="container container-smaller rounded mt-5 p-2">
                <div className="row">
                    <div className="col">
                        <h2>Link Student to Parent</h2>
                    </div>
                </div>
            </div>
            <div className="container container-smaller rounded mt-4 p-2">
                <div className="row justify-content-center">
                    <div className="col">
                        <h5>Enter Details</h5>
                    </div>
                </div>
                <div className="row mb-2 justify-content-center text-left">
                    <div className="col mt-3">
                        <label htmlFor="user-role">Parent</label>
                        <select className="form-control" id="parent" value={parentUid} onChange={e => setParentUid(e.target.value)}>
                            <option hidden value="">Select Parent</option>
                            {parents.map(parent => {
                                return <option key={parent.uid} value={parent.uid}>{parent.email}</option>
                            })}
                        </select>
                    </div>
                {displayParentFields(parentUid, setActionResult, setPageState)}
                    {/* Force next columns to break to new line */}
                    <div className="w-100"></div>
                    <div className="col-7 mt-3">
                        <button className="btn btn-primary btn-block" onClick={() => setPageState(0)}>Cancel</button>
                    </div>
                </div>
            </div>
        </>
    );
}

const unpackUsers = async (setUserToDelete) => {
    let userRows = await getUsers()
    .then(users => {
        if (!users) {
            return [];
        }
        return users.map((user, index) => {
            return (
                <tr key={index}>
                    <td><span>{user.email}</span></td>
                    <td><span className="capitalise">{user ? user.displayName || "*Not set*" : ""}</span></td>
                    <td><span className="capitalise">{user.role}</span></td>
                    <td>
                        <button type="button" className="btn btn-sm btn-danger" data-toggle="modal" data-target="#confirmationModal"
                            onClick={() => setUserToDelete(user)}>
                            Delete User
                        </button>
                    </td>
                </tr>
            );
        });
    });
    return userRows;
}

export default UserManagement;