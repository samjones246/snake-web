const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
let snake = []
let food = []
let cw = 30
let ch = 30
const initLength = 1
const numCols = 20//Math.floor(vw / cw)
const numRows = 20//Math.floor(vh / cw)
const middleRow = Math.floor(numRows / 2)
const middleCol = Math.floor(numCols / 2)
const canvas = document.getElementById("canvas")
const scoreLabel = document.getElementById("score")
const goLabel = document.getElementById("gameover")
const highLabel = document.getElementById("highscore")
const ctx = canvas.getContext("2d")
let grow = 2;
let score = 0;
let alive = true;

const fps = 10;
const moveEvery = 1000 / fps

let opposites = [2,3,0,1]

const foodSound = new Audio("sounds/collect.wav")
const goSound = new Audio("sounds/game-over.wav")

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getClosestFit(target, num, full){
    return target + (full - (num * target)) / num
}

function drawSnake(){
    ctx.clearRect(0,0,vw,vh)
    snake.forEach(pos => {
        let y = pos[0] * ch
        let x = pos[1] * cw
        ctx.fillStyle = "rgb(0,255,0)"
        ctx.fillRect(x+1,y+1,cw-2,ch-2)
    })
    let y = food[0] * ch
    let x = food[1] * cw
    ctx.fillStyle = "rgb(255,0,0)"
    ctx.fillRect(x+1,y+1,cw-2,ch-2)
}

function checkCollision(r,c){
    let col = false;
    snake.forEach(seg => {
        if (r===seg[0] && c === seg[1]){
            col = true;
        }
    })
    return col || r < 0 || c < 0 || r >= numRows || c >= numCols;
}

function moveHead(direction){
    r = snake[0][0]
    c = snake[0][1]
    switch (direction){
        case 0: //Up
            r--;
            break;
        case 1: //Right
            c++;
            break;
        case 2: //Down
            r++;
            break;
        case 3: //Left
            c--;
            break;
    }
    if(checkCollision(r,c)){
        gameOver()
        return
    }
    snake = [[r,c], ...snake]
    if (r==food[0] && c==food[1]){
        score++;
        grow++;
        scoreLabel.textContent = `Score: ${score}`
        foodSound.currentTime = 0;
        foodSound.play()
        placeFood()
    }
    if (grow){
        grow --;
    }else{
        snake = snake.slice(0, snake.length-1)
    }
}

function gameOver(){
    console.log("game over")
    direction = -1;
    alive=false;
    goLabel.hidden = false;
    scoreLabel.textContent = "Score: 0"
    goSound.currentTime = 0;
    goSound.play();
}

//cw = getClosestFit(cw, numCols, vw)
//ch = getClosestFit(ch, numRows, vh)
canvas.width = numCols * cw
canvas.height = numRows * ch

canvas.style.top = (vh / 2) - (canvas.height / 2)
canvas.style.left = (vw / 2) - (canvas.width / 2)
scoreLabel.style.left = canvas.style.left
scoreLabel.style.top = parseInt(canvas.style.top) - 60
goLabel.style.left = canvas.style.left
goLabel.style.top = parseInt(canvas.style.top) + canvas.height - 15

console.log(`Viewport: ${vw}x${vh}`)
console.log(`Cell: ${cw}x${ch}`)
console.log(`Grid ${numCols}x${numRows}`)
console.log(`Canvas: ${canvas.width}x${canvas.height}`)

// Init snake
let direction, nextDir, moves;
reset()

function step() {
    if(!alive){
        return
    }
    direction = nextDir
    if (direction === -1){
        return
    }
    moveHead(direction)
    drawSnake()
    moves++
}

function reset(){
    console.log("Reset")
    direction = -1
    nextDir = -1
    grow = 2
    moves = 0
    snake = [[middleRow, middleCol]]
    alive = true
    score = 0
    goLabel.hidden = true;
    placeFood()
    drawSnake()
}

function placeFood(){
    let locs = []
    for(let r=0;r<numRows;r++){
        for(let c=0;c<numCols;c++){
            if(!checkCollision(r,c)){
                locs.push([r,c])
            }
        }
    }
    let i = Math.floor(Math.random() * locs.length)
    food = locs[i]
}

document.addEventListener('keydown', event => {
    if(event.code === "Escape"){
        reset()
    }
    if (!alive){
        return;
    }
    codes = ["ArrowUp","ArrowRight","ArrowDown","ArrowLeft"]
    newDir = codes.indexOf(event.code)
    if (newDir !== -1 && newDir !== opposites[direction]){
        nextDir = newDir
    }
})

setInterval(step, moveEvery)
