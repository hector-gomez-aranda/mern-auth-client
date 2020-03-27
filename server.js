const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser'); //para que el back entienda la informacion que manda el front
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

//connect to db
mongoose
    .connect(process.env.DATABASE, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
    .then(()=> console.log('DB connected'))
    .catch(err => console.log('DB CONNECTION ERROR: ', err));

//import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

//app middlewared
app.use(morgan('dev'));
app.use(bodyParser.json());
//app.use(cors()); //allows all origins
if(process.env.NODE_ENV = 'development'){
    app.use(cors({ origin: `http://localhost:3000` }));
}

// middleware
app.use('/api', authRoutes);
app.use('/api', userRoutes);

const port = process.env.PORT || 8000;
app.listen(port, () =>{
    console.log(`API is running on port ${port}`);
    //console.log(`API is running on port ${port} -${process.env.NODE_ENV}`);
});
