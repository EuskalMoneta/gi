import {
    fetchAuth,
    getAPIBaseURL,
    isPositiveNumeric,
    NavbarTitle,
    SelectizeUtils,
    getCurrentLang
} from 'Utils'

import {
    BootstrapTable,
    TableHeaderColumn
} from 'react-bootstrap-table'
import 'node_modules/react-bootstrap-table/dist/react-bootstrap-table.min.css'

var ManagerHistoryPage = React.createClass({

    getInitialState() {
        try {
            var accountName = undefined
            if (document.getElementById("account_name").value) {
                var accountName = document.getElementById("account_name").value
            }
        }
        catch (e) {
            var accountName = undefined
        }

        try {
            var accountType = undefined
            if (document.getElementById("account_type").value) {
                var accountType = document.getElementById("account_type").value
            }
        }
        catch (e) {
            var accountType = undefined
        }

        return {
            accountName: accountName,
            accountType: accountType,
            historyList: Array(),
            currentSolde: undefined
        }
    },

    computeHistoryList(historyList) {
        try {
            if (historyList.result.pageItems) {
                var historyListData = historyList.result.pageItems
            }
            else {
                var historyListData = historyList
            }
        }
        catch (e) {
            var historyListData = historyList
        }

        var res = _.map(historyListData,
            (item, index, list) => {
                var newItem = item

                // Input data are strings,
                // we need to cast it in a Number object to use the toFixed method.
                if (index === 0)
                    newItem.solde = Number(this.state.currentSolde.balance)
                else
                    newItem.solde = Number(list[index-1].solde) - Number(list[index-1].amount)

                newItem.solde = newItem.solde.toFixed(2)
                return newItem
            }
        )

        this.setState({historyList: res});
    },

    componentDidMount() {
        var computeHistoryData = (data) => {
            if (this.props.mode == 'banque_de_depot') {
                var currentSolde = data[this.props.accountName]
            }
            else if (this.props.mode == 'compte_dedie') {
                var currentSolde = data[this.props.mode + '_eusko_' + this.props.accountName]
            }
            else {
                var currentSolde = _.filter(data, (item) => { return item.type.id == this.props.mode })[0]
            }

            this.setState({currentSolde: currentSolde},
                () => {
                    // Get account history
                    if (this.props.loginBDC) {
                        var urlHistory = (getAPIBaseURL + "accounts-history/?login_bdc=" + this.props.loginBDC +
                                          "&account_type=" + this.props.mode)
                    }
                    else {
                        if (this.props.mode == 'banque_de_depot') {
                            var urlHistory = getAPIBaseURL +"banks-history/?mode=historique&bank_name=" + this.props.accountName
                        }
                        else if (this.props.mode == 'compte_dedie') {
                            var urlHistory = (getAPIBaseURL + "accounts-history/?cyclos_mode=gi&account_type=" +
                                              this.props.mode + '_eusko_' + this.props.accountName)
                        }
                        else {
                            var urlHistory = getAPIBaseURL + "accounts-history/?cyclos_mode=gi&account_type=" + this.props.mode
                        }
                    }
                    fetchAuth(urlHistory, 'get', this.computeHistoryList)
                }
            );
        }

        // Get account summary
        if (this.props.loginBDC) {
            var urlSummary = getAPIBaseURL + "accounts-summaries/" + this.props.loginBDC
        }
        else {
            if (this.props.mode == 'banque_de_depot') {
                var urlSummary = getAPIBaseURL + "deposit-banks-summaries/"
            }
            else if (this.props.mode == 'compte_dedie') {
                var urlSummary = getAPIBaseURL + "dedicated-accounts-summaries/"
            }
            else {
                var urlSummary = getAPIBaseURL + "system-accounts-summaries/"
            }
        }
        fetchAuth(urlSummary, 'get', computeHistoryData)
    },

    render() {
        // Display current solde information
        if (this.state.currentSolde || this.state.currentSolde === 0) {
            var currentSoldeLabel = (
                <span className="solde-history-span">
                    {this.state.currentSolde.balance + " " + this.state.currentSolde.currency}
                </span>
            )
        }
        else
            var currentSoldeLabel = null

        // Which buttons we need to display before the table
        if (this.props.mode == 'stock_de_billets_bdc') {
            var actionButtons = (
                <div className="row margin-bottom">
                    <div className="col-md-offset-2 col-md-2 col-sm-4">
                        <a href={"/bdc/manage/" + this.props.loginBDC + "/entree-stock"} className="btn btn-info">{__("Entrée")}</a>
                    </div>
                    <div className="col-md-offset-1 col-md-2 col-sm-4">
                        <a href={"/bdc/manage/" + this.props.loginBDC + "/sortie-stock"} className="btn btn-default">{__("Sortie")}</a>
                    </div>
                    <div className="col-md-offset-1 col-md-2 col-sm-4">
                        <label className="control-label col-md-12 solde-history-label">
                            {__("Solde") + ": "}
                            {currentSoldeLabel}
                        </label>
                    </div>
                </div>
            )
        }
        else if (this.props.mode == 'caisse_euro_bdc') {
            var actionButtons = (
                <div className="row margin-bottom">
                    <div className="col-md-offset-2 col-md-2 col-sm-4">
                        <a href={"/bdc/manage/" + this.props.loginBDC + "/bank-deposit"} className="btn btn-info">{__("Dépôt en banque")}</a>
                    </div>
                    <div className="col-md-offset-1 col-md-2 col-sm-4">
                        <a href={"/bdc/manage/" + this.props.loginBDC + "/cash-deposit"} className="btn btn-default">{__("Remise d'espèces")}</a>
                    </div>
                    <div className="col-md-offset-1 col-md-2 col-sm-4">
                        <label className="control-label col-md-12 solde-history-label">
                            {__("Solde") + ": "}
                            {currentSoldeLabel}
                        </label>
                    </div>
                </div>
            )
        }
        else if (this.props.mode == 'caisse_eusko_bdc') {
            var actionButtons = (
                <div className="row margin-bottom">
                    <div className="col-md-offset-2 col-md-2 col-sm-4">
                        <a href={"/bdc/manage/" + this.props.loginBDC + "/sortie-caisse-eusko"} className="btn btn-info">{__("Sortie")}</a>
                    </div>
                    <div className="col-md-offset-1 col-md-2 col-sm-4">
                        <label className="control-label col-md-12 solde-history-label">
                            {__("Solde") + ": "}
                            {currentSoldeLabel}
                        </label>
                    </div>
                </div>
            )
        }
        else if (this.props.mode == 'retours_d_eusko_bdc') {
            var actionButtons = (
                <div className="row margin-bottom">
                    <div className="col-md-offset-2 col-md-2 col-sm-4">
                        <a href={"/bdc/manage/" + this.props.loginBDC + "/sortie-retour-eusko"} className="btn btn-info">{__("Sortie")}</a>
                    </div>
                    <div className="col-md-offset-1 col-md-2 col-sm-4">
                        <label className="control-label col-md-12 solde-history-label">
                            {__("Solde") + ": "}
                            {currentSoldeLabel}
                        </label>
                    </div>
                </div>
            )
        }
        else if (this.props.mode == 'stock_de_billets') {
            var actionButtons = (
                <div className="row margin-bottom">
                    <div className="col-md-offset-2 col-md-2 col-sm-4">
                        <a href="/coffre/entree" className="btn btn-info">{__("Entrée")}</a>
                    </div>
                    <div className="col-md-offset-1 col-md-2 col-sm-4">
                        <a href="/coffre/sortie" className="btn btn-default">{__("Sortie")}</a>
                    </div>
                    <div className="col-md-offset-1 col-md-2 col-sm-4">
                        <label className="control-label col-md-12 solde-history-label">
                            {__("Solde") + ": "}
                            {currentSoldeLabel}
                        </label>
                    </div>
                </div>
            )
        }
        else if (this.props.mode == 'banque_de_depot') {
            var actionButtons = (
                <div className="row margin-bottom">
                    <div className="col-md-offset-2 col-md-2 col-sm-4">
                        <a href={"/banques/rapprochement/" + this.props.accountName} className="btn btn-info">{__("Rapprocher")}</a>
                    </div>
                    <div className="col-md-offset-2 col-md-2 col-sm-4">
                        <a href={"/banques/virement/" + this.props.accountName} className="btn btn-default">{__("Faire un virement")}</a>
                    </div>
                    <div className="col-md-offset-1 col-md-2 col-sm-4">
                        <label className="control-label col-md-12 solde-history-label">
                            {__("Solde") + ": "}
                            {currentSoldeLabel}
                        </label>
                    </div>
                </div>
            )
        }
        else {
            var actionButtons = (
                <div className="row margin-bottom">
                    <div className="col-md-offset-1 col-md-2 col-sm-4">
                        <label className="control-label col-md-12 solde-history-label">
                            {__("Solde") + ": "}
                            {currentSoldeLabel}
                        </label>
                    </div>
                </div>
            )
        }

        // History data table
        var dateFormatter = (cell, row) => {
            // Force moment i18n
            moment.locale(getCurrentLang)
            return moment(cell).format('LLLL')
        }

        var amountFormatter = (cell, row) => {
            // Cell is a string for now,
            // we need to cast it in a Number object to use the toFixed method.
            return Number(cell).toFixed(2)
        }

        var historyTable = (
            <BootstrapTable
             data={this.state.historyList} striped={true} hover={true} pagination={true}
             selectRow={{mode: 'none'}} tableContainerClass="react-bs-table-account-history"
             options={{noDataText: __("Pas d'historique à afficher."), hideSizePerPage: true, sizePerPage: 20}}
             >
                <TableHeaderColumn isKey={true} hidden={true} dataField="id">{__("ID")}</TableHeaderColumn>
                <TableHeaderColumn dataField="date" dataFormat={dateFormatter}>{__("Date")}</TableHeaderColumn>
                <TableHeaderColumn columnClassName="line-break" dataField="description">{__("Libellé")}</TableHeaderColumn>
                <TableHeaderColumn dataField="amount" dataFormat={amountFormatter}>{__("Montant")}</TableHeaderColumn>
                <TableHeaderColumn dataField="solde">{__("Solde")}</TableHeaderColumn>
            </BootstrapTable>
        )

        return (
            <div className="row">
                <div className="col-md-10">
                    {actionButtons}
                    <div className="row margin-right">
                        <div className="col-md-12 col-md-offset-1">
                            {historyTable}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
})

var accountName = undefined
if (window.location.pathname.toLowerCase().indexOf("stock-billets") != -1)
{
    var pageTitle = __("Historique stock billets")
    var mode = 'stock_de_billets_bdc'
}
else if (window.location.pathname.toLowerCase().indexOf("caisse-euro") != -1)
{
    var pageTitle = __("Historique caisse Euro")
    var mode = 'caisse_euro_bdc'
}
else if (window.location.pathname.toLowerCase().indexOf("caisse-eusko") != -1)
{
    var pageTitle = __("Historique caisse Eusko")
    var mode = 'caisse_eusko_bdc'
}
else if (window.location.pathname.toLowerCase().indexOf("retour-eusko") != -1)
{
    var pageTitle = __("Historique retour Eusko")
    var mode = 'retours_d_eusko_bdc'
}
else if (window.location.pathname.toLowerCase().indexOf("coffre/history") != -1)
{
    var pageTitle = __("Historique coffre")
    var mode = 'stock_de_billets'
}
else if (window.location.pathname.toLowerCase().indexOf("comptedetransit/history") != -1)
{
    var pageTitle = __("Historique compte de transit")
    var mode = 'compte_de_transit'
}
else if (window.location.pathname.toLowerCase().indexOf("comptes/history") != -1)
{
    var pageTitle = __("Historique comptes dédié")
    var mode = 'compte_dedie'
    var accountName = window.location.pathname.slice(window.location.pathname.lastIndexOf('/') + 1, window.location.pathname.length)
}
else if (window.location.pathname.toLowerCase().indexOf("banques/history") != -1)
{
    var pageTitle = __("Historique banque de dépôt")
    var mode = 'banque_de_depot'
    var accountName = window.location.pathname.slice(window.location.pathname.lastIndexOf('/') + 1, window.location.pathname.length)
}
else
    window.location.assign("/bdc");

var loginBDC = undefined
if (window.location.pathname.toLowerCase().indexOf('bdc/manage/') != -1) {
    var loginBDC = window.location.pathname.slice(window.location.pathname.lastIndexOf('bdc/manage/') + 11,
                                                   window.location.pathname.lastIndexOf('/history'))
}

ReactDOM.render(
    <ManagerHistoryPage
        mode={mode}
        accountName={accountName}
        loginBDC={loginBDC}
    />,
    document.getElementById('manager-history')
)

ReactDOM.render(
    <NavbarTitle title={pageTitle} />,
    document.getElementById('navbar-title')
)