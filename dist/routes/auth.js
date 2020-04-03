"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../controllers/auth");
class authRouter {
    constructor() {
        this.router = express_1.default.Router();
    }
    //pendiente este metodo ya que da error
    routerFun() {
        let authController = new auth_1.auth();
        //import validators
        const { userSignupValidator, userSigninValidator, forgotPasswordValidator, resetPasswordValidator } = require("../validators/auth");
        const { runValidation } = require("../validators/index");
        this.router.post("/signup", userSignupValidator, runValidation, authController.signup);
        this.router.post("/account-activation", authController.accountActivation);
        this.router.post("/signin", userSigninValidator, runValidation, authController.signin);
        //forgot reset password
        this.router.put("/forgot-password", forgotPasswordValidator, runValidation, authController.forgotPassword);
        this.router.put("/reset-password", resetPasswordValidator, runValidation, authController.resetPassword);
        //google and facebook
        this.router.post("/google-login", authController.googleLogin);
        this.router.post("/facebook-login", authController.facebookLogin);
    }
}
exports.default = authRouter;
