import { Link } from 'react-router-dom';

const adminFunctions = [
    {name: 'User Management',
    rootURL: '/admin/user-management',
    explanation: 'Create and delete users',
    buttonText: 'Start'
    },
    {name: 'Class Management',
    rootURL: '/admin/class-management',
    explanation: 'Create and delete class profiles',
    buttonText: 'Start'
    }   
];

const AdminPortal = (user) => {
    return (
        <>
            <div className="container rounded mt-5 p-2">
                <div className="row">
                    <div className="col">
                        <h2>Admin Dashboard</h2>
                    </div>
                </div>
            </div>
            <div className="container rounded mt-4 p-2">
                <div className="row">
                    <div className="col">
                        <h5 className="capitalise">Hello{user.displayName ? " " + user.displayName : ""},</h5>
                        <span>You are logged in as user: {user.email}</span>
                    </div>
                </div>
                <br/>
                <div className="row">
                    <div className="col">
                        <div className="row">
                            {adminFunctions.map((functionality)=>(
                                <div className="col-sm-6" key={functionality.name}>
                                    <div className="card">
                                        <div className="card-body">
                                            <h5 className="card-title">{functionality.name}</h5>
                                            <p className="card-text">{functionality.explanation}</p>
                                            <Link to={functionality.rootURL} className="btn btn-primary">{functionality.buttonText}</Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AdminPortal;