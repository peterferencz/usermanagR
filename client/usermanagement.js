const registerpanel = document.querySelector('#register')
const loginpanel = document.querySelector('#login')

function openLogin(){
    loginpanel.classList.add("visible")
    registerpanel.classList.remove("visible")
    document.title = "Login"
}

function openRegister(){
    registerpanel.classList.add("visible")
    loginpanel.classList.remove("visible")
    document.title = "Register"
}

function register(){
    const Eusername = document.querySelector('#username')
    const Epassword = document.querySelector('#password')
    const Eemail = document.querySelector('#email')

    fetch('/register', {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache',
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': 'application/json'
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify({
            username: Eusername.value,
            password: Epassword.value,
            email: Eemail.value
        })
    }).then(async(result) => {
        result = await result.json()
        console.log(result)
        switch(result){
            case 0:
                //Everything is fine
                
                break;
            case 1:
                //Username already exists
                displayMessage('Username taken')
                break;
            case 2:
                //Email already exists
                displayMessage('Email already in use')
                break;
            case 3:
                //Invalid username
                displayMessage('Invalid username. (4 - 12 characters)')
                break;
            case 4:
                //Invalid password
                displayMessage('Invalid password. (8 - 25 characters)')
                break;
            case 5:
                //Invalid email
                displayMessage('Invalid email')
                break;
            case 6:
                //Invalid request (missing body)
                displayMessage('Request data lost during transmission, try again')
                break;
            default:
                displayMessage('Unexpected error')
                break;
        }
    }).catch((err) => {
        console.log(err)
    })
}

function login(){
    console.log('login')
    const Eusername = document.querySelector('#l_username')
    const Epassword = document.querySelector('#l_password')

    fetch('/login', {
        method: 'POST',
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache',
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify({
            username: Eusername.value,
            password: Epassword.value
        })
    }).then(async(result) => {
        result = await result.json()
        console.log(result)
        switch(result){
            case 0:
                //Everything is fine
                window.location.replace("/dashboard")
                break;
            case 1:
                //Username invalid
                displayMessage('Username invalid')
                break;
            case 2:
                //Email invalid
                displayMessage('Email invalid')
                break;
            case 3:
                //Password invalid
                displayMessage('Password invalid')
                break;
            case 4:
                //invalid request
                displayMessage('Request data lost during transmission, try again')
                break;
            default:
                displayMessage('Unexpected error')
                break;
        }
    }).catch((err) => {
        console.log(err)
    })
}

const messageContainer = document.querySelector('.msg > p')
function displayMessage(str){
    messageContainer.innerHTML = str
    messageContainer.classList.add('visible')

    setTimeout(() => {
        messageContainer.classList.remove('visible')
    }, 2000);
}

openLogin()