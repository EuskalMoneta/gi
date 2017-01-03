import {
    fetchAuth,
    getAPIBaseURL,
    isPositiveNumeric,
    NavbarTitle,
    SelectizeUtils
} from 'Utils'

const {
    Input,
    Textarea,
    Row
} = FRC

import ReactSelectize from 'react-selectize'
const SimpleSelect = ReactSelectize.SimpleSelect

import classNames from 'classnames'

const {
    ToastContainer
} = ReactToastr
const ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation)

Formsy.addValidationRule('isPositiveNumeric', isPositiveNumeric)

const SortieCoffreForm = React.createClass({

    mixins: [FRC.ParentContextMixin],

    propTypes: {
        children: React.PropTypes.node
    },

    render() {
        return (
            <Formsy.Form
                className={this.getLayoutClassName()}
                {...this.props}
                ref="sortiecoffre"
            >
                {this.props.children}
            </Formsy.Form>
        );
    }
});

class SortieCoffrePage extends React.Component {

    constructor(props) {
        super(props);

        // Default state
        this.state = {
            canSubmit: false,
            porteur: '',
            porteurList: '',
            bdcName: '',
            bdcDest: '',
            bdcList: undefined,
            amountInvalid: true,
            description: this.props.textarea_description,
        }

        // Get porteurList data
        var computePorteurListData = (porteurList) => {
            this.setState({porteurList: _.sortBy(porteurList, function(item){ return item.label })})
        }
        fetchAuth(getAPIBaseURL + "porteurs-eusko/", 'get', computePorteurListData)

        // Get current bdc name
        var computeData = (data) => {
            this.setState({bdcName: data})
        }
        fetchAuth(getAPIBaseURL + "bdc-name/", 'get', computeData)

        // Get bdcList
        var computeBdcList = (data) => {
        var bdcList = _.chain(data.results)
                        .map((item) => {
                            return {label: item.label.replace(/ \(BDC\)/g, '')
                                           + " (" + item.shortLabel.replace(/_BDC/g, '') + ")",
                                    value: item.value, sourceLabel: item.label, sourceShortLabel: item.shortLabel}
                        })
                        .sortBy((item) => {return item.login})
                        .value()

            this.setState({bdcList: bdcList})
        }
        fetchAuth(getAPIBaseURL + "bdc/", 'get', computeBdcList)
    }

    // porteur
    porteurOnValueChange = (item) => {
        this.setState({porteur: item}, this.validateForm)
    }

    // porteur
    bdcDestOnValueChange = (item) => {
        this.setState({bdcDest: item,
                       description: this.props.textarea_description + " - "
                                    + item.sourceShortLabel.replace(/_BDC/g, '') + " - "
                                    + item.sourceLabel.replace(/ \(BDC\)/g, '')},
                      this.validateForm)
    }

    onFormChange = (event, value) => {
        if (event == 'amount')
            this.setState({[event]: value}, this.validateAmount)
        else
            this.setState({[event]: value}, this.validateForm)
    }

    enableButton = () => {
        this.setState({canSubmit: true})
    }

    disableButton = () => {
        this.setState({canSubmit: false})
    }

    validateAmount = () => {
        if (this.state.amount)
        {
            if (isPositiveNumeric(null, this.state.amount)) {
                this.setState({amountInvalid: false}, this.validateForm)
            }
            else {
                this.setState({amountInvalid: true}, this.validateForm)
            }
        }
        else
            this.setState({amountInvalid: true}, this.validateForm)
    }

    validateForm = () => {
        if (this.state.porteur && this.state.bdcDest && this.state.description
            && (this.state.amount && !this.state.amountInvalid))
        {
            this.enableButton()
        }
        else
            this.disableButton()
    }

    submitForm = (data) => {
        this.disableButton()

        var postData = {}
        postData.amount = this.state.amount
        postData.porteur = this.state.porteur.value
        postData.bdc_dest = this.state.bdcDest.value
        postData.description = this.state.description

        var computeForm = (response) => {
            this.refs.container.success(
                __("L'enregistrement s'est déroulé correctement."),
                "",
                {
                    timeOut: 5000,
                    extendedTimeOut: 10000,
                    closeButton:true
                }
            )

            setTimeout(() => window.location.assign('/coffre'), 3000)
        }

        var promiseError = (err) => {
            // Error during request, or parsing NOK :(
            this.enableButton()

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
        fetchAuth(this.props.url, 'POST', computeForm, postData, promiseError)
    }

    render = () => {
        var divAmountClass = classNames({
            'form-group row': true,
            'has-error has-feedback': this.state.amountInvalid,
        })

        var reactSelectizeErrorClass = classNames({
            'has-error has-feedback': this.state.amountInvalid,
        })

        return (
            <div className="row">
                <SortieCoffreForm
                    onValidSubmit={this.submitForm}
                    ref="sortiecoffre">
                    <fieldset>
                        <Input
                            name="amount"
                            data-eusko="sortiecoffre-amount"
                            value={this.state.amount ? this.state.amount : ""}
                            label={__("Montant")}
                            type="number"
                            placeholder={__("Montant de la sortie coffre")}
                            validations="isPositiveNumeric"
                            validationErrors={{
                                isPositiveNumeric: __("Montant invalide.")
                            }}
                            elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-6']}
                            onChange={this.onFormChange}
                            required
                        />
                        <div className="form-group row">
                            <label
                                className="control-label col-sm-3"
                                data-required="true"
                                htmlFor="sortiecoffre-bdcDest">
                                {__("Destinataire")}
                                <span className="required-symbol">&nbsp;*</span>
                            </label>
                            <div className="col-sm-6 sortiecoffre" data-eusko="sortiecoffre-bdcDest">
                                <SimpleSelect
                                    className={reactSelectizeErrorClass}
                                    ref="select"
                                    value={this.state.bdcDest}
                                    options={this.state.bdcList}
                                    placeholder={__("Bureau de change destinataire")}
                                    theme="bootstrap3"
                                    onValueChange={this.bdcDestOnValueChange}
                                    renderOption={SelectizeUtils.selectizeRenderOption}
                                    renderValue={SelectizeUtils.selectizeRenderValue}
                                    onBlur={this.validateForm}
                                    renderNoResultsFound={SelectizeUtils.selectizeNoResultsFound}
                                    required
                                />
                            </div>
                            <div className="col-sm-3"></div>
                        </div>
                        <div className="form-group row">
                            <label
                                className="control-label col-sm-3"
                                data-required="true"
                                htmlFor="sortiecoffre-porteur">
                                {__("Porteur")}
                                <span className="required-symbol">&nbsp;*</span>
                            </label>
                            <div className="col-sm-6 sortiecoffre" data-eusko="sortiecoffre-porteur">
                                <SimpleSelect
                                    className={reactSelectizeErrorClass}
                                    ref="select"
                                    value={this.state.porteur}
                                    options={this.state.porteurList}
                                    placeholder={__("Porteur")}
                                    theme="bootstrap3"
                                    onValueChange={this.porteurOnValueChange}
                                    renderOption={SelectizeUtils.selectizeRenderOption}
                                    renderValue={SelectizeUtils.selectizeRenderValue}
                                    onBlur={this.validateForm}
                                    renderNoResultsFound={SelectizeUtils.selectizeNoResultsFound}
                                    required
                                />
                            </div>
                            <div className="col-sm-3"></div>
                        </div>
                        <Textarea
                            name="description"
                            value={this.state.description ? this.state.description : ""}
                            data-eusko="sortiecoffre-description"
                            rows={3}
                            elementWrapperClassName={[{'col-sm-9': false}, 'col-sm-6']}
                            label={__("Description")}
                            placeholder={__("Vous devez fournir une description.")}
                            validations="isExisty"
                            validationErrors={{
                                isExisty: __("Description invalide.")
                            }}
                            onChange={this.onFormChange}
                            required
                        />
                    </fieldset>
                    <fieldset>
                        <Row layout="horizontal">
                            <input
                                name="submit"
                                data-eusko="sortiecoffre-submit"
                                type="submit"
                                defaultValue={propTranslateButton}
                                className="btn btn-success"
                                formNoValidate={true}
                                disabled={!this.state.canSubmit}
                            />
                        </Row>
                    </fieldset>
                </SortieCoffreForm>
                <ToastContainer ref="container"
                                toastMessageFactory={ToastMessageFactory}
                                className="toast-top-right toast-top-right-navbar" />
            </div>
        );
    }
}

var propURL = getAPIBaseURL + "sortie-coffre/"
var propTitle = "Sortie coffre"
var propTextareaDescription = "Sortie coffre"
var propTranslateTitle = __("Sortie coffre")
var propTranslateButton = __("Enregistrer la sortie coffre")

ReactDOM.render(
    <SortieCoffrePage url={propURL} textarea_description={propTextareaDescription} validate_button={propTranslateButton} />,
    document.getElementById('sortie-coffre')
)

ReactDOM.render(
    <NavbarTitle title={propTranslateTitle} />,
    document.getElementById('navbar-title')
)