import {
    fetchAuth,
    getAPIBaseURL,
} from 'Utils'

import classNames from 'classnames'

var ComptesBanquesDepot = React.createClass({
    getInitialState() {
        return {
            active: this.props.active,
        }
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps) {
            this.setState({active: nextProps.active})
        }
    },

    render()
    {
        var activeOrNot = classNames({
            'row': true,
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