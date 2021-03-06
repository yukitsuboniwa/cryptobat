const path = require("path")
require("dotenv").config({ path: path.join(__dirname, "../../.env") })

const port = 9000
const dbUrl = "mongodb://127.0.0.1:27017/cryptobat"

const express = require("express")
const request = require("request")
const mongoose = require("mongoose")
const methodOverride = require("method-override")
const bodyParser = require("body-parser")
const app = express()
const cors = require("cors")
const schedule = require("node-schedule")

const bittrex = require("node-bittrex-api")

const Strategy = require("./models/strategy")
const Balance = require("./models/balance")
const trader = require("./trader/trader")
const { getNews } = require("./news")

let whitelist = [
  "http://api.domain.com",
  "http://app.domain.com",
  "http://localhost:3000"
]

let corsOptions = {
  credentials: true,
  origin: function(origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  methods: "GET,PUT,PATCH,POST,DELETE",
  preflightContinue: true
}

// =================== middleware ===================
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true
  })
)

app.use(methodOverride("_method"))
app.use(cors())

app.use(express.static(path.join(__dirname, "public")))
app.use(function(req, res, next) {
  console.log("Method: " + req.method + " Path: " + req.url)
  next()
})

bittrex.options({
  apikey: process.env.BITTREX_KEY,
  apisecret: process.env.BITTREX_SECRET
})

// =================== mongoose and mongodb ===================
mongoose.Promise = global.Promise
mongoose
  .connect(dbUrl, {
    useMongoClient: true
  })
  .then(
    () => {
      console.log("db is connected")
    },
    err => {
      console.log(err)
    }
  )

// =================== routes ===================

app.get("/", (req, res) => {
  res.json({ Hi: "Use this format to return a json file." })
})

app.get("/account_information", (req, res) => {
  res.json({ Hi: "Use this format to return a json file." })
})

app.get("/accountSummary", (req, res) => {
  bittrex.getbalances((data, err) => {
    if (err) {
      return console.error(err)
    }
    res.json(data)
    data.result.forEach(bal => Balance.create(bal))
  })
})

app.get("/cryptoPanic/:token", (req, res) => {
  let token = req.params.token
  let requestPath =
    "https://cryptopanic.com/api/posts/?auth_token=" +
    process.env.CRYPTO_PANIC +
    "&currency=" +
    token
  request(requestPath, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      let info = JSON.parse(body)
      res.json(info)
    }
  })
})

app.get("/openorders", (req, res) => {
  let tokenPair = "BTC-OMG"
  let customRequestPath =
    "https://bittrex.com/api/v1.1/market/getopenorders?apikey=API_KEY"
  console.log("GET Open Orders called")
  return new Promise((resolve, reject) => {
    bittrex.sendCustomRequest(
      customRequestPath,
      function(data, err) {
        if (err) {
          reject(err)
        } else {
          res.json(data)
        }
      },
      true
    )
  })
})

app.get("/cryptoPanic", (req, res) => {
  Promise.all([getNews("BTC"), getNews("ETH"), getNews("OMG")]).then(
    results => {
      let combinedResults = {}
      let tokens = ["BTC", "ETH", "OMG"]
      results.forEach((result, index) => {
        combinedResults[tokens[index]] = result
      })
      res.json(combinedResults)
    }
  )
})

app.post("/tradingstrategy", (req, res) => {
  console.log(req.body)
  const formData = req.body
  let newStrategy = new Strategy({
    MarketName: formData.MarketName,
    Active: formData.Active,
    conditions: [
      {
        Type: formData.Type,
        Value: formData.Value
      }
    ],
    executions: [
      {
        TradeType: formData.TradeType,
        Quantity: formData.Quantity,
        Rate: formData.Value
      }
    ]
  })
  newStrategy.save()
})

app.get("/showAllStrategies", (req, res) => {
  Strategy.find({}, (err, response) => {
    res.json(response)
  })
})

app.post("/deleteStrategy", (req, res) => {
  console.log("post /delete called")
  Strategy.findByIdAndRemove(req.body, function(err) {
    if (err) res.send(err)
    else {
      Strategy.find({}, (err, response) => {
        res.json(response)
      })
    }
  })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

// =================== trader function ===================

const autoTrade = schedule.scheduleJob("*/10 * * * * *", trader)

// =================== end of trader function ===================

// test create a Strategy
// Strategy.create(
//   {
//     MarketName: "BTC-OMG",
//     Active: true,
//     conditions: [{ Type: "supportLine", Value: 0.00001 }],
//     executions: [
//       {
//         TradeType: "tradebuy",
//         Quantity: 3,
//         Rate: 0.00001
//       }
//     ]
//   },
//   function(err, strat) {
//     if (err) {
//       console.log(err)
//       return
//     }
//     console.log(strat.trade())
//   }
// )
