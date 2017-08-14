import {
    fetchAuth,
    getAPIBaseURL,
    NavbarTitle,
} from 'Utils'

class Dons3PourcentPage extends React.Component {
    constructor(props) {
        super(props)

        // Default state
        this.state = {
        }
    }

    render = () => {
        return (
            <div>
            </div>
        )
    }
}


ReactDOM.render(
    <Dons3PourcentPage />,
    document.getElementById('dons-3-pourcent')
)

ReactDOM.render(
    <NavbarTitle title={__("Dons 3%")} />,
    document.getElementById('navbar-title')
)
