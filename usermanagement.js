const mongoose = require('mongoose')
const Schema = mongoose.Schema
const enctypt = require('crypto')
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

exports.isusernamevalid = (username) => {
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
exports.ispasswordvalid = (password) => {
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
            
            while(getLoggedInUserFromCookie(cookie) != null){
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
            
            while(getLoggedInUserFromCookie(cookie) != null){
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


function getLoggedInUserFromCookie(cookie) {
    for(let i = 0; i < loggedInUsers.length; i++){
        if(loggedInUsers[i].cookie == cookie){
            return loggedInUsers[i]
        }
    }
    return null;
}
exports.getLoggedInUserFromCookie = getLoggedInUserFromCookie
exports.getLoggedInUserFromId = (id) =>{
    for(let i = 0; i < loggedInUsers.length; i++){
        if(loggedInUsers[i].id == id){
            return loggedInUsers[i]
        }
    }
    return null;
}

exports.logout = (cookie) => {
    for(let i = 0; i < loggedInUsers.length; i++){
        if(loggedInUsers[i].cookie == cookie){
            loggedInUsers.splice(i, 1)
            return true;
        }
    }
    return false;
}

function hash(str, salt){
    return enctypt.pbkdf2Sync(str, salt, 1000, 64, `sha512`).toString(`hex`)
}

function randomHex(length){
    return enctypt.randomBytes(length).toString('hex');
}
