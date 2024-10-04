const express = require("express");
const jwt = require("jsonwebtoken")
const app = express()
const JWT_SECRET = "JWT_UJWAL"

app.use(express.json());

const users = [];

app.post("/signup", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;


    if (password.length < 8) {
        return res.status(400).json({
            message: "your password length is less than 8"
        })
    }


    if (username.length < 5) {
        return res.status(400).json({
            message: "your username length is less than 5"
        })
    }

    const userExists = users.find(u => u.username === username)
    if (userExists) {
        return res.status(400).json({
            message: "user already exists"
        })
    }

    users.push({
        username: username,
        password: password
    })

    res.status(200).json({
        message: "you have sucessfully signed up"
    })
})

app.post("/signin", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    const foundUser = users.find(u => u.username === username && u.password === password)

    if (foundUser) {
        const token = jwt.sign({
            username: username,
        }, JWT_SECRET)

        return res.json({
            message: "signed in sucessfully",
            token: token
        })
    } else {
        return res.status(400).json({
            message: " invalid cridentials",
        })
    }
})

function auth(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({
            message: "Authorization token missing"
        })
    }

    try {
        const decodedInformation = jwt.verify(token, JWT_SECRET)
        const user = users.find(u => u.username === decodedInformation.username)
        if (!user) {
            return res.status(401).json({
                message: "you are not signed in"
            })
        }
        else {
            req.username = decodedInformation.username;
            next();
        }
    } catch (error) {
        return res.status(403).json({
            message: "Failed to authenticate token",
            error: error.message
        })

    }

}

app.get("/me", auth, (req, res) => {


    const user = users.find(u => u.username === req.username)
    if (user) {
        return res.json({
            username: user.username,
            password: user.password
        })
    } else {
        return res.status(401).json({
            message: "Invalid token"
        })
    }
})


app.listen(3000);