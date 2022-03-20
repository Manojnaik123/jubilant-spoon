const mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/oneapp',{useNewUrlParser:true,useUnifiedTopology: true });
const db=mongoose.connection;
db.on('error',console.error.bind(console,'error'));
db.once('open',()=>{
  console.log('database connected');
})