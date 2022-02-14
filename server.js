const express = require('express')
const cookieparser = require('cookie-parser')
const path = require('path')
const mongoose = require('mongoose')
const usermanagement = require('./usermanagement')
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
    ["/usermanagement","usermanagement.html"],
    ["/usermanagement.js","usermanagement.js"],
    ["/usermanagement.css","usermanagement.css"],
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

app.post('/register', async (req, res) => {
    const username = req.body.username
    const password = req.body.password
    const email = req.body.email

    const conditions = [
        {function: async () => {return (username == null || username.length == 0 || 
            password == null || password.length == 0 || 
            email == null || email.length == 0)}, expected: false, error: "Please fill in all the fields"},
        {function: async () => usermanagement.isusernamevalid(username), expected: true,
            error: `Username not valid (${config.account.username.min} - ${config.account.username.max})`},
        {function: async () => usermanagement.isusernametaken(username), expected: false,
            error: "Username already taken"},
        {function: async () => usermanagement.isemailvalid(email), expected: true,
            error: "Email not valid"},
        {function: async () => usermanagement.isemailtaken(email), expected: false,
            error: "Email already in use"},
        {function: async () => usermanagement.ispasswordvalid(password), expected: true,
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

    await usermanagement.registerUser(username, password, email)

    const cookie = await usermanagement.loginwithusername(username, password)
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
        res.end()
        return;
    }
    

    let userCookie = null
    if(usermanagement.isemailvalid(username)){
        //Login with email
        if(!(await usermanagement.isemailtaken(username))){
            res.write('Email is not in use')
            res.end()
            return;
        }

        const cookie = await usermanagement.loginwithemail(username, password)
        if(cookie == false){
            res.write('Invalid credentials')
            res.end()
            return;
        }
        userCookie = cookie
    }else{
        if(!(await usermanagement.isusernametaken(username))){
            res.write('Unknown username')
            res.end()
            return;
        }

        const cookie = await usermanagement.loginwithusername(username, password)
        if(cookie == false){
            res.write('Invalid credentials')
            res.end()
            return;
        }
        userCookie = cookie
    }

    res.cookie(config.account.cookie.name, userCookie, {signed: true})
    res.end()
    return;
})

app.get('/logout', (req, res) => {
    const cookie = req.signedCookies[config.account.cookie.name]
    res.clearCookie(config.account.cookie.name, {secure: true})
    usermanagement.logout(cookie)
    res.redirect('/')
})

//Handling of static content
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
    const loggedInUser = usermanagement.getLoggedInUserFromCookie(cookie)
    if(cookie == null || loggedInUser == null){
        return null;
    }
    return loggedInUser
}

app.listen(8080, (err) => {
    if (err) throw err;
    console.log("Express server started")
})

mongoose.connect(config.database.connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) => {
    if(err) throw err;
    console.log("Connected to mongodb!")
})