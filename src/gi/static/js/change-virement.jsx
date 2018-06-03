import {
    fetchAuth,
    getAPIBaseURL,
    NavbarTitle,
} from 'Utils'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

var {ToastContainer} = ReactToastr; // This is a React Element.
var ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation);

class ChangeVirementPage extends React.Component {

    constructor(props) {
        super(props)

        // Default state
        this.state = {
        }
    }

    render = () => {
        return (
            <div className="row">
            </div>
        )
    }
}


ReactDOM.render(
    <ChangeVirementPage />,
    document.getElementById('change-virement')
)

ReactDOM.render(
    <NavbarTitle title={__("Change par virement")} />,
    document.getElementById('navbar-title')
)
