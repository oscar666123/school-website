import { Link, useHistory } from "react-router-dom"
import React, { useState, useEffect } from "react";
import { getSurveys, answerSurvey } from "components/DB";

const handleAnswerSurvey = async (surveyKey, uid, history) => {
    let responses = [];
    document.getElementById("survey-form").childNodes.forEach(e => {
        if (e.className.includes("input-type")) {
            e.childNodes.forEach(childNode => {
                if (childNode.nodeName.toLowerCase() === "input") {
                    responses.push(childNode.value);
                }
            });
        } else if (e.className.includes("textarea-type")) {
            e.childNodes.forEach(childNode => {
                if (childNode.nodeName.toLowerCase() === "textarea") {
                    responses.push(childNode.value);
                }
            });
        } else if (e.className.includes("radio-type")) {
            let nodeId = "-nodeResponseNone";
            e.childNodes.forEach(divNodes => {
                divNodes.childNodes.forEach(divChildNode => {
                    if (divChildNode.nodeName.toLowerCase() === "input" && divChildNode.checked) {
                        nodeId = divChildNode.id;
                    }
                });
            });
            responses.push(nodeId);
        } else if (e.className.includes("checkbox-type")) {
            let tmpResponses = [];
            e.childNodes.forEach(divNodes => {
                divNodes.childNodes.forEach(divChildNode => {
                    if (divChildNode.nodeName.toLowerCase() === "input") {
                        tmpResponses.push(divChildNode.checked ? "1" : "0");
                    }
                });
            });
            responses.push(tmpResponses);
        } else if (e.className.includes("dropdown-type")) {
            e.childNodes.forEach(childNode => {
                if (childNode.nodeName.toLowerCase() === "select") {
                    responses.push(childNode.value);
                }
            });
        }
    });

    answerSurvey(surveyKey, uid, responses)
    .then(response => {
        if (response === "success") {
            history.push("/student/survey-centre");
        }
    })
    .catch(e => console.log(e));
}

const AnswerSurvey = (user) => {
    const [survey, setSurvey] = useState();
    const [responses, setResponses] = useState();
    const history = useHistory();

    useEffect(() => {
        getSurveys().then(surveys => {
            surveys.forEach(surv => {
                const pathParts = (window.location.pathname.split("/"));
                if (surv.key === pathParts[pathParts.length - 1]) {
                    if (surv.allResponses && surv.allResponses[user.uid]) {
                        setResponses(surv.allResponses[user.uid].responses);
                    }
                    setSurvey(surv);
                }
            });
        })
        .catch(e => console.log(e));
    }, [user.uid]);

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
            <div className="container text-left rounded mt-4 p-2">
                <div className="row justify-content-center" >
                    <div className="col pt-4 md-4" style={{maxWidth:"600px"}}>
                        <form id="survey-form">
                            {
                                survey.questions.map((e, indexmain) => {
                                    switch(e.type) {
                                        case 'input':
                                            return (
                                                <div key={indexmain} className="mb-4 input-type">
                                                    <label htmlFor="exampleFormControlInput1" className="form-label">{e.label}</label>
                                                    <input type="email" className="form-control" id="exampleFormControlInput1" defaultValue={responses ? responses[indexmain] : ""} />
                                                </div>
                                            )
                                        case 'textarea':
                                            return (
                                                <div key={indexmain} className="mb-4 textarea-type">
                                                    <label htmlFor="exampleFormControlInput1" className="form-label">{e.label}</label>
                                                    <textarea type="email" className="form-control" id="exampleFormControlInput1" rows="3" defaultValue={responses ? responses[indexmain] : ""}/>
                                                </div>

                                            )
                                        case 'radio':
                                            return (
                                                <div key={indexmain} className="mb-4 radio-type">
                                                    <label htmlFor="exampleFormControlInput1" className="form-label">{e.label}</label>
                                                    {
                                                        e.options.map((i, index) => (
                                                            <div key={index} className="custom-control custom-radio">
                                                                <input type="radio" id={"radio" + String(index)} name="customRadio" className="custom-control-input" 
                                                                    defaultChecked={responses && responses[indexmain] === "radio"+String(index) ? 1 : 0}/>
                                                                <label className="custom-control-label" htmlFor={"radio" + String(index)}>{i.value}</label>
                                                            </div>
                                                        ))
                                                    }
                                                </div>

                                            )
                                        case 'checkbox':
                                            return (
                                                <div key={indexmain} className="mb-4 checkbox-type">
                                                    <label htmlFor="exampleFormControlInput1" className="form-label">{e.label}</label>
                                                    {
                                                        e.options.map((i, index) => (
                                                            <div key={index} className="custom-control custom-checkbox">
                                                                <input type="checkbox" id={"checkbox" + String(index)} name="customCheckbox" className="custom-control-input"
                                                                    defaultChecked={responses && responses[indexmain][index] === "1" ? 1 : 0} />
                                                                <label className="custom-control-label" htmlFor={"checkbox" + String(index)}>{i.value}</label>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            )
                                        case 'dropdown':
                                            return (
                                                <div key={indexmain} className="mb-4 dropdown-type">
                                                    <label htmlFor="exampleFormControlInput1" className="form-label">{e.label}</label>
                                                    <select className="form-control" defaultValue={responses ? responses[indexmain] : "-nodeResponseNone"}>
                                                        <option hidden value="-nodeResponseNone">Select response</option>
                                                        {e.options.map((i, index) => (
                                                            <option key={index}>{i.value}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                            )
                                        default:
                                            return <></>;
                                    }
                                })
                            }
                            <button type="button" className="btn btn-primary mb-1" onClick={() => handleAnswerSurvey(survey.key, user.uid, history)}>Submit</button>
                            <Link to="/student/survey-centre">
                                <button type="button" className="btn btn-secondary mb-1 ml-3">Cancel</button>
                            </Link>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AnswerSurvey;