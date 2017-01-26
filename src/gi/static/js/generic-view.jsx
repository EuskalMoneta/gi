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
            // Dépôts et Retraits
            montantTotalDepots: Number(),
            montantTotalRetraits: Number(),
            montantVirement: Number(),
            virementVersCompte: null,
            // Reconversions
            montantTotalReconversionsBillets: Number(),
            montantTotalReconversionsNumeriques: Number(),
            // Banque de dépôt: Virements
            montantTotalCotisations: Number(),
            montantTotalVentes: Number(),
            montantTotalBillet: Number(),
            montantTotalNumerique: Number()
        }
    },

    componentDidMount() {
        // Get historyTableData
        var computeHistoryTableData = (historyTableData) => {
            try {
                if (historyTableData.result.pageItems) {
                    this.setState({historyTableData: historyTableData.result.pageItems})
                }
                else {
                    this.setState({historyTableData: historyTableData})
                }
            }
            catch (e) {
                this.setState({historyTableData: historyTableData})
            }
        }
        fetchAuth(this.props.historyURL, 'get', computeHistoryTableData)
    },

    /*
        # Dépôts et Retraits

        Il faut calculer le montant total des dépôts (montantTotalDepots),
            et le montant total des retraits (montantTotalRetraits):

        - Si montantTotalDepots == montantTotalRetraits, pas de virement à faire.
        - Si montantTotalDepots > montantTotalRetraits,
            il faut faire un virement de montantTotalDepots - montantTotalRetraits
            du Compte dédié billet vers le Compte dédié numérique.
        - Si montantTotalDepots < montantTotalRetraits,
            il faut faire un virement de montantTotalRetraits - montantTotalDepots
            du Compte dédié numérique vers le Compte dédié billet.

        # Reconversions

        - Total des reconversions d'eusko billets
        - Total des reconversions d'eusko numériques

        # Dépôt en banque: Virements

        - Total des Cotisations
        - Total des Ventes
        - Total des changes d'eusko Billets
        - Total des changes d'eusko Numerique
    */
    computeAmounts() {
        if (this.props.mode == 'operations/depots-retraits') {
            var montantTotalDepots = _.chain(this.state.historyTableSelectedRows)
               .filter((item) => { return item.type.internalName.toLowerCase() === "compte_des_billets_en_circulation.depot_de_billets" })
               .reduce((memo, row) => { return memo + Math.abs(row.amount) }, Number(0))
               .value()

            var montantTotalRetraits = _.chain(this.state.historyTableSelectedRows)
               .filter((item) => { return item.type.internalName.toLowerCase() === "stock_de_billets_bdc.retrait_de_billets" })
               .reduce((memo, row) => { return memo + Math.abs(row.amount) }, Number(0))
               .value()

            var montantVirement = Number()
            var virementVersCompte = null


            if (montantTotalDepots === montantTotalRetraits) {
                var montantVirement = Number()
            }
            else if (montantTotalDepots > montantTotalRetraits) {
                var montantVirement = Number(montantTotalDepots - montantTotalRetraits)
                var virementVersCompte = "numerique"
            }
            else if (montantTotalDepots < montantTotalRetraits) {
                var montantVirement = Number(montantTotalRetraits - montantTotalDepots)
                var virementVersCompte = "billet"
            }

            this.setState({montantTotalDepots: montantTotalDepots,
                           montantTotalRetraits: montantTotalRetraits,
                           montantVirement: montantVirement,
                           virementVersCompte: virementVersCompte},
                          this.validateForm)
        }
        else if (this.props.mode == 'operations/reconversions') {
            var montantTotalReconversionsBillets = _.chain(this.state.historyTableSelectedRows)
               .filter((item) => { return item.type.internalName.toLowerCase() === "compte_des_billets_en_circulation.reconversion_billets_versement_des_eusko" })
               .reduce((memo, row) => { return memo + Math.abs(row.amount) }, Number(0))
               .value()
               
            var montantTotalReconversionsNumeriques = _.chain(this.state.historyTableSelectedRows)
               .filter((item) => { return item.type.internalName.toLowerCase() === "compte_d_adherent.reconversion_numerique" })
               .reduce((memo, row) => { return memo + Math.abs(row.amount) }, Number(0))
               .value()

            this.setState({montantTotalReconversionsBillets: montantTotalReconversionsBillets,
                           montantTotalReconversionsNumeriques: montantTotalReconversionsNumeriques},
                          this.validateForm)
        }
        else if (this.props.mode == 'banques/virement') {
            var montantTotalCotisations = _.chain(this.state.historyTableSelectedRows)
                .reduce((memo, item) => {
                    var resCotisations = _.filter(
                        item.customValues,
                            (j) => {
                                if (j.field.internalName == "montant_cotisations") {
                                    return j.decimalValue != "0.000000"
                                }
                                else {
                                    return false
                                }
                            }
                    )

                    if (_.isEmpty(resCotisations)) {
                        return Number(Number(memo) + Number(0)).toFixed(2)
                    }
                    else {
                        return Number(Number(memo) + Number(resCotisations[0].decimalValue)).toFixed(2)
                    }
                },
                Number(0))
                .value()

            var montantTotalVentes = _.chain(this.state.historyTableSelectedRows)
                .reduce((memo, item) => {
                    var resVentes = _.filter(
                        item.customValues,
                            (j) => {
                                if (j.field.internalName == "montant_ventes") {
                                    return j.decimalValue != "0.000000"
                                }
                                else {
                                    return false
                                }
                            }
                    )

                    if (_.isEmpty(resVentes)) {
                        return Number(Number(memo) + Number(0)).toFixed(2)
                    }
                    else {
                        return Number(Number(memo) + Number(resVentes[0].decimalValue)).toFixed(2)
                    }
                },
                Number(0))
                .value()

            var montantTotalBillet = _.chain(this.state.historyTableSelectedRows)
                .reduce((memo, item) => {
                    var resBillet = _.filter(
                        item.customValues,
                            (j) => {
                                if (j.field.internalName == "montant_changes_billet") {
                                    return j.decimalValue != "0.000000"
                                }
                                else {
                                    return false
                                }
                            }
                    )

                    if (_.isEmpty(resBillet)) {
                        return Number(Number(memo) + Number(0)).toFixed(2)
                    }
                    else {
                        return Number(Number(memo) + Number(resBillet[0].decimalValue)).toFixed(2)
                    }
                },
                Number(0))
                .value()

            var montantTotalNumerique = _.chain(this.state.historyTableSelectedRows)
                .reduce((memo, item) => {
                    var resNumerique = _.filter(
                        item.customValues,
                            (j) => {
                                if (j.field.internalName == "montant_changes_numerique") {
                                    return j.decimalValue != "0.000000"
                                }
                                else {
                                    return false
                                }
                            }
                    )

                    if (_.isEmpty(resNumerique)) {
                        return Number(Number(memo) + Number(0)).toFixed(2)
                    }
                    else {
                        return Number(Number(memo) + Number(resNumerique[0].decimalValue)).toFixed(2)
                    }
                },
                Number(0))
                .value()

            this.setState({montantTotalCotisations: montantTotalCotisations == "0.00" ? Number() : montantTotalCotisations,
                           montantTotalVentes: montantTotalVentes == "0.00" ? Number() : montantTotalVentes,
                           montantTotalBillet: montantTotalBillet == "0.00" ? Number() : montantTotalBillet,
                           montantTotalNumerique: montantTotalNumerique == "0.00" ? Number() : montantTotalNumerique},

                          this.validateForm)
        }
        else {
            this.validateForm()
        }
    },

    onSelectTableRow(row, isSelected, event) {
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
    },

    onSelectTableAll(isSelected, rows) {
        if (isSelected)
            this.setState({historyTableSelectedRows: rows}, this.computeAmounts)
        else
            this.setState({historyTableSelectedRows: Array()}, this.computeAmounts)
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

    submitCustomButton(data) {},

    submitForm(data) {
        this.disableButton()

        var postData = {}
        postData.selected_payments = this.state.historyTableSelectedRows

        if (this.props.mode == 'operations/depots-retraits') {
            postData.montant_total_depots = this.state.montantTotalDepots
            postData.montant_total_retraits = this.state.montantTotalRetraits
            postData.virement_montant = this.state.montantVirement
            postData.virement_vers_compte = this.state.virementVersCompte
        }
        else if (this.props.mode == 'operations/reconversions') {
            postData.montant_total_billets = this.state.montantTotalReconversionsBillets
            postData.montant_total_numerique = this.state.montantTotalReconversionsNumeriques
        }
        else if (this.props.mode == 'banques/virement') {
            postData.bank_name = this.props.bankName
            postData.montant_total_cotisations = this.state.montantTotalCotisations
            postData.montant_total_ventes = this.state.montantTotalVentes
            postData.montant_total_billet = this.state.montantTotalBillet
            postData.montant_total_numerique = this.state.montantTotalNumerique

        }

        var computeForm = (data) => {
            if (data.error) {
                if (data.error == 'error-system-not-enough-money-billet') {
                    this.refs.container.error(
                        __("Le compte dédié eusko billet n'a pas un solde suffisant pour réaliser cette opération."),
                        "",
                        {
                            timeOut: 15000,
                            extendedTimeOut: 15000,
                            closeButton:true
                        }
                    )
                }
                else if (data.error == 'error-system-not-enough-money-numerique') {
                    this.refs.container.error(
                        __("Le compte dédié eusko numérique n'a pas un solde suffisant pour réaliser cette opération."),
                        "",
                        {
                            timeOut: 15000,
                            extendedTimeOut: 15000,
                            closeButton:true
                        }
                    )
                }
            }
            else {
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

        if (this.props.mode == 'operations/reconversions') {
            var amountFormatter = (cell, row) => {
                // Cell is a string for now,
                // we need to cast it in a Number object to use the toFixed method.
                return Math.abs(Number(cell)).toFixed(2)
            }
        }
        else {
            var amountFormatter = (cell, row) => {
                // Cell is a string for now,
                // we need to cast it in a Number object to use the toFixed method.
                return Number(cell).toFixed(2)
            }
        }

        var dataTable = (
            <BootstrapTable
             data={this.state.historyTableData} striped={true} hover={true}
             selectRow={selectRowProp} tableContainerClass="react-bs-table-account-history"
             options={{noDataText: __("Rien à afficher.")}}
             >
                <TableHeaderColumn isKey={true} hidden={true} dataField="id">{__("ID")}</TableHeaderColumn>
                <TableHeaderColumn dataField="date" dataFormat={dateFormatter}>{__("Date")}</TableHeaderColumn>
                <TableHeaderColumn columnClassName="line-break" dataField="description">{__("Libellé")}</TableHeaderColumn>
                <TableHeaderColumn dataField="amount" dataFormat={amountFormatter}>{__("Montant")}</TableHeaderColumn>
            </BootstrapTable>
        )

        if (this.props.mode == 'operations/reconversions') {
            var customButton = (
                <div className="margin-top col-md-offset-1 col-md-1">
                    <input
                        name="submit"
                        data-eusko="entree-stock-submit"
                        type="submit"
                        defaultValue={__("Générer le fichier SEPA")}
                        className="btn btn-default"
                        formNoValidate={true}
                        onClick={this.submitCustomButton}
                        disabled={!this.state.canSubmit}
                    />
                </div>
            )
        }
        else {
            var customButton = null
        }

        if (this.props.mode == 'operations/depots-retraits') {
            var montantDepotsDiv = (
                <div className="row">
                    <div className="col-md-6 margin-top">
                        <label className="control-label col-md-4">{__("Montant total des dépôts") + " : "}</label>
                        <span className="col-md-8">{this.state.montantTotalDepots + " EUS"}</span>
                    </div>
                </div>
            )
            var montantRetraitsDiv = (
                <div className="row">
                    <div className="col-md-6">
                        <label className="control-label col-md-4">{__("Montant total des retraits") + " : "}</label>
                        <span className="col-md-8">{this.state.montantTotalRetraits + " EUS"}</span>
                    </div>
                </div>
            )

            if (this.state.virementVersCompte === null) {
                var messageVirement = <em>{__("Aucun")}</em>
            }
            else if (this.state.virementVersCompte === "numerique") {
                var messageVirement = this.state.montantVirement + __(" € du Compte dédié billet vers le Compte dédié numérique")
            }
            else if (this.state.virementVersCompte === "billet") {
                var messageVirement = this.state.montantVirement + __(" € du Compte dédié numérique vers le Compte dédié billet")
            }

            var montantVirementDiv = (
                <div className="row">
                    <div className="col-md-6">
                        <label className="control-label col-md-4">{__("Virement à réaliser") + " : "}</label>
                        <span className="col-md-8">
                            {messageVirement}
                        </span>
                    </div>
                </div>
            )

            var customInfo = (
                <div>
                    {montantDepotsDiv}
                    {montantRetraitsDiv}
                    {montantVirementDiv}
                </div>
            )

            var messageButton = __("Enregistrer")
        }
        else if (this.props.mode == 'banques/virement') {
            var montantCotisationsDiv = (
                <div className="row">
                    <div className="col-md-8 margin-top">
                        <label className="control-label col-md-4">{__("Virement vers le Compte de Gestion  - Cotisations") + " : "}</label>
                        <span className="col-md-8">{this.state.montantTotalCotisations + " €"}</span>
                    </div>
                </div>
            )
            var montantVentesDiv = (
                <div className="row">
                    <div className="col-md-8">
                        <label className="control-label col-md-4">{__("Virement vers le Compte de Gestion  - Ventes") + " : "}</label>
                        <span className="col-md-8">{this.state.montantTotalVentes + " €"}</span>
                    </div>
                </div>
            )
            var montantBilletDiv = (
                <div className="row">
                    <div className="col-md-8">
                        <label className="control-label col-md-4">{__("Virement vers le Compte dédié eusko billet") + " : "}</label>
                        <span className="col-md-8">{this.state.montantTotalBillet + " €"}</span>
                    </div>
                </div>
            )
            var montantNumeriqueDiv = (
                <div className="row">
                    <div className="col-md-8">
                        <label className="control-label col-md-4">{__("Virement vers le Compte dédié eusko numérique") + " : "}</label>
                        <span className="col-md-8">{this.state.montantTotalNumerique + " €"}</span>
                    </div>
                </div>
            )

            var customInfo = (
                <div>
                    {montantCotisationsDiv}
                    {montantVentesDiv}
                    {montantBilletDiv}
                    {montantNumeriqueDiv}
                </div>
            )

            var messageButton = __("Enregistrer")
        }
        else if (this.props.mode == 'operations/reconversions')
        {
            var montantTotalReconversionsBilletsDiv = (
                <div className="row">
                    <div className="col-md-6 margin-top">
                        <label className="control-label col-md-6">{__("Total des reconversions d'eusko billets") + " : "}</label>
                        <span className="col-md-6">
                            {this.state.montantTotalReconversionsBillets + " " + this.props.currency}
                        </span>
                    </div>
                </div>
            )

            var montantTotalReconversionsNumeriquesDiv = (
                <div className="row">
                    <div className="col-md-6">
                        <label className="control-label col-md-6">{__("Total des reconversions d'eusko numériques") + " : "}</label>
                        <span className="col-md-6">
                            {this.state.montantTotalReconversionsNumeriques + " " + this.props.currency}
                        </span>
                    </div>
                </div>
            )

            var customInfo = (
                <div>
                    {montantTotalReconversionsBilletsDiv}
                    {montantTotalReconversionsNumeriquesDiv}
                </div>
            )

            var messageButton = __("Enregistrer les virements")
        }
        else {
            var customInfo = null
            var messageButton = __("Enregistrer")
        }

        return (
            <div className="row-fluid">
                <div className="row-fluid">
                    <div className="col-md-12">
                        {dataTable}
                    </div>
                </div>
                {customInfo}
                <div className="row">
                    <div className="margin-top col-md-1 col-md-offset-1">
                        <input
                            name="submit"
                            data-eusko="entree-stock-submit"
                            type="submit"
                            defaultValue={messageButton}
                            className="btn btn-success"
                            formNoValidate={true}
                            onClick={this.submitForm}
                            disabled={!this.state.canSubmit}
                        />
                    </div>
                    {' '}
                    {customButton}
                </div>
                <ToastContainer ref="container"
                                toastMessageFactory={ToastMessageFactory}
                                className="toast-top-right toast-top-right-navbar"
                />
            </div>
        );
    }
})

var bankName = undefined
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
else if (window.location.pathname.toLowerCase().indexOf("operations/depots-retraits") != -1)
{
    // URL = operations/depots-retraits
    var propMode = "operations/depots-retraits"
    var propGetHistoryURL = getAPIBaseURL + "payments-available-depots-retraits/"
    var propNextURL =  "/operations"
    var propSaveURL =  getAPIBaseURL + "validate-depots-retraits/"
    var propTranslateTitle = __("Dépôts et retraits")
    var propCurrency = 'EUS / €'
}
else if (window.location.pathname.toLowerCase().indexOf("operations/reconversions") != -1)
{
    // URL = operations/reconversions
    var propMode = "operations/reconversions"
    var propGetHistoryURL = getAPIBaseURL + "payments-available-reconversions/"
    var propNextURL =  "/operations"
    var propSaveURL =  getAPIBaseURL + "validate-reconversions/"
    var propTranslateTitle = __("Reconversions")
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
            bankName={bankName}
    />,
    document.getElementById('generic-view')
)

ReactDOM.render(
    <NavbarTitle title={propTranslateTitle} />,
    document.getElementById('navbar-title')
)