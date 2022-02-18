import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSurveys } from "components/DB";


const SurveyViewCouncillor = () => {
    const [survey, setSurvey] = useState();
    const [responders, setResponders] = useState([]);
    const [responses, setResponses] = useState();

    useEffect(() => {
        getSurveys().then(surveys => {
            surveys.forEach(surv => {
                const pathParts = (window.location.pathname.split("/"));
                if (surv.key === pathParts[pathParts.length - 1]) {
                    setSurvey(surv);
                    if (surv.allResponses) {
                        setResponders(Object.values(surv.allResponses));
                    }
                }
            });
        })
        .catch(e => console.log(e));
    }, []);

    if (!survey) {
        return <></>;
    }
    return (
        <>
            <div className="container rounded mt-5 p-2">
                <div className="row">
                    <div className="col">
                        <h2>{survey.title}</h2>
                    </div>
                </div>
            </div>
            <div className="container text-left rounded mt-4 mb-4 py-2">
                <div className="row justify-content-center border-bottom">
                    <div className="col mt-2 mb-4" style={{maxWidth: "600px"}}>
                        <label htmlFor="student-select" className="form-label">Student response</label>
                        <select disabled={responders.length < 1} id="student-select" className="form-control"
                            onChange={e => setResponses(survey.allResponses[e.target.value].responses)}>
                            {responders.length > 0 ?
                            <option hidden value="-nodeResponseNone">Select student response</option>
                            :
                            <option hidden value="-nodeResponseNone">No responses yet</option>
                            }
                            {
                                responders.map((user, index) => (
                                    <option key={user.uid} value={user.uid}>{user.name}</option>
                                ))
                            }
                        </select>
                    </div>
                </div>
                <div className="row mb-2 justify-content-center" >
                    <div className="col pt-4 md-4" style={{maxWidth: "600px"}}>
                        <form>
                            {
                                survey.questions.map((e, indexmain) => {
                                    switch(e.type) {
                                        case 'input':
                                            return (
                                                <div key={indexmain} className="mb-4">
                                                    <label htmlFor="exampleFormControlInput1" className="form-label">{e.label}</label>
                                                    <input type="email" className="form-control" id="exampleFormControlInput1" 
                                                        value={responses && responses.length > 0 ? responses[indexmain] : ""} onChange={() => {return;}} />
                                                </div>
                                            )
                                        case 'textarea':
                                            return (
                                                <div key={indexmain} className="mb-4">
                                                    <label htmlFor="exampleFormControlTextarea1" className="form-label">{e.label}</label>
                                                    <textarea type="email" className="form-control" id="exampleFormControlTextarea1" rows="3"
                                                        value={responses && responses.length > 0 ? responses[indexmain] : ""} onChange={() => {return;}}/>
                                                </div>

                                            )
                                        case 'radio':
                                            return (
                                                <div key={indexmain} className="mb-4">
                                                    <label htmlFor="exampleFormControlInput1" className="form-label">{e.label}</label>
                                                    {
                                                        e.options.map((i, index) => (
                                                            <div key={index} className="custom-control custom-radio">
                                                                <input type="radio" id={"radio" + String(index)} name="customRadio" className="custom-control-input"
                                                                    checked={responses && responses.length > 0 && responses[indexmain] === "radio"+String(index) ? 1 : 0} onChange={() => {return;}} />
                                                                <label className="custom-control-label" htmlFor={"radio" + String(index)}>{i.value}</label>
                                                            </div>
                                                        ))
                                                    }
                                                </div>

                                            )
                                        case 'checkbox':
                                            return (
                                                <div key={indexmain} className="mb-4">
                                                    <label htmlFor="exampleFormControlInput1" className="form-label">{e.label}</label>
                                                    {
                                                        e.options.map((i, index) => (
                                                            <div key={index} className="custom-control custom-checkbox">
                                                                <input type="checkbox" id={"checkbox" + String(index)} name="customCheckbox" className="custom-control-input"
                                                                    checked={responses && responses[indexmain][index] === "1" ? 1 : 0} onChange={() => {return;}} />
                                                                <label className="custom-control-label" htmlFor={"checkbox" + String(index)}>{i.value}</label>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            )
                                        case 'dropdown':
                                            return (
                                                <div key={indexmain} className="mb-4">
                                                    <label htmlFor="exampleFormControlInput1" className="form-label">{e.label}</label>
                                                    <select className="form-control" value={responses ? responses[indexmain] : "-nodeResponseNone"} onChange={() => {return;}}>
                                                        <option hidden value="-nodeResponseNone">Select response</option>
                                                        {
                                                            e.options.map((i, index) => (
                                                                <option key={index}>{i.value}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>

                                            )
                                        default:
                                            return <></>;
                                    }
                                })
                            }
                            <button type="button" className="btn btn-primary mb-1">Submit</button>
                            <Link to="/councillor/survey-management">
                                <button type="button" className="btn btn-secondary mb-1 ml-3">Cancel</button>
                            </Link>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SurveyViewCouncillor;