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


class ChangeVirementPage extends React.Component {

    constructor(props) {
        super(props)

        // Default state
        this.state = {
            canSubmit: false,
            selectedFile: null,
            resCSV: [],
            resFinalCSV: [],
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
            response.forEach((item, index) =>{
                var ope = []
                   ope.push(item["member_login"])
                   ope.push(item["amount"])
                   ope.push(item["description"])
                   ope.push(item["message"])

                   data.push(ope)
            })
            this.state.resCSV = data
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
                   ope.member_login = item[0]
                   ope.amount = item[1]
                   ope.description = item[2]
                   console.log("    item:", item[0]);

                   postData.push(ope)
               }
        })
        var url = getAPIBaseURL + "change-par-virement/"
        fetchAuth(url, 'POST', promise, postData, promiseError)

        this.enableButton()

    }

    completeFn = (results) => {

        var stepped = 0;
        var rowCount = 0;
        var errorCount = 0;
        var firstError = undefined;

        if (results && results.errors)
        {
            if (results.errors)
            {
                errorCount = results.errors.length;
                firstError = results.errors[0];
            }
            if (results.data && results.data.length > 0)
                rowCount = results.data.length;
        }

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
             data={this.state.resCSV} striped={true} hover={true} pagination={true}
             selectRow={{mode: 'none'}} tableContainerClass="react-bs-table-account-history"
             options={{noDataText: __("Rien à afficher."), hideSizePerPage: true, sizePerPage: 20}}
             >
                <TableHeaderColumn isKey={true} hidden={true} dataField="id">{__("ID")}</TableHeaderColumn>
                <TableHeaderColumn dataField="0">{__("Numéro d'adhérent")}</TableHeaderColumn>
                <TableHeaderColumn dataField="1" >{__("Montant")}</TableHeaderColumn>
                <TableHeaderColumn dataField="2">{__("Libellé de l'opération")}</TableHeaderColumn>
                <TableHeaderColumn dataField="3">{__("état")}</TableHeaderColumn>
            </BootstrapTable>
        )

        var historyTableFinal = (
            <BootstrapTable
             data={this.state.resFinalCSV} striped={true} hover={true} pagination={true}
             selectRow={{mode: 'none'}} tableContainerClass="react-bs-table-account-history"
             options={{noDataText: __("Rien à afficher."), hideSizePerPage: true, sizePerPage: 20}}
             >
                <TableHeaderColumn isKey={true} hidden={true} dataField="id">{__("ID")}</TableHeaderColumn>
                <TableHeaderColumn dataField="0">{__("Numéro d'adhérent")}</TableHeaderColumn>
                <TableHeaderColumn dataField="1" >{__("Montant")}</TableHeaderColumn>
                <TableHeaderColumn dataField="2">{__("Libellé de l'opération")}</TableHeaderColumn>
                <TableHeaderColumn dataField="3">{__("état")}</TableHeaderColumn>
            </BootstrapTable>
        )

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
                    <Row layout="horizontal">
                        <input
                            name="submit"
                            data-eusko="change-virement-submit"
                            type="submit"
                            defaultValue={__("Valider")}
                            className="btn btn-success"
                            formNoValidate={true}
                            disabled={!this.state.canSubmit}
                        />
                    </Row>
                </Formsy.Form>
                 <div className="row margin-right">
                        <div className="col-md-12 col-md-offset-1">
                            {historyTable}
                        </div>
                    </div>
                <div className="row margin-right">
                        <div className="col-md-12 col-md-offset-1">
                            {historyTableFinal}
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
    <ChangeVirementPage />,
    document.getElementById('change-virement')
)

ReactDOM.render(
    <NavbarTitle title={__("Change par virement")} />,
    document.getElementById('navbar-title')
)
