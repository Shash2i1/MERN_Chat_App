import { Router } from "express";
import {signup, login, logout, updateProfile, checkAuth} from "../controllers/auth.controller.js"
import { protectRoute } from "../middleware/protectRoute.middleware.js";
const router = Router();



//Signup router
router.post("/signup",signup);
//login route
router.post("/login", login)
//logout
router.post("/logout", logout);
//updateProfile
router.put("/update-profile",protectRoute, updateProfile);
//get current user
router.get("/get-current-user", protectRoute, checkAuth);


export default router;