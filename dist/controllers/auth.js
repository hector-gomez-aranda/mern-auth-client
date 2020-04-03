"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User = require("../models/user");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const lodash_1 = __importDefault(require("lodash"));
const { OAuth2Client } = require("google-auth-library");
const node_fetch_1 = __importDefault(require("node-fetch"));
// sendgrid
const mail_1 = __importDefault(require("@sendgrid/mail"));
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
class auth {
    constructor() {
        this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    }
    signup(req, res) {
        const { name, email, password } = req.body;
        User.findOne({ email }).exec((err, user) => {
            if (user) {
                return res.status(400).json({
                    error: "Email is taken"
                });
            }
            const token = jsonwebtoken_1.default.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: "10m" });
            const emailData = {
                from: process.env.EMAIL_FROM,
                to: email,
                subject: "Account activation link",
                html: `
        <h1>Please use the following link to activate your account</h1>
        <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
        <hr/>
        <p>This email may contain sensetive information</p>
        <p>${process.env.CLIENT_URL}</p>

        `
            };
            mail_1.default
                .send(emailData)
                .then(sent => {
                console.log("SIGNUP EMAIL SENT", sent);
                return res.json({
                    message: `Email has been sent to ${email}. Follow the instruction to activate your account.`
                });
            })
                .catch(err => {
                console.log("SIGNUP EMAIL SENT error", err);
                return res.json({
                    message: err.message
                });
            });
        });
    }
    accountActivation(req, res) {
        const { token } = req.body;
        if (token) {
            jsonwebtoken_1.default.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function (err, decoded) {
                if (err) {
                    console.log("JWT VERIFY IN ACOOUNT ACTIVATION ERROR", err);
                    return res.status(401).json({
                        error: "Expired link, Signup again"
                    });
                }
                const { name, email, password } = jsonwebtoken_1.default.decode(token);
                const user = new User({ name, email, password });
                user.save((err, user) => {
                    if (err) {
                        console.log("SAVE USER IN ACCOUNT ACTIVATION ERROR", err);
                        return res.status(401).json({
                            error: "Error saving user in database. Try signup again"
                        });
                    }
                    return res.json({
                        message: "Signup success. Please signin"
                    });
                });
            });
        }
        else {
            return res.json({
                message: "Something went wrong, Try again"
            });
        }
    }
    signin(req, res) {
        const { email, password } = req.body;
        //check if user exists
        User.findOne({ email }).exec((err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    error: "User with that email does not exist. Please signup"
                });
            }
            // authenticate
            if (!user.authenticate(password)) {
                return res.status(400).json({
                    error: "Email and password do not match"
                });
            }
            //generate a token and send to client
            const token = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.JWT_SECRET, {
                expiresIn: "7d"
            });
            const { _id, name, email, role } = user;
            return res.json({
                token,
                user: { _id, name, email, role }
            });
        });
    }
    // PENDIENTE 
    // function requireSignin = expressJwt({
    //     secret: process.env.JWT_SECRET //req.user
    // })
    adminMiddleware(req, res, next) {
        User.findById({ _id: req.user._id }).exec((err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    error: "User not found"
                });
            }
            if (user.role !== "admin") {
                return res.status(400).json({
                    error: "Admin resource. Access denied"
                });
            }
            req.profile = user;
            next();
        });
    }
    forgotPassword(req, res) {
        const { email } = req.body;
        User.findOne({ email }, (err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    error: "User with that email does not exist"
                });
            }
            const token = jsonwebtoken_1.default.sign({ _id: user._id, name: user.name }, process.env.JWT_RESET_PASSWORD, { expiresIn: "10m" });
            const emailData = {
                from: process.env.EMAIL_FROM,
                to: email,
                subject: "Password reset link",
                html: `
        <h1>Please use the following link to reset your password</h1>
        <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
        <hr/>
        <p>This email may contain sensetive information</p>
        <p>${process.env.CLIENT_URL}</p>

        `
            };
            return user.updateOne({ resetPasswordLink: token }, (err, success) => {
                if (err) {
                    console.log("RESET PASSWORD LINK ERROR", err);
                    return res.status(400).json({
                        error: "Database connection error on user password forgot request"
                    });
                }
                else {
                    mail_1.default
                        .send(emailData)
                        .then(sent => {
                        console.log("SIGNUP EMAIL SENT", sent);
                        return res.json({
                            message: `Email has been sent to ${email}. Follow the instruction to activate your account.`
                        });
                    })
                        .catch(err => {
                        console.log("SIGNUP EMAIL SENT error", err);
                        return res.json({
                            message: err.message
                        });
                    });
                }
            });
        });
    }
    resetPassword(req, res) {
        const { resetPasswordLink, newPassword } = req.body;
        if (resetPasswordLink) {
            jsonwebtoken_1.default.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function (err, decoded) {
                if (err) {
                    return res.status(400).json({
                        error: "Expired link. Try again"
                    });
                }
                User.findOne({ resetPasswordLink }, (err, user) => {
                    if (err || !user) {
                        return res.status(400).json({
                            error: "Something went wrong. Try later"
                        });
                    }
                    const updatedFields = {
                        password: newPassword,
                        resetPasswordLink: ""
                    };
                    user = lodash_1.default.extend(user, updatedFields);
                    user.save((err, result) => {
                        if (err) {
                            return res.status(400).json({
                                error: "Error reseting user password"
                            });
                        }
                        res.json({
                            message: `Great! Now you can login with your new password`
                        });
                    });
                });
            });
        }
    }
    googleLogin(req, res) {
        // const { idToken } = req.body;
        // this.client
        //     .verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })
        //     .then(response => {
        //     //console.log('GOOGLE LOGIN RESPONSE', response);
        //     const { email_verified, name, email } = response.payload;
        //     if (email_verified) {
        //         User.findOne({ email }).exec((err:any, user: any) => {
        //         if (user) {
        //             const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET as string, {
        //             expiresIn: "7d"
        //             });
        //             const { _id, email, name, role } = user;
        //             return res.json({
        //             token,
        //             user: { _id, email, name, role }
        //             });
        //         } else {
        //             let password = email + process.env.JWT_SECRET;
        //             user = new User({ name, email, password });
        //             user.save((err: any, data: any) => {
        //             if (err) {
        //                 console.log("ERROR GOOGLE LOGIN ON USER SAVE", err);
        //                 return res.status(400).json({
        //                 error: "User signup failed with google"
        //                 });
        //             }
        //             const token = jwt.sign(
        //                 { _id: data._id },
        //                 process.env.JWT_SECRET as string,
        //                 {
        //                 expiresIn: "7d"
        //                 }
        //             );
        //             const { _id, email, name, role } = data;
        //             return res.json({
        //                 token,
        //                 user: { _id, email, name, role }
        //             });
        //             });
        //         }
        //         });
        //     } else {
        //         return res.status(400).json({
        //         error: "Google login failed. Try again"
        //         });
        //     }
        //     });
    }
    facebookLogin(req, res) {
        console.log("FACEBOOK LOGIN REQ BODY", req.body);
        const { userID, accessToken } = req.body;
        const url = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;
        return (node_fetch_1.default(url, {
            method: "GET"
        })
            .then(response => response.json())
            //.then(response = console.log(response))
            .then(response => {
            const { email, name } = response;
            User.findOne({ email }).exec((err, user) => {
                if (user) {
                    const token = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.JWT_SECRET, {
                        expiresIn: "7d"
                    });
                    const { _id, email, name, role } = user;
                    return res.json({
                        token,
                        user: { _id, email, name, role }
                    });
                }
                else {
                    let password = email + process.env.JWT_SECRET;
                    user = new User({ name, email, password });
                    user.save((err, data) => {
                        if (err) {
                            console.log("ERROR FACEBOOK LOGIN ON USER SAVE", err);
                            return res.status(400).json({
                                error: "User signup failed with facebook"
                            });
                        }
                        const token = jsonwebtoken_1.default.sign({ _id: data._id }, process.env.JWT_SECRET, {
                            expiresIn: "7d"
                        });
                        const { _id, email, name, role } = data;
                        return res.json({
                            token,
                            user: { _id, email, name, role }
                        });
                    });
                }
            });
        })
            .catch(error => {
            res.json({
                error: "Facebook login failed. Try later"
            });
        }));
    }
}
exports.auth = auth;
