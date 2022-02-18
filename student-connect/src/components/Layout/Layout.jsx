import './Layout.css';
import React, { useEffect, useState } from 'react';
import { Link, Redirect, useLocation } from 'react-router-dom';
import firebase from "firebase/app";

// Making NavLink a component allows us to display the active page's link differently to the other ones
const NavLink = (text, href, activePage) => {    
    if (href.includes(activePage)) {
        return (
            <li className="nav-item active" key={href}>
                <Link to={href} className="nav-link">{text}<span className="sr-only">(current)</span></Link>
            </li>
        );
    } else {
        return (
            <li className="nav-item" key={href}>
                <Link to={href} className="nav-link">{text}</Link>
            </li>
        );
    }
}

const Navbar = (role) => {
    // Tracking if the url changes for updating the Navbar links and active page
    const location = useLocation();

    const [redirect, setRedirect] = useState();
    const [activePage, setActivePage] = useState();
    let navbarLinks;

    switch (role) {
        case "teacher":
            navbarLinks = [
                NavLink("Dashboard", "/teacher/dashboard", activePage),
                NavLink("Daily Progress Management", "/teacher/daily-progress-management", activePage),
                NavLink("Survey Management", "/teacher/survey-management", activePage),
                NavLink("Update Student Performance", "/teacher/performance/update", activePage)
            ];
            break;

        case "student":
            navbarLinks = [
                NavLink("Dashboard", "/student/dashboard", activePage),
                NavLink("Task Centre", "/student/task-centre", activePage),
                NavLink("Survey Centre", "/student/survey-centre", activePage)
            ];
            break;

        case "councillor":
            navbarLinks = [
                NavLink("Dashboard", "/councillor/dashboard", activePage),
                NavLink("Survey Management", "/councillor/survey-management", activePage)
            ];
            break;

        case "staff":
            navbarLinks = [
                NavLink("Dashboard", "/staff/dashboard", activePage)
            ];
            break;

        case "parent":
            navbarLinks = [
                NavLink("Dashboard", "/parent/dashboard", activePage)
            ];
            break;

        case "admin":
            navbarLinks = [
                NavLink("Dashboard", "/admin/dashboard", activePage),
                NavLink("User Management", "/admin/user-management", activePage),
                NavLink("Class Management", "/admin/class-management", activePage)
            ];
            break;

        // User not logged in
        case "none":
            navbarLinks = [
                NavLink("Login", "/login", activePage),
            ];
            break;

        // Page loading
        default:
            navbarLinks = [];
            break;
    }

    useEffect(() => {
        let pathParts = (window.location.pathname.split("/"));
        //setActivePage(pathParts[pathParts.length - 1]);
        setActivePage(pathParts[2] || pathParts[1]);
        // Making the Navbar rerender when a page change happens
    }, [location]);
    
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <Link to="/" className="navbar-brand">
                Student Connect
            </Link>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav mr-auto">
                    {navbarLinks}
                </ul>
                <ul className="navbar-nav ml-auto">
                    {/*NavLink("Chat Room", "/chat", activePage)*/}
                    {/* To give the "Chatroom" link some space away from "Logout" button */}
                    <li><span>&nbsp;&nbsp;&nbsp;&nbsp;</span></li>
                    <button className="btn btn-primary" onClick={() => signOut(setRedirect)}>Logout</button>
                </ul>
            </div>
            {redirect}
        </nav>
    );
}

const signOut = (setRedirect) => {
    firebase.auth().signOut()
    .then(() => {
        // Sign-out successful in this block
        setRedirect(<Redirect to="/login"/>);
    })
    .catch((error) => console.log(error));
  }

const Layout = ({children, role}) => {
    return(
        <>
            {Navbar(role)}

            {/* children contains any element that this component "wraps" 
                aka the "App" component and all subchildren */}
            {children}
        </>
    );
}

export default Layout;