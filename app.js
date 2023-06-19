const express=require('express')
const app=express()
const morgan=require('morgan')
const bodyParser=require('body-parser')
const booksRoutes=require('./api/routes/books')
const usersRoutes=require('./api/routes/users')
const mongoose=require('mongoose')

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

mongoose.connect('mongodb://localhost:27017/booksData', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to the database successfully');
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  })

app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*')

    res.header('Access-Control-Allow-Headers','Origin,X-Requested-With,Content-Type,Accept,Authorization')
    if(req.method==='OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT,POST,PATCH,DELETE,GET')
        return res.stataus(200).json({})
    }
    next()
})


app.use('/books',booksRoutes)
app.use('/users',usersRoutes)

app.use((req,res,next)=>{
    const error=new Error('Not Found')
    error.status=404
    next(error)
})

app.use((error,req,res,next)=>{
    res.status(error.status || 500);
    res.json({
        error:{
            message:error.message
        }
    })
})


module.exports=app
