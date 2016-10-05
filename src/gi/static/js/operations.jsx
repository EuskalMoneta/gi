import {
    fetchAuth,
    getAPIBaseURL,
    NavbarTitle,
} from 'Utils'

class OperationsPage extends React.Component {
    constructor(props) {
        super(props)

        // Default state
        this.state = {
        }
    }

    render() {
        return (
            <div className="col-md-10">
                <Operations />
            </div>
        )
    }
}

var Operations = React.createClass({
    render() {
        return (
            <div className="panel panel-info">
                <div className="panel-heading">
                    <h3 className="panel-title">{__("Opérations à traiter")}</h3>
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-md-offset-1 col-md-5">
                            <a href="/operations/entrees-euro" className="btn btn-default">{__("Entrées dans la Caisse € d'E.M.")}</a>
                        </div>
                        <div className="col-md-5">
                            <a href="/operations/entrees-eusko" className="btn btn-info">{__("Entrées dans la Caisse Eusko d'E.M.")}</a>
                        </div>
                    </div>
                    <div className="row margin-top">
                        <div className="col-md-offset-1 col-md-5">
                            <a href="/operations/reconversions" className="btn btn-default">{__("Reconversions")}</a>
                        </div>
                        <div className="col-md-4">
                            <a href="/operations/depots-retraits" className="btn btn-default">{__("Dépôts et retraits")}</a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})


ReactDOM.render(
    <OperationsPage />,
    document.getElementById('operations')
)

ReactDOM.render(
    <NavbarTitle title={__("Opérations à traiter")} />,
    document.getElementById('navbar-title')
)