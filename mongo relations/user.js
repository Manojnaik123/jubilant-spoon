const mongoose=require('mongoose')
mongoose.connect('mongodb://localhost:27017/oneapp',{useNewUrlParser:true,useUnifiedTopology: true })
.then(()=>{
    console.log('db connected')
})
.catch(er=>{
    console.log(er)
})