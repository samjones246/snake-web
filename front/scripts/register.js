const apiRoot = "http://localhost:8000/auth"

document.getElementById("submit").onclick = () => {
    let username = document.getElementById("username").value
    let password1 = document.getElementById("password1").value
    let password2 = document.getElementById("password2").value
    axios.post(apiRoot + "/auth/register", {
        username: username,
        password1: password1,
        password2: password2
    })
    .then(res => {
        console.log(res)
    })
}