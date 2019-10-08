import {
    fetchAuth,
    getAPIBaseURL,
    NavbarTitle,
    isPositiveNumeric,
} from 'Utils'

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
            memberId: '',
            memberName: '',
            bankTransferReference: '',
            amount: '',
            description: 'Change par virement',
        }
    }

    enableButton = () => {
        this.setState({canSubmit: true})
    }

    disableButton = () => {
        this.setState({canSubmit: false})
    }

    handleMemberIdChange = (name, value) => {
        if (value.length == 6) {
            // On fait une requête pour avoir le nom de l'adhérent-e
            var url = getAPIBaseURL + "members/?login=" + value.toUpperCase()
            var promise = (response) => {
                var member = response[0]
                var name = ''
                if (member['login'][0] == 'E') {
                    name = member['firstname'] + ' ' + member['lastname']
                } else {
                    name = member['company']
                }
                this.setState({
                    memberId: member['login'],
                    memberName: name,
                    bankTransferReference: moment().format() + '-' + member['login']
                }, this.validateForm)
            }
            fetchAuth(url, 'GET', promise)
        } else {
            this.setState({memberName: ''})
        }
    }

    handleChange = (name, value) => {
        this.setState({[name]: value}, this.validateForm)
    }

    validateForm = () => {
        if (this.state.memberId && this.state.memberName
            && this.state.bankTransferReference
            && this.state.amount && isPositiveNumeric(null, this.state.amount)
            && this.state.description) {
            this.enableButton()
        } else {
            this.disableButton()
        }
    }

    submitForm = (data) => {
        this.disableButton()

        var postData = {}
        postData.member_login = this.state.memberId
        postData.bank_transfer_reference = this.state.bankTransferReference
        postData.amount = this.state.amount
        postData.description = this.state.description

        var promise = (response) => {
            this.refs.container.success(
                __("L'enregistrement s'est déroulé correctement."),
                "",
                {
                    timeOut: 5000,
                    extendedTimeOut: 10000,
                    closeButton:true
                }
            )

            setTimeout(() => window.location.assign('/operations'), 3000)
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

        var url = getAPIBaseURL + "change-par-virement/"
        fetchAuth(url, 'POST', promise, postData, promiseError)
    }

    render = () => {
        return (
            <div className="row">
                <Formsy.Form
                    className="form-horizontal"
                    onValidSubmit={this.submitForm}>
                    <Input
                        name="memberId"
                        data-eusko="change-virement-member-id"
                        value={this.state.memberId}
                        label={__("Numéro d'adhérent-e")}
                        type="text"
                        validations="minLength:6,maxLength:6"
                        validationErrors={{
                            minLength: __("Le numéro d'adhérent-e doit comporter 6 caractères."),
                            maxLength: __("Le numéro d'adhérent-e doit comporter 6 caractères."),
                        }}
                        elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-5']}
                        onBlur={this.handleBlur}
                        onChange={this.handleMemberIdChange}
                        required
                    />
                    <Input
                        name="memberName"
                        data-eusko="change-virement-member-name"
                        value={this.state.memberName}
                        label={__("Nom")}
                        type="text"
                        elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-5']}
                        required
                        readOnly
                    />
                    <Input
                        name="bankTransferReference"
                        data-eusko="change-virement-bank-transfer-reference"
                        value={this.state.bankTransferReference}
                        label={__("Référence interne")}
                        type="text"
                        elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-5']}
                        onBlur={this.handleBlur}
                        onChange={this.handleChange}
                        required
                    />
                    <Input
                        name="amount"
                        data-eusko="change-virement-amount"
                        value={this.state.amount}
                        label={__("Montant")}
                        type="number"
                        validations="isPositiveNumeric"
                        validationErrors={{
                            isPositiveNumeric: __("Montant invalide.")
                        }}
                        elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-5']}
                        onBlur={this.handleBlur}
                        onChange={this.handleChange}
                        required
                    />
                    <Input
                        name="description"
                        data-eusko="change-virement-description"
                        value={this.state.description}
                        label={__("Libellé")}
                        type="text"
                        elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-5']}
                        onBlur={this.handleBlur}
                        onChange={this.handleChange}
                        required
                    />
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
