import {
    fetchAuth,
    getAPIBaseURL,
    NavbarTitle,
} from 'Utils'

import {
    Modal,
    ModalHeader,
    ModalTitle,
    ModalClose,
    ModalBody,
    ModalFooter
} from 'react-modal-bootstrap'

const {
    ToastContainer
} = ReactToastr
const ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation)

class BDCManage extends React.Component {
    constructor(props) {
        super(props)


        // Default state
        this.state = {
            bdcID: document.getElementById("bdc_id").value,
            bdc: undefined,
            stockBilletsData: undefined,
            caisseEuroData: undefined,
            caisseEuskoData: undefined,
            retourEuskoData: undefined,
        }

        // Get Accounts Summaries:
        // Stock de billets: stock_de_billets_bdc
        // Caisse euros: caisse_euro_bdc
        // Caisse eusko: caisse_eusko_bdc
        // Retour eusko: retours_d_eusko_bdc

        var computeManagerData = (data) => {
            this.setState({
                stockBilletsData: _.filter(data, (item) => { return item.type.id == "stock_de_billets_bdc" })[0],
                caisseEuroData: _.filter(data, (item) => { return item.type.id == "caisse_euro_bdc" })[0],
                caisseEuskoData: _.filter(data, (item) => { return item.type.id == "caisse_eusko_bdc" })[0],
                retourEuskoData: _.filter(data, (item) => { return item.type.id == "retours_d_eusko_bdc" })[0]
            })
        }
        fetchAuth(getAPIBaseURL + "accounts-summaries/" + this.state.bdcID, 'get', computeManagerData)
    }

    render() {
        return (
            <div className="col-md-10">
                <DisplayBDC />
                <StockBillets data={this.state.stockBilletsData} bdcID={this.state.bdcID} />
                <CaisseEuro data={this.state.caisseEuroData} bdcID={this.state.bdcID} />
                <CaisseEusko data={this.state.caisseEuskoData} bdcID={this.state.bdcID} />
                <RetourEusko data={this.state.retourEuskoData} bdcID={this.state.bdcID} />
            </div>
        )
    }
}

var DisplayBDC = React.createClass({
    getInitialState() {
        return {
            bdcID: document.getElementById("bdc_id").value,
            bdcName: '',
            isModalOpen: false,
        }
    },

    componentDidMount() {
        // Get bdc data
        var computeBdcData = (bdc) => {
            this.setState({bdcName: bdc.lastname})
        }
        fetchAuth(getAPIBaseURL + "user-data/?username=" + this.state.bdcID, 'get', computeBdcData)
    },

    handleDeleteBDC() {
        if (!this.state.bdcID)
        {
            this.hideModal()

            this.refs.container.error(
                __("Une erreur s'est produite lors de la fermeture du BDC !"),
                "",
                {
                    timeOut: 5000,
                    extendedTimeOut: 10000,
                    closeButton:true
                }
            )
        }

        // delete Bdc promise
        var deleteBdcPromise = (bdc) => {
            this.hideModal()

            this.refs.container.success(
                __("La fermeture du BDC s'est déroulée correctement."),
                "",
                {
                    timeOut: 5000,
                    extendedTimeOut: 10000,
                    closeButton:true
                }
            )

            setTimeout(() => window.location.assign("/bdc"), 3000)
        }

        var promiseError = (err) => {
            // Error during request, or parsing NOK :(
            this.hideModal()

            console.error(getAPIBaseURL + "bdc/" + this.state.bdcID + "/", 'DELETE', err)
            this.refs.container.error(
                __("Une erreur s'est produite lors de la fermeture du BDC !"),
                "",
                {
                    timeOut: 5000,
                    extendedTimeOut: 10000,
                    closeButton:true
                }
            )
        }
        fetchAuth(getAPIBaseURL + "bdc/" + this.state.bdcID + "/", 'DELETE', deleteBdcPromise, null, promiseError)
    },

    openModal() {
        this.setState({isModalOpen: true})
    },

    hideModal() {
        this.setState({isModalOpen: false})
    },

    render() {
        return (
            <div className="row margin-bottom">
                <Modal isOpen={this.state.isModalOpen} onRequestHide={this.hideModal}>
                    <ModalHeader>
                        <ModalClose onClick={this.hideModal}/>
                        <ModalTitle>{__("Fermer un bureau de change ?")}</ModalTitle>
                    </ModalHeader>
                    <ModalBody>
                        <p>{__("Voulez-vous fermer le bureau de change") + " " + this.state.bdcID + " - " + this.state.bdcName + " ?"}</p>
                    </ModalBody>
                    <ModalFooter>
                        <button className="btn btn-default" onClick={this.hideModal}>
                          {__("Annuler")}
                        </button>
                        <button onClick={this.handleDeleteBDC} className="btn btn-danger">
                          {__("Fermer ce BDC")}
                        </button>
                    </ModalFooter>
                </Modal>
                <ToastContainer ref="container"
                                toastMessageFactory={ToastMessageFactory}
                                className="toast-top-right toast-top-right-navbar"
                />
                <div className="col-sm-6">
                    <label className="control-label col-sm-6">{__("Bureau de change") + " : "}</label>
                    <span>{this.state.bdcID + " - " + this.state.bdcName}</span>
                </div>
                <div className="col-sm-6">
                    <a onClick={this.openModal} className="btn btn-danger">{__("Fermer ce BDC")}</a>
                </div>
            </div>
        )
    }
})

var StockBillets = React.createClass({
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
                    <h3 className="panel-title">{__("Stock de billets — Eusko disponibles pour le change")}</h3>
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-md-8 col-sm-4">
                            <label className="control-label col-md-3">{__("Solde")} :</label>&nbsp;
                            <span className="col-md-5">{this.state.balance + " " + this.state.currency}</span>
                        </div>
                        <div className="col-md-4">
                            <a href={"/bdc/manage/" + this.props.bdcID + "/history/stock-billets"} className="btn btn-default">{__("Historique")}</a>
                        </div>
                    </div>
                    <div className="row margin-top">
                        <div className="col-md-offset-2 col-md-2 col-sm-4">
                            <a href={"/bdc/manage/" + this.props.bdcID + "/entree-stock"} className="btn btn-info">{__("Entrée")}</a>
                        </div>
                        <div className="col-md-offset-2 col-md-2 col-sm-4">
                            <a href={"/bdc/manage/" + this.props.bdcID + "/sortie-stock"} className="btn btn-default">{__("Sortie")}</a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})

var CaisseEuro = React.createClass({
    getInitialState() {
        return {
            balance: '',
            currency: '',
            cash: '',
            cheques: '',
        }
    },

    componentDidMount() {
        var computeData = (data) => {
            // Si un paiement n'a pas de champ personnalisé "Mode de paiement",
            // alors il faut le compter dans les espèces
            // (c'est le cas pour les paiements de type "Paiement de Banque de dépôt vers Caisse € BDC").
            var cheques_res = _.filter(data.result.pageItems,
                (i) => {
                    // Firstly, I need to verify if i.customValues.field.internalName == "mode_de_paiement"
                    // If this is true, I have to verify that a field is = Chèque
                    var res = _.filter(
                        i.customValues,
                            (j) => {
                                if (j.field.internalName == 'mode_de_paiement') {
                                    return j.enumeratedValues[0].value == 'Chèque'
                                }
                                else {
                                    return false
                                }
                            }
                    )

                    if (_.isEmpty(res)) {
                        return false
                    }
                    else {
                        return true
                    }
                })

            var cash_res = _.filter(data.result.pageItems,
                (i) => {
                    // Firstly, I need to verify if i.customValues.field.internalName == "mode_de_paiement"
                    // If this is true, I have to verify that a field is = Espèces
                    var res = _.filter(
                        i.customValues,
                            (j) => {
                                if (j.field.internalName == 'mode_de_paiement') {
                                    return j.enumeratedValues[0].value == 'Espèces'
                                }
                                else {
                                    return false
                                }
                            }
                    )

                    if (_.isEmpty(res)) {
                        return false
                    }
                    else {
                        return true
                    }
                })

            this.setState({cash: _.reduce(cash_res,
                                          (memo, row) => {
                                            return memo + Number(row.amount)
                                          }, Number(0)),
                           cheques: _.reduce(cheques_res,
                                             (memo, row) => {
                                                return memo + Number(row.amount)
                                             }, Number(0))
            })
        }
        fetchAuth(getAPIBaseURL +
                  "accounts-history/?account_type=caisse_euro_bdc&" +
                  "filter=a_remettre_a_euskal_moneta&" +
                  "direction=CREDIT&login_bdc=" + this.props.bdcID,
                  'get', computeData)
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
                    <h3 className="panel-title">{__("Caisse € — Euros des changes et cotisations")}</h3>
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-md-8 col-sm-4">
                            <label className="control-label col-md-3">{__("Solde")} :</label>&nbsp;
                            <span className="col-md-5">{this.state.balance + " " + this.state.currency}</span>
                        </div>
                        <div className="col-md-4">
                            <a href={"/bdc/manage/" + this.props.bdcID + "/history/caisse-euro"} className="btn btn-default">{__("Historique")}</a>
                        </div>
                    </div>
                     <div className="row">
                        <div className="col-md-8 col-sm-4">
                            <label className="control-label col-md-3">{__("Espèces")} :</label>&nbsp;
                            <span className="col-md-5">{this.state.cash + " " + this.state.currency}</span>
                        </div>
                    </div>
                    <div className="row margin-top">
                        <div className="col-md-8 col-sm-4">
                            <label className="control-label col-md-3">{__("Chèques")} :</label>&nbsp;
                            <span className="col-md-5">{this.state.cheques + " " + this.state.currency}</span>
                        </div>
                    </div>
                    <div className="row margin-top">
                        <div className="col-md-offset-2 col-md-2 col-sm-4">
                            <a href={"/bdc/manage/" + this.props.bdcID + "/bank-deposit"} className="btn btn-info">{__("Dépôt en banque")}</a>
                        </div>
                        <div className="col-md-offset-2 col-md-2 col-sm-4">
                            <a href={"/bdc/manage/" + this.props.bdcID + "/cash-deposit"} className="btn btn-default">{__("Remise d'espèces")}</a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})

var CaisseEusko = React.createClass({
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
                    <h3 className="panel-title">{__("Caisse eusko — Eusko des cotisations")}</h3>
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-md-8 col-sm-4">
                            <label className="control-label col-md-3">{__("Solde")} :</label>&nbsp;
                            <span className="col-md-5">{this.state.balance + " " + this.state.currency}</span>
                        </div>
                        <div className="col-md-4">
                            <a href={"/bdc/manage/" + this.props.bdcID + "/history/caisse-eusko"} className="btn btn-default">{__("Historique")}</a>
                        </div>
                    </div>
                    <div className="row margin-top">
                        <div className="col-md-offset-2 col-md-2 col-sm-4">
                            <a href={"/bdc/manage/" + this.props.bdcID + "/sortie-caisse-eusko"} className="btn btn-info">{__("Sortie")}</a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})

var RetourEusko = React.createClass({
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
                    <h3 className="panel-title">{__("Retours d'eusko — Eusko retournés pour être reconvertis en €")}</h3>
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-md-8 col-sm-4">
                            <label className="control-label col-md-3">{__("Solde")} :</label>&nbsp;
                            <span className="col-md-5">{this.state.balance + " " + this.state.currency}</span>
                        </div>
                        <div className="col-md-4">
                            <a href={"/bdc/manage/" + this.props.bdcID + "/history/retour-eusko"} className="btn btn-default">{__("Historique")}</a>
                        </div>
                    </div>
                    <div className="row margin-top">
                        <div className="col-md-offset-2 col-md-2 col-sm-4">
                            <a href={"/bdc/manage/" + this.props.bdcID + "/sortie-retour-eusko"} className="btn btn-info">{__("Sortie")}</a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})


ReactDOM.render(
    <BDCManage />,
    document.getElementById('bdc-show')
)

ReactDOM.render(
    <NavbarTitle title={__("Gestion BDC")} />,
    document.getElementById('navbar-title')
)