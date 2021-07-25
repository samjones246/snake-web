const tabs = document.querySelectorAll(".panel_tab")
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
}
tabs.forEach(e => {
    e.onclick = () => {
        updateActiveTab(e.id)
    }
})