const express = require('express')
const cookieparser = require('cookie-parser')
const http = require('http')
const https = require('https')
const path = require('path')
const fs = require('fs')
const mongoose = require('mongoose')
const auth = require('./auth')
const config = require('./config.json')

const app = express()
app.use(cookieparser(config.account.cookie.secret))
app.use(express.json())
app.set('view-engine', 'ejs')
app.engine('html', require('ejs').renderFile)
app.set('views', path.join(__dirname,'client'))
//app.engine('css', require('ejs').renderFile)

const staticcontent = [
    ["/","index.html"],
    ["/global.css","global.css"],
    ["/auth.js","auth.js"],
    ["/auth.css","auth.css"],
    ["/dashboard.css","dashboard.css"],
    ["/dashboard.js","dashboard.js"]
]



app.get('/dashboard', (req, res) => {
    const loggedInUser = isLoggedIn(req)
    if(!loggedInUser){
        res.redirect('/')
        return;
    }

    res.render('dashboard.html', {
        username: loggedInUser.username
    })
})

app.get('/auth', (req, res) => {
    if(isLoggedIn(req) != null){
        //Logged in
        res.redirect("dashboard")
    }else {
        //not logged in
        res.render("auth.html")
    }
})

app.post('/register', async (req, res) => {
    const username = req.body.username
    const password = req.body.password
    const email = req.body.email

    const conditions = [
        {function: async () => {return (username == null || username.length == 0 || 
            password == null || password.length == 0 || 
            email == null || email.length == 0)}, expected: false, error: "Please fill in all the fields"},
        {function: async () => auth.isusernamevalid(username), expected: true,
            error: `Username not valid (${config.account.username.min} - ${config.account.username.max})`},
        {function: async () => auth.isusernametaken(username), expected: false,
            error: "Username already taken"},
        {function: async () => auth.isemailvalid(email), expected: true,
            error: "Email not valid"},
        {function: async () => auth.isemailtaken(email), expected: false,
            error: "Email already in use"},
        {function: async () => auth.ispasswordvalid(password), expected: true,
            error: `Password not valid (${config.account.password.min} - ${config.account.password.max})`},
    ]

    for (let i = 0; i < conditions.length; i++) {
        const condition = conditions[i];
        if(await condition.function() != condition.expected){
            res.status(400)
            res.write(condition.error)
            res.end()
            return
        }
    }

    await auth.registerUser(username, password, email)

    const cookie = await auth.loginwithusername(username, password)
    res.cookie(config.account.cookie.name, cookie, {signed: true})
    res.status(200)
    res.end()
})

app.post('/login', async (req,res) => {
    const username = req.body.username
    const password = req.body.password

    if(username == null || username.length == 0 || 
        password == null || password.length == 0){
        res.write('Please fill in all the fields')
        res.status(400)
        res.end()
        return;
    }
    

    let userCookie = null
    if(auth.isemailvalid(username)){
        //Login with email
        if(!(await auth.isemailtaken(username))){
            res.write('Email is not in use')
            res.status(400)
            res.end()
            return;
        }

        const cookie = await auth.loginwithemail(username, password)
        if(cookie == false){
            res.write('Invalid credentials')
            res.status(400)
            res.end()
            return;
        }
        userCookie = cookie
    }else{
        if(!(await auth.isusernametaken(username))){
            res.write('Unknown username')
            res.status(400)
            res.end()
            return;
        }

        const cookie = await auth.loginwithusername(username, password)
        if(cookie == false){
            res.write('Invalid credentials')
            res.status(400)
            res.end()
            return;
        }
        userCookie = cookie
    }

    res.cookie(config.account.cookie.name, userCookie, {signed: true})
    res.status(200)
    res.write("0")
    res.end()
    return;
})

app.get('/logout', (req, res) => {
    const cookie = req.signedCookies[config.account.cookie.name]
    res.clearCookie(config.account.cookie.name, {secure: true})
    auth.logout(cookie)
    res.redirect('/')
})

// ! Handling of static content
// ! important leave this path last in code, or else your
// ! paths will be flagged as 404
app.get('*', (req,res) => {
    for (let i = 0; i < staticcontent.length; i++){
        if(req.path == staticcontent[i][0]){
            if(staticcontent[i][1].slice(staticcontent[i][1].lastIndexOf('.') + 1) == 'html'){
                res.render(path.join(__dirname, 'client', staticcontent[i][1]))
            }else {
                res.sendFile(path.join(__dirname, 'client', staticcontent[i][1]))
            }
            return
        }
    }
    res.status(404)
    res.render("404.html")
})


function isLoggedIn(req){
    const cookie = req.signedCookies[config.account.cookie.name]
    const loggedInUser = auth.getLoggedInUserFromCookie(cookie)
    if(cookie == null || loggedInUser == null){
        return null;
    }
    return loggedInUser
}


// Setting up server listeners

if(config.webserver.http.enabled){
    const httpServer = http.createServer(app)
    httpServer.listen(config.webserver.http.port, () => {
        console.log("Started http server")
    })
}
// HTTPS currently not working in firefox,
// but fine in chrome. Shouldn't be an issue
// with a proper CA, but sucks for local dev.
if(config.webserver.https.enabled){
    const httpsServer = https.createServer({
        key: fs.readFileSync(path.join(__dirname,"certificates","server.key")),
        cert: fs.readFileSync(path.join(__dirname,"certificates","server.cert"))
    }, app)
    httpsServer.listen(config.webserver.https.port, () => {
        console.log("Started https server")
    })
}

mongoose.connect(config.database.connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) => {
    if(err) throw err;
    console.log("Connected to mongodb!")
})