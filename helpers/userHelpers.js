
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Product = require('../models/Product');



module.exports = {
    doSignup: (userData)=>{
        return new Promise(async(resolve,reject)=>{
            let response =  {};


            //hash password
            const password = await bcrypt.hash(userData.password,10);

            //add user in to database
            const newUser = new User({
                username:userData.username,
                email:userData.email,
                mobile:userData.mobile,
                password:password
            });
            newUser.save((err,user)=>{
                if(err){
                    console.log("unable to login");
                    resolve({isUser:false})
                }else{
                    response.user = user;
                    response.isUser = true;
                    resolve(response)
                }
            });
                
        })
    },

    doSignin: (userData)=>{
        return new Promise(async(resolve,reject)=>{
            // const user = await User.find({$or:[
            //     {
            //         email:userData.email
            //     },
            //     {
            //         phone:userData.phone
            //     }
            // ]});
            // console.log(user);
            //const data = bcrypt.compare(userData.password,)

            let response ={};

            const user = await User.find({email:userData.email});
            console.log(user);
            
            if(user[0]){
                bcrypt.compare(userData.password,user[0].password).then((result)=>{

                    if(result=== true && user[0].status === true){
                        response.user = user[0];
                        response.status = true;
                        resolve(response)
                    }else if(result === true && user[0].status === false){
                        resolve({access:false});
                    }    
                })
            }else{
                resolve({status:false})
            }
        })
    }
}