import React from 'react';

class CheckboxModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            options: [],
            value: '',
            label: ''
        };
    }

    render() {
        return (
            <>
                
                <div className="modal fade" id={this.props.id} tabIndex="-1" aria-labelledby="CheckboxModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-body">
                            <label htmlFor="checkbox-label1" className="form-label">Question label</label>
                            <input value={this.state.label} onChange={e => this.setState({'label': e.target.value})} className="form-control" id="checkbox-label1" />
                            <br />
                            <label htmlFor="checkbox-label2" className="form-label">Checkbox option</label>
                            <input value={this.state.value} onChange={e => this.setState({'value': e.target.value})} className="form-control" id="checkbox-label2" />
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
                                        <div key={index} className="custom-control custom-checkbox">
                                            <input type="checkbox" id="customCheckbox1" name="customCheckbox" className="custom-control-input" />
                                            <label className="custom-control-label" htmlFor="customCheckbox1">{i.value}</label>
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
                                this.props.addCheckbox({
                                    label: this.state.label,
                                    type: 'checkbox',
                                    options: this.state.options
                                })
                                this.setState({
                                    label: '',
                                    value: '',
                                    options: []   
                                });
                            }} data-dismiss="modal" className="btn btn-primary">Add</button>
                        </div>
                    </div>
                </div>
                </div>

            </>
        );
    }
}

export default CheckboxModal;