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
            stockBilletsData: undefined,
            compteTransitEuroData: undefined,
        }

        // Get System Accounts Summaries
        var computeManagerData = (data) => {
            this.setState({
                stockBilletsData: _.filter(data, (item) => { return item.type.id == "stock_de_billets" })[0],
                compteTransitEuroData: _.filter(data, (item) => { return item.type.id == "compte_de_transit" })[0],
            })
        }
        fetchAuth(getAPIBaseURL + "system-accounts-summaries/", 'get', computeManagerData)
    }

    render() {
        return (
            <div className="col-md-10">
                <Coffre data={this.state.stockBilletsData} />
                <CompteDeTransit data={this.state.compteTransitEuroData} />
            </div>
        )
    }
}

var Coffre = React.createClass({
    getInitialState() {
        return {
            balance: '',
            currency: '',
        }
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps.data) {
            this.setState({balance: nextProps.data.balance,
                           currency: nextProps.data.currency})
        }
    },

    render() {
        return (
            <div className="panel panel-info">
                <div className="panel-heading">
                    <h3 className="panel-title">{__("Coffre")}</h3>
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-md-8 col-sm-4">
                            <label className="control-label col-md-3">{__("Solde")} :</label>&nbsp;
                            <span className="col-md-5">{this.state.balance + " " + this.state.currency}</span>
                        </div>
                        <div className="col-md-4">
                            <a href="/coffre/history" className="btn btn-default">{__("Historique")}</a>
                        </div>
                    </div>
                    <div className="row margin-top">
                        <div className="col-md-offset-2 col-md-2 col-sm-4">
                            <a href="/coffre/entree" className="btn btn-info">{__("Entrée")}</a>
                        </div>
                        <div className="col-md-offset-2 col-md-2 col-sm-4">
                            <a href="/coffre/sortie" className="btn btn-default">{__("Sortie")}</a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})

var CompteDeTransit = React.createClass({
    getInitialState() {
        return {
            balance: '',
            currency: '',
        }
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps.data) {
            this.setState({balance: nextProps.data.balance,
                           currency: nextProps.data.currency})
        }
    },

    render() {
        return (
            <div className="panel panel-info">
                <div className="panel-heading">
                    <h3 className="panel-title">{__("Compte de transit")}</h3>
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-md-8 col-sm-4">
                            <label className="control-label col-md-3">{__("Solde")} :</label>&nbsp;
                            <span className="col-md-5">{this.state.balance + " " + this.state.currency}</span>
                        </div>
                        <div className="col-md-4">
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