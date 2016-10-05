import {
    fetchAuth,
    getAPIBaseURL,
} from 'Utils'

import classNames from 'classnames'

var ComptesBanquesDepot = React.createClass({
    getInitialState() {
        return {
            active: this.props.initActive,
        }
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps) {
            this.setState({active: nextProps.initActive})
        }
    },

    componentDidMount() {
        // Get historyTableData
        // var computeHistoryTableData = (historyTableData) => {
        //     this.setState({historyTableData: historyTableData})
        // }
        // fetchAuth({getAPIBaseURL + "bdc/"}, 'get', computeHistoryTableData)
    },

    render() {
        var activeOrNot = classNames({
            'row margin-top': true,
            'hidden': !this.state.active,
        })

        return (
            <div className={activeOrNot}>
                {'ComptesBanquesDepot'}
            </div>
        )
    }
})

module.exports = {
    ComptesBanquesDepot: ComptesBanquesDepot,
}