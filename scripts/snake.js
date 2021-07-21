const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
let snake = []
let food = []
const numCols = 20
const numRows = 20
const cwMax = 30
const chMax = 30
let cw = Math.min(cwMax, vw / numCols)
let ch = Math.min(chMax, (vh * (2/3)) / numCols)
cw = Math.min(cw,ch)
ch = Math.min(cw,ch)
const initLength = 1
const middleRow = Math.floor(numRows / 2)
const middleCol = Math.floor(numCols / 2)
const canvas = document.getElementById("canvas")
const scoreLabel = document.getElementById("score")
const scoreValLabel = document.getElementById("scoreval")
const goLabel = document.getElementById("gameover")
const highLabel = document.getElementById("highscore")
const highValLabel = document.getElementById("highscoreval")
const ctx = canvas.getContext("2d")
let grow = 2;
let score = 0;
let highscore = 0;
let newBest = false;
let alive = true;

const fps = 10;
const moveEvery = 1000 / fps

let opposites = [2,3,0,1]

const foodSound = new Audio("sounds/collect.wav")
const goSound = new Audio("sounds/game-over.wav")
const bestSound = new Audio("sounds/high-score.wav")

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getClosestFit(target, num, full){
    return target + (full - (num * target)) / num
}

function drawSnake(){
    ctx.clearRect(0,0,vw,vh)
    ctx.fillStyle = "rgb(0,255,0)"
    snake.forEach(pos => {
        let y = pos[0] * ch
        let x = pos[1] * cw
        ctx.fillRect(x+1,y+1,cw-2,ch-2)
    })
    ctx.save()
    ctx.translate(snake[0][1] * cw + cw / 2, snake[0][0] * ch + ch / 2)
    let angle = [270,0,90,180][direction];
    ctx.rotate(angle * Math.PI / 180)
    const pad = 2
    const eyeX = cw / 2 - pad * 5
    const eyeY = -ch / 2 + pad * 2
    const eyeW = pad * 3
    const eyeH = pad * 3
    const tongueL = 5;
    ctx.clearRect(eyeX, eyeY, eyeW, eyeH)
    ctx.strokeStyle = "rgb(255,0,0)"
    ctx.lineWidth = pad
    const tongueStartX = cw / 2 - tongueL
    const tongueStartY = ch / 4 - pad / 2
    ctx.beginPath()
    ctx.moveTo(tongueStartX, tongueStartY)
    ctx.lineTo(tongueStartX + tongueL, tongueStartY)
    ctx.lineTo(tongueStartX + tongueL * 2, tongueStartY + tongueL / 2) 
    ctx.moveTo(tongueStartX + tongueL, tongueStartY)
    ctx.lineTo(tongueStartX + tongueL * 2, tongueStartY - tongueL / 2) 
    ctx.stroke()
    ctx.restore()
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
        scoreValLabel.textContent = String(score).padStart(3, '0')
        if(score > highscore && !newBest && highscore > 0){
            scoreValLabel.classList.add("best")
            newBest = true;
            bestSound.play()
        }else{
            foodSound.currentTime = 0;
            foodSound.play()
        }
        placeFood()
    }
    if (grow){
        grow --;
    }else{
        snake = snake.slice(0, snake.length-1)
    }
}

function gameOver(){
    direction = -1;
    alive=false;
    goLabel.hidden = false;
    goSound.currentTime = 0;
    goSound.play();
    if(score > highscore){
        highscore = score;
        highValLabel.textContent = String(score).padStart(3, "0")
    }
}

//cw = getClosestFit(cw, numCols, vw)
//ch = getClosestFit(ch, numRows, vh)
canvas.width = numCols * cw
canvas.height = numRows * ch

canvas.style.top = (vh / 2) - (canvas.height / 2)
canvas.style.left = (vw / 2) - (canvas.width / 2)

scoreLabel.style.left = canvas.style.left
scoreLabel.style.top = parseInt(canvas.style.top) - 60
highLabel.style.left = canvas.style.left
highLabel.style.top = parseInt(scoreLabel.style.top) - 40

scoreValLabel.style.left = parseInt(canvas.style.left) + canvas.width - 74
scoreValLabel.style.top = scoreLabel.style.top
highValLabel.style.left = scoreValLabel.style.left
highValLabel.style.top = highLabel.style.top

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
    if(!alive){
        return
    }
    drawSnake()
    moves++
}

function reset(){
    direction = -1
    nextDir = -1
    grow = 2
    moves = 0
    snake = [[middleRow, middleCol]]
    alive = true
    score = 0
    goLabel.hidden = true;
    scoreValLabel.textContent = "000"
    scoreValLabel.classList.remove("best")
    newBest = false;
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
