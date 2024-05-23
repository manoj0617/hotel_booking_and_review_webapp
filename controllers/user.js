// controllers/user.js
const User = require('../models/user');

module.exports.signup = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "New user registered successfully!");
            res.redirect('/listing');
        });
    } catch (err) {
        req.flash("error", err.message);
        res.redirect('/signup');
    }
};

module.exports.login = (req, res) => {
    req.flash("success", "Welcome back!");
    const redirectUrl = res.locals.redirectUrl || '/listing';
    res.redirect(redirectUrl);
};

module.exports.renderSignupForm = (req, res) => {
    res.render("../views/users/signup.ejs");
};

module.exports.renderLoginForm = (req, res) => {
    res.render("../views/users/login.ejs");
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "Logged out successfully!");
        res.redirect('/listing');
    });
};
