import express from "express";
import {auth} from '../controllers/auth';

const router = express.Router();

        let authController = new auth();
        //import validators
        const {
          userSignupValidator,
          userSigninValidator,
          forgotPasswordValidator,
          resetPasswordValidator
        } = require("../validators/auth");
        const { runValidation } = require("../validators/index");

        router.post(
          "/signup",
          userSignupValidator,
          runValidation,
          authController.signup
        );
        router.post("/account-activation", authController.accountActivation);
        router.post(
          "/signin",
          userSigninValidator,
          runValidation,
          authController.signin
        );
        //forgot reset password
        router.put(
          "/forgot-password",
          forgotPasswordValidator,
          runValidation,
          authController.forgotPassword
        );
        router.put(
          "/reset-password",
          resetPasswordValidator,
          runValidation,
          authController.resetPassword
        );
        //google and facebook
        router.post("/google-login", authController.googleLogin);
        router.post("/facebook-login", authController.facebookLogin);
        
        export = router;
