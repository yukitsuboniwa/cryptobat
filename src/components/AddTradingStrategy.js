import React, { Component } from "react"
import { connect } from "react-redux"
import { push } from "react-router-redux"
import { bindActionCreators } from "redux"

import { createStrategy, deleteStrategy } from "../reducers/addtradingStrategy"

class AddTradingStrategy extends Component {
  componentDidMount() {}

  render() {
    return (
      <div className="TradingStrategy">
        <h5>Add New Strategy</h5>
        <div className="tradingrow">
          Select currency pair:{" "}
          <select defaultValue="Select" className="strategyfield">
            <option hidden>Select</option>
            <option value="ETH-OMG">ETH-OMG</option>
            <option value="BTC-ETH">BTC-ETH</option>
            <option value="BTC-OMG">BTC-OMG</option>
          </select>
          <form>
            Execution price:{" "}
            <input
              className="strategyfield"
              type="number"
              placeholder="Price"
            />
          </form>
          Trade:
          <select defaultValue="Select" className="strategyfield">
            <option hidden>Select</option>
            <option value="tradebuy">Buy</option>
            <option value="tradesell">Sell</option>
          </select>
          Trade type:
          <select defaultValue="Select" className="strategyfield">
            <option hidden>Select</option>
            <option value="supportLine">Support</option>
            <option value="resistanceLine">Resistance</option>
          </select>
          <form>
            Quantity to hold:{" "}
            <input
              className="strategyfield"
              type="number"
              placeholder="Quantity"
            />
          </form>
          <button onClick={this.props.createStrategy}>ADD</button>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  allBalances: state.accountSummary.allBalances,
  allStrategiesFromDB: state.showTradingStrategies.allStrategies
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      createStrategy,
      deleteStrategy,
      changePage: () => push("/AddTradingStrategy")
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(AddTradingStrategy)
