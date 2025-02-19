const express=require("express")
const {createProfile,upload, profile }=require("../controllers/profileController")
const router=express.Router()


router.post("/create-profile",upload.single('profileImage'),createProfile)
router.get("/profile/:userId", profile)



module.exports=router