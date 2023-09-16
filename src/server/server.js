const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const request = require('request');
const ip = '192.168.88.207';

let otpid = '';

const app = express();
const server = http.createServer(app);
const io = socketIo(server,{
  cors: {
    origin: ["http://localhost:4200","https://5252-196-250-212-188.ngrok-free.app"], 
    methods: ["GET", "POST"]
  }
});

const router = express.Router();
const bodyparser = require('body-parser');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const Store = require('./models/stores');
const Product = require('./models/products');
const Favorite = require('./models/favorites');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const shortid = require('shortid');
dotenv.config();
const mongoose = require('./db');
const port = 3000;





// twilio verify
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const verifySid = process.env.TWILIO_VERIFY_SID;
// const client = require("twilio")(accountSid, authToken);
// const ONE_HOUR_IN_MILLISECONDS = 60 * 60 * 1000;


app.use(cors())
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));




// splitting the api
app.get('/', (req, res) => {
    res.send({message: 'request recieved'});
});

app.use((err,req,res,next)=>{
    console.log(err);
    res.status(500).send({message: error.message});
})
// get products
app.get('/getProducts/:id', async (req, res) => {
  const storeId = req.params.id;
  try {
    // Use the Product model to find products by storeid
    const products = await Product.find({ storeid: storeId });
    if(products.length > 0){ // check if products array is not empty
      res.send({ message: 'Products fetched successfully', success: true, data: products });
    }else{
      res.send({ message: 'No products found', success: false });
    }

  } catch (error) {
    console.error(error.message);
    res.send({ message: error.message, success: false }); // return error message instead of the error object
  }
});



// login route
app.post('/login', async (req, res) => {
  const data = req.body;
  const phone = data.phone;
  const password = data.password;

  try {
    // check if user exists
    const user = await User.findOne({
      phone,
    });
    if (user && (await bcrypt.compare(password, user.password))) {
      const userId = user._id;
      const token = jwt.sign(
        {
          userId: user._id,
          fname: user.fname,
          lname: user.lname,
          phone: user.phone,
          admin: user.admin,
          active: user.active,
          client: user.client,
          vendor: user.vendor,
          verified: user.verified,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '1d',
        }
      );
    

      res.send({ message: 'Login successful', success: true, token, userId: userId });
    } else {
      res.send({ message: 'Invalid details', success: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error', success: false });
  }
});

function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send({ message: 'Unauthorized request' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Invalid Token' });

  }
  
}



async function sendOtp(zip, phone) {
  const phoneNumber = zip + phone;
  let response;
    try {
      const user = await User.findOne({ phone });
      if (user && user.verificationAttempts >= 2) {
        // If the user has already made a verification attempt, return an error message
        response = "Too many attempts. Try again in 1 hour.";
       
      }
       // use termii
      
    } catch(error){
      response = `Error: ${error}`;
    }

}
// reject or approve listed product items
app.post('/reviewlisteditem', async(req, res)=>{
  const product = await Product.findOne({_id:req.body.id});
  if(product){
    const verified = product.verified;
    if(verified){
      res.status(200).send({message:"Product already verified, Action not completed!"})
    }else{
      const filter = {_id: req.body.id};
      const update = { approved: req.body.action=="approve",rejected:req.body.action=="reject", verified: true, rejectionReason:req.body.reason};
      const updateproduct = await Product.findOneAndUpdate(filter, update);
    
      if(updateproduct){
        res.status(200).send({message: `${req.body.action.toUpperCase()} Action completed successfully`, success: true});
      }else{
        res.send({message: "Action Failed", success: false})
      }
    }
    
  }

})
// change user avatar
app.post('/changeUserAvatar', async (req, res) => {
  // find a user by the id
  const user = await User.findOne({ _id: req.body.userid });
  if (user) {
    const filter = { _id: req.body.userid };
    const update = { avatar: req.body.avatar };
    // update the value for avatar in the user document
    const updatedUser = await User.findOneAndUpdate(filter, update);
    if (updatedUser) {
      res.send({ message: 'Avatar changed successfully', success: true });
    } else {
      res.send({ message: 'Error changing avatar', success: false });
    }
  } else {
    res.send({ message: 'User not found', success: false });
  }
});
// get number of unapproved products
app.get('/unapprovedproducts', async(req, res)=>{
  try{
    const unapproved = await Product.countDocuments({verified:false}).exec();
    res.status(200).send({number: unapproved, success:true})

  } catch(error){
    res.status(500).send({error: "Internal server error"});
  }
  
})
// mark a product favorite
app.post('/addFavorite', async (req, res)=>{
  const favorite = new Favorite({
      userid:req.body.userid,
      productid:req.body.productid,
      favorite: req.body.favorite
  });
  // check if product has already been added as favorite
  const foundFavorite = await Favorite.findOne({productid:req.body.productid, userid:req.body.userid})
  if(foundFavorite){
    // remove it from favorites
    const deleteProduct = await Favorite.findOneAndDelete({productid:req.body.productid});
      if(deleteProduct){
        res.send({message:'Removed from favorites', success:true})
      }else{
        res.send({message:'Error Occured', success:false})
      }

  }else{
    // add to favorites
    const newFavorite = await favorite.save();
    if(newFavorite){
      res.send({message:'Added to Favorites', success:true})
    }else{
      res.send({message:'Error occured', success: false});
    }
    
  }

 
})
// check if is favorite
app.post('/isFavorite', async (req, res)=>{
  const isfavorite = await Favorite.findOne({productid:req.body.productid, userid:req.body.userid})
  if(isfavorite){
    res.send({success:true})
  }else{
    res.send({success:false})
  }
}) 
// get all the products
app.get('/getAllProducts', async (req, res)=>{
  const product = await Product.find({approved:true})
  if(product){
    res.status(200).send({data:product, success:true})
  }else{
    res.status(404).send({success: false, message:'Could not find the product'})
  }
})

// get stores
app.get('/getStores/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const stores = await Store.find({ user: userId });
    res.send({ message: 'Stores fetched successfully', success: true, data: stores });
  } catch (error) {
    console.error(error);
    res.send({ message: 'Server error', success: false });
  }
});
// add product
app.post('/addProduct', async (req, res) => {
  const data = req.body;
  // add the data to mongodb
    const product = new Product({
      name: data.name,
      brand: data.brand,
      category: data.category,
      subcategory: data.subcategory,
      description: data.description,
      features: data.features,
      quantity: data.quantity,
      model: data.model,
      bp: data.bp,
      sp: data.sp,
      avatar: data.images,
      storeid: data.storeid,
      discount:0
    });
    try{
      const newProduct = await product.save();
      res.send({ message: 'Product added successfully', success: true, data: newProduct });
    }catch(error){
      console.error(error);
      res.send({ message: 'Product not Created.', success: false });
    }

});
// check if advanced action is allowed
app.post('/advancedAction', async (req, res)=>{
  const userId = req.body.id;

  const person = await User.findOne({_id: userId});
  const hasPermissions = person.aq || person.admin || person.manager || person.support;

  if(hasPermissions){
    res.status(200).send({allowed: true});    
  }else{
    res.status(200).send({allowed: false});
  }
  
})

// review products
app.post('/reviewproducts', async (req, res)=>{
  if (req.body.allowed) {
    try {
      const products = await Product.find({ approved: false, verified: false });
      res.status(200).send(products);
    } catch (error) {
      res.status(500).send({ error: 'Failed to fetch products' });
    }
  } else {
    res.status(403).send({ error: 'Not allowed' });
  }

});


// add a store
app.post('/addStore', async (req, res) => {
  const data = req.body;
  const user = await User.findOne({ _id: data.userId });
  const store = new Store({
    storename: data.storename,
    storetype: data.storetype,
    location: data.location,
    email: data.email,
    avatar: data.avatar,
    description:data.description,
    user: data.userId
  });
  try {
    const newStore = await store.save();
    // emit a message to the client
    res.send({ message: 'Store added successfully', success: true, data: newStore });
  } catch (error) {
    console.error(error);
    res.send({ message: 'Store not Created.', success: false });
  }



  
  

});
// search for a product
app.post('/searchProduct', async (req, res) => {
  try {
    const searchquery = req.body.query;
    const regexQuery = new RegExp(searchquery, 'i'); // Case-insensitive regex
    const filter = {    
          
        $or: [
          { category: regexQuery },
          { name: regexQuery },
          { subcategory: regexQuery },
          {features: regexQuery},
          {brand: regexQuery},
          {model: regexQuery},
          {description: regexQuery},
  
        ],
        approved:true,
        verified:true,      
      
    };

    // Parse the price and quantity search queries to numbers
    const numericValue = parseFloat(searchquery);
    if (!isNaN(numericValue)) {
      filter.$or.push({ price: numericValue });
      filter.$or.push({ quantity: numericValue });
      filter.$or.push({ bp: numericValue });
      filter.$or.push({ sp: numericValue });
      filter.$or.push({ discount: numericValue });
    }

    const products = await Product.find(filter);

    if (products.length > 0) { // Check if products array has items
      res.status(200).send({success:true, data:products});
    } else {
      res.send({success:false, message:'Product not found'});

    }
  } catch (error) {
    res.send({success:false, message:error});

  }
});




// get user data using their mobile phone
app.get('/getUser/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id); // find user by ID
    if (!user) {
      return res.status(404).json({ message: 'User not found' }); // handle case where user is not found
    }else{
      res.send({ message: 'User found', success: true, data: user });
    }// return user object if found
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' }); // handle other errors
  }
});
app.post('/editProduct', async (req, res)=>{
  const product = await Product.find({_id:req.body.id});
  if(product){
    const filter = {_id: req.body.id};
    const update = {bp:req.body.bp, sp:req.body.sp, quantity:req.body.qtty,discount:req.body.discount,avatar:req.body.images, approved:false, verified:false, description: req.body.description, features:req.body.features, rejected:false, rejectionReason:""}
    const productUpdate = await Product.findOneAndUpdate(filter, update);
    if(productUpdate){
      res.status(200).send({message: "Product Details Edited Successfully", success:true});
    }else{
      res.send({message: "Error: Something Happend", success:false})
    }

  }else{
    res.status(400).send({message: 'Product Not Found', success:false})
  }

})
// lazy loading products
app.post('/getlazyLoadedProducts', async (req, res)=>{
    const startIndex = req.body.startIndex;
    const batchSize = req.body.batchSize;
    // try
    try{
      const products = await Product.find({approved:true, verified:true}).skip(startIndex).limit(batchSize);
      res.status(200).send({success: true, data:products})
    } catch(error){
      res.status(500).send({success:false, err: error})
    }

})
// registration route
app.post('/register', async (req, res) => {
    const data = req.body;
    const fname = data.fname;
    const lname = data.lname;
    const phone = data.phone;
    const dob = data.dob;
    const zipcode = data.zipcode;
    const gender = data.gender;
    const password = data.password;
    const city = data.city;
    const address = data.address;
  
    // hash the password
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        res.status(500).send({ message: 'Error hashing password' });
      } else {
        const user = new User({
          fname: fname,
          lname: lname,
          phone: phone,
          avatar: '',
          email: '',
          dob: dob,
          zipcode: zipcode,
          gender: gender,
          password: hash, // use the hashed password
          city: city,
          address: address,
          verified: false,
          verificationAttempts: 0,
        });
  
        // check if user already exists
        User.findOne({ phone: phone, zipcode: zipcode })
          .then((existingUser) => {
            if (existingUser) {
              res.send({ message: 'User already exists', success: false });
            } else {
              // save data to database
              user.save()
                .then(() => {
                  // send otp
                  const data = {
                    "api_key" : process.env.TERMII_API_KEY,
                    "message_type" : "ALPHANUMERIC",
                    "to" : zipcode.slice(1)+phone.slice(1),
                    "from" : process.env.TERMII_SENDER_ID,
                    "channel" : "generic",
                    "pin_attempts" : 10,
                    "pin_time_to_live" :  5,
                    "pin_length" : 6,
                    "pin_placeholder" : "< 1234 >",
                    "message_text" : "Your one time password for MARKET BASKET is < 1234 >",
                    "pin_type" : "NUMERIC"
                  }
                  const options = {
                    'method': 'POST',
                    'url': 'https://api.ng.termii.com/api/sms/otp/send',
                    'headers': {
                      'Content-Type': ['application/json', 'application/json']
                    },
                    body: JSON.stringify(data)
                  
                  };
                  request(options, async function (error, response) { 
                    if (error){
                      response = "Error: " + error;
                    }else{
                      const responseData = JSON.parse(response.body);
                      if(responseData && responseData.smsStatus === 'Message Sent'){
                        verifydatadata = {zip: zipcode, phone: phone, pinid: responseData.pinId }
                        res
                          .status(200)
                          .send({ message: `Registration  successfull`, success: true, data: verifydatadata});
                        
                        if (user) {
                          // If the user already exists, increment their verification attempts by 1
                          await User.findOneAndUpdate({ phone }, { $inc: { verificationAttempts: 1 } });
                        } else {
                          // If the user doesn't exist yet, create a new user and set their verification attempts to 1
                          await User.create({ phone, verificationAttempts: 0 });
                        }
            
                      }
                    } 
                  });
                })
                .catch((err) => {
                  res.send({ message: 'Mobile Number already in use', success: false });
                });
            }
          })
          .catch((err) => {
            res.status(500).send({ message: 'Error checking for existing user' });
          });
      }
    });
  });
  // delete product
app.delete('/deleteProduct/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    } else {
      res.send({ message: 'Product deleted', success: true });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});
// verify otp
app.post('/verify', async (req, res) => {
// termii integration
  const phone = req.body.phone;
  var data = {
    "api_key": process.env.TERMII_API_KEY,
    "pin_id": req.body.codeid,
    "pin": req.body.otp
  };
  var options = {
    'method': 'POST',
    'url': 'https://api.ng.termii.com/api/sms/otp/verify',
    'headers': {
    'Content-Type': ['application/json', 'application/json']
    },
    body: JSON.stringify(data)

  };
  request(options, async function (error, response) { 
  if (error) throw new Error(error);
    const responseData = JSON.parse(response.body);
    if(responseData && responseData.verified){
      res.status(200).send({ message: `Verification successful`, success: true});
      // upldate verified status
      User.findOneAndUpdate({ phone: phone }, { $set: { verified: true } })
          .then(() => {
          })
          .catch((err) => {
          });
    }else if(responseData.verified === "Expired"){
      res.send({message: 'OTP Expired', success: false})
    }else{
      res.send({ message: 'Invalid code', success: false });
    }
  });

  

  
});
// get store details
app.get('/getStoreDetails/:id', async (req, res) => {
  const storeid = req.params.id;
  const store = await Store.find({_id: storeid});
  if(store){
    res.status(200).send({ message: `Store details`, success: true, data: store});
  }else{
    res.send({ message: 'Store not found', success: false });
  }
});


app.post('/sendOTP', async (req, res) => {
  if (!req.body.phone || !req.body.zip) {
    return res.status(400).json({ message: 'Missing required fields', success: false });
  }

  const data = {
    "api_key" : process.env.TERMII_API_KEY,
    "message_type" : "ALPHANUMERIC",
    "to" : req.body.zip.slice(1)+req.body.phone.slice(1),
    "from" : process.env.TERMII_SENDER_ID,
    "channel" : "generic",
    "pin_attempts" : 10,
    "pin_time_to_live" :  5,
    "pin_length" : 6,
    "pin_placeholder" : "< 1234 >",
    "message_text" : "Your one time password for MARKET BASKET is < 1234 >",
    "pin_type" : "NUMERIC"
  }
  const options = {
    'method': 'POST',
    'url': 'https://api.ng.termii.com/api/sms/otp/send',
    'headers': {
      'Content-Type': ['application/json', 'application/json']
    },
    body: JSON.stringify(data)
  
  };
  request(options, async function (error, response) { 
    if (error){
      response = "Error: " + error;
    }else{
      const responseData = JSON.parse(response.body);
      if(responseData && responseData.smsStatus === 'Message Sent'){
        verifydatadata = {zip: req.body.zip, phone: req.body.phone, pinid: responseData.pinId }
        res
          .status(200)
          .send({ message: `OTP sent`, success: true, data: verifydatadata});
          const user = User.findOne({ phone: req.body.phone})
        if (user) {
          const phone = req.body.phone
          // If the user already exists, increment their verification attempts by 1
          await User.findOneAndUpdate({ phone}, { $inc: { verificationAttempts: 1 } });
        } else {
          // If the user doesn't exist yet, create a new user and set their verification attempts to 1
          await User.create({ phone, verificationAttempts: 0 });
        }

      }
    } 
  });
});

app.get('/getProductDetails/:id', async(req, res)=>{
    const product = await Product.find({_id:req.params.id});
    if(product){
      res.status(200).send({productDetails: product, success:true})
    }else{
      res.status(404).send({success: false});
    }
});

app.post('/verifyOTP', async (req, res) => {
  var data = {
    "api_key": process.env.TERMII_API_KEY,
    "pin_id": req.body.otpid,
    "pin": req.body.otp
  };
  var options = {
    'method': 'POST',
    'url': 'https://api.ng.termii.com/api/sms/otp/verify',
    'headers': {
    'Content-Type': ['application/json', 'application/json']
    },
    body: JSON.stringify(data)

  };
  request(options, async function (error, response) { 
  if (error) throw new Error(error);
    const responseData = JSON.parse(response.body);
    if(responseData && responseData.verified){
      res.status(200).send({ message: `Verification successful`, success: true});
    }else if(responseData.verified === "Expired"){
      res.send({message: 'OTP Expired', success: false})
    }else{
      res.send({ message: 'Invalid code', success: false });
    }
  });

  

});

// socket io
io.on('connection', (socket) => {
  io.to(socket.id).emit('connected', socket.id);
  // communicate when a store is created
  socket.on('store-created', (data) => {
    io.to(socket.id).emit('new store created', data);
  });
  socket.on('getManageStoreID', (data) => {
    io.to(socket.id).emit('sendManageStoreID', data);
  });
  socket.on('closeStore', (data) => {
    io.to(socket.id).emit('closeThisStore', data);
  });
  // product added
  socket.on('productadded', (data) => {
    io.to(socket.id).emit('new product added', data);
  });
  socket.on('toggle-sidebar', (data) => {
    io.to(socket.id).emit('toggleSideBar', data);
  });
  socket.on('getStoreDetails', async (data) => {
    // get the data from the mongo database
    const store =  await Store.find({ _id: data }); 
    io.to(socket.id).emit('sendStoreDetails', store);
  });
});


// configure the port
server.listen(port, () => {
    console.log(`Server is running on http://${ip}:${port}`);
});