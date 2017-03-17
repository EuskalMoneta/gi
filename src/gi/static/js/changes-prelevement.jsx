import {
    fetchAuth,
    fetchUpload,
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

import ReactSpinner from 'react-spinjs'


class ChangesPrelevementsPage extends React.Component {
    constructor(props) {
        super(props)

        // Default state
        this.state = {
            // Step 1: Import CSV
            csvFile: undefined,
            canSendCSV: false,
            invalidCSVFile: false,

            // Step 2: Display import recap + Process pending ops
            importData: undefined,
            processPendingOps: false,
            pendingOps: Array(),

            // Step (0) & 3: Display errors that occured during ops' processing in tableData
            paymentsErrorsTableData: Array(),
            selectedPaymentsErrors: Array(),
        }
    }

    importCSV = () => {
        this.disableCanSendCSVButton()
        var postCSVFileURL = getAPIBaseURL + "credits-comptes-prelevement-auto/import/" + this.state.csvFile.name

        var computeRecap = (importData) => {
            this.setState({importData: importData}, this.updatePendingOps)
        }

        var promiseImportCSVError = (err) => {
            // Error during request, or parsing NOK :(
            if (err.message != "No content") {
                console.error(postCSVFileURL, 'POST', err)
            }
        }
        fetchUpload(postCSVFileURL, 'POST', computeRecap, this.state.csvFile, promiseImportCSVError)
    }

    selectCSV = (handler) => {
        if (handler.target.files[0].type == "text/csv" || handler.target.files[0].type == "application/csv") {
            this.setState({csvFile: handler.target.files[0], invalidCSVFile: false})
            this.enableCanSendCSVButton()
        }
        else {
            this.setState({csvFile: undefined, invalidCSVFile: true})
            this.disableCanSendCSVButton()
        }
    }

    onSelectTableRow = (row, isSelected, event) => {
        var selectedPaymentsErrors = this.state.selectedPaymentsErrors

        if (isSelected) {
            selectedPaymentsErrors.push(row)
            this.setState({selectedPaymentsErrors: selectedPaymentsErrors})
        }
        else {
            this.setState({selectedPaymentsErrors: _.filter(selectedPaymentsErrors,
                            (item) => {
                                if (row != item)
                                    return item
                            })
                          })
        }
    }

    onSelectTableAll = (isSelected, rows) => {
        if (isSelected)
            this.setState({selectedPaymentsErrors: rows})
        else
            this.setState({selectedPaymentsErrors: Array()})
    }

    enableCanSendCSVButton = () => {
        this.setState({canSendCSV: true})
    }

    disableCanSendCSVButton = () => {
        this.setState({canSendCSV: false})
    }

    updatePaymentsErrorsTableData = () => {
        var computePaymentsErrorsTableData = (paymentsErrorsTableData) => {
            this.setState({paymentsErrorsTableData: paymentsErrorsTableData})
        }
        fetchAuth(getAPIBaseURL + "credits-comptes-prelevement-auto/list/errors", 'get', computePaymentsErrorsTableData)
    }

    updatePendingOps = () => {
        var computePendingOps = (pendingOps) => {
            if (pendingOps.length > 0)
                var processPendingOps = true
            else
                var processPendingOps = false
            this.setState({pendingOps: pendingOps, processPendingOps: processPendingOps})
        }
        fetchAuth(getAPIBaseURL + "credits-comptes-prelevement-auto/list/pending", 'get', computePendingOps)
    }

    componentDidMount = () => {
        this.updatePaymentsErrorsTableData()
        this.updatePendingOps()
    }

    creditAccounts = () => {
        var computeCreditAccounts = (data) => {
            this.updatePaymentsErrorsTableData()
            this.updatePendingOps()
        }

        var promiseErrorCreditAccounts = (err) => {
            debugger
            // Error during request, or parsing NOK :(
            if (err.message != "No content") {
                console.error(getAPIBaseURL + "credits-comptes-prelevement-auto/perform/", 'POST', err)
            }
        }
        fetchAuth(getAPIBaseURL + "credits-comptes-prelevement-auto/perform/",
                  'POST', computeCreditAccounts, {selected_payments: this.state.selectedPaymentsErrors}, promiseErrorCreditAccounts)
    }

    deleteItems = () => {
        var computeDeleteItems = (data) => {
            this.updatePaymentsErrorsTableData()
            this.updatePendingOps()
        }

        var promiseErrorDeleteItems = (err) => {
            debugger
            // Error during request, or parsing NOK :(
            if (err.message != "No content") {
                console.error(getAPIBaseURL + "credits-comptes-prelevement-auto/delete/", 'POST', err)
            }
        }
        fetchAuth(getAPIBaseURL + "credits-comptes-prelevement-auto/delete/",
                  'POST', computeDeleteItems, {selected_payments: this.state.selectedPaymentsErrors}, promiseErrorDeleteItems)
    }

    processPendingOps = () => {
        var computeCreditAccounts = (data) => {
            this.updatePaymentsErrorsTableData()
            this.updatePendingOps()
        }

        var promiseErrorPendingOps = (err) => {
            debugger
            // Error during request, or parsing NOK :(
            if (err.message != "No content") {
                console.error(getAPIBaseURL + "credits-comptes-prelevement-auto/perform/", 'POST', err)
            }
        }
        fetchAuth(getAPIBaseURL + "credits-comptes-prelevement-auto/perform/",
                  'POST', computeCreditAccounts, {selected_payments: this.state.pendingOps}, promiseErrorPendingOps)
    }

    render = () => {
        if (this.state.invalidCSVFile) {
            var invalidCSVDiv = <div style={{paddingTop: 10, color: 'red'}} className="col-md-3">
                                    <span>{__("Le fichier sélectionné n'est pas un fichier CSV.")}</span>
                                </div>
        }
        else
            var invalidCSVDiv = null

        var creditAccountButton = <input
                                    name="credit-account"
                                    data-eusko="changes-prelevement-credit-all"
                                    type="submit"
                                    defaultValue={__("Créditer tout")}
                                    className={this.state.processPendingOps ?
                                               "btn btn-default" :
                                               "btn btn-default no-hover disabled"}
                                    onClick={this.processPendingOps}
                                    disabled={!this.state.processPendingOps}
                                  />

        if (_.isEmpty(this.state.pendingOps)) {
            var pendingOpsDiv = <span style={{marginRight: 20, color: 'green'}}>
                                    {__("Aucun crédit de compte en attente.")}
                                </span>
        }
        else {
            var pendingOpsDiv = <span style={{color: 'green'}}>
                                    {__("%%%% crédit(s) de compte sont en attente.").replace('%%%%', this.state.pendingOps.length)}
                                </span>
        }

        if (this.state.importData) {
            var importDataDiv = (
                <div className="col-md-3 col-md-offset-1">
                    <div className="row">
                        <div className="col-md-8">
                            {pendingOpsDiv}
                            <br />
                            <span style={{color: 'grey'}}>
                                {__("%%%% crédit(s) de compte ont été ignorées.").replace('%%%%', this.state.importData.ignore)}
                            </span>
                            <br />
                            <span style={{color: 'red'}}>
                                {__("%%%% crédit(s) de compte ont échouées.").replace('%%%%', this.state.importData.errors.length)}
                            </span>
                        </div>
                        <div className="col-md-4">
                            {creditAccountButton}
                        </div>
                    </div>
                </div>
            )

            if (_.isEmpty(this.state.importData.errors)) {
                var importDataErrorsTable = null
            }
            else {
                var importDataErrorsDateFormatter = (cell, row) => {
                    // Force moment i18n
                    moment.locale(getCurrentLang)
                    return moment(cell).format('L')
                }

                var importDataErrorsTable = (
                    <div>
                        <h3 style={{paddingLeft: 30, marginBottom: 20}}>{__("Erreurs d'importation")}</h3>
                        <BootstrapTable
                             data={this.state.importData.errors}
                              tableContainerClass="react-bs-table-account-history"
                             options={{noDataText: __("Rien à afficher.")}} striped={true} hover={false}
                             >
                                <TableHeaderColumn isKey={true} hidden={true} dataField="ref">{__("ID")}</TableHeaderColumn>
                                <TableHeaderColumn dataField="ref">{__("Référence")}</TableHeaderColumn>
                                <TableHeaderColumn dataField="adherent_id">{__("N° Adhérent")}</TableHeaderColumn>
                                <TableHeaderColumn width='400' dataField="adherent_name">{__("Adhérent")}</TableHeaderColumn>
                                <TableHeaderColumn dataField="montant">{__("Montant")}</TableHeaderColumn>
                                <TableHeaderColumn dataField="date" dataFormat={importDataErrorsDateFormatter}>{__("Date ")}</TableHeaderColumn>
                                <TableHeaderColumn dataField="operation_date" dataFormat={importDataErrorsDateFormatter}>{__("Date d'opération")}</TableHeaderColumn>
                                <TableHeaderColumn columnClassName="line-break" dataField="cyclos_error">{__("Erreur lors de l'import")}</TableHeaderColumn>
                        </BootstrapTable>
                    </div>
                )
            }
        }
        else {
            var importDataDiv = (
                <div className="col-md-3 col-md-offset-1">
                    <div className="row">
                        <div className="col-md-8">
                            {pendingOpsDiv}
                        </div>
                        <div className="col-md-4">
                            {creditAccountButton}
                        </div>
                    </div>
                </div>
            )

            var importDataErrorsTable = null
        }

        if (_.isEmpty(this.state.paymentsErrorsTableData)) {
            var dataTable = null
            var dataTableButtons = null
        }
        else {            
            const selectRowProp = {
                mode: 'checkbox',
                clickToSelect: false,
                onSelect: this.onSelectTableRow,
                onSelectAll: this.onSelectTableAll,
            }

            var dateFormatter = (cell, row) => {
                // Force moment i18n
                moment.locale(getCurrentLang)
                return moment(cell).format('LLLL')
            }

            var dataTable = (
                <div>
                    <h3 style={{paddingLeft: 30, marginBottom: 20}}>{__("Erreurs de paiement")}</h3>
                    <BootstrapTable
                     data={this.state.paymentsErrorsTableData} striped={true} hover={true}
                     selectRow={selectRowProp} tableContainerClass="react-bs-table-account-history"
                     options={{noDataText: __("Rien à afficher.")}}
                     >
                        <TableHeaderColumn isKey={true} hidden={true} dataField="ref">{__("ID")}</TableHeaderColumn>
                        <TableHeaderColumn dataField="ref">{__("Référence")}</TableHeaderColumn>
                        <TableHeaderColumn dataField="adherent_id">{__("N° Adhérent")}</TableHeaderColumn>
                        <TableHeaderColumn dataField="adherent_name">{__("Adhérent")}</TableHeaderColumn>
                        <TableHeaderColumn dataField="montant">{__("Montant")}</TableHeaderColumn>
                        <TableHeaderColumn dataField="date" dataFormat={importDataErrorsDateFormatter}>{__("Date ")}</TableHeaderColumn>
                        <TableHeaderColumn dataField="operation_date" dataFormat={importDataErrorsDateFormatter}>{__("Date d'opération")}</TableHeaderColumn>
                        <TableHeaderColumn dataField="cyclos_payment_id">{__("ID du crédit de compte")}</TableHeaderColumn>
                        <TableHeaderColumn columnClassName="line-break" dataField="cyclos_error">{__("Erreur lors de l'import")}</TableHeaderColumn>
                    </BootstrapTable>
                </div>
            )

            var dataTableButtons = (<div className="row">
                       <div className="margin-top col-md-offset-2 col-md-1">
                            <button onClick={this.creditAccounts}
                                    className="btn btn-success enable-pointer-events"
                                    disabled={_.isEmpty(this.state.selectedPaymentsErrors)}>
                                    {__("Créditer le compte")} <i className="glyphicon glyphicon-euro"></i>
                            </button>
                       </div>
                       <div className="margin-top col-md-offset-2 col-md-1">
                            <button onClick={this.deleteItems}
                                    className="btn btn-danger enable-pointer-events"
                                    disabled={_.isEmpty(this.state.selectedPaymentsErrors)}>
                                    {__("Supprimer")} <i className="glyphicon glyphicon-trash"></i>
                            </button>
                       </div>
                    </div>
            )
        }


        return <div className="row">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="row">
                                <div style={{paddingTop: 10}} className="col-md-2 col-md-offset-1">
                                    <input
                                        type="file"
                                        name="csv"
                                        onChange={this.selectCSV}
                                        data-eusko="changes-prelevement-csv"
                                        accept=".csv"
                                    />
                                </div>
                                <div className="col-md-1">
                                    <input
                                     name="import-csv"
                                     data-eusko="changes-prelevement-import-csv"
                                     type="submit"
                                     defaultValue={__("Importer le fichier")}
                                     className="btn btn-info"
                                     onClick={this.importCSV}
                                     disabled={!this.state.canSendCSV}
                                    />
                                </div>
                                {invalidCSVDiv}
                            </div>
                            <div className="row" style={{marginTop: 30}}>
                                {importDataDiv}
                            </div>
                            <div className="row margin-top">
                                <div className="col-md-12">
                                    {importDataErrorsTable}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div style={{marginTop: 30}} className="col-md-12">
                            {dataTable}
                        </div>
                    </div>
                    {dataTableButtons}
                </div>
    }
}


ReactDOM.render(
    <ChangesPrelevementsPage />,
    document.getElementById('changes-prelevement')
)

ReactDOM.render(
    <NavbarTitle />,
    document.getElementById('navbar-title')
)
