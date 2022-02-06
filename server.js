const express = require('express')
const bodyparser = require('body-parser')
const cookieparser = require('cookie-parser')
const path = require('path')
const mongoose = require('mongoose')
const usermanagement = require('./usermanagement')
const config = require("./config.json")

const app = express()
app.use(cookieparser(config.account.cookie.secret))
app.use(bodyparser.json())
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

app.get('/dashboard', (req,res) => {
    const cookie = req.signedCookies[config.account.cookie.name]
    const loggedInUser = usermanagement.getLoggedInUserFromCookie(cookie)
    if(cookie == null || loggedInUser == null){
        res.redirect('/')
        return;
    }

    res.render('dashboard.html', {
        username: loggedInUser.username
    })
})

app.post('/register', async (req, res) => {
    if(req.body.username == null || req.body.password == null || req.body.email == null){
        res.write('6')
        res.end()
        return
    }
    const username = req.body.username
    const password = req.body.password
    const email = req.body.email

    if(!usermanagement.register_isusernamevalid(username)){
        res.write('3')
        res.end()
        return;
    }

    if(await usermanagement.isusernametaken(username)){
        res.write('1')
        res.end()
        return;
    }

    if(!usermanagement.isemailvalid(email)){
        res.write('5')
        res.end()
        return;
    }
    if(await usermanagement.isemailtaken(email)){
        res.write('2')
        res.end()
        return;
    }
    if(!usermanagement.register_ispasswordvalid(password)){
        res.write('4')
        res.end()
        return;
    }

    //TODO add error handling
    await usermanagement.registerUser(username, password, email)

    const cookie = await usermanagement.loginwithusername(username, password)
    res.cookie(config.account.cookie.name, cookie, {signed: true})
    res.write('0')
    res.end()
})

app.post('/login', async (req,res) => {
    console.log('login')
    const username = req.body.username
    const password = req.body.password

    if(password == null || username == null){
        console.log('2')
        res.write('2')
        res.end()
        return;
    }
    

    let userCookie = null
    if(usermanagement.isemailvalid(username)){
        //Login with email
        if(!(await usermanagement.isemailtaken(username))){
            console.log('4')
            res.write('4')
            res.end()
            return;
        }

        const cookie = await usermanagement.loginwithemail(username, password)
        if(cookie == false){
            console.log('2')
            res.write('2')
            res.end()
            return;
        }
        userCookie = cookie
    }else{
        if(!(await usermanagement.isusernametaken(username))){
            console.log('1')
            res.write('1')
            res.end()
            return;
        }

        const cookie = await usermanagement.loginwithusername(username, password)
        if(cookie == false){
            console.log('3')
            res.write('3')
            res.end()
            return;
        }
        userCookie = cookie
    }

    res.cookie(config.account.cookie.name, userCookie, {signed: true})
    res.write('0')
    res.end()
    return;
})

app.get('/logout', (req, res) => {
    const cookie = req.signedCookies[config.account.cookie.name]
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
    res.write('404')
    res.end()
})

app.listen(8080, (err) => {
    if (err) throw err;
    console.log("Express server started")
})

mongoose.connect('mongodb://localhost:27017/lollers', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) => {
    if(err) throw err;
    console.log("Connected to mongodb!")
})