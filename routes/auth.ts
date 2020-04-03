import express from "express";
import {auth} from '../controllers/auth';


export default class authRouter {
    router: any;

    constructor(){
        this.router = express.Router();
    }

    //pendiente este metodo ya que da error
    routerFun(){
        let authController = new auth();
        //import validators
        const {
          userSignupValidator,
          userSigninValidator,
          forgotPasswordValidator,
          resetPasswordValidator
        } = require("../validators/auth");
        const { runValidation } = require("../validators/index");

        this.router.post(
          "/signup",
          userSignupValidator,
          runValidation,
          authController.signup
        );
        this.router.post("/account-activation", authController.accountActivation);
        this.router.post(
          "/signin",
          userSigninValidator,
          runValidation,
          authController.signin
        );
        //forgot reset password
        this.router.put(
          "/forgot-password",
          forgotPasswordValidator,
          runValidation,
          authController.forgotPassword
        );
        this.router.put(
          "/reset-password",
          resetPasswordValidator,
          runValidation,
          authController.resetPassword
        );
        //google and facebook
        this.router.post("/google-login", authController.googleLogin);
        this.router.post("/facebook-login", authController.facebookLogin);
    }
}

