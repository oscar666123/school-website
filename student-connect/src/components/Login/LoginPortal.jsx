import React, { useState } from 'react';
import firebase from "firebase/app";
import "firebase/auth";
import './LoginPortal.css';

const HandleLogin = (setLoading) => {
    if (!document.getElementById("login-email")) {
        return;
    }

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    
    if (email === "" || password === "") {
        alert("Input fields cannot be empty");
        return;
    }
    const emailRegex = "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$";
    const emailPass = email.match(emailRegex);

    if (!emailPass) {
        alert("Email does not match the required format (user@site.com)");
        return;
    }
    setLoading(true);
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
        })
        .catch((error) => {
            let errorCode = error.code;
            let errorMessage = error.message;
            setLoading(false);
            alert(errorCode, "\n", errorMessage);
        });
    }

const LoginPortal = ({projectName}) => {
    const [loading, setLoading] = useState(false);
    if (loading) {
        return (
            <>
                <div className="main2">
                    <h5 className="projectName" align="center">Logging in...</h5>
                </div>
            </>
        );
    }
    return (
        <>
            <div className="main3">
                <p className="projectName" align="center">{projectName}</p>
            </div>
            <div className="main">
                <p className="login" align="center">Login</p>
                <form className="form1">
                    <input type="email" className="form-control-email" id="login-email" placeholder="Email" onKeyPress={e => {
                        if (e.key === "Enter") {
                            document.getElementById("login-password").focus();
                        }
                    }}/>
                    <input type="password" className="form-control-pass" id="login-password" placeholder="Password" onKeyPress={e => {
                            if (e.key === "Enter") {
                                if (document.getElementById("login-email").value && document.getElementById("login-password").value) {
                                    HandleLogin(setLoading);
                                } else {
                                    document.getElementById("login-email").focus();
                                }
                            }
                        }}/>
                    <button type="button" className="submit" onClick={() => HandleLogin(setLoading)}>
                            Login
                    </button>
                </form>
                    
                        
            </div>
        </>
    );
}
  
export default LoginPortal;