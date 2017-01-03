import {
    fetchAuth,
    getAPIBaseURL,
} from 'Utils'

import classNames from 'classnames'

var ComptesDedies = React.createClass({
    getInitialState() {
        return {
            active: this.props.initActive,
            balanceBillet: '',
            currencyBillet: '',
            balanceNumerique: '',
            currencyNumerique: '',
        }
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps) {
            this.setState({active: nextProps.initActive,
                           balanceBillet: nextProps.data.compte_dedie_eusko_billet.balance,
                           currencyBillet: nextProps.data.compte_dedie_eusko_billet.currency,
                           balanceNumerique: nextProps.data.compte_dedie_eusko_numerique.balance,
                           currencyNumerique: nextProps.data.compte_dedie_eusko_numerique.currency})
        }
    },

    render() {
        var activeOrNot = classNames({
            'row margin-top': true,
            'hidden': !this.state.active,
        })

        return (
            <div className={activeOrNot}>
                <div className="col-md-offset-1 col-md-10">
                    <div className="panel panel-info">
                        <div className="panel-heading">
                            <h3 className="panel-title">{__("Compte dédié billet")}</h3>
                        </div>
                        <div className="panel-body">
                            <div className="row">
                                <div className="col-md-8 col-sm-4">
                                    <label className="control-label col-md-3">{__("Solde")} :</label>&nbsp;
                                    <span className="col-md-5">{this.state.balanceBillet + " " + this.state.currencyBillet}</span>
                                </div>
                                <div className="col-md-4">
                                    <a href="/comptes/history/billets" className="btn btn-default">{__("Historique")}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-offset-1 col-md-10">
                    <div className="panel panel-info">
                        <div className="panel-heading">
                            <h3 className="panel-title">{__("Compte dédié numérique")}</h3>
                        </div>
                        <div className="panel-body">
                             <div className="row">
                                <div className="col-md-8 col-sm-4">
                                    <label className="control-label col-md-3">{__("Solde")} :</label>&nbsp;
                                    <span className="col-md-5">{this.state.balanceNumerique + " " + this.state.currencyNumerique}</span>
                                </div>
                                <div className="col-md-4">
                                    <a href="/comptes/history/numerique" className="btn btn-default">{__("Historique")}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})

module.exports = {
    ComptesDedies: ComptesDedies,
}