"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../controllers/auth");
const router = express_1.default.Router();
let authController = new auth_1.auth();
//import validators
const { userSignupValidator, userSigninValidator, forgotPasswordValidator, resetPasswordValidator } = require("../validators/auth");
const { runValidation } = require("../validators/index");
router.post("/signup", userSignupValidator, runValidation, authController.signup);
router.post("/account-activation", authController.accountActivation);
router.post("/signin", userSigninValidator, runValidation, authController.signin);
//forgot reset password
router.put("/forgot-password", forgotPasswordValidator, runValidation, authController.forgotPassword);
router.put("/reset-password", resetPasswordValidator, runValidation, authController.resetPassword);
//google and facebook
router.post("/google-login", authController.googleLogin);
router.post("/facebook-login", authController.facebookLogin);
exports.default = auth_1.auth;
