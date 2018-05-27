import {
    fetchAuth,
    getAPIBaseURL,
    NavbarTitle,
} from 'Utils'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'node_modules/react-bootstrap-table/dist/react-bootstrap-table.min.css'

var {ToastContainer} = ReactToastr; // This is a React Element.
var ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation);

class Dons3PourcentPage extends React.Component {

    constructor(props) {
        super(props)

        // Default state
        this.state = {
            canSubmit: false,
            startDate: undefined,
            endDate: undefined,
            totalChanges: undefined,
            totalDons: undefined,
            dons: Array(),
        }
    }

    handleStartDateChange = (date) => {
        this.setState({startDate: date}, this.validateForm)
    }

    handleEndDateChange = (date) => {
        this.setState({endDate: date}, this.validateForm)
    }

    enableButton = () => {
        this.setState({canSubmit: true})
    }

    disableButton = () => {
        this.setState({canSubmit: false})
    }

    validateForm = () => {
        if (this.state.startDate && this.state.endDate) {
            this.enableButton()
        } else {
            this.disableButton()
        }
    }

    submitForm = (data) => {
        this.disableButton()

        var displayResult = (data) => {
            this.refs.container.success(
                __("Le calcul s'est déroulé correctement."),
                "",
                {
                    timeOut: 5000,
                    extendedTimeOut: 10000,
                    closeButton:true
                }
            )

            this.setState({
                totalChanges: data.montant_total_changes,
                totalDons: data.montant_total_dons,
                dons: data.dons.map(function(don) {
                    return {
                        id: don.association.num_adherent,
                        name: don.association.nom,
                        nb_parrainages: don.nb_parrainages,
                        don: don.montant_don
                    }
                })
            })
        }

        var promiseError = (err) => {
            // Error during request, or parsing NOK :(
            this.enableButton()

            console.error(this.props.url, err)
            this.refs.container.error(
                __("Une erreur s'est produite !"),
                "",
                {
                    timeOut: 5000,
                    extendedTimeOut: 10000,
                    closeButton:true
                }
            )
        }

        var url = getAPIBaseURL + "calculate-3-percent/?begin=" +
            moment(this.state.startDate).format("YYYY-MM-DD") + "&end=" +
            moment(this.state.endDate).format("YYYY-MM-DD")

        fetchAuth(url, 'GET', displayResult, null, promiseError)
    }

    render = () => {
        return (
            <div className="row">
                <Formsy.Form onValidSubmit={this.submitForm}>
                    <div className="col-md-10">
                        <label className="control-label">{__("Période :")}</label>
                        <div data-eusko="dons-3-pourcent-start-date">
                            <DatePicker
                                className="form-control"
                                selected={this.state.startDate}
                                onChange={this.handleStartDateChange}
                                locale="fr"
                            />
                        </div>
                        <div data-eusko="dons-3-pourcent-end-date">
                            <DatePicker
                                className="form-control"
                                selected={this.state.endDate}
                                onChange={this.handleEndDateChange}
                                locale="fr"
                            />
                        </div>
                    </div>
                    <div className="col-md-10">
                                <input
                                    name="submit"
                                    data-eusko="dons-3-pourcent-submit"
                                    type="submit"
                                    defaultValue={__("Valider")}
                                    className="btn btn-success"
                                    formNoValidate={true}
                                    disabled={!this.state.canSubmit}
                                />
                    </div>
                </Formsy.Form>
                <div className="col-md-10">
                    <div className="row">
                        <div className="col-sm-3 col-sm-offset-1">
                            <label>{__("Montant total du change d'euros en eusko :") + " "}
                                <span>{this.state.totalChanges}</span>
                            </label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-3 col-sm-offset-1">
                            <label>{__("Montant total du don de 3% :") + " "}
                                <span>{this.state.totalDons}</span>
                            </label>
                        </div>
                    </div>
                </div>
                <div className="col-md-10">
                    <div className="row">
                        <div className="col-md-12 col-md-offset-1">
                            <BootstrapTable data={this.state.dons} striped={true} hover={true}>
                                <TableHeaderColumn isKey={true} dataField="id" dataSort>{__("Numéro d'adhérent")}</TableHeaderColumn>
                                <TableHeaderColumn dataField="name" dataSort>{__("Association")}</TableHeaderColumn>
                                <TableHeaderColumn dataField="nb_parrainages" dataSort>{__("Nombre de parrainages")}</TableHeaderColumn>
                                <TableHeaderColumn dataField="don" dataSort>{__("Montant du don")}</TableHeaderColumn>
                            </BootstrapTable>
                        </div>
                    </div>
                </div>
                <ToastContainer ref="container"
                                toastMessageFactory={ToastMessageFactory}
                                className="toast-top-right toast-top-right-navbar" />
            </div>
        )
    }
}


ReactDOM.render(
    <Dons3PourcentPage />,
    document.getElementById('dons-3-pourcent')
)

ReactDOM.render(
    <NavbarTitle title={__("Dons 3%")} />,
    document.getElementById('navbar-title')
)
