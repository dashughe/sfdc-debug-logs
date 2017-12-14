import React from 'react'
import Snackbar from 'material-ui/Snackbar'
import ChatIcon from 'material-ui-icons/Chat'
import Button from 'material-ui/Button'
import {Link, Route, Switch} from 'react-router-dom'
import Toolbar from 'material-ui/Toolbar'
import AppBar from 'material-ui/AppBar'
import Grid from 'material-ui/Grid'
import {connect} from 'react-redux'
import LogView from './log-view'
import TrackingLogs from './tracking-logs'
import Search from './search'
import LogsTable from './logs-table'
import LogButtons from './log-buttons'
import {loadLogs, setMessage, deleteAll, search} from './actions'

const mapStateToProps = (state) => {
  return state.logs
}

const mapDispatchToProps = (dispatch) => ({
  refresh: ((sf) => dispatch(loadLogs(sf))),
  setMessage: ((msg) => dispatch(setMessage(msg))),
  deleteAll: ((sf) => dispatch(deleteAll(sf))),
  search: ((sf, logs, searchTerm) => dispatch(search(sf, logs, searchTerm)))
})

class LogsPageComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      searchTerm: ""
    }
    this.updateSearchTerm = this.updateSearchTerm.bind(this)
    this.fetchLogBody = this.fetchLogBody.bind(this)
    this.refresh = props.refresh.bind(this, props.sf)
    this.deleteAll = props.deleteAll.bind(this, props.sf)
    this.search = props.search.bind(this, props.sf)
  }

  componentDidCatch(error, info) {
    setMessage(`Error: ${error}`)
  }

  fetchLogBody(id) {
    return this.props.sf.logBody(id)
  }

  componentDidMount() {
    const props = this.props
    this.refresh()
    document.body.addEventListener('keyup', (e) => {
      if (e.target.type == "text")
        return
      const key = e.key
      const funMap = {
        'r': this.refresh,
        'a': this.deleteAll
      }
      if (funMap[key])
        funMap[key]()
    })
  }

  updateSearchTerm(e) {
    this.setState({searchTerm: e.target.value})
  }

  logById(id) {
    this.state.logs.find(l => l.Id == id)
  }

  render() {
    const props = this.props
    return (<div style={{
        paddingTop: 80
      }}>
      <AppBar position="fixed">
        <Toolbar>
          <Grid container="container" direction="row" justify="space-between">
            <Grid item="item" xs={12} sm={6}>
              <Grid container="container" direction="row" justify="flex-start">
                <Grid item="item">
                  <Search color="contrast" handleSearch={() => this.search(props.logs, this.state.searchTerm)} handleRefresh={this.refresh} searchTerm={this.state.searchTerm} updateSearchTerm={this.updateSearchTerm}/>
                </Grid>
                <Grid item="item">
                  <LogButtons handleRefresh={this.refresh} handleDeleteAll={this.deleteAll} loading={props.loading}/>
                </Grid>
              </Grid>
            </Grid>
            <Grid item="item">
              <Link to="/feedback">
                <Button color="contrast"><ChatIcon/>
                  Give Feedback</Button>
              </Link>
              <TrackingLogs sf={props.sf}/>
            </Grid>
          </Grid>
        </Toolbar>

        <Snackbar open={props.message != ""} message={props.message} onRequestClose={() => props.setMessage("")}/>
      </AppBar>
      <Switch>
        <Route path="/logs/:id" render={ownProps => <LogView fetchBody={this.fetchLogBody} {...ownProps}/>}/>
        <Route render={ownProps => (<LogsTable logs={props.logs} refreshLogs={this.refresh} {...ownProps}/>)}/>
      </Switch>
    </div>)
  }
}

const LogsPage = connect(mapStateToProps, mapDispatchToProps)(LogsPageComponent)

export default LogsPage
