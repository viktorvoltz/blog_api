const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const User = require("./models/user.js");
const jwt = require("jsonwebtoken");
const JWT_SECRETKEY = "jhvcjhdbvjbadjkfbvjhdjbhjhjbjkbjhbhj";




const app = express()
const port = process.env.PORT || 8080;

app.use(morgan('dev'));
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

/*app.get('*', (req, res) => {
    res.sendFile('index.html', {root: www});
})*/

async function connectToMongoDB() {
    await mongoose.connect('mongodb://localhost:27017/blog');
    console.log(":: Connected to MongoDB server")
}
//connectToMongoDB();

app.get('/ping', (rq, res) => {
    res.status(200).send("hello world!");
})

app.post('/auth/signup', async (req, res) => {
    const data = req.body

    try {
        const user = await new User({
            email: data.email,
            password: data.password,
            full_name: data.full_name
        }).save()

        const token = jwt.sign({ user_id: user._id }, JWT_SECRETKEY, { expiresIn: 60 * 10 })

        res.status(201).send({
            message: "user created", data: {
                token,
                email: user.email,
                full_name: user.full_name

            }
        })
    } catch (error) {
        res.status(400).send({ message: "user was not created", data: error })
        console.log(error)
    }

})

app.post('/auth/signin', async (req, res) => {
    const data = req.body

    const user = await User.findOne({ email: data.email })

    try {
        if (!user) return res.status(400).send({
            message: "invalid email or password"
        });

        if (data.password !== user.password) return res.status(400).send({ message: "invalid email or password" });

        const token = jwt.sign({ user_id: user._id }, JWT_SECRETKEY)

        res.status(201).send({
            message: "user signedin", 
            data: {
                token,
                email: user.email,
                full_name: user.full_name

            }
        })
    } catch (error) {
        res.status(400).send({ message: "user not signed in", data: error });
        console.log(error);
    }


})

app.listen(port, () => {
    try {
        connectToMongoDB();
    } catch (error) {
        console.log("couldnt connect to db")
    }
    console.log(`::listening on http://localhost:${port}`);
})