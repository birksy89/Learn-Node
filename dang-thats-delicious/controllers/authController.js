const passport = require('passport');

exports.login = passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Failed Login!',
    successRedirect: '/',
    successFlash: 'You now are logged in!'
})

exports.logout = (req,res)=>{
    req.logout();
    req.flash('success', 'You are now logged out')
    res.redirect('/');
}