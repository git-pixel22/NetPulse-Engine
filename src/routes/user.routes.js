import { Router } from "express";
import { logoutUser, loginUser, registerUser, refreshAccessToken, changePassword, getCurrentUser, updateAccountDetails } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1 
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)


// secured routes (routes for logged in users)
router.route("/logout").post(verifyJWT ,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changePassword)
router.route("/get-current-user").post(verifyJWT, getCurrentUser)
router.route("update-account-details").post(verifyJWT, updateAccountDetails)

export default router