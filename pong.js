// vector class to hold x and y positions which can be re-used
// The constructor method is a special method for creating and initializing an object created within a class
class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
    
  set length(value) {
    const f = value / this.length;
    this.x *= f;
    this.y *= f;
  }
}

// Create a data structure for rectangles
class Rectangle {
  constructor(x = 0, y = 0) {
    this.position = new Vector(0, 0);
    this.size = new Vector(x, y);
  }
  // create getters for the sides
  get left() {
    return this.position.x - this.size.x / 2;
  }
  get right() {
    return this.position.x + this.size.x / 2;
  }
  get top() {
    return this.position.y - this.size.y / 2;
  }
  get bottom() {
    return this.position.y + this.size.y / 2;
  }
}

// Use Rectangle to create the ball. (ball inherits from Rectangle)
class Ball extends Rectangle {
  constructor() {
    super(10, 10);
    this.velocity = new Vector;
  }
}

class Player extends Rectangle {
  constructor() {
    super(20, 100);
    this.velocity = new Vector;
    this.score = 0;
    this._lastPosition = new Vector;
  }
  update(deltaTime)
  {
    this.velocity.y = (this.position.y - this._lastPosition.y) / deltaTime;
    this._lastPosition.y = this.position.y;
  }
}

class Pong {
  constructor(canvas) {
    this._canvas = canvas;
    this._context = canvas.getContext('2d');

    // Set the ball speed
    this.initialSpeed = 250;

    // Create the ball
    this.ball = new Ball;

    // Create players
    this.players = [
      new Player,
      new Player
    ];

    // Position the players
    this.players[0].position.x = 40;
    this.players[1].position.x = this._canvas.width - 40;
    // Center them
    this.players.forEach(player => player.position.y = this._canvas.height / 2 )
 
    // Update the ball's position
    // Calculate how much time as elapsed since last requestAnimationFrame
    let lastTime = null;
    this._frameCallback = (milliseconds) => {
      if (lastTime !== null) {
        const difference = milliseconds - lastTime;
        this.update(difference / 1000); // dividing by 1000 to convert to seconds
      }
      lastTime = milliseconds;
      // requestAnimationFrame is a function that takes a callback, and calls the callback for the next time the browser is ready to draw
      requestAnimationFrame(this._frameCallback);
    };

    // Create each number character for the scoreboard
    // Set pixel width
    this.CHAR_PIXEL = 10;
    this.CHARS = [
      '111101101101111', // 0
      '010010010010010', // 1
      '111001111100111', // 2
      '111001111001111', // 3
      '101101111001001', // 4
      '111100111001111', // 5
      '111100111101111', // 6
      '111001001001001', // 7
      '111101111101111', // 8
      '111101111001111', // 9
      // In order to convert these numbers to graphics we need to create canvases for them
    ].map(str => {
        // Create a new HTML element for each number 
        const canvas = document.createElement('canvas');
        // Set the width and height
        const s = this.CHAR_PIXEL;
        canvas.height = s * 5;
        canvas.width = s * 3;
        // Create the canvas object
        const context = canvas.getContext('2d');
        context.fillStyle = '#fff';
        // Create an array of canvases which can be used to draw in
        str.split('').forEach((fill, i) => {
            // This will only fill a character if it's 1. If 0 it will be left empty
            if (fill === '1') {
                context.fillRect((i % 3) * s, (i / 3 | 0) * s, s, s);
            }
        });
        return canvas;
    });

    this.reset();
  }

  clear() {
    this._context.fillStyle = '#000';
    this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
  }

  // Make the ball bounce when it hits the player's rectangle
  collide(player, ball) {
    if (player.left < ball.right && player.right > ball.left &&
      player.top < ball.bottom && player.bottom > ball.top) {
      // Make the ball go 5% faster after it hits a paddle
      ball.velocity.x = -ball.velocity.x * 1.05;
      // Save the current ball velocity
      const length = ball.velocity.length;
      
      ball.velocity.y += player.velocity.y * .2;
      ball.velocity.length = length;
    }
  }

  draw() {
    this.clear();
    this.drawRectangle(this.ball);
    this.players.forEach(player => this.drawRectangle(player))
    this.drawScore();
  }

  drawRectangle(rect) {
    // Use the fillStyle property to set a color
    this._context.fillStyle = '#fff';
    // The fillRect() method draws a "filled" rectangle
    // Parameter values = (x value, y value, width, height)
    this._context.fillRect(rect.left, rect.top, rect.size.x, rect.size.y);
  }

  drawScore() {
    // Divide the whole canvas into thirds
    const align = this._canvas.width / 3;
    // Set the character width (3 pixels plus 1 extra for space between characters)
    const charWidth = this.CHAR_PIXEL * 4;
    // Loop over player's scores
    this.players.forEach((player, i) => {
      // Convert score into characters
      const chars = player.score.toString().split('');
      // Set offset position of the score
      const offset = align * (i + 1) - (charWidth * chars.length / 2) + this.CHAR_PIXEL / 2;
      // Draw the characters to the canvas
      chars.forEach((char, position) => {
          this._context.drawImage(this.CHARS[char|0], offset + position * charWidth, 20);
      });
    });
  }

  play() {
    const b = this.ball;
    if (b.velocity.x === 0 && b.velocity.y === 0) {
      // Make the direction the ball goes at start of play random
      // This Ternary simply creates a 50/50 scenario
      b.velocity.x = 200 * (Math.random() > .5 ? 1 : -1);
      b.velocity.y = 200 * (Math.random() * 2 - 1);
      b.velocity.length = this.initialSpeed;
    }
  }

  // Reset the ball position for new game
  reset() {
    const b = this.ball;
    // Make the ball still
    b.velocity.x = 0;
    b.velocity.y = 0;
    // Put the ball in the middle
    b.position.x = this._canvas.width / 2;
    b.position.y = this._canvas.height / 2;
  }

  start() {
    requestAnimationFrame(this._frameCallback);
  }

  // Animate the ball
  update(deltaTime) {
    const cvs = this._canvas;
    const ball = this.ball;
    ball.position.x += ball.velocity.x * deltaTime;
    ball.position.y += ball.velocity.y * deltaTime;

    // Detect if the ball touches a corner. If so, invert velocity
    if (ball.right < 0 || ball.left > cvs.width) {
      ++this.players[ball.velocity.x < 0 | 0].score;
      this.reset();
    }

    if (ball.velocity.y < 0 && ball.top < 0 ||
      ball.velocity.y > 0 && ball.bottom > cvs.height) {
      ball.velocity.y = -ball.velocity.y;
    }

    // Make Player 2 (computer) follow the ball
    this.players[1].position.y = ball.position.y;

    this.players.forEach(player => {
      player.update(deltaTime);
      this.collide(player, ball);
    });

    this.draw();
  }
}

const canvas = document.querySelector('#pong');

// Initialize the game
const pong = new Pong(canvas);

// Begin game when user clicks mouse
canvas.addEventListener('click', () => pong.play());

// Player 1 will be controlled by the mouse, so we need an event handler
canvas.addEventListener('mousemove', event => {
  const scale = event.offsetY / event.target.getBoundingClientRect().height;
  pong.players[0].position.y = canvas.height * scale;
});

// Invoke the start function
pong.start();
