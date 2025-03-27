import {User} from "../models/user.model.js"
import bcrypt from "bcryptjs";
import {generateToken} from "../lib/utils.js"
import cloudinary from "../lib/cloudinary.js"

//signup controller
const signup = async  (req, res) =>{
    const {email, fullName, password} = req.body;
     
    try {
        //check for empty data
        if(!fullName || !email || !password){
            return res.status(400).json({message: "All fields are required"});
        }
        //check for password length
        if(password.length < 6){
            return res.status(400).json({ message: "Password must be at least 6 characters"});
        }
        

        //check if email is already exist or not
        const user = await User.findOne({email});

        if(user) return res.status(400).json({message: "Email already exists"});

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password,salt)
        
        const newUser = new User({
            fullName,
            email,
            password: hashPassword
        });

        if(newUser){
            //generate jwt token
            generateToken(newUser._id, res)
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });
        }else{
            return res.status(400).json({message: "Invalid user data"});
        }

    } catch (error) {
        console.error("Error in signup controller", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}

//login
const login = async (req, res) =>{
    const {email, password} = req.body;

    try {
        //check for empty credentials
        if(!email || !password){
            return res.status(400).json({ message: "All fields are required"});
        }

        //find the user
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({ message: "Invalid credentials"});
        }

        const isPasswordCorrect = await bcrypt.compare(password,user.password);

        if(!isPasswordCorrect){
            return res.status(400).json({ message: "Invalid credentials"});
        }
        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic
        })
    } catch (error) {
        console.error("Error in login controller ", error.message);
        res.status(500).json({ error: "Internal Server Error"});
    }
}

//logout
const logout = async (req, res)=>{
    try {
        res.cookie("jwt","", {maxAge:0});
        res.status(200).json({message: "Logged Out successfully"});
    } catch (error) {
        console.error("Error in logout controller", error.message);
        res.status(500).json({ error: "Internal Server Error"});
    }
}

//updateProfile
const updateProfile = async(req, res) =>{
    try {
        const {profilePic} = req.body;
        const userId = req.user._id;
        const publicId = req.user.publicId

        if(!profilePic){
            return res.status(400).json({ message: "Profile pic is required"});
        }

        //delete the existing profile pic from cloudinary
        const existedUrl = req.user.profilePic;
        if(existedUrl && publicId){
            await cloudinary.uploader.destroy(publicId)
        }
        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic: uploadResponse.secure_url, publicId: uploadResponse.public_id}, {new: true});

        res.status(201).json(updatedUser);
    } catch (error) {
        console.error("Error in update profile ", error.message);
        res.status(500).json({ error: "Internal Server Error"});
    }
}

//check auth
const checkAuth = (req, res) =>{
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.error("Error in checkAuth controller ", error.message);
        res.status(500).json({error: "Internal Server error"});
    }
}
export {
    signup,
    login,
    logout,
    updateProfile,
    checkAuth
}