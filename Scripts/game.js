GLOBAL = {
    'catDy' : 7,
    'barrierDx': 5,
    'updateTime': 1000/60,
    'acceleration': 0.2
};

document.addEventListener('DOMContentLoaded', function() {
    var canvas = document.getElementById('main-canvas');
    var ctx = canvas.getContext('2d');

    var catImg = new Image();
    catImg.src = 'images/cat.png';

    var dogImg = new Image();
    dogImg.src = 'images/dog.png';

    var bacImg = new Image();
    bacImg.src = 'images/background.png';

    var meowSound = new Audio();
    meowSound.src = 'cat.mp3';

    var gameOverSound = new Audio();
    gameOverSound.src = 'over.mp3';

    var catIsFlying = false, catIsDown = false, catIsUp = false;
    var isPaused = false, gameOver = false;

    var lastFrameTime = 0, totalSeconds = 0;
    var score = 0;

    var dog = {
        height : 70,
        width: 100,
        dx: GLOBAL.barrierDx
    };

    dog.x = canvas.width;
    dog.y = canvas.height - dog.height;

    var cat = {
        height : 100,
        width: 100,
        dy: GLOBAL.catDy
    };
    cat.x = canvas.width/2 - cat.width;
    cat.y = canvas.height - cat.height;

    document.addEventListener("keyup", keyPressHandler, false);
    document.addEventListener("click", clickHandler, false);

    function draw()
    {
        window.requestAnimationFrame(draw);

        if(!isPaused && !gameOver){
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            var now = Date.now();
            var deltaSeconds = (now - lastFrameTime) / 1000;
            lastFrameTime = now;
            drawBackGround(deltaSeconds);

            drawBarrier();
            drawCat();
            drawScore();

            if(checkPositions()){
                score++
            }
            else{
                gameOver = true;
                gameOverSound.play();
                drawGameOver();
            }
        }
    }

    function drawBarrier(){
        ctx.beginPath();
        ctx.drawImage(dogImg, dog.x, dog.y, dog.width, dog.height);
        ctx.fill();
        ctx.closePath();

        //ctx.strokeStyle = '#000';
        //ctx.strokeRect(dog.x, dog.y, dog.width, dog.height);

        //если преграда дошла до конца - отправляем ее в начало
        if(dog.x >= canvas.width || dog.x <= 0){
            dog.x = canvas.width;
        }

        dog.x -= dog.dx;
    }

    function checkPositions(){
        var catX1 = cat.x + 10,
            catY1 = cat.y + 10,
            catX2 = cat.x + cat.width - 10,
            catY2 = cat.y + cat.height - 10,
            barX1 = dog.x + 5,
            barY1 = dog.y + 5,
            barX2 = dog.x + dog.width - 10,
            barY2 = dog.y + dog.height - 10;

        console.log('catX1: ' + catX1 + '\n' +
            'catY1: ' + catY1 + '\n' +
            'catX2: ' + catX2 + '\n' +
            'catY2: ' + catY2 + '\n' +
            'barX1: ' + barX1 + '\n' +
            'barY1: ' + barY1 + '\n' +
            'barX2: ' + barX2 + '\n' +
            'barY2: ' + barY2 + '\n');

        return ( catX1 > barX2 ||
        catX2 < barX1 ||
        catY1 > barY2 ||
        catY2 < barY1);
    }

    function drawCat()
    {
        //console.log('catIsUp: ' + catIsUp + '\n' +
        //    'catIsDown: ' + catIsDown + '\n' +
        //    'catIsFly: ' + catIsFlying + '\n' +
        //    'x: ' + cat.x + '\n' +
        //    'y: ' + cat.y + '\n' +
        //    'dy: ' + cat.dy + '\n');


        if(catIsFlying){
            if((cat.y >= canvas.height - cat.height) && catIsDown)
            {
                catIsDown = false;
                catIsFlying = false;
                cat.dy = GLOBAL.catDy;
            }
            else{
                if(catIsFlying){
                    cat.dy -= GLOBAL.acceleration;
                    cat.y -= Math.round(cat.dy);

                    if(cat.dy < 0){
                        catIsDown = true;
                        catIsUp = false;
                    }
                }
            }
        }

        ctx.beginPath();
        ctx.drawImage(catImg, cat.x, cat.y, cat.width, cat.height);

        //отрисовка контура картинки кота
        //ctx.strokeStyle = '#000';
        //ctx.strokeRect(cat.x, cat.y, cat.width, cat.height);

        ctx.fill();
        ctx.closePath();
    }

    function keyPressHandler(e){
        if(e.keyCode == 32){
            if(gameOver){
                gameOver = !gameOver;
                setStart();
            }
            //если кот не находится в полете, переводим его в режим полета
            else if(!catIsFlying){
                meowSound.play();
                catIsFlying = true;
                catIsUp = true;
            }
        }
        else if(e.keyCode == 27){
            if(isPaused){
                document.getElementById('main-canvas').classList.remove('pause');
            }
            else{
                document.getElementById('main-canvas').classList.add('pause');
            }

            isPaused = !isPaused;
        }
    }

    function clickHandler(e){
        if(gameOver){
            gameOver = !gameOver;
            setStart();
        }
        //если кот не находится в полете, переводим его в режим полета
        else if(!catIsFlying){
            meowSound.play();
            catIsFlying = true;
            catIsUp = true;
        }
    }

    //отрисовка фона
    function drawBackGround(delta){
        totalSeconds += delta;

        var speed = 50; // the background scrolls with a speed of 100 pixels/sec
        var numImages = Math.ceil(canvas.width / bacImg.width) + 1;
        var xpos = totalSeconds * speed % bacImg.width;

        ctx.save();
        ctx.translate(-xpos, 0);
        for (var i = 0; i < numImages; i++) {
            ctx.drawImage(bacImg, i * bacImg.width, 0);
        }
        ctx.restore();
    }

    function drawScore(){
        ctx.strokeStyle = "#000";
        ctx.font = "30pt Arial";
        ctx.strokeText("Score: " + score, 20, 100);
    }

    function drawGameOver(){
        ctx.strokeStyle = "#000";
        ctx.font = "25pt Arial";
        ctx.strokeText("Game Over! Press Space to restart...", 50, 200);
    }

    function setStart(){
        lastFrameTime = 0;
        totalSeconds = 0;
        score = 0;

        dog.x = canvas.width;
        dog.y = canvas.height - dog.height;

        cat.x = canvas.width/2 - cat.width;
        cat.y = canvas.height - cat.height;
    }

    bacImg.onload = draw;
});

