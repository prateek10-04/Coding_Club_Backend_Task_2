const express=require('express')
const User=require('../models/user')
const router=express.Router()
const mongoose=require('mongoose')
const Book=require('../models/book')
const check_authorization=require('../middleware/authorization')
router.get('/user/:userID',(req,res,next)=>{

    const userID = req.params.userID;

  Book.find({ user: userID })
    .select('title author price rating _id')
    .exec()
    .then(docs=>{
        const response={
            count:docs.length,
            books:docs.map(doc =>{
                return {
                    title:doc.title,
                    author:doc.author,
                    price:doc.price,
                    rating:doc.rating,
                    _id:doc._id,
                    request :{
                        type:'GET',
                        url:'localhost:3000/books/'+doc._id
                    }
                }
            })
        }
        res.status(200).json(response)
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({
            error:err
        })
    })
})

router.get('/:booksID', (req, res, next) => {
    const id = req.params.booksID;
    Book.findById(id)
      .exec()
      .then(doc => {
        if (doc) {
          console.log(doc);
          res.status(200).json({
            title:doc.title,
            author:doc.author,
            price:doc.price,
            rating:doc.rating,
            _id:doc._id});
        } else {
          res.status(404).json({ message: 'Book not found' });
        }
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ error: err });
      });
  });
  

router.post('/',check_authorization,(req,res,next)=>{
    
    const book= new Book({
        
        title:req.body.title,
        author:req.body.author,
        price:req.body.price,
        rating:req.body.rating,
        user: req.userData.userID
    })
    book.save()
    .then(result =>{
        console.log(result)
        User.findByIdAndUpdate(
            req.userData.userID,
            { $push: { books: result._id } },
            { new: true }
          )
        res.status(201).json({
            message:"Book added Successfully",
            data:{
                title:result.title,
                author:result.author,
                price:result.price,
                rating:result.rating,
                _id:result._id,
                request :{
                    type:"GET",
                    url:'localhost:3000/books/'+result._id
                }
            }
        })
    })
    .catch(err =>{
        console.log(err)
        res.status(500).json({
            error:err,

        })
    })
    
}) 

router.delete('/:bookID',check_authorization,(req,res,next)=>{
    const id=req.params.bookID
    Book.findOneAndDelete({_id:id, user: req.userData.userID })
    .exec()
    .then(result=>{

        if (!result){
            res.status(404).json({
                message:'Book not found with that id'
            })
        }
        else
        {
            User.findByIdAndUpdate(
                req.userData.userID,
                { $pull: { books: id } },
                { new: true }
              )
            res.status(200).json({
            message:'Book details deleted successfuly',
            request:{
                type:'GET',
                url:'localhost:3000/books'           
             }
        })}
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({error:err})
    })
})

router.patch('/:bookID',check_authorization,(req,res,next)=>{
    const id=req.params.bookID
    const updatedFields={}
    for (const field of req.body){
        updatedFields[field.propName]=field.value
    }
    Book.findOneAndUpdate(
        { _id: id, user: req.userData.userID },
        { $set: updatedFields },
        { new: true }
      )
    .exec()
    .then(result=>{
        res.status(200).json({
            message:'Book details Updated!',
            request:{
                type:'GET',
                url:'localhost:3000/books/'+id
            }
        })
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({error:err})
    })
})

router.get('/user/:userID/search/:search',(req,res,next)=>{
    const searchText=req.params.search
    const userID=req.params.userID
    Book.find({user:userID})
    .select('title author price rating _id')
    .exec()
    .then(docs => {
        const books = docs
          .filter(doc => doc.title.toLowerCase().includes(searchText.toLowerCase()))
          .map(doc => {
            return {
              title: doc.title,
              author: doc.author,
              price: doc.price,
              rating: doc.rating,
              _id: doc._id,
              request: {
                type: 'GET',
                url: 'localhost:3000/books/' + doc._id
              }
            };
          });
        res.status(200).json({ books });
      })
    .catch(err=>{
        console.log(err)
        res.status(500).json({
            error:err
        })
    })

})

router.get('/user/:userID/sort/:sortParam',(req,res,next)=>{
    const sortParam=req.params.sortParam
    const sortOptions = {};

  
  switch (sortParam) {
    case 'title':
      sortOptions.title = 1;
      break;
    case 'author':
      sortOptions.author = 1;
      break;
    case 'price':
      sortOptions.price = 1;
      break;
    case 'rating':
      sortOptions.rating = 1;
      break;
    default:
      
      return res.status(400).json({ error: 'Invalid sort parameter' });
  }

  const userID=req.params.userID
  Book.find({user:userID})
    .select('title author price rating _id')
    .sort(sortOptions)
    .exec()
    .then(docs=>{
        const response={
            count:docs.length,
            books:docs.map(doc =>{
                return {
                    title:doc.title,
                    author:doc.author,
                    price:doc.price,
                    rating:doc.rating,
                    _id:doc._id,
                    request :{
                        type:'GET',
                        url:'localhost:3000/books/'+doc._id
                    }
                }
            })
        }
        res.status(200).json(response)
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({
            error:err
        })
    })
})

module.exports=router