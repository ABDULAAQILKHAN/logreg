import express from "express";
import cors from "cors";
import mongoose from "mongoose"
import nodemailer from "nodemailer";
import path from 'path';
import {fileURLToPath} from 'url';

var userpush = null;
const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);
console.log('directory-name 👉️', __dirname);
const server = express();
var random = Math.floor(1000 + Math.random() * 9000);

var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'aaqilservertest@gmail.com',
        pass: 'njdfbcukzijuofho'
    }
});

console.log(process.env.PASS)
//all using methods
server.use(express.json());
server.use (express.urlencoded({
    extended: true
}));
server.use(cors());

//connecting to the database
mongoose.connect("mongodb+srv://matrix:matrix99@users.fcunj.mongodb.net/?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedtopology: true
}, ()=>{
    console.log("DB connected");
})

//defineing schema of db
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    mobile: Number,
    password: String
})

//creating db modal as user
var User = new mongoose.model("User", userSchema);

//defining address of get request


server.post("/register",(req,res)=>{
    console.log(req.body.user)
    const { name, email, mobile, password} = req.body;
    User.findOne({email: email}, (err, user)=>{
        if (user){
            res.send({message: user.name+" you already have an account please login",flag: false});
        }
        else{

            console.log(random);

            var user = new User({
                name,
                email,
                mobile,
                password
            })
            userpush = user;
            console.log(user.email);
            const otp={
                OTP: random
            }


            var verificationMail={
                from: 'aaqilservertest@gmail.com',
                to: user.email,
                subject: "MATRIX ACCOUNT VERIFICATION",
                text: otp.OTP+' is your OTP'
            }
            transporter.sendMail(verificationMail,(err,data)=>{
                if(err){
                    console.log(err);
                }else{
                    if(data){
                        res.send({flag: true});
                        console.log("mail success");
                    }
                    else{
                        console.log("error in sending otp")
                    }
                }
            })
            
            
        }
    })
})

server.post("/verification",(req,res)=>{
    const verificationOtp = req.body.value;
    if(random == verificationOtp){

       let congratulateMail={
            from: 'aaqilservertest@gmail.com',
            to: userpush.email,
            subject: "Welcome to MATRIX",
            text: 'Hello '+userpush.name+' we welcome to MATRIX we hope that you will like our service'
        }

        transporter.sendMail(congratulateMail,(err,data)=>{
            if(err){
                res.send({message: 'Error! try again'})
                console.log(err);
            }else{
                if(data){
                    res.send({flag: true});
                    console.log("mail success");
                    userpush.save();
                    res.send(true)
                }
                else{
                    res.send({message: 'error in sending otp, try again'})
                    console.log("error in sending otp")
                }
            }
        })

        console.log("otp matched")
        console.log(verificationOtp);
    }
    else{
        res.send({message: "Wrong Otp"})
        console.log(verificationOtp);
        console.log("otp unmatched");
    }

})





server.post("/login",(req,res)=>{

    console.log(req.body);

    const { email, password}=req.body;
    User.findOne({email: email},(err, user)=>{
        if (user){
            if(password == user.password){
                res.send({message: "Login success",user: user,passflag: true})
                console.log("login successfully");
            }
            else {
                res.send({message: 'wrong password', passflag: false})
                console.log("login failed");
            }
        }
        else{
            res.send({message: 'Account not found',accflag: false})
            console.log(err+"user not found");
        }
    })
});
server.use(express.static("../app/build"));

server.get('/', function (req, res) {
    res.sendFile(path.join(__dirname,'app', 'build', 'index.html'));
   });


//port for listening on no. 9000
server.listen(9000, () => {
    console.log("server running");
})