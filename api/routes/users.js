const express=require('express')
const router=express.Router()
const mongoose=require('mongoose')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const User=require('../models/user')

router.post('/signup',(req,res,next)=>{
    User.find({email:req.body.email})
    .exec()
    .then(user=>{
        if(user.length>=1){
            res.status(409).json({
                message:'Account already exists with the given mail'
            })
        }
        else{
            bcrypt.hash(req.body.password,10,(err,hash)=>{
                if (err){
                         return res.status(500).json({
                            error:err
                         })
                }
                else{
                    const user=new User({
                        userName:req.body.userName,
                        email:req.body.email,
                        password:hash,
                        books: []
                    })
                    user.save()
                .then(result=>{
                    const token=jwt.sign({
                        email:req.body.email,
                        userID:result._id
                    },'secret',
                    {
                        expiresIn:"1h"
                    }
                    )
                    console.log(result)
                    res.status(201).json({
                        message:'User Created',
                        token:token
                    })
                })
                .catch(err=>{
                    console.log(err)
                    res.status(500).json({
                        
                        error:err
                    })
                })
        
                }
                
            })
        }
    })
    
})

router.post('/login',(req,res,next)=>{
    User.find({email:req.body.email})
    .exec()
    .then(user=>{
        if(user.length<1){
            return res.status(401).json({
                error:'Authorization failed'
            })
        }
        bcrypt.compare(req.body.password,user[0].password,(err,result)=>{
            if(err){
                return res.status(401).json({
                    error:'Autorization failed'
                })
            }

            if(result){
                if (user[0].userName === req.body.userName) {
                    const token=jwt.sign({
                        email:user[0].email,
                        userID:user[0]._id
                    },'secret',
                    {
                        expiresIn:"1h"
                    }
                    )
                    return res.status(200).json({
                      message: 'Login successful',
                      token:token
                    });
                  } else {
                    return res.status(401).json({
                      error: 'Authorization failed',
                    });
                  }
            }
            res.status(401).json({
                error:'Autorization failed'
            })
            
        })
    })
})

router.delete('/signup/:userID',(req,res,next)=>{
    const id=req.params.userID
    User.findOneAndDelete({_id:id})
    .exec()
    .then(result=>{
        res.status(200).json({
            message:'User deleted'
        })
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({
            error:err

        })
    })
})



module.exports=router