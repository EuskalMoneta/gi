import {
    fetchAuth,
    getAPIBaseURL,
    NavbarTitle,
    getCurrentLang,
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
            historyTableData: Array(),
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
        if (this.state.historyTableSelectedRows.length > 0)
            this.enableButton()
        else
            this.disableButton()
    },

    submitForm(data) {
        this.disableButton()

        var postData = {}
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

            setTimeout(() => window.location.assign(this.props.nextURL), 3000)
        }

        var promiseError = (err) => {
            // Error during request, or parsing NOK :(
            this.enableButton()

            console.error(this.props.saveURL, err)
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

if (window.location.pathname.toLowerCase().indexOf("coffre/entree") != -1)
{
    // URL = coffre/entree
    var propMode = "coffre/entree"
    var propGetHistoryURL = getAPIBaseURL + "payments-available-entree-coffre/"
    var propNextURL =  "/coffre"
    var propSaveURL =  getAPIBaseURL + "entree-coffre/"
    var propTranslateTitle = __("Entrée coffre")
    var propCurrency = 'EUS'
}
else if (window.location.pathname.toLowerCase().indexOf("operations/entrees-euro") != -1)
{
    // URL = operations/entrees-euro
    var propMode = "operations/entrees-euro"
    var propGetHistoryURL = getAPIBaseURL + "payments-available-entrees-euro/"
    var propNextURL =  "/operations"
    var propSaveURL =  getAPIBaseURL + "validate-entrees-euro/"
    var propTranslateTitle = __("Entrées dans la Caisse €")
    var propCurrency = '€'
}
else if (window.location.pathname.toLowerCase().indexOf("operations/entrees-eusko") != -1)
{
    // URL = operations/entrees-eusko
    var propMode = "operations/entrees-eusko"
    var propGetHistoryURL = getAPIBaseURL + "payments-available-entrees-eusko/"
    var propNextURL =  "/operations"
    var propSaveURL =  getAPIBaseURL + "validate-entrees-eusko/"
    var propTranslateTitle = __("Entrées dans la Caisse Eusko")
    var propCurrency = 'EUS'
}
else if (window.location.pathname.toLowerCase().indexOf("banques/rapprochement") != -1)
{
    // URL = banques/rapprochement
    var propMode = "banques/rapprochement"
    var bankName = window.location.pathname.slice(window.location.pathname.lastIndexOf('/') + 1, window.location.pathname.length)
    var propGetHistoryURL = getAPIBaseURL + "payments-available-banques/?mode=rapprochement&bank_name=" + bankName
    var propNextURL =  "/comptes"
    var propSaveURL =  getAPIBaseURL + "validate-banques-rapprochement/"
    var propTranslateTitle = __("Banques de dépôt : rapprochement")
    var propCurrency = '€'
}
else if (window.location.pathname.toLowerCase().indexOf("banques/virement") != -1)
{
    // URL = banques/virement
    var propMode = "banques/virement"
    var bankName = window.location.pathname.slice(window.location.pathname.lastIndexOf('/') + 1, window.location.pathname.length)
    var propGetHistoryURL = getAPIBaseURL + "payments-available-banques/?mode=virement&bank_name=" + bankName
    var propNextURL =  "/comptes"
    var propSaveURL =  getAPIBaseURL + "validate-banques-virement/"
    var propTranslateTitle = __("Banques de dépôt : virements")
    var propCurrency = '€'
}
else {
    window.location.assign("/")
}

ReactDOM.render(
    <GenericPage
            historyURL={propGetHistoryURL}
            saveURL={propSaveURL}
            nextURL={propNextURL}
            mode={propMode}
            currency={propCurrency}
    />,
    document.getElementById('generic-view')
)

ReactDOM.render(
    <NavbarTitle title={propTranslateTitle} />,
    document.getElementById('navbar-title')
)