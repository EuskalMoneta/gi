import {
    fetchAuth,
    getAPIBaseURL,
    isBdcIdEusko,
    NavbarTitle,
} from 'Utils'

const {
    Input,
    Row
} = FRC

import classNames from 'classnames'

const {
    ToastContainer
} = ReactToastr
const ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation)

Formsy.addValidationRule('isBdcIdEusko', isBdcIdEusko)

const BdcCreateForm = React.createClass({

    mixins: [FRC.ParentContextMixin],

    propTypes: {
        children: React.PropTypes.node
    },

    render() {
        return (
            <Formsy.Form
                className={this.getLayoutClassName()}
                {...this.props}
                ref="bdc-add"
            >
                {this.props.children}
            </Formsy.Form>
        );
    }
});

class BdcCreatePage extends React.Component {

    constructor(props) {
        super(props);

        // Default state
        this.state = {
            canSubmit: false,
        }
    }

    enableButton = () => {
        this.setState({canSubmit: true})
    }

    disableButton = () => {
        this.setState({canSubmit: false})
    }

    submitForm = (data) => {
        this.disableButton()

        var computeForm = (data) => {
            this.refs.container.success(
                __("L'enregistrement s'est déroulé correctement."),
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
            console.error(this.props.url, err)
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
        fetchAuth(this.props.url, this.props.method, computeForm, data, promiseError)
    }

    render = () =>
    {
        return (
            <div className="row">
                <BdcCreateForm
                    onValidSubmit={this.submitForm}
                    onInvalid={this.disableButton}
                    onValid={this.enableButton}
                    ref="bdc-add">
                    <fieldset>
                         <Input
                            name="login"
                            data-eusko="bdc-add-login"
                            value=""
                            label={__("Code")}
                            type="text"
                            placeholder={__("Code du nouveau bureau de change")}
                             validations="isBdcIdEusko"
                             validationErrors={{
                                 isBdcIdEusko: __("Ceci n'est pas un identifiant BDC Eusko valide.")
                             }}
                            elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-5']}
                            required
                        />
                         <Input
                            name="name"
                            data-eusko="bdc-add-name"
                            value=""
                            label={__("Nom")}
                            type="text"
                            placeholder={__("Nom du nouveau bureau de change")}
                            validations="isExisty"
                            validationErrors={{
                                isExisty: __("Ce champ ne peut être vide."),
                            }}
                            elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-5']}
                            required
                        />
                    </fieldset>
                    <fieldset>
                        <Row layout="horizontal">
                            <input
                                name="submit"
                                data-eusko="bdc-add-submit"
                                type="submit"
                                defaultValue={__("Enregistrer")}
                                className="btn btn-success"
                                formNoValidate={true}
                                disabled={!this.state.canSubmit}
                            />
                        </Row>
                    </fieldset>
                </BdcCreateForm>
                <ToastContainer ref="container"
                                toastMessageFactory={ToastMessageFactory}
                                className="toast-top-right toast-top-right-navbar" />
            </div>
        );
    }
}


ReactDOM.render(
    <BdcCreatePage url={getAPIBaseURL + "bdc/"} method="POST" />,
    document.getElementById('bdc-add')
)

ReactDOM.render(
    <NavbarTitle title={__("Nouveau Bureau de change")} />,
    document.getElementById('navbar-title')
)