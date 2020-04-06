import express from "express";
import * as dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";


dotenv.config();

const port: number = parseInt(process.env.PORT as string, 10) || 8000;
const DATABASE: string = process.env.DATABASE as string;

const app = express();

mongoose
  .connect(DATABASE, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(() => console.log("DB connected"))
  .catch(err => console.log("DB CONNECTION ERROR: ", err));

//import routes PENDITENTE POR CAMBIAR A TS
import authRouters from './routes/auth';
const userRoutes = require('./routes/user');

// const auth = new authRouters()


//app middlewared
app.use(morgan("dev"));
app.use(bodyParser.json());

//PENDIENTE POR CAMBIAR A TS
if ((process.env.NODE_ENV = "development")) {
  app.use(cors({ origin: `http://localhost:3000` }));
}

// middleware PENDIENTE POR CAMBIAR A TS
app.use('/api', authRouters);
app.use('/api', userRoutes);


const server = app.listen(port, () => {
  console.log(`API is running on port ${port}`);
  //console.log(`API is running on port ${port} -${process.env.NODE_ENV}`);
});
