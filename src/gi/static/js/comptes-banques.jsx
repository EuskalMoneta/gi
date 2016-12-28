import {
    fetchAuth,
    getAPIBaseURL,
} from 'Utils'

import classNames from 'classnames'

var ComptesBanquesDepot = React.createClass({
    getInitialState() {
        return {
            active: this.props.initActive,
            depositBankList: Array(),
        }
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps) {
            this.setState({active: nextProps.initActive})
        }
    },

    componentDidMount() {
        // Get depositBankList
        var computeBankDepositList = (depositBankList) => {
            this.setState({depositBankList: _.sortBy(depositBankList, (item) => { return item.label })})
        }
        fetchAuth(getAPIBaseURL + "deposit-banks/", 'get', computeBankDepositList)
    },

    render() {
        var activeOrNot = classNames({
            'row margin-top': true,
            'hidden': !this.state.active,
        })

        var divDepositBanks = _.map(this.state.depositBankList,
            (item) => {
                return (
                    <div key={item.value} className="col-md-offset-1 col-md-10">
                        <div className="panel panel-info">
                            <div className="panel-heading">
                                <h3 className="panel-title">{item.label}</h3>
                            </div>
                            <div className="panel-body">
                                <div className="row">
                                    <div className="col-md-8 col-sm-4">
                                        <label className="control-label col-md-3">{__("Solde")} :</label>&nbsp;
                                    </div>
                                    <div className="col-md-4">
                                        <a href={"/banques/history/" + item.shortLabel} className="btn btn-default">{__("Historique")}</a>
                                    </div>
                                </div>
                                <div className="row margin-top">
                                    <div className="col-md-offset-2 col-md-2 col-sm-4">
                                        <a href={"/banques/rapprochement/" + item.shortLabel} className="btn btn-info">{__("Rapprocher")}</a>
                                    </div>
                                    <div className="col-md-offset-2 col-md-2 col-sm-4">
                                        <a href={"/banques/virement/" + item.shortLabel} className="btn btn-default">{__("Faire un virement")}</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })

        return (
            <div className={activeOrNot}>
                {divDepositBanks}
            </div>
        )
    }
})

module.exports = {
    ComptesBanquesDepot: ComptesBanquesDepot,
}