import React from 'react';
import InputModal from './modals/Input';
import TextareaModal from './modals/Textarea';
import RadioModal from './modals/Radio';
import CheckboxModal from './modals/Checkbox';
import DropdownModal from './modals/Dropdown';
import { Link } from 'react-router-dom';
import { createSurvey } from '../DB';

class SurveyCreator extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            title: ''        
        };
    }

    render() {
        return (
            <>
                <div className="container rounded mt-5 p-2">
                    <div className="row">
                        <div className="col">
                            <h2>Create New Survey</h2>
                        </div>
                    </div>
                </div>
                <div className="container rounded mt-4 p-2">
                    <div className="row d-flex justify-content-center">
                        <input style={{maxWidth: "600px"}} className="form-control" onChange={e => this.setState({'title': e.target.value})}  id="formname" placeholder="Survey Name" />
                        <Link
                            className="btn btn-primary ml-3"
                            to="/teacher/survey-management"
                            onClick = {() => {
                                if (!this.state.title || this.state.data.length < 1) {
                                    return;
                                }
                                let newSurvey = {
                                    'title': this.state.title,
                                    'creator': {uid: this.props.uid, name: this.props.displayName},
                                    'created-on': Date.now(),
                                    'students': [],
                                    'questions': this.state.data
                                }
                                createSurvey(newSurvey).then(result => {
                                    if (result !== "success") {
                                        console.error(result)
                                    }
                                });
                            }}
                        >Create</Link>
                        <button onClick={() => {
                            this.setState({
                                data: []
                            })
                        }} className="btn btn-danger ml-3">Clear</button>
                    </div>
                    <div className="row mt-3 mr-0">
                        <div className="col-2 pr-0">
                            <ul className="list-group">
                                <li className="list-group-item">
                                    <button 
                                        type="button" 
                                        data-toggle="modal" 
                                        data-target="#inputModal" 
                                        className="btn"
                                    >Input</button>
                                </li>
                                <li className="list-group-item">
                                    <button type="button" 
                                        data-toggle="modal" 
                                        data-target="#textareaModal" 
                                        className="btn"
                                    >Textarea</button>
                                </li>
                                <li className="list-group-item">
                                    <button type="button" 
                                        data-toggle="modal" 
                                        data-target="#radioModal" 
                                        className="btn"
                                    >Radio Buttons</button>
                                </li>
                                <li className="list-group-item">
                                    <button type="button" 
                                        data-toggle="modal" 
                                        data-target="#checkboxModal" 
                                        className="btn"
                                    >Checkboxes</button>
                                </li>
                                <li className="list-group-item">
                                    <button type="button" 
                                        data-toggle="modal" 
                                        data-target="#dropdownModal" 
                                        className="btn"
                                    >Dropdowns</button>
                                </li>
                            </ul>
                        </div>
                        <div className="col-10 d-flex justify-content-center text-left" style={{backgroundColor:'#efefef'}}>
                            <div className="col-md-7 mt-3 mb-10">
                            {
                                this.state.data.length === 0 ?
                                <h5 style={{
                                    marginTop: "20px",
                                    color: "#00000040",
                                    textAlign: "center"
                                }}>Start creating a form by selecting from various elements in the side panel</h5> :
                                this.state.data.map((e, index) => {
                                    switch(e.type) {
                                        case 'input':
                                            return (
                                                <div key={index} className="mb-3">
                                                    <label htmlFor="exampleFormControlInput1" className="form-label">{e.label}</label>
                                                    <input type="email" className="form-control" id="exampleFormControlInput1" placeholder={e.placeholder} />
                                                </div>
                                            )
                                        case 'textarea':
                                            return (
                                                <div key={index} className="mb-3">
                                                    <label htmlFor="exampleFormControlInput1" className="form-label">{e.label}</label>
                                                    <textarea type="email" className="form-control" id="exampleFormControlInput1" placeholder={e.placeholder} rows="3"/>
                                                </div>
                                            )
                                        case 'radio':
                                            return (
                                                <div key={index} className="mb-3">
                                                    <label htmlFor="exampleFormControlInput1" className="form-label">{e.label}</label>
                                                    {
                                                        e.options.map((i, index) => (
                                                            <div key={index} className="custom-control custom-radio">
                                                                <label className="custom-control-label" htmlFor="customRadio1">{i.value}</label>
                                                                <input type="radio" id="customRadio1" name="customRadio" className="custom-control-input" />
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            )
                                        case 'checkbox':
                                            return (
                                                <div key={index} className="mb-3">
                                                    <label htmlFor="exampleFormControlInput1" className="form-label">{e.label}</label>
                                                    {
                                                        e.options.map((i, index) => (
                                                            <div key={index} className="custom-control custom-checkbox">
                                                                <label className="custom-control-label" htmlFor="customCheckbox1">{i.value}</label>
                                                                <input type="checkbox" id="customCheckbox1" name="customCheckbox" className="custom-control-input" />
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            )
                                        case 'dropdown':
                                            return (
                                                <div key={index} className="mb-3">
                                                    <label htmlFor="exampleFormControlInput1" className="form-label">{e.label}</label>
                                                    <select className="form-control">
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
                            </div>
                        </div>
                    </div>
                </div>

                <InputModal id="inputModal" addInput={data => {
                    this.setState({
                        data:[
                            ...this.state.data,
                            data
                        ]}) 
                }}/>

                <TextareaModal id="textareaModal" addTextarea={data => {
                    this.setState({
                        data:[
                            ...this.state.data,
                            data
                        ]}) 
                }}/>

                <CheckboxModal id="checkboxModal" addCheckbox={data => {
                    this.setState({
                        data:[
                            ...this.state.data,
                            data
                        ]}) 
                }}/>

                <RadioModal id="radioModal" addRadio={data => {
                    this.setState({
                        data:[
                            ...this.state.data,
                            data
                        ]}) 
                }}/>

                <DropdownModal id="dropdownModal" addDropdown={data => {
                    this.setState({
                        data:[
                            ...this.state.data,
                            data
                        ]}) 
                }}/>

            </>
        );
    }
}

export default SurveyCreator;