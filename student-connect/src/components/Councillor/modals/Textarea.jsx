import React from 'react';

class TextareaModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            label: '',
        };
    }

    render() {
        return (
            <>
                
                <div className="modal fade" id={this.props.id} tabIndex="-1" aria-labelledby="textareaModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-body">
                            <label htmlFor="textarea-label" className="form-label">Question label</label>
                            <input value={this.state.label} onChange={e => this.setState({'label': e.target.value})} className="form-control" id="textarea-label" />
                            <br />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="submit" onClick={() => {
                                if (this.state.label === '') {
                                    return;
                                }
                                this.props.addTextarea({
                                    label: this.state.label,
                                    type: 'textarea',
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

export default TextareaModal;