import {
    fetchAuth,
    getAPIBaseURL,
    NavbarTitle,
    getCurrentLang
} from 'Utils'

import {
    BootstrapTable,
    TableHeaderColumn
} from 'react-bootstrap-table'
import 'node_modules/react-bootstrap-table/dist/react-bootstrap-table.min.css'

import classNames from 'classnames'

const {
    ToastContainer
} = ReactToastr
const ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation)

var GenericPage = React.createClass({

    getInitialState() {
        return {
            canSubmit: false,
            historyTableData: undefined,
            historyTableSelectedRows: Array(),
        }
    },

    componentDidMount() {
        // Get historyTableData
        var computeHistoryTableData = (historyTableData) => {
            this.setState({historyTableData: historyTableData})
        }
        fetchAuth(this.props.historyURL, 'get', computeHistoryTableData)
    },

    onSelectTableRow(row, isSelected, event) {
        var historyTableSelectedRows = this.state.historyTableSelectedRows

        if (isSelected) {
            historyTableSelectedRows.push(row)
            this.setState({historyTableSelectedRows: historyTableSelectedRows}, this.validateForm)
        }
        else {
            this.setState({historyTableSelectedRows: _.filter(historyTableSelectedRows,
                            (item) => {
                                if (row != item)
                                    return item
                            })
                          }, this.validateForm)
        }
    },

    onSelectTableAll(isSelected, rows) {
        if (isSelected)
            this.setState({historyTableSelectedRows: rows}, this.validateForm)
        else
            this.setState({historyTableSelectedRows: Array()}, this.validateForm)
    },

    enableButton() {
        this.setState({canSubmit: true})
    },

    disableButton() {
        this.setState({canSubmit: false})
    },

    validateForm() {
        if (this.state.historyTableSelectedRows == Array())
            this.disableButton()
        else
            this.enableButton()
    },

    submitForm(data) {
        this.disableButton()

        var postData = {}
        postData.login_bdc = window.config.userName
        postData.selected_payments = this.state.historyTableSelectedRows

        var computeForm = (data) => {
            this.refs.container.success(
                __("L'enregistrement s'est déroulé correctement."),
                "",
                {
                    timeOut: 5000,
                    extendedTimeOut: 10000,
                    closeButton:true
                }
            )

            setTimeout(() => window.location.assign('/manager/history/stock-billets'), 3000)
        }

        var promiseError = (err) => {
            // Error during request, or parsing NOK :(
            this.enableButton()

            console.error(this.props.url, err)
            this.refs.container.error(
                __("Une erreur s'est produite lors de l'enregistrement !"),
                "",
                {
                    timeOut: 5000,
                    extendedTimeOut: 10000,
                    closeButton:true
                }
            )
        }
        fetchAuth(this.props.saveURL, 'POST', computeForm, postData, promiseError)
    },

    render() {
        const selectRowProp = {
            mode: 'checkbox',
            clickToSelect: true,
            onSelect: this.onSelectTableRow,
            onSelectAll: this.onSelectTableAll,
        }

        // History data table
        if (this.state.historyTableData) {
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

            var dataTable = (
                <BootstrapTable
                 data={this.state.historyTableData} striped={true} hover={true}
                 selectRow={selectRowProp} tableContainerClass="react-bs-table-account-history"
                 options={{noDataText: __("Rien à afficher.")}}
                 >
                    <TableHeaderColumn isKey={true} hidden={true} dataField="id">{__("ID")}</TableHeaderColumn>
                    <TableHeaderColumn dataField="date" dataFormat={dateFormatter}>{__("Date")}</TableHeaderColumn>
                    <TableHeaderColumn dataField="description">{__("Libellé")}</TableHeaderColumn>
                    <TableHeaderColumn dataField="amount" dataFormat={amountFormatter}>{__("Montant")}</TableHeaderColumn>
                </BootstrapTable>
            )
        }
        else
            var dataTable = null;

        return (
            <div className="row-fluid">
                <div className="row-fluid">
                    <div className="col-md-12">
                        {dataTable}
                    </div>
                </div>
                <div className="row-fluid">
                    <div className="col-md-12 margin-top">
                        <input
                            name="submit"
                            data-eusko="entree-stock-submit"
                            type="submit"
                            defaultValue={__("Enregistrer")}
                            className="btn btn-success"
                            formNoValidate={true}
                            onClick={this.submitForm}
                            disabled={!this.state.canSubmit}
                        />
                    </div>
                </div>
                <ToastContainer ref="container"
                                toastMessageFactory={ToastMessageFactory}
                                className="toast-top-right toast-top-right-navbar"
                />
            </div>
        );
    }
})

if (window.location.pathname.toLowerCase().indexOf("cash-deposit") != -1)
{
    // URL = cash-deposit
    var propMode = "cash-deposit"
    var propGetHistoryURL =  "accounts-history/?account_type=caisse_euro_bdc&filter=a_remettre_a_euskal_moneta"
    var propNextURL =  "/manager/history/caisse-euro"
    var propTranslateTitle = __("Remise d'espèces")
    var propCurrency = '€'
}
else if (window.location.pathname.toLowerCase().indexOf("sortie-caisse-eusko") != -1)
{
    // URL = sortie-caisse-eusko
    var propMode =  "sortie-caisse-eusko"
    var propGetHistoryURL =  "accounts-history/?account_type=caisse_eusko_bdc&filter=a_remettre_a_euskal_moneta"
    var propNextURL =  "/manager/history/caisse-eusko"
    var propTranslateTitle = __("Sortie caisse eusko")
    var propCurrency = 'EUS'
}
else if (window.location.pathname.toLowerCase().indexOf("sortie-retour-eusko") != -1)
{
    // URL = sortie-caisse-eusko
    var propMode =  "sortie-retour-eusko"
    var propGetHistoryURL =  "accounts-history/?account_type=retours_d_eusko_bdc&filter=a_remettre_a_euskal_moneta"
    var propNextURL =  "/manager/history/retour-eusko"
    var propTranslateTitle = __("Sortie retours d'eusko")
    var propCurrency = 'EUS'
}
else
    window.location.assign("/manager");

ReactDOM.render(
    <GenericPage
            historyURL={getAPIBaseURL + propGetHistoryURL}
            saveURL={getAPIBaseURL + propMode + "/"}
            nextURL={propNextURL}
            mode={propMode}
            currency={propCurrency}
    />,
    document.getElementById('generic-view')
)

ReactDOM.render(
    <NavbarTitle title={__("Entrée stock BDC")} />,
    document.getElementById('navbar-title')
)