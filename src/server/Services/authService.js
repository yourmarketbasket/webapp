const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const request = require('request');
const dotenv = require('dotenv');

class AuthService {
    
    // login and authenticate
  static async authenticateUser(phone, password) {

    try {
      const user = await User.findOne({ phone });

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

        return { message: 'Login Successful', success: true, token, userId };
      } else {
        return { message: 'Invalid Details', success: false };
      }
    } catch (error) {
      throw error; // You can rethrow the error or handle it as needed
    }
  }
//   send otp
  async sendOTP(phone, zipcode){
    try{
        // send otp
        return new Promise((resolve, reject)=>{
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
                  reject(response)
                }else{
                    try {
                        const responseData = JSON.parse(response.body);
                        if (responseData && responseData.smsStatus === 'Message Sent') {
                          const verifydatadata = { zip: zipcode, phone: phone, pinid: responseData.pinId };
                          resolve(verifydatadata);
                        } else {
                          reject('OTP not sent'); // You can reject with a specific error message
                        }
                      } catch (parseError) {
                        reject(parseError);
                      }
                } 
              });

        });
     
      
    }catch(e){
        console.log("Error sending OTP:", e)
    }
     
  }
    // register user
  static async registerUser(data){

    try{
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = new User({
            fname: data.fname,
            lname: data.lname,
            phone: data.phone,
            avatar: '',
            email: '',
            dob: data.dob,
            zipcode: data.zipcode,
            gender: data.gender,
            password: hashedPassword, // use the hashed password
            city: data.city,
            address: data.address,
            verified: false,
            verificationAttempts: 0,
        });
        const existingUser = await User.findOne({phone:data.phone, zipcode:data.zipcode })
        if(existingUser){
            return {message: 'User already exists', success:false};
        }else{
            await user.save();
            const authService = new AuthService();
            const verifydata = await authService.sendOTP(data.phone, data.zipcode);
            
            if (user) {
                let phone = data.phone;
                // If the user already exists, increment their verification attempts by 1
                await User.findOneAndUpdate({ phone }, { $inc: { verificationAttempts: 1 } });
              } else {
                // If the user doesn't exist yet, create a new user and set their verification attempts to 1
                await User.create({ phone, verificationAttempts: 0 });
              }
                  
              return { message: `Registration  successfull`, success: true, data: verifydata};
                      
        }

    }catch(error){
        return error
    }

   
  }
  // verify otp
  static async verifyOTP(verificationData){
    const phone = verificationData.phone
    try{
      return new Promise((resolve,reject)=>{
        // termii integration
        var data = {
          "api_key": process.env.TERMII_API_KEY,
          "pin_id": verificationData.codeid,
          "pin": verificationData.otp
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
            resolve({ message: `Verification successful`, success: true});
            // upldate verified status
            User.findOneAndUpdate({ phone: phone }, { $set: { verified: true } })
                .then(() => {
                })
                .catch((err) => {
                });
          }else if(responseData.verified === "Expired"){
            resolve({message: 'OTP Expired', success: false})
          }else{
            resolve({ message: 'Invalid code', success: false });
          }
        });
      })

    }catch(e){
      return e;
    }

  }
}

module.exports = AuthService;
