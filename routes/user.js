var express = require('express');
const client = require('twilio')(process.env.ACCOUNTSID,process.env.AUTHTOKEN);



var router = express.Router();
var userHelper = require('../helpers/userHelpers');
const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');

/* GET home page. */
router.get('/', async function(req, res, next) {
  const categories = await Category.find({});
  const products = await Product.find({});
  const user = req.session.user;
  res.render('index',{categories,products,user});
});

router.get('/signup',(req,res)=>{
  res.render("signup",{message:req.flash('message')})
})

router.get('/signin',function(req,res){
  res.render('signin',{message:req.flash('message')})
});

router.post('/signup',

function(req,res){

  const userData = req.body;
  userHelper.doSignup(userData).then((response)=>{
    if(response.isUser){
      req.session.userlogin = true;
      req.session.user = response.user;
      res.redirect("/")
    }else{
      req.flash('message','user already exist with this email address or mobile number')
      res.redirect("/signup")
    }
  })
});

router.post('/signin',function(req,res){
  const userData = req.body;
  console.log(userData);

  userHelper.doSignin(userData).then((result)=>{
    if(result.status){
      req.session.userlogin = true;
      req.session.user = result.user;
      res.redirect("/")
    }else if(result.access === false){
      req.flash('message','You are blocked')
      res.redirect("/signin");
    }else{
      req.flash('message','invalid credentials')
      res.redirect("/signin");
    }
  })
});

router.get("/signout",(req,res)=>{
  req.session.userlogin = false;
  req.session.user = null;
  res.redirect("/")
});

router.get("/productdetails/:id",async(req,res)=>{
  const id = req.params.id;
  const product = await Product.findOne({_id:id});

  const products = await Product.find({}).limit(4);

  res.render("single",{product,products});
})

router.get("/otp",(req,res)=>{
  res.render("otp",{message:req.flash('message')})
})

router.post("/otp",async(req,res)=>{
  let phone = req.body.mobile;

  const checkphone = await User.findOne({mobile:phone});

  if(checkphone === null){
    req.flash('message','Enter a valid Mobile Number')
    res.redirect("/otp");
  }else if(checkphone.status === false){
    req.flash('message','You are blocked');
    res.redirect('/otp')
  } else{
        client.verify.services(process.env.SERVICE_ID).verifications.create({
        to: `+91${phone}`,
        channel: "sms",
      });

      req.session.phone = checkphone.mobile;
      res.redirect("/verify")
  } 
})

router.get("/verify",async(req,res)=>{
  const mobile = req.session.phone;
  res.render("otp-varification",{message:req.flash('message'),mobile});
});

router.post("/verify",(req,res)=>{
  const otp = req.body.otp;
  const mobile = req.session.phone;
  client.verify
    .services(process.env.SERVICE_ID)
    .verificationChecks.create({
      to:`+91${mobile}`,
      code:otp
    })
    .then(async resp=>{
      console.log(resp);
      console.log(resp.valid);
      if(resp.valid){
        const user = await User.findOne({mobile})
        req.session.user = user;
        res.redirect("/")
      }else{
        req.flash('message','Invalid OTP')
        res.redirect("/verify")
      }
    })
})



module.exports = router;
