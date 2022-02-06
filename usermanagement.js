const mongoose = require('mongoose')
const Schema = mongoose.Schema
const crypto = require('crypto')
const config = require('./config.json')

const loggedInUsers = []

const userSchema = new Schema({
    username: {type: String, required: true},
    passwordHash: {type: String, required: true},
    passwordSalt: {type: String, required: true},
    email: {type: String, required: true}
},{
    timestamps: true
})

const usersdb = mongoose.model('user', userSchema)

// exports.getUserFromCredentials = (username, password) => {
//     usersdb.findOne({
//         username: username,
//         password: password
//     }).then((user) => {
//         return user
//     }).catch((err) => {
//         throw err
//     })
// }

exports.register_isusernamevalid = (username) => {
    return (username.length > config.account.username.min-1 && username.length < config.account.username.max+1)
}

exports.isusernametaken = async (username) => {
    if(await usersdb.findOne({
        username: username
    }) === null){
        return false
    }else {
        return true
    }
}
exports.register_ispasswordvalid = (password) => {
    console.log(password, password.length, config.account.password.min, config.account.password.max)
    if((password.length >= config.account.password.min) && (password.length <= config.account.password.max)){
        return true
    } else {
        return false
    }
}

exports.isemailvalid = (email) => {
    const emailregex = /\S+@\S+\.\S+/;
    return emailregex.test(email)
}
exports.isemailtaken = async (email) => {
    if(await usersdb.findOne({
        email: email
    }) === null){
        return false
    }else {
        return true
    }
}

exports.loginwithemail = async (email, password) => {
    const usr = await usersdb.findOne({
        email: email
    })
    if(usr === null){
        return false
    }else {
        if(hash(password, usr.salt) == usr.passwordHash){
            let cookie = randomHex(config.account.cookie.lengtgh)
            
            while(this.getLoggedInUserFromCookie(cookie) != null){
                cookie = randomHex(config.account.cookie.lengtgh)
            }

            loggedInUsers.push({
                id: usr._id,
                username: usr.username,
                cookie: cookie
            })
            return cookie
        } else{
            return false
        }
    }
}
exports.loginwithusername = async (username, password) => {
    const usr = await usersdb.findOne({
        username: username
    })
    if(usr === null){
        return false
    }else {
        if(hash(password, usr.passwordSalt) == usr.passwordHash){
            let cookie = randomHex(config.account.cookie.lengtgh)
            
            while(this.getLoggedInUserFromCookie(cookie) != null){
                cookie = randomHex(config.account.cookie.lengtgh)
            }

            loggedInUsers.push({
                id: usr._id,
                username: usr.username,
                cookie: cookie
            })
            return cookie
        } else{
            return false
        }
    }
}

exports.registerUser = async (username, password, email) => {
    console.log(username, password, email)

    const salt = randomHex(config.account.password.saltLength)
    const newUser = new usersdb({
        username: username,
        passwordHash: hash(password, salt),
        passwordSalt: salt,
        email: email
    })
    
    await newUser.save()
}


exports.getLoggedInUserFromCookie = (cookie) =>{
    for(let i = 0; i < loggedInUsers.length; i++){
        if(loggedInUsers[i].cookie == cookie){
            return loggedInUsers[i]
        }
    }
    return null;
}
exports.getLoggedInUserFromId = (id) =>{
    for(let i = 0; i < loggedInUsers.length; i++){
        if(loggedInUsers[i].id == id){
            return loggedInUsers[i]
        }
    }
    return null;
}

function hash(str, salt){
    return crypto.pbkdf2Sync(str, salt, 1000, 64, `sha512`).toString(`hex`)
}

function randomHex(length){
    return crypto.randomBytes(length).toString('hex');
}