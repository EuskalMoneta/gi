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
            recapImport: undefined,
            processPendingOps: false,

            // Step (0) & 3: Display errors that occured during ops' processing in tableData
            tableData: Array(),
        }
    }

    importCSV = () => {
        this.disableCanSendCSVButton()
        var postCSVFileURL = getAPIBaseURL + "credits-comptes-prelevement-auto/import-csv/" + this.state.csvFile.name

        var computeRecap = (recapImport) => {
            this.setState({recapImport: recapImport})
        }

        var promiseImportCSVError = (err) => {
            debugger
            // Error during request, or parsing NOK :(
            if (err.message != "No content") {
                console.error(postCSVFileURL, 'POST', err)
            }
        }
        fetchUpload(postCSVFileURL, 'POST', computeRecap, this.state.csvFile, promiseImportCSVError)
    }

    selectCSV = (handler) => {
        if (handler.target.files[0].type == "text/csv") {
            this.setState({csvFile: handler.target.files[0], invalidCSVFile: false})
            this.enableCanSendCSVButton()
        }
        else {
            this.setState({csvFile: undefined, invalidCSVFile: true})
            this.disableCanSendCSVButton()
        }
    }

    onSelectTableRow = (row, isSelected, event) => {
        var historyTableSelectedRows = this.state.historyTableSelectedRows

        if (isSelected) {
            historyTableSelectedRows.push(row)
            this.setState({historyTableSelectedRows: historyTableSelectedRows}, this.computeAmounts)
        }
        else {
            this.setState({historyTableSelectedRows: _.filter(historyTableSelectedRows,
                            (item) => {
                                if (row != item)
                                    return item
                            })
                          }, this.computeAmounts)
        }
    }

    onSelectTableAll = (isSelected, rows) => {
        if (isSelected)
            this.setState({historyTableSelectedRows: rows}, this.computeAmounts)
        else
            this.setState({historyTableSelectedRows: Array()}, this.computeAmounts)
    }

    enableCanSendCSVButton = () => {
        this.setState({canSendCSV: true})
    }

    disableCanSendCSVButton = () => {
        this.setState({canSendCSV: false})
    }

    componentDidMount = () => {
        // Get tableData
        var computeHistoryTableData = (tableData) => {
            this.setState({tableData: tableData.result.pageItems})
        }
        // fetchAuth(getAPIBaseURL + "/toto/", 'get', computeHistoryTableData)
    }

    render = () => {
        if (this.state.invalidCSVFile) {
            var invalidCSVDiv = <div style={{paddingTop: 10, color: 'red'}} className="col-md-3">
                                    <span>{__("Le fichier sélectionné n'est pas un fichier CSV.")}</span>
                                </div>
        }
        else
            var invalidCSVDiv = null

        if (this.state.recapImport) {
            if (this.state.recapImport.errors.length > 0) {
                var recapImportErrorsList = _.map(this.state.recapImport.errors,
                    (item) => {
                        return <span>{__('Entrée: ') + item.item + ' ' + __('Erreur: ') + item.error}</span>
                    }
                )
            }
            else {
                var recapImportErrorsList = null
            }

            var recapImportDiv = (
                <div className="col-md-2 col-md-offset-1">
                    <p>
                        <span style={{color: 'green'}}>
                            {__("%%%% entrée(s) ont été importées.").replace('%%%%', this.state.recapImport.ok)}
                        </span>
                        <br />
                        <span style={{color: 'grey'}}>
                            {__("%%%% entrée(s) ont été ignorées.").replace('%%%%', this.state.recapImport.ignore)}
                        </span>
                        <br />
                        <span style={{color: 'red'}}>
                            {__("%%%% entrée(s) ont échouées.").replace('%%%%', this.state.recapImport.errors.length)}
                        </span>
                    </p>
                    {recapImportErrorsList}
                </div>
            )
        }
        else
            var recapImportDiv = <div style={{paddingTop: 10}} className="col-md-2 col-md-offset-1">
                                    <span>{__("Aucun crédit de compte en attente.")}</span>
                                 </div>

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
            <BootstrapTable
             data={this.state.tableData} striped={true} hover={true}
             selectRow={selectRowProp} tableContainerClass="react-bs-table-account-history"
             options={{noDataText: __("Rien à afficher.")}}
             >
                <TableHeaderColumn isKey={true} hidden={true} dataField="id">{__("ID")}</TableHeaderColumn>
                <TableHeaderColumn dataField="date" dataFormat={dateFormatter}>{__("Date")}</TableHeaderColumn>
                <TableHeaderColumn columnClassName="line-break" dataField="description">{__("Libellé")}</TableHeaderColumn>
            </BootstrapTable>
        )


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
                                {recapImportDiv}
                                <div className="col-md-1">
                                    <input
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
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div style={{marginTop: 40}} className="col-md-12">
                            {dataTable}
                        </div>
                    </div>
                    {/* <div className="row">
                    //     <div className="margin-top col-md-offset-2 col-md-1">
                    //         <input
                    //             name="credit-account"
                    //             data-eusko="changes-prelevement-credit-account"
                    //             type="submit"
                    //             defaultValue={__("Créditer le compte")}
                    //             className="btn btn-success"
                    //             formNoValidate={true}
                    //             onClick={this.creditAccount}
                    //             // disabled={!this.state.canSubmit}
                    //         />
                    //     </div>
                    //     <div className="margin-top col-md-offset-2 col-md-1">
                    //         <input
                    //             name="delete-items"
                    //             data-eusko="changes-prelevement-delete-items"
                    //             type="submit"
                    //             defaultValue={__("Supprimer")}
                    //             className="btn btn-danger"
                    //             formNoValidate={true}
                    //             onClick={this.deleteItems}
                    //             // disabled={!this.state.canSubmit}
                    //         />
                    //     </div>
                    // </div>*/}
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