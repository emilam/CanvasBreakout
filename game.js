/*
** Simple canvas version of breakout
** by Evrhet Milam
*/
PADDLE_SPEED = 10;
LEFT_KEY = 37;
RIGHT_KEY = 39;
SPACE_BAR = 32;

breakout = {};
$(function() {
	breakout.pageLoaded();
});
/**
 * Called to draw the screen. This is called over and over again
 **/
breakout.gameLoop = function() {
	breakout.clearBoard();
	breakout.updatePaddle();
	breakout.drawPaddle();
	breakout.updateBalls();
	breakout.drawBalls();
	breakout.drawWall();
	breakout.drawStatus();
	
	if (breakout.lives <= 0) {
		clearInterval(breakout.gameLoopID);
		breakout.drawGameOver();
	}
	
	if (breakout.isNoBlocksLeft()) {
		breakout.level += 1;
		breakout.lives += 1;
		breakout.score += 10000;
		breakout.newLevel();
	}
};

breakout.isNoBlocksLeft = function() {
	for (var x = 0; x < breakout.blocks.length; x++) {
		var block = breakout.blocks[x];
		if (block.hits > 0)
			return false;
	}
	return true;
};

/**
 * Called when the page is finished loading. Sets up the gameboard
 **/
breakout.pageLoaded = function() {
	breakout.initGameBoard();
	breakout.setupKeyboard();
	breakout.setupMouse();
	breakout.newGame();
};

/**
 * Clears the canvas of anything drawn on it
 **/
breakout.clearBoard = function() {
	var context = breakout.gameBoard.context;
	context.clearRect(0, 0, breakout.gameBoard.width, breakout.gameBoard.height);
};

/**
 * Setup variables we want to use to keep track of the gameboard
 **/
breakout.initGameBoard = function() {
	var canvas = $("#gameboard")[0];
	//Fix thr stretch on the canvas from my css
	canvas.width = $("#container").width();
	canvas.height = $("#container").height();
	breakout.gameBoard = {};
	breakout.gameBoard.canvas = canvas;
	breakout.gameBoard.context = canvas.getContext("2d");
	breakout.gameBoard.width = canvas.width;
	breakout.gameBoard.height = canvas.height;
};

/**
 * Reset game pieces for a new game to start
 **/
breakout.newGame = function() {
	breakout.lives = 3;
	breakout.level = 1;
	breakout.score = 0;
	breakout.setupPaddle();
	breakout.newLevel();
	//Start the gameloop! 15 is a long time. 10 might be better
	breakout.gameLoopID = setInterval(breakout.gameLoop, 20);
};

/**
 * Sets the screen up for a new level. Does not advance the level.
 **/
breakout.newLevel = function() {
	breakout.balls = [];
	breakout.blocks = [];
	breakout.addDefaultBall();
	breakout.addBlockWall(0.07 * breakout.level);
};

breakout.drawGameOver = function() {
	var context = breakout.gameBoard.context;
	context.fillStyle = "#eee";
	context.font = "40px sans-seif";
	var y = breakout.gameBoard.height / 2;
	var x = breakout.gameBoard.width / 2 - 120;
	context.fillText("GAME OVER", x, y);
	context.fillStyle = "#2f2";
	var newGameX = x + 30;
	var newGameY = y + 60;
	context.fillText("New Game", newGameX, newGameY);
	// We subtract 45 because of the baeline of the font
	breakout.newGameButton = {x: newGameX, y: newGameY - 45, height: 45, width: 200, visible: true};
};

/**
 * Draw score and lives status at the bottom
 **/
breakout.drawStatus = function() {
	var padding = 10;
	var y = breakout.gameBoard.height - padding;
	var context = breakout.gameBoard.context;
	context.fillStyle = "#aaa";
	context.font = "18px sans-serif";
	// Draw lives
	var liveX = padding;
	context.fillText("Lives: " + breakout.lives, liveX, y);
	
	// Draw score
	var scoreX = breakout.gameBoard.width - 200;
	context.fillText("Score: " + breakout.score, scoreX, y); 
};

/**
 * Setup the ball paddle
 **/
breakout.setupPaddle = function() {
	breakout.paddle = {
		x: breakout.gameBoard.width / 2, //somewhere in the middle
		y: breakout.gameBoard.height - 40, //somewhere near the bottom
		width: 80, // big paddle
		height: 15, // not so tall though
		color: "#3333aa", //blue paddle
		direction: 0, // + is moving right - is moving left
	};
	
	breakout.paddle.middleX = function() {
		return breakout.paddle.x + breakout.paddle.width / 2;
	}
};

/**
 * Draw the paddle on the screen
 **/
breakout.drawPaddle = function() {
	var context = breakout.gameBoard.context;
	context.fillStyle = breakout.paddle.color;
	context.beginPath();
	context.rect(
		breakout.paddle.x,
		breakout.paddle.y,
		breakout.paddle.width,
		breakout.paddle.height
	);
	context.closePath();
	context.fill();
}

breakout.updatePaddle = function() {
	if (breakout.paddle.direction == 0) {
		return;
	}

	if (breakout.paddle.direction < 0 && (breakout.paddle.x <= 0)) {
		return;
	} else if (breakout.paddle.direction > 0 && (breakout.paddle.x + breakout.paddle.width >= breakout.gameBoard.width)) {
		return;
	}
	breakout.paddle.x += breakout.paddle.direction;
};

/**
 * Random color for blocks
 **/
breakout.blockColor = function(block) {
	switch (block.hits) {
		case 1:
			return "#e5e";
		case 2:
			return "#929";
		case 3:
			return "#666";
		default:
			return "#999";
	}
};

breakout.drawWall = function() {
	$.each(breakout.blocks, function(index, block) {
		if (block.hits <= 0) {
			return;
		}
		var context = breakout.gameBoard.context;
		context.fillStyle = breakout.blockColor(block);
		context.beginPath();
		context.rect(block.x, block.y, block.width, block.height);
		context.closePath();
		context.fill();
	});
};

/**
 * Add a block to the wall at position i
 **/
breakout.addBlockToWall = function(position) {
	// For the beginning levels we will have bigger blocks
	var numBlocksWide = Math.min(10, breakout.level + 5);
	var blockHeight = 50;
	var sidePadding = 100; // How are away from the walls do we want to be
	var topPadding = 80;
	var blockPadding = 1;
	var blockWidth = (breakout.gameBoard.width  - sidePadding*2 - (blockPadding * numBlocksWide)) / numBlocksWide; 
	var column = position % numBlocksWide;
	var row = Math.floor((position - column) / numBlocksWide);
	var x = (column * blockWidth) + sidePadding + (blockPadding * (column - 1));
	var y = (row * blockHeight) + topPadding + (blockPadding * row);
	var hits = Math.min(3, breakout.level);
	breakout.addBlock(x, y, blockWidth, blockHeight, hits);
};

/**
 * Randomly generates blocks for the level
 * We do no promise more blocks each level just a greater chance
 **/
breakout.addBlockWall = function(blockChance) {
	//A simple catch to make sure our level has some blocks
	while (breakout.blocks.length == 0) {
		for (var i = 0; i < 40; i++) {
			if (Math.random() <= blockChance) {
				breakout.addBlockToWall(i);
			}
		}
		blockChance += 0.05;
	}
}

breakout.addBlock = function(x, y, width, height, hits) {
	if (breakout.blocks == undefined)
		breakout.blocks = [];
	var block = {
		x: x,
		y: y,
		width: width,
		height: height,
		hits: hits
	};
	breakout.blocks.push(block);
};


/**
 * Add a default game ball
 **/
breakout.addDefaultBall = function() {
	breakout.addBall(10, 10, 3.0, 5.5, 10);
};

/**
 * Add a ball to the gameboard
 **/
breakout.addBall = function(startX, startY, xVelocity, yVelocity, radius) {
	if (breakout.balls == undefined)
		breakout.balls = [];
	// TODO: Add random colors to the balls!
	var ball = {
		x: startX,
		y: startY,
		xVelocity: xVelocity,
		yVelocity: yVelocity,
		radius: radius,
		staged: true, // staged means the ball is connected to the paddle
		alive: true
	};
	breakout.balls.push(ball);
};

/**
 * Update the location of each of the balls
 **/
breakout.updateBalls = function() {
	var paddle = breakout.paddle;
	//Update all the balls locations
	$.each(breakout.balls, function(index, ball) {
		if (!ball.alive) {
			return;
		}
		
		if (!ball.staged) {
			breakout.updateMovingBall(ball, paddle);
		} else {
			// The ball is still connected to the paddle
			ball.x = paddle.x + paddle.width / 2;
			ball.y = paddle.y - ball.radius;
		}
		if (!ball.alive) {
			breakout.lives--;
			if (breakout.lives > 0) {
				breakout.addDefaultBall();
			}
		}
	});
};

breakout.unstageBalls = function() {
	$.each(breakout.balls, function(index, ball) {
		ball.staged = false;
	});
};

/**
 * Update a ball that is moving around the screen
 **/
breakout.updateMovingBall = function(ball, paddle) {
	var futureX = ball.x + ball.xVelocity;
	var futureY = ball.y + ball.yVelocity;
	var reverseX = false;
	var reverseY = false;
	
	// Check if the ball went off the bottom of the board
	if (futureY >= breakout.gameBoard.height) {
		ball.alive = false;
	}
	
	if (futureX >= breakout.gameBoard.width || futureX <= 0) {
		reverseX = true;
	}
	
	if (futureY <= 0) {
		reverseY = true
	} else if (breakout.isCollision(ball.x, ball.y, ball.radius, paddle)) {
		reverseY = true;
		// Increase the velocity of the ball based upon where it hit the paddle
		ball.xVelocity += (ball.x - paddle.middleX()) / 10;
		if (Math.abs(ball.xVelocity) > PADDLE_SPEED) {
			
		}
	}
	
	for(var index = 0; index < breakout.blocks.length; index++) {
		var block = breakout.blocks[index];
		// No reason processing if we have already reversed
		if(reverseX && reverseY) {
			break;
		}
		if (block.hits <= 0) {
			continue;
		}
		
		if (breakout.isCollision(futureX, futureY, ball.radius, block)) {
			if (breakout.isVerticalCollision(ball.x, ball.y, ball.radius, block)) {
				reverseY = true;
			} else {
				reverseX = true;
			}
			block.hits -= 1;
			breakout.score += 1000;
			break;
		}
	}
	
	if (reverseX) ball.xVelocity *= -1;
	if (reverseY) ball.yVelocity *= -1;
	ball.y += ball.yVelocity;
	ball.x += ball.xVelocity;
};

/**
 * Draw the balls on the screen
 **/
breakout.drawBalls = function() {
	$.each(breakout.balls, function(index, ball) {
		if (!ball.alive) {
			return;
		}
		var context = breakout.gameBoard.context;
		context.fillStyle = "#22ee22";
		context.beginPath();
		context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, true);
		context.closePath();
		context.fill();
	});
};

/**
 * Naive check to see if we have a collision
 **/
breakout.isCollision = function(x, y, radius, rect) {
	return ((x - radius <=  rect.x + rect.width) && (x + radius >= rect.x) &&
			(y - radius <= rect.y + rect.height) && (y + radius >= rect.y));
};
/**
 * Check for a collision on top or bottom fo a rect
 * You must already know that you are going to have a collision
 **/
breakout.isVerticalCollision = function(x, y, radius, rect) {
	//If we have a collision, but we are "already" in collision for the x range then we know its a vertical collision
	return ((x - radius <=  rect.x + rect.width) && (x + radius >= rect.x));
};


/**
 * Setup the code to listen for mouse events
 **/
breakout.setupMouse = function() {
	$(breakout.gameBoard.canvas).click(breakout.mouseClicked);
};

breakout.mouseClicked = function(event) {
	if (breakout.newGameButton && breakout.newGameButton.visible) {
		if (breakout.isCollision(event.offsetX, event.offsetY, 2, breakout.newGameButton)) {
			breakout.newGameButton.visible = false;
			breakout.newGame();
		}
	}
};


/**
 * Setup the code to listen to the keyboard
 **/
breakout.setupKeyboard = function() {
	$(document).keydown(breakout.keyPressed);
	$(document).keyup(breakout.keyReleased);
};

breakout.keyPressed = function(event) {
	if (event.keyCode == LEFT_KEY) {
		breakout.paddle.direction = -PADDLE_SPEED;
	} else if(event.keyCode == RIGHT_KEY) {
		breakout.paddle.direction = PADDLE_SPEED;
	} else if(event.keyCode == SPACE_BAR) {
		breakout.unstageBalls();
	}
};

breakout.keyReleased = function(event) {
	if (event.keyCode == LEFT_KEY || event.keyCode == RIGHT_KEY) {
		breakout.paddle.direction = 0;
	}
};