const router = require('express').Router();
const User = require('../model/User');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const { registrationValidation, loginValidation } = require('../validation');

router.post('/register', async (req, res) => {


    const { error } = registrationValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    // res.send(error.details[0].message);
    // res.send(error.details[0].message);


    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) return res.status(404).send("Email already exists");


    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(req.body.password, salt);


    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedpassword
    });
    try {
        const savedUser = await user.save();
        // res.send(savedUser);
        res.send(savedUser.id);
    } catch (err) {
        res.status(404).send(err);
        console.log(err);
    }
    console.log(req.body);


});



router.post('/login', async (req, res) => {
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).send("Email doesnot exists");

    const checkpass = await bcrypt.compare(req.body.password, user.password)
    if (!checkpass) return res.status(404).send("invalid password");

    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send(token);

    // res.send("signed in");

    // console.log("get request working")
});





module.exports = router;     