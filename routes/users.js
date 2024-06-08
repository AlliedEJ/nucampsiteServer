const express = require('express');
const User = require('../models/user');
const router = express.Router();
const passport = require('passport');
const authenticate = require('../authenticate');

/* GET users listing. */
router.get('/', authenticate.verifyUser, function(req, res, next) {
  User.find()
  .then(users => { 
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(users);
  })
  .catch(err => next(err));
});

router.post("/signup", async (req, res) => {
  try {
    const user = new User({ username: req.body.username });
    await User.register(user, req.body.password);

    try {
      await user.save();
      passport.authenticate("local")(req, res, () => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: true, status: "Registration Successful!" });
      });
    } catch (saveErr) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.json({ err: saveErr });
    }
  } catch (registerErr) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.json({ err: registerErr });
  }
});

router.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
  const token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are successfully logged in!'});
});

router.get('/logout', (req, res, next) => {
  if (req.session) {
      req.session.destroy();
      res.clearCookie('session-id');
      res.redirect('/');
  } else {
      const err = new Error('You are not logged in!');
      err.status = 401;
      return next(err);
  }
});

module.exports = router;
