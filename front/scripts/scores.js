const tabs = document.querySelectorAll(".panel_tab")
const submitBox = document.getElementById("score_submit")
const leaderboardRows = document.querySelectorAll("#scores_table tr")
const apiRoot = "http://localhost:8000"
let active = "daily"

function updateActiveTab(id){
    active = id
    tabs.forEach(e => {
        if (e.id === active){
            e.classList.add("active")
        }else{
            e.classList.remove("active")
        }
    })
    populateScores()
}

function populateScores(){
    leaderboardRows.forEach(e => {
        e.querySelector(".name").textContent = ""
        e.querySelector(".score").textContent = ""
    })
    const today = new Date()
    let filter = "/scores/"
    if (active === "yearly"){
        filter = `/scores/${today.getFullYear()}`
    }
    else if (active === "monthly") {
        filter = `/scores/${today.getFullYear()}/${today.getMonth()+1}`
    }
    else if (active === "daily") {
        filter = `/scores/${today.getFullYear()}/${today.getMonth()+1}/${today.getDate()}`
    }
    axios.get(apiRoot + filter)
    .then(res => {
        let scores = res.data
        for(let i=0;i<10;i++){
            let name, score
            if(i < scores.length){
                name = scores[i].fields.name
                score = scores[i].fields.score
            }else{
                name = "-"
                score = "-"
            }
            leaderboardRows[i].querySelector(".name").textContent = name
            leaderboardRows[i].querySelector(".score").textContent = score
        }
    })
}

tabs.forEach(e => {
    e.onclick = () => {
        updateActiveTab(e.id)
    }
})

const buttons = document.querySelectorAll(".score_submit_controls button")
const submitButton = buttons[0];

function enableScoreSubmitBox(score){
    submitButton.onclick = () => {
        let name = document.getElementById("submit_name").value
        submitScore(name, score)
        submitButton.style.enabled = false
    }
    submitBox.classList.remove("hidden")
}

function disableScoreSubmitBox(){
    submitBox.classList.add("hidden")
}

function submitScore(name, score){
    let data = new FormData()
    data.append("name", name)
    data.append("score", score)

    axios.post(apiRoot + "/scores/submit", data)
    .then(res => {
        disableScoreSubmitBox()
        populateScores()
    })
}

populateScores()