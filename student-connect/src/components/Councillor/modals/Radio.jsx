import React from 'react';

class RadioModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            value: '', 
            label: '',
            options: []
        };
    }

    render() {
        return (
            <>
                
                <div className="modal fade" id={this.props.id} tabIndex="-1" aria-labelledby="RadioModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-body">
                            <label htmlFor="radio-label1" className="form-label">Question label</label>
                            <input value={this.state.label} onChange={e => this.setState({'label': e.target.value})} className="form-control" id="radio-label1" placeholder="" />
                            <br />
                            <label htmlFor="radio-label2" className="form-label">Radiobutton option</label>
                            <input value={this.state.value} onChange={e => this.setState({'value': e.target.value})} className="form-control" id="radio-label2" placeholder="" />
                            <button type="button" className="btn mt-2 btn-primary" onClick={() => {
                                if (this.state.value === '') {
                                    return;
                                }
                                this.setState({
                                    options:[
                                        ...this.state.options,
                                        {
                                            value: this.state.value
                                        }
                                    ],
                                    value: ''
                                })
                            }}>Add</button>
                            <br />

                            {
                                this.state.options.length > 0 ?
                                <div className="mt-3">
                                {
                                    this.state.options.map((i, index) => (
                                        <div key={index} className="custom-control custom-radio">
                                            <input type="radio" id="customRadio1" name="customRadio" className="custom-control-input" />
                                            <label className="custom-control-label" htmlFor="customRadio1">{i.value}</label>
                                        </div>
                                    ))
                                }
                                </div>
                                
                                : <h5 style={{
                                    marginTop: "20px",
                                    color: "#00000040",
                                    textAlign: "center"
                                }}>Add Values</h5>
                            }
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="submit" onClick={() => {
                                if (this.state.label === '' || this.state.options.length < 1) {
                                    this.setState({
                                        label: '',
                                        value: '',
                                        options: []
                                    });
                                    return;
                                }
                                this.props.addRadio({
                                    label: this.state.label,
                                    type: 'radio',
                                    options: this.state.options
                                })
                                this.setState({
                                    label: '',
                                    value: '',
                                    options: []   
                                })
                            }} data-dismiss="modal" className="btn btn-primary">Add</button>
                        </div>
                    </div>
                </div>
                </div>

            </>
        );
    }
}

export default RadioModal;