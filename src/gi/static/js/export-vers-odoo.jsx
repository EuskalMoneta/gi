import {
    fetchAuth,
    getAPIBaseURL,
    NavbarTitle,
} from 'Utils'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import FileSaver from 'file-saver'

var {ToastContainer} = ReactToastr; // This is a React Element.
var ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation);

class ExportVersOdooPage extends React.Component {

    constructor(props) {
        super(props)

        // Default state
        this.state = {
            canSubmit: false,
            startDate: undefined,
            endDate: undefined,
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

        var saveFile = (blob) => {
            # Write the CSV file without BOM (else it cannot be
            # imported in Odoo).
            # see https://www.npmjs.com/package/file-saver
            FileSaver.saveAs(blob, 'export.csv', true)
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

        var url = getAPIBaseURL + "export-vers-odoo/?begin=" +
            moment(this.state.startDate).format("YYYY-MM-DD") + "&end=" +
            moment(this.state.endDate).format("YYYY-MM-DD")

        fetchAuth(url, 'GET', saveFile, null, promiseError, 'text/csv')
    }

    render = () => {
        return (
            <div className="row">
                <Formsy.Form onValidSubmit={this.submitForm}>
                    <div className="col-md-10">
                        <label className="control-label">{__("Période :")}</label>
                        <div data-eusko="export-vers-odoo-start-date">
                            <DatePicker
                                className="form-control"
                                selected={this.state.startDate}
                                onChange={this.handleStartDateChange}
                                locale="fr"
                            />
                        </div>
                        <div data-eusko="export-vers-odoo-end-date">
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
                                    data-eusko="export-vers-odoo-submit"
                                    type="submit"
                                    defaultValue={__("Valider")}
                                    className="btn btn-success"
                                    formNoValidate={true}
                                    disabled={!this.state.canSubmit}
                                />
                    </div>
                </Formsy.Form>
                <ToastContainer ref="container"
                                toastMessageFactory={ToastMessageFactory}
                                className="toast-top-right toast-top-right-navbar" />
            </div>
        )
    }
}


ReactDOM.render(
    <ExportVersOdooPage />,
    document.getElementById('export-vers-odoo')
)

ReactDOM.render(
    <NavbarTitle title={__("Export vers Odoo")} />,
    document.getElementById('navbar-title')
)
