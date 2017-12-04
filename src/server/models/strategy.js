var mongoose = require("mongoose")
var Schema = mongoose.Schema

var executionSchema = new Schema(
  {
    TradeType: String, // tradebuy or tradesell
    Quantity: Number,
    Rate: Number,
    // Fixed. No input allowed by users
    ConditionType: { type: String, default: "NONE" }, // supported options are 'NONE', 'GREATER_THAN', 'LESS_THAN'
    Target: { type: Number, default: 0 }, // used in conjunction with ConditionType
    OrderType: { type: String, default: "LIMIT" },
    TimeInEffect: { type: String, default: "GOOD_TIL_CANCELLED" }
  },
  {
    timestamps: true
  }
)

var conditionSchema = new Schema({
  Type: String,
  Value: Number
})

var strategySchema = new Schema({
  MarketName: String, // BTC-ETH, BTC-OMG, ETH-OMG
  conditions: [conditionSchema],
  executions: [executionSchema]
})

strategySchema.methods.trade = function() {
  console.log(
    `This is a schema method. The type for this strategy is ${this.type}`
  )
}

const Strategy = mongoose.model("Strategy", strategySchema)
module.exports = Strategy
