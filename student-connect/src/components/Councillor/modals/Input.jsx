import React from 'react';

class InputModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            label: '',
        };
    }

    render() {
        return (
            <>
                <div className="modal fade" id={this.props.id} tabIndex="-1" aria-labelledby="inputModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-body">
                            <label htmlFor="input-label" className="form-label">Question label</label>
                            <input value={this.state.label} onChange={e => this.setState({'label': e.target.value})} className="form-control" id="input-label" placeholder="" />
                            <br />
                        </div>
                        <div className="modal-footer">
                            <button type="button" onClick={this.clear} className="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="submit" onClick={() => {
                                if (this.state.label === '') {
                                    return;
                                }
                                this.props.addInput({
                                    label: this.state.label,
                                    type: 'input'
                                })
                                this.setState({
                                    label: '',
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

export default InputModal;