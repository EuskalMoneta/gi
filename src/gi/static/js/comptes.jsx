import {
    fetchAuth,
    getAPIBaseURL,
    NavbarTitle,
} from 'Utils'

import {
    ComptesBanquesDepot
} from 'ComptesBanquesDepot'

import {
    ComptesDedies
} from 'ComptesDedies'


import classNames from 'classnames'

class ComptesPage extends React.Component {
    constructor(props) {
        super(props)

        // Default state
        this.state = {
            tabBanquesDepotsActive: true,
            tabComptesDediesActive: false,
            dedieData: undefined,
        }
        var computeComptesPageData = (data) => {
            this.setState({dedieData: data})
        }
        fetchAuth(getAPIBaseURL + "dedicated-accounts-summaries/", 'get', computeComptesPageData)
    }

    toggleTabs(tab) {
        if (tab == 'banques')
            this.setState({tabBanquesDepotsActive: true, tabComptesDediesActive: false})
        else
            this.setState({tabBanquesDepotsActive: false, tabComptesDediesActive: true})
    }

    render() {
        var tabBanquesDepotsActiveClass = classNames({
            'active': this.state.tabBanquesDepotsActive,
        })
        var tabComptesDediesActiveClass = classNames({
            'active': this.state.tabComptesDediesActive,
        })

        return (
            <div className="row">
                <div className="row">
                    <ul className="nav nav-tabs">
                        <li role="presentation" className={tabBanquesDepotsActiveClass}>
                            <a onClick={() => this.toggleTabs('banques')}>{__("Banques de dépôt")}</a>
                        </li>
                        <li role="presentation" className={tabComptesDediesActiveClass}>
                            <a onClick={() => this.toggleTabs('comptes')}>{__("Comptes dédiés")}</a>
                        </li>
                    </ul>
                </div>
                <div className="row">
                    <ComptesBanquesDepot initActive={this.state.tabBanquesDepotsActive} />
                    <ComptesDedies initActive={this.state.tabComptesDediesActive} data={this.state.dedieData} />
                </div>
            </div>
        )
    }
}


ReactDOM.render(
    <ComptesPage />,
    document.getElementById('comptes')
)

ReactDOM.render(
    <NavbarTitle title={__("Comptes en banque")} />,
    document.getElementById('navbar-title')
)