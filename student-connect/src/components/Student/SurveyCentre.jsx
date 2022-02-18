import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSurveys } from '../DB';

const SurveyManagement = user => {
    const [newSurveys, setNewSurveys] = useState([]);
    const [answeredSurveys, setAnsweredSurveys] = useState([]);
    
    useEffect (() => {
        const sleep = async(ms) => {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        // Forcing the page to wait for sleepSeconds before fetching data since database may not have updated yet
        setNewSurveys([]);
        setAnsweredSurveys([]);
        const sleepMilliseconds = 250;
        sleep(sleepMilliseconds).then(() => {
            getSurveys().then(result => {
                result.forEach(survey => {
                    survey.students.forEach(student => {
                        if (student.uid === user.uid) {
                            if (student.answered) {
                                setAnsweredSurveys(oldState => [...oldState, survey]);
                            }
                            else {
                                setNewSurveys(oldState => [...oldState, survey]);
                            }
                        }
                    });
                });
            });
        });
    }, [user.uid]);
    
    const surveyDate = unix => {
        const date = new Date(unix)
        return(date.toDateString())
    }

    return (
        <>
            <div className="container rounded mt-5 p-2">
                <div className="row">
                    <div className="col">
                        <h2>Your Surveys</h2>
                    </div>
                </div>
            </div>
            <div className="container text-left rounded mt-4 p-2 ">
                <div className="row">
                    <div className="col table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                <th scope="col-2">#</th>
                                <th scope="col-6">Label</th>
                                <th scope="col-2">Created On</th>
                                <th scope="col-2">Created By</th>
                                <th scope="col-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    newSurveys.length > 0 || answeredSurveys.length > 0 ?
                                    <>
                                        {newSurveys.map((e, index) => (
                                            <tr key={index} className="clickable-row">
                                                <th scope="row">{index + 1}</th>
                                                <td> <Link to={"/student/survey-centre/answer/"+e.key}>{e.title}</Link></td>
                                                <td>{surveyDate(e['created-on'])}</td>
                                                <td>{e.creator.name}</td>
                                                <td>
                                                    <Link to={"/student/survey-centre/answer/"+e.key}><button className="btn btn-sm btn-primary">Answer Survey</button></Link>
                                                </td>
                                            </tr>
                                        ))}
                                        {answeredSurveys.map((e, index) => (
                                            <tr key={index} className="clickable-row">
                                                <th scope="row">{index + 1 + newSurveys.length}</th>
                                                <td> <Link to={"/student/survey-centre/answer/"+e.key}>{e.title}</Link></td>
                                                <td>{surveyDate(e['created-on'])}</td>
                                                <td>{e.creator.name}</td>
                                                <td>
                                                    <Link to={"/student/survey-centre/answer/"+e.key}><button className="btn btn-sm btn-secondary">Edit Response</button></Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </>
                                    :
                                    (
                                        <tr>
                                            <td style={{width: "64px"}}/>
                                            <td style={{width: "342px"}}>
                                                <h5 style={{
                                                    color: "#00000040"
                                                }}>No active surveys</h5>
                                            </td>
                                            <td style={{width: "247px"}}/><td style={{width: "220px"}}/><td style={{width: "251px"}}/>
                                        </tr>
                                    )
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );    
}

export default SurveyManagement;