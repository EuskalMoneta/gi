import {
    fetchAuth,
    getAPIBaseURL,
    NavbarTitle,
} from 'Utils'

const {
    Input,
    RadioGroup,
    Row
} = FRC

const {
    ToastContainer
} = ReactToastr
const ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation)

class ResilierAdherentPage extends React.Component {

    constructor(props) {
        super(props)

        // Default state
        this.state = {
            canSubmit: false,
            memberId: '',
            memberName: '',
            cessationOfActivity: '0',
            terminationReason: '',
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
                if (member['login'][0] == 'E' || member['login'][0] == 'T') {
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
        if (this.state.memberId && this.state.memberName) {
            this.enableButton()
        } else {
            this.disableButton()
        }
    }

    submitForm = (data) => {
        this.disableButton()

        var postData = {}
        postData.member_login = this.state.memberId
        postData.cessation_of_activity = this.state.cessationOfActivity
        postData.termination_reason = this.state.terminationReason

        var promise = (response) => {
            this.refs.container.success(
                __("La résiliation s'est déroulée correctement."),
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

        var url = getAPIBaseURL + "resilier-adherent/"
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
                        data-eusko="resilier-adherent-member-id"
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
                        data-eusko="resilier-adherent-member-name"
                        value={this.state.memberName}
                        label={__("Nom")}
                        type="text"
                        elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-5']}
                        required
                        readOnly
                    />
                    <RadioGroup
                        name="cessationOfActivity"
                        data-eusko="resilier-adherent-cessation-of-activity"
                        value={this.state.cessationOfActivity}
                        onChange={this.handleChange}
                        type="inline"
                        label={__("Cessation d'activité")}
                        options={[{value: '1', label: __('Oui')},
                                  {value: '0', label: __('Non')}
                        ]}
                        elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-6']}
                        required={this.state.memberId[0]=='Z'}
                        disabled={this.state.memberId[0]!='Z'}
                    />
                    <Input
                        name="terminationReason"
                        data-eusko="resilier-adherent-termination-reason"
                        value={this.state.terminationReason}
                        label={__("Raison de la résiliation")}
                        type="text"
                        elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-5']}
                        onBlur={this.handleBlur}
                        onChange={this.handleChange}

                    />
                    <Row layout="horizontal">
                        <input
                            name="submit"
                            data-eusko="resilier-adherent-submit"
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
    <ResilierAdherentPage />,
    document.getElementById('resilier-adherent')
)

ReactDOM.render(
    <NavbarTitle title={__("Résilier un.e adhérent.e")} />,
    document.getElementById('navbar-title')
)
