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
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify({
            username: Eusername.value,
            password: Epassword.value,
            email: Eemail.value
        })
    }).then(async(result) => {
        if(result.status == 200){
            window.location.replace("/dashboard")
        }else{
            result = await result.text()
            displayMessage(result)
        }
    }).catch((err) => {
        console.log(err)
    })
}

function login(){
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
        if(result.status == 200){
            window.location.replace("/dashboard")
        }else{
            result = await result.text()
            displayMessage(result)
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