function setScore(val){
    console.log("Nice try")
}
;(function(){

// Constants
const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
const numCols = 20
const numRows = 20
const cwMax = 30
const chMax = 30
const cw = Math.min(vw / numCols, (vh * (2/3)) / numCols)
const ch = cw;
const middleRow = Math.floor(numRows / 2)
const middleCol = Math.floor(numCols / 2)
const canvas = document.getElementById("canvas")
const scoreLabel = document.getElementById("score")
const scoreValLabel = document.getElementById("scoreval")
const goLabel = document.getElementById("gameover")
const highLabel = document.getElementById("highscore")
const highValLabel = document.getElementById("highscoreval")
const pauseLabel = document.getElementById("pause")
const ctx = canvas.getContext("2d")
const fps = 10;
const moveEvery = 1000 / fps
const opposites = [2,3,0,1]
const foodSound = new Audio("sounds/collect.wav")
const goSound = new Audio("sounds/game-over.wav")
const bestSound = new Audio("sounds/high-score.wav")
const inputBufferMax = 2

// State variables
let snake = []
let food = []
let grow = 2;
let score = 0;
let highscore = window.localStorage["highscore"] || 0;
highValLabel.textContent = String(highscore).padStart(3, '0')
let newBest = false;
let alive = true;
let paused = false;
let inputBuffer = []
let direction;

// Functions

/*
    Redraw the canvas to reflect the current state (snake and food positions)
*/
function draw(){
    // Clear canvas before drawing
    ctx.clearRect(0,0,vw,vh)

    // Draw each segment of the snake
    ctx.fillStyle = "rgb(0,255,0)"
    snake.forEach(pos => {
        let y = pos[0] * ch
        let x = pos[1] * cw
        ctx.fillRect(x+1,y+1,cw-2,ch-2)
    })

    // Draw the snake's eye and tongue
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

    // Draw the food
    let y = food[0] * ch
    let x = food[1] * cw
    ctx.fillStyle = "rgb(255,0,0)"
    ctx.fillRect(x+1,y+1,cw-2,ch-2)
}

/*
    Check if the specified row and column is occupied by the snake or is outside the play area
*/
function checkCollision(r,c){
    let col = false;
    snake.forEach(seg => {
        if (r===seg[0] && c === seg[1]){
            col = true;
        }
    })
    return col || r < 0 || c < 0 || r >= numRows || c >= numCols;
}

/*
    Move the snake one cell in the specified direction
    If this move causes the snake to collect food, score is incremented and new food is spawned
    If this move causes the snake to collide with itself or a wall, a game over is triggered
*/
function moveHead(direction){
    // Get new head position
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

    // Collision? Dead
    if(checkCollision(r,c)){
        gameOver()
        return
    }

    // Place the new segment at the front of the snake
    snake = [[r,c], ...snake]

    // Check for food collection, respond accordingly
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

    // Delete tail if not growing
    if (grow){
        grow --;
    }else{
        snake = snake.slice(0, snake.length-1)
    }
}


/*
    Stop play, update high score if necessary.
    Triggered when snake collides with self or wall
*/
function gameOver(){
    alive=false;
    direction = -1;
    goLabel.hidden = false;
    goSound.currentTime = 0;
    goSound.play();
    if(score > highscore){
        highscore = score;
        window.localStorage["highscore"] = highscore
        highValLabel.textContent = String(score).padStart(3, "0")
        enableScoreSubmitBox(score)
    }
    enableScoreSubmitBox(score)
}

/*
    Places canvas and label elements at correct positions on screen
*/
function initHtmlElements(){
    canvas.width = numCols * cw
    canvas.height = numRows * ch
    canvas.style.top = (vh / 2) - (canvas.height / 2)
    scoreLabel.style.top = parseInt(canvas.style.top) - 40
    highLabel.style.top = parseInt(scoreLabel.style.top) - 40
    scoreValLabel.style.top = scoreLabel.style.top
    highValLabel.style.top = highLabel.style.top
    goLabel.style.left = canvas.style.left
    goLabel.style.top = parseInt(canvas.style.top) + canvas.height + 10
}

/*
    Main game loop function. Called at every frame to advance state.
    Should be used with setInterval
*/
function step() {
    if(!alive || paused){
        return
    }
    if (inputBuffer.length > 0){
        direction = inputBuffer.splice(0,1)[0]
    }
    if (direction === -1){
        return
    }
    moveHead(direction)
    if(!alive){
        return
    }
    draw()
    moves++
}

/*
    Set state variables back to default values, ready for a new game to begin
*/
function reset(){
    disableScoreSubmitBox()
    inputBuffer = []
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
    draw()
}

/*
    Place the food in a new random location
*/
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

/*
    Input listener, responds accordingly to relevant key-presses
*/
document.addEventListener('keydown', event => {
    if(event.code === "Escape"){
        reset()
    }
    if (!alive){
        return;
    }
    if(event.code === "Space"){
        paused = !paused
        pauseLabel.hidden = !paused;
    }
    if (paused){
        return
    }
    codes = ["ArrowUp","ArrowRight","ArrowDown","ArrowLeft"]
    newDir = codes.indexOf(event.code)
    lastDir = inputBuffer.length === 0 ? direction : inputBuffer[0]
    if (newDir !== -1 && 
        newDir !== lastDir && 
        newDir !== opposites[lastDir] && 
        inputBuffer.length <= inputBufferMax){
        inputBuffer.push(newDir)
    }
})

// Initialize and begin game loop
initHtmlElements();
reset();
setInterval(step, moveEvery);

}());