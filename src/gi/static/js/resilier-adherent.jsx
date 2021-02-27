import {
    fetchAuth,
    getAPIBaseURL,
    NavbarTitle,
} from 'Utils'

const {
    Input,
    Row
} = FRC

const {
    ToastContainer
} = ReactToastr
const ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation)

class ResilierAdherentPage extends React.Component {

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
    <ResilierAdherentPage />,
    document.getElementById('resilier-adherent')
)

ReactDOM.render(
    <NavbarTitle title={__("Résilier un.e adhérent.e")} />,
    document.getElementById('navbar-title')
)
