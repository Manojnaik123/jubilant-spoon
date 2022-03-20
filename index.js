const express=require('express');
const app=express()
const  Campground=require('./models/campgrounds');
const mongoose = require('mongoose');
const path=require('path');
const Review=require('./models/review')
const { findById } = require('./models/campgrounds');

const asyncError=require('./utils/asyncError')
const ExperssError=require('./utils/ExpressError');
const passport=require('passport')
const localStratergy=require('passport-local');
const session=require('express-session')
const methodOverride = require('method-override') ;
const User=require('./models/user')
const bodyParser=require('body-parser')
const flash=require('flash');
const ejsMate=require('ejs-mate')
app.set('view engine','ejs')
app.use(express.static('public'))
app.use(express.static(path.join(__dirname,'public')));
app.engine('ejs',ejsMate)

 
app.use(methodOverride('_method'))  
app.use(express.json({extended:true}))
app.use(express.urlencoded({extended:true})); 
app.set('views',path.join(__dirname,'views'));
// app.use(express.json())
// app.use(express.urlencoded()); 
app.use(methodOverride('_method')) 


const sessionConfig={
  secret:'hello this is secret',
  resave:false,
  saveUninitialized:true,
 
}
app.use(session(sessionConfig))

//this middleware should be use after session middleware
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStratergy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



mongoose.connect('mongodb://localhost:27017/oneapp',{useNewUrlParser:true,useUnifiedTopology: true });
const db=mongoose.connection;
db.on('error',console.error.bind(console,'error'));
db.once('open',()=>{
  console.log('database connected');
})

app.get('/register',async(req,res)=>{
  res.render('campground/register');
  
})
app.post('/register',asyncError(async(req,res)=>{
  try{
    const {email,username,password}=req.body;
    const user=new User({username,email});
    const regUser=await User.register(user,password);
    res.redirect('/campground')
  }catch(e){
   req.flash('error',e.message);
   res.redirect('/register')
  }
   
    
  
}))
app.get('/',async(req,res)=>{
  res.render('campground/home')
})
app.get('/campground',asyncError(async(req,res)=>{
  const data=await Campground.find();
  res.render('campground/index',{data})

}))
app.get('/campground/new',(req,res)=>{
  res.render('campground/new')
})

app.post('/campground',asyncError(async(req,res,next)=>{
  if(!req.body) throw new ExperssError("invalid data",400)
  if(!req.body.price){
    alert('price required')
  }
  const data=new Campground(req.body);
  await data.save();
  res.redirect(`/campground/${data.id}`)


}))


app.get('/campground/:id/edit',asyncError(async(req,res)=>{
  const {id}=req.params;
  const data=await Campground.findById(id)
  res.render('campground/edit',{data})
}))
app.put('/campground/:id',asyncError(async(req,res)=>{
  const {id}=req.params;
 
  
  await Campground.findByIdAndUpdate(id,req.body);
  res.redirect('/campground');
}))
app.get('/campground/:id',asyncError(async(req,res)=>{
  const {id}=req.params;

  const data=await Campground.findById(id).populate('review')
  console.log(data)
  res.render('campground/show',{data})
}))

app.post('/campground/:id/review',asyncError(async(req,res)=>{
  const {id}=req.params;
  const data=await Campground.findById(id);
  const rev=new Review(req.body);
  data.review.push(rev);
  await rev.save();
  await data.save();
  res.redirect(`/campground/${data._id}`)
}))
app.delete('/campground/:id',asyncError(async(req,res)=>{
  const {id}=req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect('/campground')
}))
app.delete('/campground/:id/review/:reviewId',async(req,res)=>{
  const {id,reviewId}=req.params;
  await Campground.findByIdAndUpdate(id,{$pull:{review:reviewId}})
  await Review.findByIdAndDelete(id)
  res.redirect(`/campground/${id}`)
})
app.all('*',(req,res,next)=>{
  next(new ExperssError('page not found',404))
})

app.use((err,req,res,next)=>{
  const {statusCode=500,message='something went wrong'}=err;
 if(!err.message){err.message="oh no something went wrong"}
  res.status(statusCode).render('campground/error',{err});
})


app.listen(3001,()=>{
  console.log('listening on 3001');
})