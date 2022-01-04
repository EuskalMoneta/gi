import {
    fetchAuth,
    getAPIBaseURL,
    NavbarTitle,
    isPositiveNumeric,
} from 'Utils'
import {BootstrapTable, TableHeaderColumn} from "react-bootstrap-table";

const {
    Input,
    Row
} = FRC

const {
    ToastContainer
} = ReactToastr
const ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation)

Formsy.addValidationRule('isPositiveNumeric', isPositiveNumeric)


class ChangeVirementMultiplePage extends React.Component {

    constructor(props) {
        super(props)

        // Default state
        this.state = {
            canSubmit: false,
            selectedFile: null,
            resCSV: [],
            nombreOperation: 0,
            nombreEchec: 0
        }
    }

    enableButton = () => {
        this.setState({canSubmit: true})
    }

    disableButton = () => {
        this.setState({canSubmit: false})
    }

    validateForm = () => {
        this.enableButton()
    }

    submitForm = (data) => {
        this.disableButton()

        var promise = (response) => {
            var data = []
            var nbOp = 0
            var nbEchec = 0
            response.forEach((item, index) =>{
                if(item["status"] === 1) {
                    nbOp++
                } else {
                    data.push([
                        item["member_name"],
                        item["member_login"],
                        item["amount"],
                        item["description"],
                        item["message"]
                    ])
                    nbEchec++
                }
            })
            this.setState({
                nombreOperation: nbOp,
                nombreEchec: nbEchec,
                resCSV: data
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

        var postData = []
        this.state.resCSV.forEach((item, index) => {

            if(item[0] != ""){
                var ope = {}
                ope.member_name = item[0]
                ope.member_login = item[1]
                ope.amount = Number(item[2].replace(',', '.'))
                ope.description = item[3]
                postData.push(ope)
            }

        })
        var url = getAPIBaseURL + "change-par-virement/"
        fetchAuth(url, 'POST', promise, postData, promiseError)
    }

    completeFn = (results) => {
        this.setState({
            resCSV: results.data.slice(1)
        })
    }

    errorFn = (err, file) => {
        console.log("ERROR:", err, file);
    }

    onChangeHandler=event=>{
        papaparse.parse(event.target.files[0], {
                delimiter: "",
                newline: "",
                complete: this.completeFn,
                error: this.errorFn
            }
        )
        this.setState({
            selectedFile: event.target.files[0],
            loaded: 0,
        }, this.validateForm)
    }

    render = () => {

        return (
            <div className="row">
                <Formsy.Form
                    className="form-horizontal"
                    onValidSubmit={this.submitForm}>
                    <Row layout="horizontal">
                        <input
                            name="file"
                            data-eusko="change-virement-fichier"
                            type="file"
                            onChange={this.onChangeHandler}
                            required/>
                    </Row>

                    <div className="row">
                        <div className="col-md-6 margin-top">
                            <label className="col-md-12">{__("Nb d'opérations réussies") + " : "} {this.state.nombreOperation}</label><br/>
                            <label className="col-md-12">{__("Nb d'opérations en erreur") + " : "} {this.state.nombreEchec}</label>
                        </div>
                    </div>

                    <div className="row margin-right">
                        <div className="col-md-12 col-md-offset-1">
                            <BootstrapTable
                                data={this.state.resCSV} striped={true} hover={true} pagination={true}
                                selectRow={{mode: 'none'}} tableContainerClass="react-bs-table-account-history"
                                options={{noDataText: __("Rien à afficher."), hideSizePerPage: true, sizePerPage: 20}}
                            >
                                <TableHeaderColumn isKey={true} hidden={true} dataField="id">{__("ID")}</TableHeaderColumn>
                                <TableHeaderColumn dataField="0">{__("Nom")}</TableHeaderColumn>
                                <TableHeaderColumn dataField="1">{__("Numéro d'adhérent")}</TableHeaderColumn>
                                <TableHeaderColumn dataField="2" >{__("Montant")}</TableHeaderColumn>
                                <TableHeaderColumn dataField="3">{__("Libellé de l'opération")}</TableHeaderColumn>
                                <TableHeaderColumn dataField="4">{__("Message")}</TableHeaderColumn>
                            </BootstrapTable>
                        </div>
                    </div>

                    <Row layout="horizontal">
                        <div className="col-md-6 margin-top">
                            <input
                                name="submit"
                                data-eusko="change-virement-submit"
                                type="submit"
                                defaultValue={__("Valider")}
                                className="btn btn-success"
                                formNoValidate={true}
                                disabled={!this.state.canSubmit}
                            />
                        </div>
                    </Row>
                </Formsy.Form>

                <ToastContainer ref="container"
                                toastMessageFactory={ToastMessageFactory}
                                className="toast-top-right toast-top-right-navbar" />
            </div>
        )
    }
}


ReactDOM.render(
    <ChangeVirementMultiplePage />,
    document.getElementById('change-virement-multiple')
)

ReactDOM.render(
    <NavbarTitle title={__("Change par virement multiple")} />,
    document.getElementById('navbar-title')
)
