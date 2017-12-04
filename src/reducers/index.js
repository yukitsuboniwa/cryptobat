import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import counter from './counter'
import tradehistory from './tradehistory'
import news from './news'
import accountSummary from './accountSummary'

export default combineReducers({
  routing: routerReducer,
  counter,
  tradehistory,
  accountSummary,
  news
})
