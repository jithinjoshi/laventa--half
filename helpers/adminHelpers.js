const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const Product = require('../models/Product');
const Category = require('../models/Category')

module.exports = {
    doLogin :(userData)=>{
        return new Promise(async(resolve,reject)=>{
          let response = {}
            const user = await Admin.find({email:userData.email});

            if(user[0]){
                bcrypt.compare(userData.password,user[0].password).then((result)=>{
                  if(result){
                    response.user = user;
                    response.status = true;
                    resolve(response)
                    console.log("login success");
                  }else{
                    console.log("invalid credentials");
                    resolve({status:false})
                  }
                })
              }else{
                console.log("no user with this email address");
                resolve({status:false})
              }
        })
    },

    doAddProduct:(userData)=>{
      return new Promise(async(resolve,reject)=>{
        let status = false;
          const newProduct = new Product(
              {
                  name:userData.name,
                  category:userData.category,
                  price:userData.price,
                  description:userData.description,
                  image:userData.image
              }
          );
          newProduct.save().then((err,data)=>{
            if(err){
              resolve(status=true)
            }
            resolve(newProduct)
          })
      
      })
  },

  doAddCategory:(productData)=>{
    let status = false;
    return new Promise(async(resolve,reject)=>{
      const category = await Category.findOne({category:productData});
      if(category){
        
        resolve(status=true)
      }else{
        const newCategory = new Category(
          {category:productData}
        );
        newCategory.save().then(()=>{
          console.log("Category added to the database");
          resolve(status)
        })
      }
      
    })
  }
}