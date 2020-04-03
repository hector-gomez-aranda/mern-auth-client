"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv.config();
const port = parseInt(process.env.PORT, 10) || 8000;
const DATABASE = process.env.DATABASE;
const app = express_1.default();
mongoose_1.default
    .connect(DATABASE, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true
})
    .then(() => console.log("DB connected"))
    .catch(err => console.log("DB CONNECTION ERROR: ", err));
//import routes PENDITENTE POR CAMBIAR A TS
const auth_1 = __importDefault(require("./routes/auth"));
const userRoutes = require('./routes/user');
let authRouters = new auth_1.default();
//app middlewared
app.use(morgan_1.default("dev"));
app.use(body_parser_1.default.json());
//PENDIENTE POR CAMBIAR A TS
if ((process.env.NODE_ENV = "development")) {
    app.use(cors_1.default({ origin: `http://localhost:3000` }));
}
// middleware PENDIENTE POR CAMBIAR A TS
app.use("/api", authRouters.routerFun);
app.use('/api', userRoutes);
const server = app.listen(port, () => {
    console.log(`API is running on port ${port}`);
    //console.log(`API is running on port ${port} -${process.env.NODE_ENV}`);
});
