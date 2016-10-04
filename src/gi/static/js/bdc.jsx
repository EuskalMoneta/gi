import {
    fetchAuth,
    isMemberIdEusko,
    getAPIBaseURL,
    NavbarTitle,
    SelectizeUtils,
} from 'Utils'


const {
    Input
} = FRC

import {
    BootstrapTable,
    TableHeaderColumn,
} from 'react-bootstrap-table'
import 'node_modules/react-bootstrap-table/dist/react-bootstrap-table.min.css'


class BDCList extends React.Component {

    constructor(props) {
        super(props);

        // Default state
        this.state = {
            bdcList: undefined,
        }

        // Get bdcList
        var computeBdcList = (data) => {
            var bdcList = _.chain(data.results)
                            .map((item) => {
                                return {name: item.label,
                                        login: item.shortLabel.replace(/_BDC/g, '')}
                            })
                            .sortBy((item) => {return item.login})
                            .value()

            this.setState({bdcList: bdcList})
        }
        fetchAuth(this.props.bdcListUrl, this.props.method, computeBdcList)
    }

    render = () => {
        if (this.state.bdcList != undefined)
        {
            const selectRowProp = {
                mode: 'radio',
                clickToSelect: true,
                hideSelectColumn: true,
                onSelect: (row, isSelected, event) => {
                    window.location.assign(this.props.bdcUrl + row.login)
                }
            }

            var bdcListTable = (
                <BootstrapTable data={this.state.bdcList} striped={true} hover={true} selectRow={selectRowProp}
                                tableContainerClass="react-bs-table-list-bdc" options={{noDataText: __("Rien à afficher.")}}
                >
                    <TableHeaderColumn dataField="login" isKey={true} width="100">{__("Code")}</TableHeaderColumn>
                    <TableHeaderColumn dataField="name">{__("Nom")}</TableHeaderColumn>
                </BootstrapTable>
            )
        }
        else
            var bdcListTable = null;

        return (
            <div className="row">
                <div className="row">
                    <div className="col-md-2">
                      <a href="/bdc/add">
                        <button type="button" className="btn btn-success">{__("Nouveau Bureau de change")}</button>
                      </a>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-9 search-results">
                        {bdcListTable}
                    </div>
                </div>
            </div>
        )
    }
}


ReactDOM.render(
    <BDCList bdcListUrl={getAPIBaseURL + "bdc/"} bdcUrl="/bdc/manage/" method="GET" />,
    document.getElementById('bdc')
)

ReactDOM.render(
    <NavbarTitle title={__("Bureaux de change")} />,
    document.getElementById('navbar-title')
)