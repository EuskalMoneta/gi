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
            <div className="col-md-10">
            <div className="panel panel-info">
                <div className="panel-heading">
                    <h3 className="panel-title">{__("Entrées caisses")}</h3>
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-md-6">
                            <a href="/operations/entrees-euro" className="btn btn-default">{__("Entrées dans la Caisse € d'E.M.")}</a>
                        </div>
                        <div className="col-md-6">
                            <a href="/operations/entrees-eusko" className="btn btn-default">{__("Entrées dans la Caisse Eusko d'E.M.")}</a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="panel panel-info">
                <div className="panel-heading">
                    <h3 className="panel-title">{__("Virements à partir des comptes dédiés")}</h3>
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-md-6">
                            <a href="/operations/reconversions" className="btn btn-default">{__("Reconversions")}</a>
                        </div>
                        <div className="col-md-6">
                            <a href="/operations/depots-retraits" className="btn btn-default">{__("Dépôts et retraits")}</a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="panel panel-info">
                <div className="panel-heading">
                    <h3 className="panel-title">{__("Changes d'eusko numériques")}</h3>
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-md-6">
                            <a href="/operations/changes-prelevement" className="btn btn-default">{__("Changes par prélèvement automatique")}</a>
                        </div>
                        <div className="col-md-6">
                            <a href="/operations/change-virement" className="btn btn-default">{__("Change par virement")}</a>
                            <br/>
                            <br/>
                            <a href="/operations/change-virement-multiple" className="btn btn-default">{__("Change par virement multiple")}</a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="panel panel-info">
                <div className="panel-heading">
                    <h3 className="panel-title">{__("Adhérents")}</h3>
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-md-6">
                            <a href="/operations/resilier-adherent" className="btn btn-default">{__("Résilier un.e adhérent.e")}</a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="panel panel-info">
                <div className="panel-heading">
                    <h3 className="panel-title">{__("Dons 3% aux associations")}</h3>
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-md-6">
                            <a href="/operations/dons-3-pourcent" className="btn btn-default">{__("Calcul des montants")}</a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="panel panel-info">
                <div className="panel-heading">
                    <h3 className="panel-title">{__("Comptabilité")}</h3>
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-md-6">
                            <a href="/operations/export-vers-odoo/" className="btn btn-default">{__("Export vers Odoo")}</a>
                        </div>
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
