import React from 'react';

class DropboxModal extends React.Component {

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
                
                <div className="modal fade" id={this.props.id} tabIndex="-1" aria-labelledby="DropboxModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-body">
                            <label htmlFor="dropdown-label1" className="form-label">Question label</label>
                            <input value={this.state.label} onChange={e => this.setState({'label': e.target.value})} className="form-control" id="dropdown-label1" placeholder="" />
                            <br />
                            <label htmlFor="dropdown-label2" className="form-label">Dropdown option</label>
                            <input value={this.state.value} onChange={e => this.setState({'value': e.target.value})} className="form-control" id="dropdown-label2" placeholder="" />
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
                                <ul className="mt-3 list-group-flush">
                                {
                                    this.state.options.map((i, index) => (
                                        <li key={index} className="list-group-item">{i.value}</li>
                                    ))
                                }
                                </ul>
                                
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
                                this.props.addDropdown({
                                    label: this.state.label,
                                    type: 'dropdown',
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

export default DropboxModal;