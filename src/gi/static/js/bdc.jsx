import {
    fetchAuth,
    getAPIBaseURL,
    NavbarTitle,
} from 'Utils'

import {
    BootstrapTable,
    TableHeaderColumn,
} from 'react-bootstrap-table'
import 'node_modules/react-bootstrap-table/dist/react-bootstrap-table.min.css'


var BDCList = React.createClass({

     getInitialState() {
        return {
            bdcList: Array(),
            bdcViewAllList: false,
        }
    },

    computeBdcList(data) {
        // Get bdcList
        var bdcList = _.chain(data.results)
                        .map((item) => {
                            return {name: item.label, id: item.value,
                                    login: item.shortLabel.replace(/_BDC/g, '')}
                        })
                        .sortBy((item) => {return item.login})
                        .value()

        this.setState({bdcList: bdcList})
    },

    componentDidMount() {
        fetchAuth(this.props.bdcListUrl, this.props.method, this.computeBdcList)
    },

    bdcViewAllListOnChange(event) {
        this.setState({bdcViewAllList: !this.state.bdcViewAllList}, () => {
            fetchAuth(this.props.bdcListUrl + "?view_all=" + this.state.bdcViewAllList,
                      this.props.method, this.computeBdcList)
        })
    },

    render() {
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
                <TableHeaderColumn isKey={true} hidden={true} dataField="id">{__("ID")}</TableHeaderColumn>
                <TableHeaderColumn dataField="login" width="100">{__("Code")}</TableHeaderColumn>
                <TableHeaderColumn dataField="name">{__("Nom")}</TableHeaderColumn>
            </BootstrapTable>
        )

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
                    <div className="col-md-4">
                        <label className="font-weight-normal margin-top-ten">
                            <input type="checkbox" value={this.state.bdcViewAllList} onChange={this.bdcViewAllListOnChange} />
                            {' '}{__("Afficher les bureaux de change fermés")}
                        </label>
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
})


ReactDOM.render(
    <BDCList bdcListUrl={getAPIBaseURL + "bdc/"} bdcUrl="/bdc/manage/" method="GET" />,
    document.getElementById('bdc')
)

ReactDOM.render(
    <NavbarTitle title={__("Bureaux de change")} />,
    document.getElementById('navbar-title')
)