function show(item){
    var divToManipulate = document.getElementById(item);
    divToManipulate.style.display = "block";

}
function hide(item){
    var divToManipulate = document.getElementById(item);
    divToManipulate.style.display = "none";
}

function hideAlllExcept(one){
        if(one!="game"){
            game.pause();
        }
        var divToManipulate =document.getElementsByClassName('screens')
        for(i=0;i<divToManipulate.length;i++){
            divToManipulate[i].style.display = "none";
        }
        var divToManipulate = document.getElementById(one);
        divToManipulate.style.display = "block";
    }

function writeWhatPressed(e, place){
    if(window.event)
    {
        clearTheText(e);
        e.srcElement.value = e.key;
    }                   
    else if(e.which)  
    {
        clearTheText(e);               
        document.name = e.key;
    }
    gameSettings[place] = e.key;
}
function clearTheText(e){
    if (e.srcElement.value != "")
        e.srcElement.value = "";
}
function randomColor(){
    var letters = '0123456789ABCDEF';
    var color = "#000000";
    while (color === "#000000"){
        color = '#'
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        if (color != "#000000")
        {
            return color;
        }
    }
    return color;
}

function random(e) {
    var bolls = Math.floor(Math.random()*40)+50;
    var color1 = randomColor();
    var color2 = randomColor();
    var color3 = randomColor();
    var time = Math.floor(Math.random()*299) + 60;
    var numMonster = Math.floor(Math.random()*2) + 1;
    if (confirm("Use the arrows for moving \n Number of balls is " + bolls+"\n Time for game: "+ time+ "\n Number of monsters in game: " +numMonster)) {
        gameSettings[0] = "ArrowUp";
        gameSettings[1] = "ArrowRight";
        gameSettings[2] = "ArrowDown";
        gameSettings[3] = "ArrowLeft";
        gameSettings[4] = bolls;
        gameSettings[5] = color1;
        gameSettings[6] = color2;   
        gameSettings[7] = color3;
        gameSettings[8] = time;
        gameSettings[9] = numMonster;
        callRestart();
        callGame();

    }
  }

function test(){
    alert("TESTING!");
}



function clickColor(hex, seltop, selleft, html5, idName) {
    if (html5 && html5 == 5)  {
        c = document.getElementById(idName).value;
    } 
    else {
        if (hex == 0)  {
            c = document.getElementById("entercolor").value;
        } else {
            c = hex;
        }
    }
    switch(idName){
        case "html5colorpicker5":
            gameSettings[5] = c;
            break;
        case "html5colorpicker15":
            gameSettings[6] = c;
            break;
        case "html5colorpicker25":
            gameSettings[7] = c;
            break;
    }
    
}
function startGame(){
    if(!gameRunning){
        gameRunning = true;
        game.start();
    }
    else{
        removeStartGameListener();
    }
}
function removeStartGameListener(){
    mainCanvas.removeEventListener('click', startGame);
    mainCanvas.addEventListener('click', game.pause);

}
function saveAndRestart(e){
    e.preventDefault();
    callRestart();
    callGame();
}
$( function() {
    var handle = $( "#custom-handle" );
    $( "#slider" ).slider({
      create: function() {
        handle.text( $( this ).slider( "value" ) );
      },
      slide: function( event, ui ) {
        handle.text( ui.value );
      }
    });
  } );
function handleKeyboard(e) {
    game.movePlayer(getCommand(e));
}
function setSetting(id,value){
    gameSettings[id] = value;
    console.log("Setting " + id + " set to: "+value);
}

function reload(element){
    var container = document.getElementById(element);
    var content = container.innerHTML;
    container.innerHTML= content; 
    console.log("Refreshed "+element); 
}
function updateUser(){
    loggedName = document.getElementById(login_username).value;
}