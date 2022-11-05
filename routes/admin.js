var express = require('express');
var router = express.Router();
var adminHelper = require('../helpers/adminHelpers');
const multer = require('multer');
const path = require('path');

const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require("../models/User");

const storage = multer.diskStorage({
 destination:'public/uploads',
 filename:(req,file,cb,err)=>{
  if(err){
    console.log(err);
  }
  cb(null,Date.now() + path.extname(file.originalname))
 }
});

const upload = multer({
  storage:storage
}).single('file')

const verifyAdminLogin = (req,res,next)=>{
  if(!req.session.loggedIn){
    res.redirect("/admin");
  }else{
    next();
  }
}

/* Admin Login. */
router.get('/', function(req, res, next) {
  if(req.session.loggedIn){
    res.redirect('/admin/home');
  }else{
    res.render('admin/login',{message:req.flash('message')});
  }
  
});

// Admin authentication
router.post('/login',(req,res)=>{
  let adminData = {
    email:req.body.email,
    password:req.body.password
  };

  adminHelper.doLogin(adminData).then((response)=>{
    if(response.status){
      req.session.loggedIn = true;
      req.session.admin = response.user;
      res.redirect("/admin/home")
    }else{
      req.flash('message','invalid username or password')
      res.redirect("/admin")
    }
  })
});

router.get("/logout",(req,res)=>{
  req.session.loggedIn = false;
  req.session.admin = null;
  res.redirect("/admin")
})

router.get('/home',verifyAdminLogin,(req,res)=>{
  res.render('admin/main')
})

router.get('/addProduct',verifyAdminLogin,async(req,res)=>{
  const categories = await Category.find({});
  res.render('admin/add-product',{categories:categories,message:req.flash('message')})
})

router.post('/addProduct',verifyAdminLogin,upload,(req,res)=>{
  const productData = {
    name:req.body.name,
    category:req.body.category,
    price:req.body.price,
    description:req.body.description,
    image:req.file.filename
  }
  adminHelper.doAddProduct(productData).then((data,status)=>{
    if(data){
      res.redirect("/admin/products")
    }else{
      req.flash("message","All items are not added properly");
      res.redirect("/admin/addProduct");
    }
    
  })
});



router.get('/products',verifyAdminLogin,async(req,res)=>{
  let Products = await Product.find({});
  res.render('admin/products',{items:Products})
})


router.get('/edit/:id',verifyAdminLogin,async(req,res)=>{
  const userid = req.params.id;
  let product = await Product.findOne({_id:userid});
  let categories = await Category.find({});
  res.render('admin/edit',{item:product,categories:categories})
});

router.post("/edit/:id",verifyAdminLogin, upload, async (req, res) => {
  const userid = req.params.id;
  const singlepdt = await Product.findOne({_id:userid});
  console.log(singlepdt.image);


  
  let product = await Product.findByIdAndUpdate(userid, {
        name: req.body.name,
        category: req.body.category,
        price: req.body.price,
        description: req.body.description,
        image: !req.file ? singlepdt.image : req.file.filename
        //
      });
      res.redirect("/admin/products");
  
});

router.post("/delete",(req,res)=>{
  
  Product.deleteOne({_id:req.body.delete},(err)=>{
    if(!err){
      res.redirect("/admin/products")
    }else{
      console.log(err);
    }
  })
});

router.get("/addcategory",verifyAdminLogin,(req,res)=>{
  res.render('admin/add-category')
});

router.post('/addcategory',(req,res)=>{
  const category = req.body.category;
  
  adminHelper.doAddCategory(category).then((status)=>{
    if(status){
      res.redirect("/admin/addcategory")
    }else{
      res.redirect('/admin/category')
    }
  })
})


router.get("/category",verifyAdminLogin,async(req,res)=>{
  let category = await Category.find({});
  console.log(category);
  res.render('admin/category',{categories:category})
})

router.post("/categoryDelete",(req,res)=>{
  const id = req.body.delete;
  console.log(id);
  Category.deleteOne({_id:id},(err)=>{
    if(!err){
      res.redirect("/admin/category")
    }
  })
  
});

router.get("/customers",verifyAdminLogin,async(req,res)=>{
  const users = await User.find({});
  console.log(users);
  res.render("admin/customers",{users:users});
})

router.post("/customers/block/:id",async(req,res)=>{
  id = req.params.id
  const user = await User.findByIdAndUpdate(id,{status:false});
  req.session.userlogin = false;
  req.session.user = null;
  

  res.redirect("/admin/customers")

})

router.post("/customers/unblock/:id",async(req,res)=>{
  id = req.params.id
  const user = await User.findByIdAndUpdate(id,{status:true});

  res.redirect("/admin/customers")

})



module.exports = router;
