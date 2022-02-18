import { Link } from 'react-router-dom';

const ErrorPage = ({errorCode, errorMessage}) => {
    return (
        <>
        <div className="container rounded mt-5 p-2">
            <div className="row">
                <div className="col">
                    <h1>{errorCode}!</h1>
                </div>
            </div>
        </div>
        <div className="container rounded mt-4 p-3">
            <div className="row mb-3">
                <div className="col">
                    {errorMessage}<br/>
                    Please click the button below to go home.
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <Link to="/" className="btn btn-primary">
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
        </>
    );
}
  
  export default ErrorPage;