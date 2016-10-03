import {
    fetchAuth,
    getAPIBaseURL,
    NavbarTitle,
} from 'Utils'

class CoffrePage extends React.Component {
    constructor(props) {
        super(props)

        // Default state
        this.state = {
        }

    }

    render() {
        return (
            <div className="col-md-10">
                <Coffre />
                <CompteDeTransit />
            </div>
        )
    }
}

var Coffre = React.createClass({
    render() {
        return (
            <div className="panel panel-info">
                <div className="panel-heading">
                    <h3 className="panel-title">{__("Coffre")}</h3>
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-md-offset-1 col-md-2">
                            <a href="/coffre/history" className="btn btn-default">{__("Historique")}</a>
                        </div>
                        <div className="col-md-offset-1 col-md-2 col-sm-4">
                            <a href="/coffre/entree" className="btn btn-info">{__("Entrée")}</a>
                        </div>
                        <div className="col-md-offset-1 col-md-2 col-sm-4">
                            <a href="/coffre/sortie" className="btn btn-default">{__("Sortie")}</a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})

var CompteDeTransit = React.createClass({
    render() {
        return (
            <div className="panel panel-info">
                <div className="panel-heading">
                    <h3 className="panel-title">{__("Compte de transit")}</h3>
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-md-offset-1 col-md-4 col-sm-4">
                            <a href="/comptedetransit/history" className="btn btn-default">{__("Historique")}</a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})

ReactDOM.render(
    <CoffrePage />,
    document.getElementById('coffre')
)

ReactDOM.render(
    <NavbarTitle title={__("Coffre")} />,
    document.getElementById('navbar-title')
)