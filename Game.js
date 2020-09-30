function resetGame(){
    alert("resetting");
}
var animationCounter = 0;
var gameAnimation = null;
var scoreAnimation = null;
function animateScreen(screen){
    requestAnimationFrame(function(){
            animateScreen(screen);
            if(!paused){
                screen.updateSize();
                if(animationCounter != 0){
                    game.animateMoving();
                    animationCounter--;
                }
                screen.draw();
            }
    });
}
class ScoreScreen {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.ySize = window.innerHeight / 14 ;
        this.score = 0;
        this.startTime = null;
        this.lastMonsterMove = null;
        this.maxTime = null;
        this.pauseTime = null;
        this.paused = false;
        this.ended = false;
        this.draw = function() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            var status = "";
            if (this.startTime === null) {
                status = "Not Running.";
            }
            else { 
                var now = new Date();
                var dif = this.maxTime - now;
                dif /= 1000;
                dif = Math.round(dif);
                if (dif >= 3600) {
                    status = status + Math.floor(dif / 3600) + ":";
                }
                if (dif >= 60) {
                    status = status + Math.floor((dif / 60) % 60) + ":";
                }
                if(dif%60<10){
                    status = status + "0" + dif % 60;
                }
                else{
                    status = status + dif % 60;
                }
            }
            var fontSize = Math.round(this.ySize )/3;
            this.context.font = fontSize + "px" + " MainFont";
            this.context.fillStyle = "white";
            if(dif<0 && !game.done){
                game.finish('lose',"You can do better\nScore: "+this.score);
            }
            else if(dif<0&&this.score>=150){
                debugger;
                game.finish('win',"We have a winner\nScore: "+this.score);
            }
            this.context.fillText("User: " + loggedName +"   Score: " + this.score + "   Time Remaining: " + status + "   Lives: " + game.pacLives, this.ySize/2, this.ySize*0.666 );
        };
        this.updateSize = function() {
            this.canvas.width = window.innerHeight * 11 / 14;
            this.canvas.height = window.innerHeight / 14;
            this.ySize = window.innerHeight / 14;
        };
        this.update = function() {
            this.updateSize;
            this.draw;
        };
        this.initialize = function(){
            animateScreen(ScoreBar);
        }
        this.restart = function(){
            this.score = 0;
            this.startTime = null;
            this.lastMonsterMove = null;
            this.maxTime = null;
            this.pauseTime = null;
            this.paused = false;
            this.ended = false;
        }
        this.startGame = function() {
            this.startTime = new Date();
            this.maxTime = new Date();
            this.maxTime.setMinutes(new Date().getMinutes()+1);
            console.log("Current time setting: "+gameSettings[8])
            this.addTime(gameSettings[8]-60);
            scoreAnimation = animateScreen(ScoreBar);
        };
        this.resetTimeAndScore = function() {
            this.startTime = null;
        };
        this.upScore = function(amount) {
            this.score += amount;
        };
        this.pause = function(){
            this.pauseTime = new Date();
            this.paused = true;
        }
        this.unpause = function(){
            if(!this.paused){
                return;
            }
            var now = new Date();
            var diff = now - this.pauseTime;
            diff /= 1000;
            this.addTime(diff);
            paused = false;
        }
        this.addTime = function(sec){
            console.log("Added: "+sec);
            sec = sec + this.maxTime.getSeconds();
            var minutes = Math.floor(sec/60);
            sec = sec - minutes*60;
            console.log("Added: "+sec + "s"+minutes+"m");
            this.maxTime.setMinutes(this.maxTime.getMinutes()+minutes);
            this.maxTime.setSeconds(sec);
        }
    }
}

class GameScreenUpdated {
    

    constructor(scoreScreen, game_canvas) {
        this.scoreScreen = scoreScreen;
        this.canvas = game_canvas;
        this.context = this.canvas.getContext("2d");
        this.board = new Array();
        this.SuperfoodPosition = new Array();
        this.playeableObjects = {};
        this.monsters = {};
        this.score = 0;
        this.start_time = null;
        this.shape = new Object();
        this.colNum = 15;
        this.currentSize = window.innerHeight * 11 / 14 / this.colNum;
        this.wallColor = "white";
        this.pacManColor = "white";
        this.player = null;
        this.food_remain = gameSettings[4];
        this.pacLives = 3;
        this.lastAIMove = null;
        this.lastSuperFoodMove = null;
        this.done=false;
        this.audio = new Audio('Theme.mp3');
        this.audio.loop = true;//ensure it works
        this.runs=1;
        this.superFoodEaten = false;
        this.draw = function() {
            if(this.done){
                return;
            }
            var now = new Date();
            var monsters_found = [];

            for (var key in this.playeableObjects){
                this.playeableObjects[key].eraseSelf();
                this.playeableObjects[key].draw();
            }

            if (this.lastAIMove == null){
                this.lastAIMove = new Date();
            }            
            for (var key in this.monsters){
                for(var i=0; i<this.monsters[key].length;i++){
                    monsters_found.push({'key':key,'i':i})
                }
            }

            for (let k of monsters_found) {
                try{
                    this.monsters[k['key']][k['i']].draw();
                }
                catch(e){}
                if(now - this.lastAIMove>1000) {
                    this.monsters[k['key']][k['i']].makeMove();
                }
            }

            if(now - this.lastAIMove>1000){
                this.lastAIMove = new Date();
              }
              
            if((this.lastSuperFoodMove==null || now - this.lastSuperFoodMove>Math.random()*500)&&!this.superFoodEaten){
                this.lastSuperFoodMove = new Date();
                game.playeableObjects["superFood"].makeMove();
            }

        }
        this.initializeGame = function(){
            for (var i = 0; i < this.colNum; i++) {
                this.board[i] = new Array();
                this.SuperfoodPosition[i] = new Array();
                for (var j = 0; j < this.colNum; j++) {
                    if(i==0||j==0||j==this.colNum-1||i==this.colNum-1){
                        this.board[i][j] = 4;
                        this.playeableObjects[i+","+j] = new Wall(this.currentSize,this.context,this.wallColor,i,j);
                    }
                    this.SuperfoodPosition[i][j] = 0;
                }
            }
            this.score = 0;
            for (var i = 0; i < this.colNum; i++) {
                //put obstacles in (i=3,j=3) and (i=3,j=4) and (i=3,j=5), (i=6,j=1) and (i=6,j=2)
                for (var j = 0; j < this.colNum; j++) {
                    if(i==0||j==0||j==this.colNum-1||i==this.colNum-1){
                        continue;
                    }
                    if ((i === 3 && j === 3) || (i === 3 && j === 4) || (i === 3 && j === 5) || (i === 6 && j === 1) || (i === 6 && j === 2) || (i === 6 && j === 7) || (i === 7 && j === 7) || (i === 8 && j === 7)) 
                    {
                        this.board[i][j] = 4;
                        this.playeableObjects[i+","+j] = new Wall(this.currentSize,this.context,this.wallColor,i,j);
                    } 
                    else 
                    {
                        this.board[i][j] = 0;
                    }
                    this.monsters[i+","+j] = new Array();
                }
            }
            this.placePlayer();
            var pos ;
            for (var i=0; i < gameSettings[9]; i++) {
                pos = null;
                pos = randomCorner();
                var monster = new Monster(game.currentSize,game.context,pos[0],pos[1]);
                game.monsters[pos[0] + "," + pos[1]].push(monster);
            }
            this.scoreScreen.initialize();
            this.placeFood(this.food_remain);
            this.updateSize();
            this.releaseSuperfood();
            //this.draw();
            this.layFilter(0.6,'#000000');
        }
        this.releaseSuperfood = function(){
            this.superFoodEaten = false;
            var pos = this.findEmptyCell();
            var SuperFood = new Superfood(game.currentSize,game.context,pos[0],pos[1]);
            this.playeableObjects["superFood"] = SuperFood;
        }
        this.start = function(){
            this.lastAIMove = this.start_time;
            this.start_time = new Date();
            this.scoreScreen.startGame();
            gameAnimation = animateScreen(game);
            addEventListener("keyup", handleKeyboard, false);
            this.audio.play();
        }
        this.pause = function(){
            if(paused){
                return;
            }
            game.audio.pause();
            paused = true;
            mainCanvas.removeEventListener('click', game.pause)
            mainCanvas.addEventListener("click", game.unPause);
            game.layFilter(0.6,'black');
            game.placeStartScreen();
            game.scoreScreen.pause()
            console.log("paused");
        }
        this.unPause = function(){
            if(!paused){
                return;
            }
            paused = false;
            mainCanvas.removeEventListener("click", game.unPause);
            mainCanvas.addEventListener('click', game.pause);
            game.scoreScreen.unpause();
            console.log("unpaused");
            game.audio.play();
        }
        this.restart = function(){
            this.runs++;
            console.log(this.board);
            animationCounter = 0;
            this.board = new Array();
            this.playeableObjects = {};
            this.monsters = {};
            this.score = 0;
            this.player = null;
            this.food_remain = gameSettings[4];
            this.done=false;
            this.initializeGame();
            console.log(this.board);
            this.scoreScreen.restart();
            removeEventListener("keyup", handleKeyboard, false);//to prevent conflict with endgame function
            addEventListener("keyup", handleKeyboard, false);
            this.done = false;
            this.pacLives = 3;
            this.start();
            
            debugger;
        }
        this.placePlayer = function(){
            var x = Math.round(Math.random()*14);
            var y = Math.round(Math.random()*14);
            while(!this.cellIsFree(x,y)){
                x = Math.round(Math.random()*14);
                y = Math.round(Math.random()*14);
            }
            this.board[x][y] = 2;
            this.player = new PacMan(this.currentSize,this.context,this.pacManColor,x,y);
            this.playeableObjects[x+","+y] = this.player;

        }
        this.layFilter = function(alpha,color){
            this.context.globalAlpha = alpha;
            this.context.fillStyle = color; 
            this.context.fillRect(0,0,this.canvas.height,this.canvas.width);
            this.context.globalAlpha = 1;
        }
        this.placeStartScreen = function(){
            var img = document.getElementById("start");
            this.context.drawImage(img, this.canvas.height/3, this.canvas.height/3, this.canvas.height/3, this.canvas.height/3);
            this.canvas.addEventListener("click", startGame, false);
        }
        this.updateSize = function() {
            this.canvas.width = window.innerHeight * 11 / 14;
            this.canvas.height = window.innerHeight * 11 / 14;
            if(this.currentSize != window.innerHeight * 11 / 14 / this.colNum){
                this.currentSize = window.innerHeight * 11 / 14 / this.colNum;
                for(var key in this.playeableObjects){
                    this.playeableObjects[key].setNewSize(this.currentSize);
                }
            }
            this.currentSize = window.innerHeight * 11 / 14 / this.colNum;
        };
        this.cellIsFree = function(x,y){
            console.log("x="+x+",y="+y);
            return this.board[x][y]===0;
        };
        this.placeFood = function(amount){
            var simpleFood = Math.round(amount*0.6);
            var mediumFood = Math.round(amount*0.3);
            var topFood = amount-simpleFood-mediumFood;
            while (simpleFood > 0) {
                var emptyCell = this.findEmptyCell(this.board);
                this.board[emptyCell[0]][emptyCell[1]] = 1;
                var foodPiece = new Food(this.currentSize,this.context,gameSettings[5],emptyCell[0],emptyCell[1],5);
                this.playeableObjects[emptyCell[0]+","+emptyCell[1]] = foodPiece;
                simpleFood--;
            }
            while (mediumFood > 0) {
                var emptyCell = this.findEmptyCell(this.board);
                this.board[emptyCell[0]][emptyCell[1]] = 1;
                var foodPiece = new Food(this.currentSize,this.context,gameSettings[6],emptyCell[0],emptyCell[1],15);
                this.playeableObjects[emptyCell[0]+","+emptyCell[1]] = foodPiece;
                mediumFood--;
            }
            while (topFood > 0) {
                var emptyCell = this.findEmptyCell(this.board);
                this.board[emptyCell[0]][emptyCell[1]] = 1;
                var foodPiece = new Food(this.currentSize,this.context,gameSettings[7],emptyCell[0],emptyCell[1],25);
                this.playeableObjects[emptyCell[0]+","+emptyCell[1]] = foodPiece;
                topFood--;
            }
            debugger;
            var emptyCell = this.findEmptyCell(this.board);
            this.board[emptyCell[0]][emptyCell[1]] = -1;
            var foodPiece = new MagicalFood(this.currentSize,this.context,emptyCell[0],emptyCell[1],0);
            this.playeableObjects[emptyCell[0]+","+emptyCell[1]] = foodPiece;
        }
        this.findEmptyCell = function(){
            var i = Math.round((Math.random() * (this.colNum-2)) + 1);
            var j = Math.round((Math.random() * (this.colNum-2)) + 1);
            while (this.board[i][j] !== 0) {
                i = Math.round((Math.random() * (this.colNum-2)) + 1);
                j = Math.round((Math.random() * (this.colNum-2)) + 1);
            }
            return [i, j];
        };
        this.removeObject = function(id){
            var char = this.playeableObjects[id];
            this.board[char.xgrid][char.ygrid] = 0;
            delete this.playeableObjects[id];
        };
        this.movePlayer = function(e) {
            var x = e;//TODO change this
            var xCoordinate = this.player.xgrid;
            var yCoordinate = this.player.ygrid;
            if (x === 1) {//move right
                if(xCoordinate==this.colNum-1){
                    return;
                }
                xCoordinate = xCoordinate + 1;
                this.player.face("right");
            }
            if (x === 2) {//move left
                if(xCoordinate==0){
                    return;
                }
                xCoordinate = xCoordinate - 1;
                this.player.face("left");
            }
            if (x === 3) {//move down
                if(yCoordinate==this.colNum-1){
                    return;
                }
                yCoordinate = yCoordinate+1;
                this.player.face("down");
            }
            if (x === 4) {//move up
                if(yCoordinate==0){
                    return;
                }
                yCoordinate = yCoordinate-1;
                this.player.face("up");
            }
            if(xCoordinate+","+yCoordinate in this.monsters && this.monsters[xCoordinate+","+yCoordinate].length > 0){
                this.getEaten();
            }
            else if (this.board[xCoordinate][yCoordinate] == 0 || this.board[xCoordinate][yCoordinate] == 1) {
                if(this.board[xCoordinate][yCoordinate] == 1){
                    this.scoreScreen.upScore(this.playeableObjects[xCoordinate+","+yCoordinate].score);
                    this.score+=this.playeableObjects[xCoordinate+","+yCoordinate].score;
                    this.removeObject(xCoordinate+","+yCoordinate);
                }
                
                this.player.moveTo(xCoordinate,yCoordinate);
            }
            else if(this.board[xCoordinate][yCoordinate] == -1){
                this.pacLives++;
                this.removeObject(xCoordinate+","+yCoordinate);
                this.player.moveTo(xCoordinate,yCoordinate);
            }
            if(this.SuperfoodPosition[xCoordinate][yCoordinate]==1&&!this.superFoodEaten){
                this.eatSuperfood();
            }
            if (this.score >= 150) {
                debugger;
                this.finish("win","We have a Winner!!!");
                this.scoreScreen.startTime = null;
            }
        };
        this.getEaten = function(){
            this.scoreScreen.upScore(-10);
            this.score-=10;
            this.removeObject(this.player.xgrid+","+this.player.ygrid);
            this.pacLives--;
            if(this.pacLives==0){
                this.finish("lose","You Lost!");
            }
            else{
                this.placePlayer();
            }
        }
        this.animateMoving = function(){
            for (var key in this.playeableObjects){
                this.playeableObjects[key].movingAnimationNextFrame();
            }
        }
        this.finish = function(arg,msg){
            debugger;
            switch (arg){
                case "win":
                    alert("You Won. \n"+msg);
                    break;
                case "lose":
                    alert("You Lost. \n"+msg);
                    break;
            }
            this.done = true;
            this.scoreScreen.startTime = null;
            removeEventListener("keyup", handleKeyboard, false);
            this.audio.pause();
        }
        this.getBoard = function(){
            return this.board;
        }
        this.eatSuperfood = function(x,y){
            this.superFoodEaten = true;
            this.score += 50;
            this.player.moveTo(x,y);
            this.SuperfoodPosition[x][y] = 0;
            this.removeObject("superFood");
            this.scoreScreen.upScore(50);
        }
    }
}
function getCommand(e){
    if (e.key==gameSettings[0]) {
        return 4;
    }
    if (e.key==gameSettings[2]) {
        return 3;
    }
    if (e.key==gameSettings[3]) {
        return 2;
    }
    if (e.key==gameSettings[1]) {
        return 1;
    }
}
class GameObject {
    constructor(currentSize,isStatic,context,xgrid,ygrid){
        this.currentSize = currentSize;
        this.xgrid = xgrid;
        this.ygrid = ygrid;
        this.posX = xgrid * this.currentSize + this.currentSize/2;
        this.posY = ygrid * this.currentSize + this.currentSize/2;
        this.static = isStatic;
        this.context = context;
        this.type = 0;
        this.visualPositionX = 0;
        this.modX = 0;
        this.modY = 0;
        this.visualPositionY = 0;
        this.currentAnimationFrame = 0;
        this.animationSteps = 18;
        this.animationInProgress = false;
        this.eating = false;
        this.isDrawn = false;
    }
    eraseSelf(){
        this.context.clearRect(this.posX-this.currentSize/2,this.posY-this.currentSize/2,this.currentSize,this.currentSize);
    }
    setNewSize(size){
        this.currentSize = size;
        this.posX = this.xgrid * size + size/2;
        this.posY = this.ygrid * size + size/2;
    }
    moveTo(x,y){
        if(this.static){
            return;
        }
        this.setMod(x,y);
        this.visualPositionX = this.xgrid;
        this.visualPositionY = this.ygrid;
        this.animationInProgress = true;
        animationCounter = this.animationSteps;
        if(this.eating){
            game.board[this.xgrid][this.ygrid] = 0;
        }
        if(this.type!=5){
            game.board[x][y] = this.type;
            delete game.playeableObjects[this.visualPositionX+","+this.visualPositionY]
            game.playeableObjects[x+","+y] = this;
        }
        this.xgrid = x;
        this.ygrid = y;
        this.setNewSize(this.currentSize);
    }
    setMod(x,y){
        if(x>this.xgrid){
            this.modX = 1/this.animationSteps;
        }
        else if(x<this.xgrid){
            this.modX = -1/this.animationSteps;
        }
        else if(y>this.ygrid){
            this.modY = 1/this.animationSteps;
        }
        else{
            this.modY = -1/this.animationSteps;
        }
    }
    movingAnimationNextFrame(){
        if(this.currentAnimationFrame>this.aminationSteps||!this.animationInProgress){
            return;
        }
        this.visualPositionX = this.visualPositionX + this.modX;
        this.visualPositionY = this.visualPositionY + this.modY;
        this.posX = this.visualPositionX * this.currentSize + this.currentSize/2;
        this.posY = this.visualPositionY * this.currentSize + this.currentSize/2;
        this.currentAnimationFrame++;
        if(this.currentAnimationFrame==this.animationSteps){
            this.finalizeMove();
        }
    }
    finalizeMove(){
        this.animationInProgress = false;
        this.currentAnimationFrame = 0;
        this.modX = 0;
        this.modY = 0;
        this.setNewSize(this.currentSize);
    }
    
}
class PacMan extends GameObject{
    constructor(currentSize,context,color,xgrid,ygrid){
        super(currentSize,false,context,xgrid,ygrid);
        this.color = color;
        this.eyeColor = "black";
        this.startCircle = 0.15 * Math.PI;
        this.endCircle = 1.85 * Math.PI;
        this.eyeModX = 5;
        this.eyeModY = -15; 
        this.type = 2;
        this.pacingModifierStep = 0.01/game.runs;//mouth speed modifier
        this.pacingCycleCounter = 0;
        this.maxPacingModifier = 0.5/this.pacingModifierStep;
        this.pacingModifierUp = -1;
        this.pacingModifierDown = 1;
        this.eating = true;
    }
    draw(){
        if(Math.ceil(this.maxPacingModifier)!=this.pacingCycleCounter){
            this.pacingCycleCounter++;
        }
        else{
            this.pacingCycleCounter = 0;
        }
        this.context.beginPath();
        this.context.arc(this.posX, this.posY, this.currentSize/2, this.startCircle+this.pacingModifierUp*this.pacingCycleCounter*this.pacingModifierStep, this.endCircle+this.pacingModifierDown*this.pacingCycleCounter*this.pacingModifierStep); // half circle
        this.context.lineTo(this.posX, this.posY);
        this.context.fillStyle = this.color; //color
        this.context.fill();
        this.context.beginPath();
        this.context.arc(this.posX + this.eyeModX, this.posY + this.eyeModY, 5, 0, 2 * Math.PI); // circle
        this.context.fillStyle = this.eyeColor; //color
        this.context.fill();
    }
    isEdiable(){
        return true;
    }
    isTraversable(){
        return true;
    }
    face(direction){
        switch(direction){
            case "up":
                this.startCircle = -0.35 * Math.PI;
                this.endCircle = 1.35 * Math.PI;
                this.eyeModX = -15;
                this.eyeModY = -5;
                break;
            case "down":
                this.startCircle = 0.65 * Math.PI;
                this.endCircle = 2.35 * Math.PI;
                this.eyeModX = -15;
                this.eyeModY = -5;
                break;
            case "right":
                this.startCircle = 0.15 * Math.PI;
                this.endCircle = 1.85 * Math.PI;
                this.eyeModX = 5;
                this.eyeModY = -15; 
                break;
            case "left":
                this.startCircle = 1.15 * Math.PI;
                this.endCircle = 2.85 * Math.PI;
                this.eyeModX = 5;
                this.eyeModY = -15; 
                break;
        }
    }
}
class Monster extends GameObject{
    constructor(currentSize,context,xgrid,ygrid){
        super(currentSize,false,context,xgrid,ygrid);
        this.color = "rgb("+ (Math.round(Math.random()*118)+10) + "," + (Math.round(Math.random()*118)+10)  + "," +(Math.round(Math.random()*118)+10) + ")";
        this.eyeColor = "red";
        this.leg1 = 0.20 * Math.PI;
        this.leg2 = 0.50 * Math.PI;
        this.leg3 = 0.80 * Math.PI;
        this.eyeModX = 5;
        this.eyeModY = -15;
        this.type = 5;
    }
    draw(){
        this.context.beginPath();       
        this.context.arc(this.posX, this.posY, this.currentSize/2, this.leg3, this.leg1); // half circle
        this.context.lineTo(this.posX+this.currentSize/5, this.posY-this.currentSize/6);
        this.context.lineTo(this.posX, this.posY+this.currentSize/4);
        this.context.lineTo(this.posX-this.currentSize/5, this.posY-this.currentSize/6);
        this.context.fillStyle = this.color; //color
        this.context.fill();
        
        this.context.beginPath();
        this.context.arc(this.posX + this.eyeModX, this.posY + this.eyeModY, 3, 0, 2 * Math.PI); // circle
        
        this.context.arc(this.posX - this.eyeModX, this.posY + this.eyeModY, 3, 0, 2 * Math.PI); // circle
        this.context.fillStyle = this.eyeColor; //color
        this.context.fill();
    }
    isEdiable(){
        return false;
    }
    isTraversable(){
        return false;
    }

    makeLegalMoveMonster(){
        if (game.monsters[this.xgrid+","+this.ygrid].length == 0){
            console.log("bugbug makeLegalMoveMonster");
        }
        for (var i=0; i<game.monsters[this.xgrid+","+this.ygrid].length; i++){
            if (game.monsters[this.xgrid+","+this.ygrid][i] === this){
                game.monsters[this.xgrid+","+this.ygrid].splice(i, 1);
                break;
            }
        }
        //check if eating the packman!
        var board = game.board;
        if (board[this.xgrid][this.ygrid] == 2)
            game.getEaten();
    }
    updateGamePlayObject(){
        if (game.board[this.xgrid][this.ygrid] == 1)
        {

        }
    }

    makeMove(){
        var goToPacman = Math.round(Math.random() * 3); // zero is false
        if (goToPacman != 0) //make a step forword pacman
        {
            var differenceX = game.player.xgrid - this.xgrid;
            var differenceY = game.player.ygrid - this.ygrid;
            if (Math.abs(differenceX) > Math.abs(differenceY) && differenceY != 0 && game.board[ this.xgrid][differenceY/(Math.abs(differenceY)) + this.ygrid]!= 4)
            {//make a move forward the closest line if it is possible!
                this.makeLegalMoveMonster();
                this.moveTo( this.xgrid , differenceY/(Math.abs(differenceY)) + this.ygrid);
                game.monsters[this.xgrid+"," +this.ygrid].push(this);
                return;
            }
            else if (differenceX != 0  && game.board[ this.xgrid+ differenceX/(Math.abs(differenceX))] [this.ygrid]!= 4)
            { 
                this.makeLegalMoveMonster();
                this.moveTo( this.xgrid + differenceX/(Math.abs(differenceX)) ,this.ygrid);
                game.monsters[this.xgrid+"," +this.ygrid].push(this);
                return;
            }
            else if (Math.abs(differenceX) < Math.abs(differenceY) && differenceY != 0  && game.board[ this.xgrid][differenceY/(Math.abs(differenceY)) + this.ygrid]!= 4) 
                {
                this.makeLegalMoveMonster();
                this.moveTo( this.xgrid , differenceY/(Math.abs(differenceY)) + this.ygrid);
                game.monsters[this.xgrid+"," +this.ygrid].push(this);
                return;
            }
        }
        //make random action
        var findPlace = false;
        while(!findPlace)
        {
            var adding = Math.round(Math.random()*2);// zero is changing x
            var goX=this.xgrid, goY=this.ygrid; 
            if (adding == 0){ //changing phose in X
                adding = Math.round(Math.random()*2);
                if (adding == 0){
                    goX += 1;
                }   
                else{
                    goX -=1;
                }
            }
            else{ //changing position in Y
                adding = Math.round(Math.random()*2);
                if (adding == 0){
                    goY += 1;
                }   
                else{
                    goY -= 1;
                }
            }
            if(game.board[goX][goY] != 4){
                this.makeLegalMoveMonster();
                this.moveTo(goX, goY);
                game.monsters[this.xgrid + "," + this.ygrid].push(this);
                findPlace = true;
            } 
        }
        return;            
    }
}
class Superfood extends GameObject{
    constructor(currentSize,context,xgrid,ygrid){
        super(currentSize,false,context,xgrid,ygrid);
        this.color = "rgb("+ (Math.round(Math.random()*118)+10) + "," + (Math.round(Math.random()*118)+10)  + "," +(Math.round(Math.random()*118)+10) + ")";
        this.eyeColor = "red";
        this.leg1 = 0.20 * Math.PI;
        this.leg2 = 0.50 * Math.PI;
        this.leg3 = 0.80 * Math.PI;
        this.eyeModX = 5;
        this.eyeModY = -15;
        this.type = 5;
    }
    draw(){
        var img = document.getElementById("superFood");
        this.context.drawImage(img, this.posX - this.currentSize/2, this.posY - this.currentSize/2, this.currentSize, this.currentSize);
    }
    isEdiable(){
        return false;
    }
    isTraversable(){
        return false;
    }
    makeLegalMoveMonster(){
        //check step will bring to pacman
        var board = game.board;
        if (board[this.xgrid][this.ygrid] == 2)
            game.eatSuperfood(this.xgrid,this.ygrid);
    }

    makeMove(){
        var goToPacman = Math.round(Math.random() * 3); // zero is false
        if (goToPacman != 0) //make a step towards pacman
        {
            var differenceX = game.player.xgrid - this.xgrid;
            var differenceY = game.player.ygrid - this.ygrid;
            if (Math.abs(differenceX) > Math.abs(differenceY) && differenceY != 0 && game.board[ this.xgrid][this.ygrid-differenceY/(Math.abs(differenceY))]!= 4 && this.ygrid-differenceY/(Math.abs(differenceY))>0)
            {//make a move forward the closest line if it is possible!
                this.makeLegalMoveMonster();
                this.moveTo( this.xgrid ,this.ygrid - differenceY/(Math.abs(differenceY)));
                return;
            }
            else if (differenceX != 0  && game.board[this.xgrid - differenceX/(Math.abs(differenceX))] [this.ygrid]!= 4 && this.xgrid - differenceX/(Math.abs(differenceX))>0)
            { 
                this.makeLegalMoveMonster();
                this.moveTo( this.xgrid - differenceX/(Math.abs(differenceX)) ,this.ygrid);
                return;
            }
            else if (Math.abs(differenceX) < Math.abs(differenceY) && differenceY != 0  && game.board[ this.xgrid][differenceY/(Math.abs(differenceY)) + this.ygrid]!= 4) 
                {
                this.makeLegalMoveMonster();
                this.moveTo( this.xgrid , differenceY/(Math.abs(differenceY)) + this.ygrid);
                return;
            }
        }
        //make random action
        var findPlace = false;
        while(!findPlace)
        {
            var adding = Math.round(Math.random()*2);// zero is changing x
            var goX=this.xgrid, goY=this.ygrid; 
            if (adding == 0){ //changing phose in X
                adding = Math.round(Math.random()*2);
                if (adding == 0){
                    goX += 1;
                }   
                else{
                    goX -=1;
                }
            }
            else{ //changing position in Y
                adding = Math.round(Math.random()*2);
                if (adding == 0){
                    goY += 1;
                }   
                else{
                    goY -= 1;
                }
            }
            if(game.board[goX][goY] != 4){
                this.makeLegalMoveMonster();
                this.moveTo(goX, goY);
                findPlace = true;
            } 
        }
        return;            
    }
}

class Food extends GameObject{
    constructor(currentSize,context,color,xgrid,ygrid,score){
        super(currentSize,true,context,xgrid,ygrid);
        this.color = color;
        this.type = 1;
        this.score = score;
    }
    draw(){
        this.context.beginPath();
        this.context.arc(this.posX, this.posY, this.currentSize/4, 0, 2 * Math.PI); // circle
        this.context.fillStyle = this.color; //color
        this.context.fill();
        this.isDrawn = true;
        /*var img = document.getElementById("apple");
        this.context.drawImage(img, this.posX - this.currentSize/2, this.posY - this.currentSize/2, this.currentSize/2, this.currentSize/2);*/
    }
    isEdiable(){
        return true;
    }
    isTraversable(){
        return true;
    }
}

class MagicalFood extends GameObject{
    constructor(currentSize,context,xgrid,ygrid,score){
        super(currentSize,true,context,xgrid,ygrid);
        this.type = -1;
    }
    draw(){
        this.context.beginPath();
        this.context.arc(this.posX, this.posY, this.currentSize/4, 0, 1 * Math.PI); // circle
        this.context.fillStyle = '#FFFFFF'; //color
        this.context.fill();
        this.context.arc(this.posX, this.posY, this.currentSize/4, 1 * Math.PI, 2 * Math.PI); // circle
        this.context.fillStyle = '#FFFFFF'; //color
        this.context.fill();
        this.isDrawn = true;
        var img = document.getElementById("heal");
        this.context.drawImage(img, this.posX - this.currentSize/2, this.posY - this.currentSize/2, this.currentSize, this.currentSize);
    }
    isEdiable(){
        return true;
    }
    isTraversable(){
        return true;
    }
}

class Wall extends GameObject{
    constructor(currentSize,context,color,xgrid,ygrid){
        super(currentSize,true,context,xgrid,ygrid);
        this.color = color;
        this.type = 4;
    }
    draw(){
        this.context.beginPath();
        this.context.rect(this.posX - this.currentSize/2, this.posY - this.currentSize/2, this.currentSize, this.currentSize);
        this.context.fillStyle = this.color; //color
        this.context.fill();
        this.isDrawn = true;
        /*var img = document.getElementById("wall");
        this.context.drawImage(img, this.posX - this.currentSize/2, this.posY - this.currentSize/2, this.currentSize, this.currentSize);*/

    }
    isEdiable(){
        return false;
    }
    isTraversable(){
        return false;
    }
    
}

function randomCorner(){
    var rows = Math.round(Math.random());
    var placeX = 1;
    var placeY = 1;
    if (rows === 0){
        var cols = Math.round(Math.random());
        if (cols !== 0){
            placeX = game.board[0].length-2;
        }
    }
    else{
        placeX = game.board.length - 2;
        var cols = Math.round(Math.random());
        if (cols !== 0){
            placeY = game.board[0].length-2;
        }
    }
    return [placeX, placeY];
} 
