"use strict";
exports.__esModule = true;
var express_1 = require("express");
var dotenv = require("dotenv");
var morgan_1 = require("morgan");
var cors_1 = require("cors");
var body_parser_1 = require("body-parser");
var mongoose_1 = require("mongoose");
dotenv.config();
var port = parseInt(process.env.PORT, 10) || 8000;
var DATABASE = process.env.DATABASE;
var app = express_1["default"]();
mongoose_1["default"]
    .connect(DATABASE, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true
})
    .then(function () { return console.log("DB connected"); })["catch"](function (err) { return console.log("DB CONNECTION ERROR: ", err); });
//import routes PENDITENTE POR CAMBIAR A TS
var authRoutes = require('./routes/auth');
var userRoutes = require('./routes/user');
//app middlewared
app.use(morgan_1["default"]("dev"));
app.use(body_parser_1["default"].json());
//PENDIENTE POR CAMBIAR A TS
if ((process.env.NODE_ENV = "development")) {
    app.use(cors_1["default"]({ origin: "http://localhost:3000" }));
}
// middleware PENDIENTE POR CAMBIAR A TS
app.use('/api', authRoutes);
app.use('/api', userRoutes);
var server = app.listen(port, function () {
    console.log("API is running on port " + port);
    //console.log(`API is running on port ${port} -${process.env.NODE_ENV}`);
});
