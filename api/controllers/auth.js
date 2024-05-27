import { db } from "../db.js"
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'
import nodemailer from "nodemailer";

var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "gurpreet2015.pta@gmail.com",
      pass: "ghbfjxitgnhyckiw",
    },
  });

export const register = (req,res)=>{
    // check existing user
    const q="SELECT * from user WHERE email = ? OR username = ?"
    db.query(q,[req.body.email,req.body.name],(err,data)=>{
        if(err) return res.json(err)
        if(data.length) return res.status(409).json("user already exists!");
        //Hash the password and create the user
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);
        
        const q = "INSERT into user(`username`,`email`,`password`) values(?)";
        console.log(req.body);
        const values=[
            req.body.username,
            req.body.email,
            hash,
        ];
        console.log(values)
        db.query(q,[values],(err,data)=>{
            if (err) return res.json(err)
                const mailOptions = {
                    from: 'gurpreet2015.pta@gmail.com',
                    to: req.body.email,
                    subject: 'Thank you for Joing us!',
                    html: `
                    <h1>Welcome to My-Blog</h1>
                    <p>Thank you for registering with us. Your account has been created successfully.</p>
                    <p>Here are your account details:</p>
                    <p>Name: ${req.body.username}</p>
                    <p>Email: ${req.body.email}</p>
                    `,
                  };
                  transporter.sendMail(mailOptions, async(error, info) => {
                if (error) {
                  console.log(error);
                  res.status(500).send('Error sending email');
                }
              });
            return res.status(200).json("User has been created")
        });
    });
};


export const login = (req,res)=>{
    //check user
    const q = "select * from user where username=?";
    
    db.query(q,req.body.username,(err,data)=>{
        if (err) res.status(404).json("")
        if(data.length === 0) return res.status(404).json("User not found!")
        const {password ,...other} = data[0]
        //check password
        const isPasswordCorrect = bcrypt.compareSync(req.body.password,data[0].password)

        if(!isPasswordCorrect) return res.status(400).json("wrong username or password");
        const token = jwt.sign({id:data[0].id} ,"jwtkey")
        res.cookie("access_token",token,{httpOnly:true}).status(200).json(other)
    })
}


export const logout = (req,res)=>{
    res.clearCookie("access_token",{
        sameSite:"none",
        secure:true
    }).status(200).json("user has been logged out")
}