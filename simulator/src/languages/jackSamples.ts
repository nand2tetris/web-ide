export const files: Record<string, string> = {
  Average_Main: `// This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/11/Average/Main.jack
  
  // Inputs some numbers and computes their average
  class Main {
     function void main() {
        var Array a; 
        var int length;
        var int i, sum;
  
        let length = Keyboard.readInt("How many numbers? ");
        let a = Array.new(length); // constructs the array
       
        let i = 0;
        while (i < length) {
           let a[i] = Keyboard.readInt("Enter a number: ");
           let sum = sum + a[i];
           let i = i + 1;
        }
  
        do Output.printString("The average is ");
        do Output.printInt(sum / length);
        return;
     }
  }`,
  ComplexArrays_Main: `// This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/11/ComplexArrays/Main.jack
  /**
   * Performs several complex array processing tests.
   * For each test, the expected result is printed, along with the
   * actual result. In each test, the two results should be equal.
   */
  class Main {
  
      function void main() {
          var Array a, b, c;
          
          let a = Array.new(10);
          let b = Array.new(5);
          let c = Array.new(1);
          
          let a[3] = 2;
          let a[4] = 8;
          let a[5] = 4;
          let b[a[3]] = a[3] + 3;  // b[2] = 5
          let a[b[a[3]]] = a[a[5]] * b[((7 - a[3]) - Main.double(2)) + 1];  // a[5] = 8 * 5 = 40
          let c[0] = null;
          let c = c[0];
          
          do Output.printString("Test 1: expected result: 5; actual result: ");
          do Output.printInt(b[2]);
          do Output.println();
          do Output.printString("Test 2: expected result: 40; actual result: ");
          do Output.printInt(a[5]);
          do Output.println();
          do Output.printString("Test 3: expected result: 0; actual result: ");
          do Output.printInt(c);
          do Output.println();
          
          let c = null;
  
          if (c = null) {
              do Main.fill(a, 10);
              let c = a[3];
              let c[1] = 33;
              let c = a[7];
              let c[1] = 77;
              let b = a[3];
              let b[1] = b[1] + c[1];  // b[1] = 33 + 77 = 110;
          }
  
          do Output.printString("Test 4: expected result: 77; actual result: ");
          do Output.printInt(c[1]);
          do Output.println();
          do Output.printString("Test 5: expected result: 110; actual result: ");
          do Output.printInt(b[1]);
          do Output.println();
          return;
      }
      
      function int double(int a) {
        return a * 2;
      }
      
      function void fill(Array a, int size) {
          while (size > 0) {
              let size = size - 1;
              let a[size] = Array.new(3);
          }
          return;
      }
  }`,
  ConvertToBin_Main: `// This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/11/ConvertToBin/Main.jack
  /**
   * Unpacks a 16-bit number into its binary representation:
   * Takes the 16-bit number stored in RAM[8000] and stores its individual 
   * bits in RAM[8001]..RAM[8016] (each location will contain 0 or 1).
   * Before the conversion, RAM[8001]..RAM[8016] are initialized to -1.
   * 
   * The program should be tested as follows:
   * 1) Load the program into the supplied VM emulator
   * 2) Put some value in RAM[8000]
   * 3) Switch to "no animation"
   * 4) Run the program (give it enough time to run)
   * 5) Stop the program
   * 6) Check that RAM[8001]..RAM[8016] contain the correct bits, and
   *    that none of these memory locations contains -1.
   */
  class Main {
      
      /**
       * Initializes RAM[8001]..RAM[8016] to -1,
       * and converts the value in RAM[8000] to binary.
       */
      function void main() {
        var int value;
          do Main.fillMemory(8001, 16, -1); // sets RAM[8001]..RAM[8016] to -1
          let value = Memory.peek(8000);    // Uses an OS routine to read the input
          do Main.convert(value);           // performs the conversion
          return;
      }
      
      /** Converts the given decimal value to binary, and puts 
       *  the resulting bits in RAM[8001]..RAM[8016]. */
      function void convert(int value) {
        var int mask, position;
        var boolean loop;
        
        let loop = true;
        while (loop) {
            let position = position + 1;
            let mask = Main.nextMask(mask);
        
            if (~(position > 16)) {
        
                if (~((value & mask) = 0)) {
                    do Memory.poke(8000 + position, 1);
                   }
                else {
                    do Memory.poke(8000 + position, 0);
                  }    
            }
            else {
                let loop = false;
            }
        }
        return;
      }
   
      /** Returns the next mask (the mask that should follow the given mask). */
      function int nextMask(int mask) {
        if (mask = 0) {
            return 1;
        }
        else {
        return mask * 2;
        }
      }
      
      /** Fills 'length' consecutive memory locations with 'value',
        * starting at 'address'. */
      function void fillMemory(int address, int length, int value) {
          while (length > 0) {
              do Memory.poke(address, value);
              let length = length - 1;
              let address = address + 1;
          }
          return;
      }
  }`,
  Pong_Ball: `// This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/11/Pong/Ball.jack
  // (Same as projects/9/Pong/Ball.jack)
  /**
   * A graphical ball in a Pong game. Characterized by a screen location and 
   * distance of last destination. Has methods for drawing, erasing and moving
   * on the screen. The ball is displayed as a filled, 6-by-6 pixles rectangle. 
   */
  class Ball {
  
      field int x, y;               // the ball's screen location (in pixels)
      field int lengthx, lengthy;   // distance of last destination (in pixels)
  
      field int d, straightD, diagonalD;   // used for straight line movement computation
      field boolean invert, positivex, positivey;   // (same)
     
      field int leftWall, rightWall, topWall, bottomWall;  // wall locations
     
      field int wall;   // last wall that the ball was bounced off of
  
      /** Constructs a new ball with the given initial location and wall locations. */
      constructor Ball new(int Ax, int Ay,
                           int AleftWall, int ArightWall, int AtopWall, int AbottomWall) {    	
        let x = Ax;		
        let y = Ay;
        let leftWall = AleftWall;
        let rightWall = ArightWall - 6;    // -6 for ball size
        let topWall = AtopWall; 
        let bottomWall = AbottomWall - 6;  // -6 for ball size
        let wall = 0;
          do show();
          return this;
      }
  
      /** Deallocates the Ball's memory. */
      method void dispose() {
          do Memory.deAlloc(this);
          return;
      }
  
      /** Shows the ball. */
      method void show() {
          do Screen.setColor(true);
          do draw();
          return;
      }
  
      /** Hides the ball. */
      method void hide() {
          do Screen.setColor(false);
        do draw();
          return;
      }
  
      /** Draws the ball. */
      method void draw() {
        do Screen.drawRectangle(x, y, x + 5, y + 5);
        return;
      }
  
      /** Returns the ball's left edge. */
      method int getLeft() {
          return x;
      }
  
      /** Returns the ball's right edge. */
      method int getRight() {
          return x + 5;
      }
  
      /** Computes and sets the ball's destination. */
      method void setDestination(int destx, int desty) {
          var int dx, dy, temp;
          let lengthx = destx - x;
        let lengthy = desty - y;
          let dx = Math.abs(lengthx);
          let dy = Math.abs(lengthy);
          let invert = (dx < dy);
  
          if (invert) {
              let temp = dx; // swap dx, dy
              let dx = dy;
              let dy = temp;
               let positivex = (y < desty);
              let positivey = (x < destx);
          }
          else {
            let positivex = (x < destx);
              let positivey = (y < desty);
          }
  
          let d = (2 * dy) - dx;
          let straightD = 2 * dy;
          let diagonalD = 2 * (dy - dx);
  
        return;
      }
  
      /**
       * Moves the ball one step towards its destination.
       * If the ball has reached a wall, returns 0.
       * Else, returns a value according to the wall:
       * 1 (left wall), 2 (right wall), 3 (top wall), 4 (bottom wall).
       */
      method int move() {
  
        do hide();
  
          if (d < 0) { let d = d + straightD; }
          else {
              let d = d + diagonalD;
  
              if (positivey) {
                  if (invert) { let x = x + 4; }
                  else { let y = y + 4; }
              }
              else {
                  if (invert) { let x = x - 4; }
                  else { let y = y - 4; }
              }
        }
  
          if (positivex) {
              if (invert) { let y = y + 4; }
              else { let x = x + 4; }
        }
        else {
              if (invert) { let y = y - 4; }
              else { let x = x - 4; }
        }
  
        if (~(x > leftWall)) {
            let wall = 1;    
            let x = leftWall;
        }
          if (~(x < rightWall)) {
            let wall = 2;    
            let x = rightWall;
        }
          if (~(y > topWall)) {
              let wall = 3;    
            let y = topWall;
          }
          if (~(y < bottomWall)) {
              let wall = 4;    
            let y = bottomWall;
          }
  
        do show();
  
        return wall;
      }
  
      /**
       * Bounces off the current wall: sets the new destination
       * of the ball according to the ball's angle and the given
       * bouncing direction (-1/0/1=left/center/right or up/center/down).
       */
      method void bounce(int bouncingDirection) {
          var int newx, newy, divLengthx, divLengthy, factor;
  
        // Since results are too big, divides by 10
          let divLengthx = lengthx / 10;
          let divLengthy = lengthy / 10;
        if (bouncingDirection = 0) { let factor = 10; }
        else {
            if (((~(lengthx < 0)) & (bouncingDirection = 1)) | ((lengthx < 0) & (bouncingDirection = (-1)))) {
                  let factor = 20; // bounce direction is in ball direction
              }
            else { let factor = 5; } // bounce direction is against ball direction
        }
  
        if (wall = 1) {
            let newx = 506;
            let newy = (divLengthy * (-50)) / divLengthx;
              let newy = y + (newy * factor);
        }
          else {
              if (wall = 2) {
                  let newx = 0;
                  let newy = (divLengthy * 50) / divLengthx;
                  let newy = y + (newy * factor);
            }
            else {
                  if (wall = 3) {
                  let newy = 250;
                  let newx = (divLengthx * (-25)) / divLengthy;
                      let newx = x + (newx * factor);
              }
                  else { // assumes wall = 4
                  let newy = 0;
                  let newx = (divLengthx * 25) / divLengthy;
                      let newx = x + (newx * factor);
              }
              }
          }
  
          do setDestination(newx, newy);
          return;
      }
  }`,
  Pong_Main: `// This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/11/Pong/Main.jack
  // (Same as projects/9/Pong/Main.jack)
  /**
   * Main class of the Pong game.
   */
  class Main {
  
      /** Initializes a Pong game and starts running it. */
      function void main() {
          var PongGame game;
          do PongGame.newInstance();
          let game = PongGame.getInstance();
          do game.run();
          do game.dispose();
          return;
      }
  }`,
  Pong_Bat: `// This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/11/Pong/Bat.jack
  // (Same as projects/9/Pong/Bat.jack)
  /**
   * A graphical bat in a Pong game. 
   * Displayed as a filled horizontal rectangle that has a screen location,
   * a width and a height.
   * Has methods for drawing, erasing, moving left and right, and changing 
   * its width (to make the hitting action more challenging).
   * This class should have been called "Paddle", following the 
   * standard Pong terminology. Unaware of this terminology,
   * we called it "bat", and the name stuck. 
   */
  class Bat {
  
      field int x, y;           // the bat's screen location
      field int width, height;  // the bat's width and height
      field int direction;      // direction of the bat's movement
                                //  (1 = left, 2 = right)
  
      /** Constructs a new bat with the given location and width. */
      constructor Bat new(int Ax, int Ay, int Awidth, int Aheight) {
          let x = Ax;
          let y = Ay;
          let width = Awidth;
          let height = Aheight;
          let direction = 2;
          do show();
          return this;
      }
  
      /** Deallocates the object's memory. */
      method void dispose() {
          do Memory.deAlloc(this);
          return;
      }
  
      /** Shows the bat. */
      method void show() {
          do Screen.setColor(true);
          do draw();
          return;
      }
  
      /** Hides the bat. */
      method void hide() {
          do Screen.setColor(false);
          do draw();
          return;
      }
  
      /** Draws the bat. */
      method void draw() {
          do Screen.drawRectangle(x, y, x + width, y + height);
          return;
      }
  
      /** Sets the bat's direction (0=stop, 1=left, 2=right). */
      method void setDirection(int Adirection) {
          let direction = Adirection;
          return;
      }
  
      /** Returns the bat's left edge. */
      method int getLeft() {
          return x;
      }
  
      /** Returns the bat's right edge. */
      method int getRight() {
          return x + width;
      }
  
      /** Sets the bat's width. */
      method void setWidth(int Awidth) {
          do hide();
          let width = Awidth;
          do show();
          return;
      }
  
      /** Moves the bat one step in the bat's direction. */
      method void move() {
        if (direction = 1) {
              let x = x - 4;
              if (x < 0) { let x = 0; }
              do Screen.setColor(false);
              do Screen.drawRectangle((x + width) + 1, y, (x + width) + 4, y + height);
              do Screen.setColor(true);
              do Screen.drawRectangle(x, y, x + 3, y + height);
          }
          else {
              let x = x + 4;
              if ((x + width) > 511) { let x = 511 - width; }
              do Screen.setColor(false);
              do Screen.drawRectangle(x - 4, y, x - 1, y + height);
              do Screen.setColor(true);
              do Screen.drawRectangle((x + width) - 3, y, x + width, y + height);
          }
          return;
      }
  }`,
  Pong_PongGame: `// This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/11/Pong/PongGame.jack
  // (Same as projects/9/Pong/PongGame.jack)
  /**
   * Represents a Pong game.
   */
  class PongGame {
  
      static PongGame instance; // A Pong game     
      field Bat bat;            // bat
      field Ball ball;          // ball
      field int wall;           // current wall that the ball is bouncing off of
      field boolean exit;       // true when the game is over
      field int score;          // current score
      field int lastWall;       // last wall that the ball bounced off of
  
      // The current width of the bat
      field int batWidth;
  
      /** Constructs a new Pong game. */
      constructor PongGame new() {
        do Screen.clearScreen();
          let batWidth = 50;  // initial bat size
          let bat = Bat.new(230, 229, batWidth, 7);
          let ball = Ball.new(253, 222, 0, 511, 0, 229);
          do ball.setDestination(400,0);
          do Screen.drawRectangle(0, 238, 511, 240);
        do Output.moveCursor(22,0);
        do Output.printString("Score: 0");
    
        let exit = false;
        let score = 0;
        let wall = 0;
        let lastWall = 0;
  
          return this;
      }
  
      /** Deallocates the object's memory. */
      method void dispose() {
          do bat.dispose();
        do ball.dispose();
          do Memory.deAlloc(this);
          return;
      }
  
      /** Creates an instance of a Pong game. */
      function void newInstance() {
          let instance = PongGame.new();
          return;
      }
      
      /** Returns this Pong game. */
      function PongGame getInstance() {
          return instance;
      }
  
      /** Starts the game, and handles inputs from the user that control
       *  the bat's movement direction. */
      method void run() {
          var char key;
  
          while (~exit) {
              // waits for a key to be pressed.
              while ((key = 0) & (~exit)) {
                  let key = Keyboard.keyPressed();
                  do bat.move();
                  do moveBall();
                  do Sys.wait(50);
              }
  
              if (key = 130) { do bat.setDirection(1); }
            else {
                if (key = 132) { do bat.setDirection(2); }
              else {
                      if (key = 140) { let exit = true; }
              }
              }
  
              // Waits for the key to be released.
              while ((~(key = 0)) & (~exit)) {
                  let key = Keyboard.keyPressed();
                  do bat.move();
                  do moveBall();
                  do Sys.wait(50);
              }
          }
  
        if (exit) {
              do Output.moveCursor(10,27);
            do Output.printString("Game Over");
        }
              
          return;
      }
  
      /**
       * Handles ball movement, including bouncing.
       * If the ball bounces off a wall, finds its new direction.
       * If the ball bounces off the bat, increases the score by one
       * and shrinks the bat's size, to make the game more challenging. 
       */
      method void moveBall() {
          var int bouncingDirection, batLeft, batRight, ballLeft, ballRight;
  
          let wall = ball.move();
  
          if ((wall > 0) & (~(wall = lastWall))) {
              let lastWall = wall;
              let bouncingDirection = 0;
              let batLeft = bat.getLeft();
              let batRight = bat.getRight();
              let ballLeft = ball.getLeft();
              let ballRight = ball.getRight();
    
              if (wall = 4) {
                  let exit = (batLeft > ballRight) | (batRight < ballLeft);
                  if (~exit) {
                      if (ballRight < (batLeft + 10)) { let bouncingDirection = -1; }
                      else {
                          if (ballLeft > (batRight - 10)) { let bouncingDirection = 1; }
                      }
  
                      let batWidth = batWidth - 2;
                      do bat.setWidth(batWidth);      
                      let score = score + 1;
                      do Output.moveCursor(22,7);
                      do Output.printInt(score);
                  }
              }
              do ball.bounce(bouncingDirection);
          }
          return;
      }
  }`,
  Seven_Main: `// This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/11/Seven/Main.jack
  /**
   * Computes the value of 1 + (2 * 3) and prints the result
   * at the top-left of the screen.  
   */
  class Main {
  
     function void main() {
        do Output.printInt(1 + (2 * 3));
        return;
     }
  
  }`,
  Square_Main: `// This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/11/Square/Main.jack
  
  /** Initializes a new Square game and starts running it. */
  class Main {
      function void main() {
          var SquareGame game;
          let game = SquareGame.new();
          do game.run();
          do game.dispose();
          return;
      }
  }`,
  Square_Square: `// This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/11/Square/Square.jack
  
  /** Implements a graphical square.
      The square has top-left x and y coordinates, and a size. */
  class Square {
  
     field int x, y; // screen location of the top-left corner of this square
     field int size; // length of this square, in pixels
  
     /** Constructs and draws a new square with a given location and size. */
     constructor Square new(int ax, int ay, int asize) {
        let x = ax;
        let y = ay;
        let size = asize;
        do draw();
        return this;
     }
  
     /** Disposes this square. */
     method void dispose() {
        do Memory.deAlloc(this);
        return;
     }
  
     /** Draws this square in its current (x,y) location */
     method void draw() {
        // Draws the square using the color black
        do Screen.setColor(true);
        do Screen.drawRectangle(x, y, x + size, y + size);
        return;
     }
  
     /** Erases this square. */
     method void erase() {
        // Draws the square using the color white (background color)
        do Screen.setColor(false);
        do Screen.drawRectangle(x, y, x + size, y + size);
        return;
     }
  
      /** Increments the square size by 2 pixels (if possible). */
     method void incSize() {
        if (((y + size) < 254) & ((x + size) < 510)) {
           do erase();
           let size = size + 2;
           do draw();
        }
        return;
     }
  
     /** Decrements the square size by 2 pixels (if possible). */
     method void decSize() {
        if (size > 2) {
           do erase();
           let size = size - 2;
           do draw();
        }
        return;
     }
  
     /** Moves this square up by 2 pixels (if possible). */
     method void moveUp() {
        if (y > 1) {
           // Erases the bottom two rows of this square in its current location
           do Screen.setColor(false);
           do Screen.drawRectangle(x, (y + size) - 1, x + size, y + size);
           let y = y - 2;
           // Draws the top two rows of this square in its new location
           do Screen.setColor(true);
           do Screen.drawRectangle(x, y, x + size, y + 1);
        }
        return;
     }
  
     /** Moves the square down by 2 pixels (if possible). */
     method void moveDown() {
        if ((y + size) < 254) {
           do Screen.setColor(false);
           do Screen.drawRectangle(x, y, x + size, y + 1);
           let y = y + 2;
           do Screen.setColor(true);
           do Screen.drawRectangle(x, (y + size) - 1, x + size, y + size);
        }
        return;
     }
  
     /** Moves the square left by 2 pixels (if possible). */
     method void moveLeft() {
        if (x > 1) {
           do Screen.setColor(false);
           do Screen.drawRectangle((x + size) - 1, y, x + size, y + size);
           let x = x - 2;
           do Screen.setColor(true);
           do Screen.drawRectangle(x, y, x + 1, y + size);
        }
        return;
     }
  
     /** Moves the square right by 2 pixels (if possible). */
     method void moveRight() {
        if ((x + size) < 510) {
           do Screen.setColor(false);
           do Screen.drawRectangle(x, y, x + 1, y + size);
           let x = x + 2;
           do Screen.setColor(true);
           do Screen.drawRectangle((x + size) - 1, y, x + size, y + size);
        }
        return;
     }
  }`,
  Square_SquareGame: `// This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/11/Square/SquareGame.jack
  /**
   * Implements the Square game.
   * This simple game allows the user to move a black square around
   * the screen, and change the square's size during the movement.
   * When the game starts, a square of 30 by 30 pixels is shown at the
   * top-left corner of the screen. The user controls the square as follows.
   * The 4 arrow keys are used to move the square up, down, left, and right.
   * The 'z' and 'x' keys are used, respectively, to decrement and increment
   * the square's size. The 'q' key is used to quit the game.
   */
  class SquareGame {
     field Square square; // the square of this game
     field int direction; // the square's current direction: 
                          // 0=none, 1=up, 2=down, 3=left, 4=right
  
     /** Constructs a new square game. */
     constructor SquareGame new() {
        // The initial square is located in (0,0), has size 30, and is not moving.
        let square = Square.new(0, 0, 30);
        let direction = 0;
        return this;
     }
  
     /** Disposes this game. */
     method void dispose() {
        do square.dispose();
        do Memory.deAlloc(this);
        return;
     }
  
     /** Moves the square in the current direction. */
     method void moveSquare() {
        if (direction = 1) { do square.moveUp(); }
        if (direction = 2) { do square.moveDown(); }
        if (direction = 3) { do square.moveLeft(); }
        if (direction = 4) { do square.moveRight(); }
        do Sys.wait(5);  // delays the next movement
        return;
     }
  
     /** Runs the game: handles the user's inputs and moves the square accordingly */
     method void run() {
        var char key;  // the key currently pressed by the user
        var boolean exit;
        let exit = false;
        
        while (~exit) {
           // waits for a key to be pressed
           while (key = 0) {
              let key = Keyboard.keyPressed();
              do moveSquare();
           }
           if (key = 81)  { let exit = true; }     // q key
           if (key = 90)  { do square.decSize(); } // z key
           if (key = 88)  { do square.incSize(); } // x key
           if (key = 131) { let direction = 1; }   // up arrow
           if (key = 133) { let direction = 2; }   // down arrow
           if (key = 130) { let direction = 3; }   // left arrow
           if (key = 132) { let direction = 4; }   // right arrow
  
           // waits for the key to be released
           while (~(key = 0)) {
              let key = Keyboard.keyPressed();
              do moveSquare();
           }
       } // while
       return;
     }
  }
  
  
  `,
};

export const parsedFiles: Record<string, any> = {
  Average_Main: {
    name: "Main",
    varDecs: [],
    subroutines: [
      {
        type: "function",
        returnType: "void",
        name: "main",
        parameters: [],
        body: {
          varDecs: [
            { type: "Array", names: ["a"] },
            { type: "int", names: ["length"] },
            { type: "int", names: ["i", "sum"] },
          ],
          statements: [
            {
              statementType: "letStatement",
              name: "length",
              value: {
                nodeType: "expression",
                term: {
                  termType: "subroutineCall",
                  name: "Keyboard.readInt",
                  parameters: [
                    {
                      nodeType: "expression",
                      term: {
                        termType: "stringLiteral",
                        value: "How many numbers? ",
                      },
                      rest: [],
                    },
                  ],
                },
                rest: [],
              },
            },
            {
              statementType: "letStatement",
              name: "a",
              value: {
                nodeType: "expression",
                term: {
                  termType: "subroutineCall",
                  name: "Array.new",
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "length" },
                      rest: [],
                    },
                  ],
                },
                rest: [],
              },
            },
            {
              statementType: "letStatement",
              name: "i",
              value: {
                nodeType: "expression",
                term: { termType: "numericLiteral", value: 0 },
                rest: [],
              },
            },
            {
              statementType: "whileStatement",
              condition: {
                nodeType: "expression",
                term: { termType: "variable", name: "i" },
                rest: [
                  { op: "<", term: { termType: "variable", name: "length" } },
                ],
              },
              body: [
                {
                  statementType: "letStatement",
                  name: "a",
                  arrayIndex: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "i" },
                    rest: [],
                  },
                  value: {
                    nodeType: "expression",
                    term: {
                      termType: "subroutineCall",
                      name: "Keyboard.readInt",
                      parameters: [
                        {
                          nodeType: "expression",
                          term: {
                            termType: "stringLiteral",
                            value: "Enter a number: ",
                          },
                          rest: [],
                        },
                      ],
                    },
                    rest: [],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "sum",
                  value: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "sum" },
                    rest: [
                      {
                        op: "+",
                        term: {
                          termType: "arrayAccess",
                          name: "a",
                          index: {
                            nodeType: "expression",
                            term: { termType: "variable", name: "i" },
                            rest: [],
                          },
                        },
                      },
                    ],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "i",
                  value: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "i" },
                    rest: [
                      {
                        op: "+",
                        term: { termType: "numericLiteral", value: 1 },
                      },
                    ],
                  },
                },
              ],
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Output.printString",
                parameters: [
                  {
                    nodeType: "expression",
                    term: {
                      termType: "stringLiteral",
                      value: "The average is ",
                    },
                    rest: [],
                  },
                ],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Output.printInt",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "variable", name: "sum" },
                    rest: [
                      {
                        op: "/",
                        term: { termType: "variable", name: "length" },
                      },
                    ],
                  },
                ],
              },
            },
            { statementType: "returnStatement" },
          ],
        },
      },
    ],
  },
  ComplexArrays_Main: {
    name: "Main",
    varDecs: [],
    subroutines: [
      {
        type: "function",
        returnType: "void",
        name: "main",
        parameters: [],
        body: {
          varDecs: [{ type: "Array", names: ["a", "b", "c"] }],
          statements: [
            {
              statementType: "letStatement",
              name: "a",
              value: {
                nodeType: "expression",
                term: {
                  termType: "subroutineCall",
                  name: "Array.new",
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 10 },
                      rest: [],
                    },
                  ],
                },
                rest: [],
              },
            },
            {
              statementType: "letStatement",
              name: "b",
              value: {
                nodeType: "expression",
                term: {
                  termType: "subroutineCall",
                  name: "Array.new",
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 5 },
                      rest: [],
                    },
                  ],
                },
                rest: [],
              },
            },
            {
              statementType: "letStatement",
              name: "c",
              value: {
                nodeType: "expression",
                term: {
                  termType: "subroutineCall",
                  name: "Array.new",
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 1 },
                      rest: [],
                    },
                  ],
                },
                rest: [],
              },
            },
            {
              statementType: "letStatement",
              name: "a",
              arrayIndex: {
                nodeType: "expression",
                term: { termType: "numericLiteral", value: 3 },
                rest: [],
              },
              value: {
                nodeType: "expression",
                term: { termType: "numericLiteral", value: 2 },
                rest: [],
              },
            },
            {
              statementType: "letStatement",
              name: "a",
              arrayIndex: {
                nodeType: "expression",
                term: { termType: "numericLiteral", value: 4 },
                rest: [],
              },
              value: {
                nodeType: "expression",
                term: { termType: "numericLiteral", value: 8 },
                rest: [],
              },
            },
            {
              statementType: "letStatement",
              name: "a",
              arrayIndex: {
                nodeType: "expression",
                term: { termType: "numericLiteral", value: 5 },
                rest: [],
              },
              value: {
                nodeType: "expression",
                term: { termType: "numericLiteral", value: 4 },
                rest: [],
              },
            },
            {
              statementType: "letStatement",
              name: "b",
              arrayIndex: {
                nodeType: "expression",
                term: {
                  termType: "arrayAccess",
                  name: "a",
                  index: {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 3 },
                    rest: [],
                  },
                },
                rest: [],
              },
              value: {
                nodeType: "expression",
                term: {
                  termType: "arrayAccess",
                  name: "a",
                  index: {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 3 },
                    rest: [],
                  },
                },
                rest: [
                  { op: "+", term: { termType: "numericLiteral", value: 3 } },
                ],
              },
            },
            {
              statementType: "letStatement",
              name: "a",
              arrayIndex: {
                nodeType: "expression",
                term: {
                  termType: "arrayAccess",
                  name: "b",
                  index: {
                    nodeType: "expression",
                    term: {
                      termType: "arrayAccess",
                      name: "a",
                      index: {
                        nodeType: "expression",
                        term: { termType: "numericLiteral", value: 3 },
                        rest: [],
                      },
                    },
                    rest: [],
                  },
                },
                rest: [],
              },
              value: {
                nodeType: "expression",
                term: {
                  termType: "arrayAccess",
                  name: "a",
                  index: {
                    nodeType: "expression",
                    term: {
                      termType: "arrayAccess",
                      name: "a",
                      index: {
                        nodeType: "expression",
                        term: { termType: "numericLiteral", value: 5 },
                        rest: [],
                      },
                    },
                    rest: [],
                  },
                },
                rest: [
                  {
                    op: "*",
                    term: {
                      termType: "arrayAccess",
                      name: "b",
                      index: {
                        nodeType: "expression",
                        term: {
                          termType: "groupedExpression",
                          expression: {
                            nodeType: "expression",
                            term: {
                              termType: "groupedExpression",
                              expression: {
                                nodeType: "expression",
                                term: { termType: "numericLiteral", value: 7 },
                                rest: [
                                  {
                                    op: "-",
                                    term: {
                                      termType: "arrayAccess",
                                      name: "a",
                                      index: {
                                        nodeType: "expression",
                                        term: {
                                          termType: "numericLiteral",
                                          value: 3,
                                        },
                                        rest: [],
                                      },
                                    },
                                  },
                                ],
                              },
                            },
                            rest: [
                              {
                                op: "-",
                                term: {
                                  termType: "subroutineCall",
                                  name: "Main.double",
                                  parameters: [
                                    {
                                      nodeType: "expression",
                                      term: {
                                        termType: "numericLiteral",
                                        value: 2,
                                      },
                                      rest: [],
                                    },
                                  ],
                                },
                              },
                            ],
                          },
                        },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "numericLiteral", value: 1 },
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            },
            {
              statementType: "letStatement",
              name: "c",
              arrayIndex: {
                nodeType: "expression",
                term: { termType: "numericLiteral", value: 0 },
                rest: [],
              },
              value: {
                nodeType: "expression",
                term: { termType: "keywordLiteral", value: "null" },
                rest: [],
              },
            },
            {
              statementType: "letStatement",
              name: "c",
              value: {
                nodeType: "expression",
                term: {
                  termType: "arrayAccess",
                  name: "c",
                  index: {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 0 },
                    rest: [],
                  },
                },
                rest: [],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Output.printString",
                parameters: [
                  {
                    nodeType: "expression",
                    term: {
                      termType: "stringLiteral",
                      value: "Test 1: expected result: 5; actual result: ",
                    },
                    rest: [],
                  },
                ],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Output.printInt",
                parameters: [
                  {
                    nodeType: "expression",
                    term: {
                      termType: "arrayAccess",
                      name: "b",
                      index: {
                        nodeType: "expression",
                        term: { termType: "numericLiteral", value: 2 },
                        rest: [],
                      },
                    },
                    rest: [],
                  },
                ],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Output.println",
                parameters: [],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Output.printString",
                parameters: [
                  {
                    nodeType: "expression",
                    term: {
                      termType: "stringLiteral",
                      value: "Test 2: expected result: 40; actual result: ",
                    },
                    rest: [],
                  },
                ],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Output.printInt",
                parameters: [
                  {
                    nodeType: "expression",
                    term: {
                      termType: "arrayAccess",
                      name: "a",
                      index: {
                        nodeType: "expression",
                        term: { termType: "numericLiteral", value: 5 },
                        rest: [],
                      },
                    },
                    rest: [],
                  },
                ],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Output.println",
                parameters: [],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Output.printString",
                parameters: [
                  {
                    nodeType: "expression",
                    term: {
                      termType: "stringLiteral",
                      value: "Test 3: expected result: 0; actual result: ",
                    },
                    rest: [],
                  },
                ],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Output.printInt",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "variable", name: "c" },
                    rest: [],
                  },
                ],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Output.println",
                parameters: [],
              },
            },
            {
              statementType: "letStatement",
              name: "c",
              value: {
                nodeType: "expression",
                term: { termType: "keywordLiteral", value: "null" },
                rest: [],
              },
            },
            {
              statementType: "ifStatement",
              condition: {
                nodeType: "expression",
                term: { termType: "variable", name: "c" },
                rest: [
                  {
                    op: "=",
                    term: { termType: "keywordLiteral", value: "null" },
                  },
                ],
              },
              body: [
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "Main.fill",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "a" },
                        rest: [],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "numericLiteral", value: 10 },
                        rest: [],
                      },
                    ],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "c",
                  value: {
                    nodeType: "expression",
                    term: {
                      termType: "arrayAccess",
                      name: "a",
                      index: {
                        nodeType: "expression",
                        term: { termType: "numericLiteral", value: 3 },
                        rest: [],
                      },
                    },
                    rest: [],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "c",
                  arrayIndex: {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 1 },
                    rest: [],
                  },
                  value: {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 33 },
                    rest: [],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "c",
                  value: {
                    nodeType: "expression",
                    term: {
                      termType: "arrayAccess",
                      name: "a",
                      index: {
                        nodeType: "expression",
                        term: { termType: "numericLiteral", value: 7 },
                        rest: [],
                      },
                    },
                    rest: [],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "c",
                  arrayIndex: {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 1 },
                    rest: [],
                  },
                  value: {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 77 },
                    rest: [],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "b",
                  value: {
                    nodeType: "expression",
                    term: {
                      termType: "arrayAccess",
                      name: "a",
                      index: {
                        nodeType: "expression",
                        term: { termType: "numericLiteral", value: 3 },
                        rest: [],
                      },
                    },
                    rest: [],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "b",
                  arrayIndex: {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 1 },
                    rest: [],
                  },
                  value: {
                    nodeType: "expression",
                    term: {
                      termType: "arrayAccess",
                      name: "b",
                      index: {
                        nodeType: "expression",
                        term: { termType: "numericLiteral", value: 1 },
                        rest: [],
                      },
                    },
                    rest: [
                      {
                        op: "+",
                        term: {
                          termType: "arrayAccess",
                          name: "c",
                          index: {
                            nodeType: "expression",
                            term: { termType: "numericLiteral", value: 1 },
                            rest: [],
                          },
                        },
                      },
                    ],
                  },
                },
              ],
              else: [],
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Output.printString",
                parameters: [
                  {
                    nodeType: "expression",
                    term: {
                      termType: "stringLiteral",
                      value: "Test 4: expected result: 77; actual result: ",
                    },
                    rest: [],
                  },
                ],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Output.printInt",
                parameters: [
                  {
                    nodeType: "expression",
                    term: {
                      termType: "arrayAccess",
                      name: "c",
                      index: {
                        nodeType: "expression",
                        term: { termType: "numericLiteral", value: 1 },
                        rest: [],
                      },
                    },
                    rest: [],
                  },
                ],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Output.println",
                parameters: [],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Output.printString",
                parameters: [
                  {
                    nodeType: "expression",
                    term: {
                      termType: "stringLiteral",
                      value: "Test 5: expected result: 110; actual result: ",
                    },
                    rest: [],
                  },
                ],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Output.printInt",
                parameters: [
                  {
                    nodeType: "expression",
                    term: {
                      termType: "arrayAccess",
                      name: "b",
                      index: {
                        nodeType: "expression",
                        term: { termType: "numericLiteral", value: 1 },
                        rest: [],
                      },
                    },
                    rest: [],
                  },
                ],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Output.println",
                parameters: [],
              },
            },
            { statementType: "returnStatement" },
          ],
        },
      },
      {
        type: "function",
        returnType: "int",
        name: "double",
        parameters: [{ type: "int", name: "a" }],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "returnStatement",
              value: {
                nodeType: "expression",
                term: { termType: "variable", name: "a" },
                rest: [
                  { op: "*", term: { termType: "numericLiteral", value: 2 } },
                ],
              },
            },
          ],
        },
      },
      {
        type: "function",
        returnType: "void",
        name: "fill",
        parameters: [
          { type: "Array", name: "a" },
          { type: "int", name: "size" },
        ],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "whileStatement",
              condition: {
                nodeType: "expression",
                term: { termType: "variable", name: "size" },
                rest: [
                  { op: ">", term: { termType: "numericLiteral", value: 0 } },
                ],
              },
              body: [
                {
                  statementType: "letStatement",
                  name: "size",
                  value: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "size" },
                    rest: [
                      {
                        op: "-",
                        term: { termType: "numericLiteral", value: 1 },
                      },
                    ],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "a",
                  arrayIndex: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "size" },
                    rest: [],
                  },
                  value: {
                    nodeType: "expression",
                    term: {
                      termType: "subroutineCall",
                      name: "Array.new",
                      parameters: [
                        {
                          nodeType: "expression",
                          term: { termType: "numericLiteral", value: 3 },
                          rest: [],
                        },
                      ],
                    },
                    rest: [],
                  },
                },
              ],
            },
            { statementType: "returnStatement" },
          ],
        },
      },
    ],
  },
  ConvertToBin_Main: {
    name: "Main",
    varDecs: [],
    subroutines: [
      {
        type: "function",
        returnType: "void",
        name: "main",
        parameters: [],
        body: {
          varDecs: [{ type: "int", names: ["value"] }],
          statements: [
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Main.fillMemory",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 8001 },
                    rest: [],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 16 },
                    rest: [],
                  },
                  {
                    nodeType: "expression",
                    term: {
                      termType: "unaryExpression",
                      op: "-",
                      term: { termType: "numericLiteral", value: 1 },
                    },
                    rest: [],
                  },
                ],
              },
            },
            {
              statementType: "letStatement",
              name: "value",
              value: {
                nodeType: "expression",
                term: {
                  termType: "subroutineCall",
                  name: "Memory.peek",
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 8000 },
                      rest: [],
                    },
                  ],
                },
                rest: [],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Main.convert",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "variable", name: "value" },
                    rest: [],
                  },
                ],
              },
            },
            { statementType: "returnStatement" },
          ],
        },
      },
      {
        type: "function",
        returnType: "void",
        name: "convert",
        parameters: [{ type: "int", name: "value" }],
        body: {
          varDecs: [
            { type: "int", names: ["mask", "position"] },
            { type: "boolean", names: ["loop"] },
          ],
          statements: [
            {
              statementType: "letStatement",
              name: "loop",
              value: {
                nodeType: "expression",
                term: { termType: "keywordLiteral", value: "true" },
                rest: [],
              },
            },
            {
              statementType: "whileStatement",
              condition: {
                nodeType: "expression",
                term: { termType: "variable", name: "loop" },
                rest: [],
              },
              body: [
                {
                  statementType: "letStatement",
                  name: "position",
                  value: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "position" },
                    rest: [
                      {
                        op: "+",
                        term: { termType: "numericLiteral", value: 1 },
                      },
                    ],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "mask",
                  value: {
                    nodeType: "expression",
                    term: {
                      termType: "subroutineCall",
                      name: "Main.nextMask",
                      parameters: [
                        {
                          nodeType: "expression",
                          term: { termType: "variable", name: "mask" },
                          rest: [],
                        },
                      ],
                    },
                    rest: [],
                  },
                },
                {
                  statementType: "ifStatement",
                  condition: {
                    nodeType: "expression",
                    term: {
                      termType: "unaryExpression",
                      op: "~",
                      term: {
                        termType: "groupedExpression",
                        expression: {
                          nodeType: "expression",
                          term: { termType: "variable", name: "position" },
                          rest: [
                            {
                              op: ">",
                              term: { termType: "numericLiteral", value: 16 },
                            },
                          ],
                        },
                      },
                    },
                    rest: [],
                  },
                  body: [
                    {
                      statementType: "ifStatement",
                      condition: {
                        nodeType: "expression",
                        term: {
                          termType: "unaryExpression",
                          op: "~",
                          term: {
                            termType: "groupedExpression",
                            expression: {
                              nodeType: "expression",
                              term: {
                                termType: "groupedExpression",
                                expression: {
                                  nodeType: "expression",
                                  term: { termType: "variable", name: "value" },
                                  rest: [
                                    {
                                      op: "&",
                                      term: {
                                        termType: "variable",
                                        name: "mask",
                                      },
                                    },
                                  ],
                                },
                              },
                              rest: [
                                {
                                  op: "=",
                                  term: {
                                    termType: "numericLiteral",
                                    value: 0,
                                  },
                                },
                              ],
                            },
                          },
                        },
                        rest: [],
                      },
                      body: [
                        {
                          statementType: "doStatement",
                          call: {
                            termType: "subroutineCall",
                            name: "Memory.poke",
                            parameters: [
                              {
                                nodeType: "expression",
                                term: {
                                  termType: "numericLiteral",
                                  value: 8000,
                                },
                                rest: [
                                  {
                                    op: "+",
                                    term: {
                                      termType: "variable",
                                      name: "position",
                                    },
                                  },
                                ],
                              },
                              {
                                nodeType: "expression",
                                term: { termType: "numericLiteral", value: 1 },
                                rest: [],
                              },
                            ],
                          },
                        },
                      ],
                      else: [
                        {
                          statementType: "doStatement",
                          call: {
                            termType: "subroutineCall",
                            name: "Memory.poke",
                            parameters: [
                              {
                                nodeType: "expression",
                                term: {
                                  termType: "numericLiteral",
                                  value: 8000,
                                },
                                rest: [
                                  {
                                    op: "+",
                                    term: {
                                      termType: "variable",
                                      name: "position",
                                    },
                                  },
                                ],
                              },
                              {
                                nodeType: "expression",
                                term: { termType: "numericLiteral", value: 0 },
                                rest: [],
                              },
                            ],
                          },
                        },
                      ],
                    },
                  ],
                  else: [
                    {
                      statementType: "letStatement",
                      name: "loop",
                      value: {
                        nodeType: "expression",
                        term: { termType: "keywordLiteral", value: "false" },
                        rest: [],
                      },
                    },
                  ],
                },
              ],
            },
            { statementType: "returnStatement" },
          ],
        },
      },
      {
        type: "function",
        returnType: "int",
        name: "nextMask",
        parameters: [{ type: "int", name: "mask" }],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "ifStatement",
              condition: {
                nodeType: "expression",
                term: { termType: "variable", name: "mask" },
                rest: [
                  { op: "=", term: { termType: "numericLiteral", value: 0 } },
                ],
              },
              body: [
                {
                  statementType: "returnStatement",
                  value: {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 1 },
                    rest: [],
                  },
                },
              ],
              else: [
                {
                  statementType: "returnStatement",
                  value: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "mask" },
                    rest: [
                      {
                        op: "*",
                        term: { termType: "numericLiteral", value: 2 },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      },
      {
        type: "function",
        returnType: "void",
        name: "fillMemory",
        parameters: [
          { type: "int", name: "address" },
          { type: "int", name: "length" },
          { type: "int", name: "value" },
        ],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "whileStatement",
              condition: {
                nodeType: "expression",
                term: { termType: "variable", name: "length" },
                rest: [
                  { op: ">", term: { termType: "numericLiteral", value: 0 } },
                ],
              },
              body: [
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "Memory.poke",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "address" },
                        rest: [],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "value" },
                        rest: [],
                      },
                    ],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "length",
                  value: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "length" },
                    rest: [
                      {
                        op: "-",
                        term: { termType: "numericLiteral", value: 1 },
                      },
                    ],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "address",
                  value: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "address" },
                    rest: [
                      {
                        op: "+",
                        term: { termType: "numericLiteral", value: 1 },
                      },
                    ],
                  },
                },
              ],
            },
            { statementType: "returnStatement" },
          ],
        },
      },
    ],
  },
  Pong_Ball: {
    name: "Ball",
    varDecs: [
      { varType: "field", type: "int", names: ["x", "y"] },
      { varType: "field", type: "int", names: ["lengthx", "lengthy"] },
      { varType: "field", type: "int", names: ["d", "straightD", "diagonalD"] },
      {
        varType: "field",
        type: "boolean",
        names: ["invert", "positivex", "positivey"],
      },
      {
        varType: "field",
        type: "int",
        names: ["leftWall", "rightWall", "topWall", "bottomWall"],
      },
      { varType: "field", type: "int", names: ["wall"] },
    ],
    subroutines: [
      {
        type: "constructor",
        returnType: "Ball",
        name: "new",
        parameters: [
          { type: "int", name: "Ax" },
          { type: "int", name: "Ay" },
          { type: "int", name: "AleftWall" },
          { type: "int", name: "ArightWall" },
          { type: "int", name: "AtopWall" },
          { type: "int", name: "AbottomWall" },
        ],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "letStatement",
              name: "x",
              value: {
                nodeType: "expression",
                term: { termType: "variable", name: "Ax" },
                rest: [],
              },
            },
            {
              statementType: "letStatement",
              name: "y",
              value: {
                nodeType: "expression",
                term: { termType: "variable", name: "Ay" },
                rest: [],
              },
            },
            {
              statementType: "letStatement",
              name: "leftWall",
              value: {
                nodeType: "expression",
                term: { termType: "variable", name: "AleftWall" },
                rest: [],
              },
            },
            {
              statementType: "letStatement",
              name: "rightWall",
              value: {
                nodeType: "expression",
                term: { termType: "variable", name: "ArightWall" },
                rest: [
                  { op: "-", term: { termType: "numericLiteral", value: 6 } },
                ],
              },
            },
            {
              statementType: "letStatement",
              name: "topWall",
              value: {
                nodeType: "expression",
                term: { termType: "variable", name: "AtopWall" },
                rest: [],
              },
            },
            {
              statementType: "letStatement",
              name: "bottomWall",
              value: {
                nodeType: "expression",
                term: { termType: "variable", name: "AbottomWall" },
                rest: [
                  { op: "-", term: { termType: "numericLiteral", value: 6 } },
                ],
              },
            },
            {
              statementType: "letStatement",
              name: "wall",
              value: {
                nodeType: "expression",
                term: { termType: "numericLiteral", value: 0 },
                rest: [],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "show",
                parameters: [],
              },
            },
            {
              statementType: "returnStatement",
              value: {
                nodeType: "expression",
                term: { termType: "keywordLiteral", value: "this" },
                rest: [],
              },
            },
          ],
        },
      },
      {
        type: "method",
        returnType: "void",
        name: "dispose",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Memory.deAlloc",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "keywordLiteral", value: "this" },
                    rest: [],
                  },
                ],
              },
            },
            { statementType: "returnStatement" },
          ],
        },
      },
      {
        type: "method",
        returnType: "void",
        name: "show",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Screen.setColor",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "keywordLiteral", value: "true" },
                    rest: [],
                  },
                ],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "draw",
                parameters: [],
              },
            },
            { statementType: "returnStatement" },
          ],
        },
      },
      {
        type: "method",
        returnType: "void",
        name: "hide",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Screen.setColor",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "keywordLiteral", value: "false" },
                    rest: [],
                  },
                ],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "draw",
                parameters: [],
              },
            },
            { statementType: "returnStatement" },
          ],
        },
      },
      {
        type: "method",
        returnType: "void",
        name: "draw",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Screen.drawRectangle",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "variable", name: "x" },
                    rest: [],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "variable", name: "y" },
                    rest: [],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "variable", name: "x" },
                    rest: [
                      {
                        op: "+",
                        term: { termType: "numericLiteral", value: 5 },
                      },
                    ],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "variable", name: "y" },
                    rest: [
                      {
                        op: "+",
                        term: { termType: "numericLiteral", value: 5 },
                      },
                    ],
                  },
                ],
              },
            },
            { statementType: "returnStatement" },
          ],
        },
      },
      {
        type: "method",
        returnType: "int",
        name: "getLeft",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "returnStatement",
              value: {
                nodeType: "expression",
                term: { termType: "variable", name: "x" },
                rest: [],
              },
            },
          ],
        },
      },
      {
        type: "method",
        returnType: "int",
        name: "getRight",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "returnStatement",
              value: {
                nodeType: "expression",
                term: { termType: "variable", name: "x" },
                rest: [
                  { op: "+", term: { termType: "numericLiteral", value: 5 } },
                ],
              },
            },
          ],
        },
      },
      {
        type: "method",
        returnType: "void",
        name: "setDestination",
        parameters: [
          { type: "int", name: "destx" },
          { type: "int", name: "desty" },
        ],
        body: {
          varDecs: [{ type: "int", names: ["dx", "dy", "temp"] }],
          statements: [
            {
              statementType: "letStatement",
              name: "lengthx",
              value: {
                nodeType: "expression",
                term: { termType: "variable", name: "destx" },
                rest: [{ op: "-", term: { termType: "variable", name: "x" } }],
              },
            },
            {
              statementType: "letStatement",
              name: "lengthy",
              value: {
                nodeType: "expression",
                term: { termType: "variable", name: "desty" },
                rest: [{ op: "-", term: { termType: "variable", name: "y" } }],
              },
            },
            {
              statementType: "letStatement",
              name: "dx",
              value: {
                nodeType: "expression",
                term: {
                  termType: "subroutineCall",
                  name: "Math.abs",
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "lengthx" },
                      rest: [],
                    },
                  ],
                },
                rest: [],
              },
            },
            {
              statementType: "letStatement",
              name: "dy",
              value: {
                nodeType: "expression",
                term: {
                  termType: "subroutineCall",
                  name: "Math.abs",
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "lengthy" },
                      rest: [],
                    },
                  ],
                },
                rest: [],
              },
            },
            {
              statementType: "letStatement",
              name: "invert",
              value: {
                nodeType: "expression",
                term: {
                  termType: "groupedExpression",
                  expression: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "dx" },
                    rest: [
                      { op: "<", term: { termType: "variable", name: "dy" } },
                    ],
                  },
                },
                rest: [],
              },
            },
            {
              statementType: "ifStatement",
              condition: {
                nodeType: "expression",
                term: { termType: "variable", name: "invert" },
                rest: [],
              },
              body: [
                {
                  statementType: "letStatement",
                  name: "temp",
                  value: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "dx" },
                    rest: [],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "dx",
                  value: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "dy" },
                    rest: [],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "dy",
                  value: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "temp" },
                    rest: [],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "positivex",
                  value: {
                    nodeType: "expression",
                    term: {
                      termType: "groupedExpression",
                      expression: {
                        nodeType: "expression",
                        term: { termType: "variable", name: "y" },
                        rest: [
                          {
                            op: "<",
                            term: { termType: "variable", name: "desty" },
                          },
                        ],
                      },
                    },
                    rest: [],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "positivey",
                  value: {
                    nodeType: "expression",
                    term: {
                      termType: "groupedExpression",
                      expression: {
                        nodeType: "expression",
                        term: { termType: "variable", name: "x" },
                        rest: [
                          {
                            op: "<",
                            term: { termType: "variable", name: "destx" },
                          },
                        ],
                      },
                    },
                    rest: [],
                  },
                },
              ],
              else: [
                {
                  statementType: "letStatement",
                  name: "positivex",
                  value: {
                    nodeType: "expression",
                    term: {
                      termType: "groupedExpression",
                      expression: {
                        nodeType: "expression",
                        term: { termType: "variable", name: "x" },
                        rest: [
                          {
                            op: "<",
                            term: { termType: "variable", name: "destx" },
                          },
                        ],
                      },
                    },
                    rest: [],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "positivey",
                  value: {
                    nodeType: "expression",
                    term: {
                      termType: "groupedExpression",
                      expression: {
                        nodeType: "expression",
                        term: { termType: "variable", name: "y" },
                        rest: [
                          {
                            op: "<",
                            term: { termType: "variable", name: "desty" },
                          },
                        ],
                      },
                    },
                    rest: [],
                  },
                },
              ],
            },
            {
              statementType: "letStatement",
              name: "d",
              value: {
                nodeType: "expression",
                term: {
                  termType: "groupedExpression",
                  expression: {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 2 },
                    rest: [
                      { op: "*", term: { termType: "variable", name: "dy" } },
                    ],
                  },
                },
                rest: [{ op: "-", term: { termType: "variable", name: "dx" } }],
              },
            },
            {
              statementType: "letStatement",
              name: "straightD",
              value: {
                nodeType: "expression",
                term: { termType: "numericLiteral", value: 2 },
                rest: [{ op: "*", term: { termType: "variable", name: "dy" } }],
              },
            },
            {
              statementType: "letStatement",
              name: "diagonalD",
              value: {
                nodeType: "expression",
                term: { termType: "numericLiteral", value: 2 },
                rest: [
                  {
                    op: "*",
                    term: {
                      termType: "groupedExpression",
                      expression: {
                        nodeType: "expression",
                        term: { termType: "variable", name: "dy" },
                        rest: [
                          {
                            op: "-",
                            term: { termType: "variable", name: "dx" },
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            },
            { statementType: "returnStatement" },
          ],
        },
      },
      {
        type: "method",
        returnType: "int",
        name: "move",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "hide",
                parameters: [],
              },
            },
            {
              statementType: "ifStatement",
              condition: {
                nodeType: "expression",
                term: { termType: "variable", name: "d" },
                rest: [
                  { op: "<", term: { termType: "numericLiteral", value: 0 } },
                ],
              },
              body: [
                {
                  statementType: "letStatement",
                  name: "d",
                  value: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "d" },
                    rest: [
                      {
                        op: "+",
                        term: { termType: "variable", name: "straightD" },
                      },
                    ],
                  },
                },
              ],
              else: [
                {
                  statementType: "letStatement",
                  name: "d",
                  value: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "d" },
                    rest: [
                      {
                        op: "+",
                        term: { termType: "variable", name: "diagonalD" },
                      },
                    ],
                  },
                },
                {
                  statementType: "ifStatement",
                  condition: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "positivey" },
                    rest: [],
                  },
                  body: [
                    {
                      statementType: "ifStatement",
                      condition: {
                        nodeType: "expression",
                        term: { termType: "variable", name: "invert" },
                        rest: [],
                      },
                      body: [
                        {
                          statementType: "letStatement",
                          name: "x",
                          value: {
                            nodeType: "expression",
                            term: { termType: "variable", name: "x" },
                            rest: [
                              {
                                op: "+",
                                term: { termType: "numericLiteral", value: 4 },
                              },
                            ],
                          },
                        },
                      ],
                      else: [
                        {
                          statementType: "letStatement",
                          name: "y",
                          value: {
                            nodeType: "expression",
                            term: { termType: "variable", name: "y" },
                            rest: [
                              {
                                op: "+",
                                term: { termType: "numericLiteral", value: 4 },
                              },
                            ],
                          },
                        },
                      ],
                    },
                  ],
                  else: [
                    {
                      statementType: "ifStatement",
                      condition: {
                        nodeType: "expression",
                        term: { termType: "variable", name: "invert" },
                        rest: [],
                      },
                      body: [
                        {
                          statementType: "letStatement",
                          name: "x",
                          value: {
                            nodeType: "expression",
                            term: { termType: "variable", name: "x" },
                            rest: [
                              {
                                op: "-",
                                term: { termType: "numericLiteral", value: 4 },
                              },
                            ],
                          },
                        },
                      ],
                      else: [
                        {
                          statementType: "letStatement",
                          name: "y",
                          value: {
                            nodeType: "expression",
                            term: { termType: "variable", name: "y" },
                            rest: [
                              {
                                op: "-",
                                term: { termType: "numericLiteral", value: 4 },
                              },
                            ],
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              statementType: "ifStatement",
              condition: {
                nodeType: "expression",
                term: { termType: "variable", name: "positivex" },
                rest: [],
              },
              body: [
                {
                  statementType: "ifStatement",
                  condition: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "invert" },
                    rest: [],
                  },
                  body: [
                    {
                      statementType: "letStatement",
                      name: "y",
                      value: {
                        nodeType: "expression",
                        term: { termType: "variable", name: "y" },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "numericLiteral", value: 4 },
                          },
                        ],
                      },
                    },
                  ],
                  else: [
                    {
                      statementType: "letStatement",
                      name: "x",
                      value: {
                        nodeType: "expression",
                        term: { termType: "variable", name: "x" },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "numericLiteral", value: 4 },
                          },
                        ],
                      },
                    },
                  ],
                },
              ],
              else: [
                {
                  statementType: "ifStatement",
                  condition: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "invert" },
                    rest: [],
                  },
                  body: [
                    {
                      statementType: "letStatement",
                      name: "y",
                      value: {
                        nodeType: "expression",
                        term: { termType: "variable", name: "y" },
                        rest: [
                          {
                            op: "-",
                            term: { termType: "numericLiteral", value: 4 },
                          },
                        ],
                      },
                    },
                  ],
                  else: [
                    {
                      statementType: "letStatement",
                      name: "x",
                      value: {
                        nodeType: "expression",
                        term: { termType: "variable", name: "x" },
                        rest: [
                          {
                            op: "-",
                            term: { termType: "numericLiteral", value: 4 },
                          },
                        ],
                      },
                    },
                  ],
                },
              ],
            },
            {
              statementType: "ifStatement",
              condition: {
                nodeType: "expression",
                term: {
                  termType: "unaryExpression",
                  op: "~",
                  term: {
                    termType: "groupedExpression",
                    expression: {
                      nodeType: "expression",
                      term: { termType: "variable", name: "x" },
                      rest: [
                        {
                          op: ">",
                          term: { termType: "variable", name: "leftWall" },
                        },
                      ],
                    },
                  },
                },
                rest: [],
              },
              body: [
                {
                  statementType: "letStatement",
                  name: "wall",
                  value: {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 1 },
                    rest: [],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "x",
                  value: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "leftWall" },
                    rest: [],
                  },
                },
              ],
              else: [],
            },
            {
              statementType: "ifStatement",
              condition: {
                nodeType: "expression",
                term: {
                  termType: "unaryExpression",
                  op: "~",
                  term: {
                    termType: "groupedExpression",
                    expression: {
                      nodeType: "expression",
                      term: { termType: "variable", name: "x" },
                      rest: [
                        {
                          op: "<",
                          term: { termType: "variable", name: "rightWall" },
                        },
                      ],
                    },
                  },
                },
                rest: [],
              },
              body: [
                {
                  statementType: "letStatement",
                  name: "wall",
                  value: {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 2 },
                    rest: [],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "x",
                  value: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "rightWall" },
                    rest: [],
                  },
                },
              ],
              else: [],
            },
            {
              statementType: "ifStatement",
              condition: {
                nodeType: "expression",
                term: {
                  termType: "unaryExpression",
                  op: "~",
                  term: {
                    termType: "groupedExpression",
                    expression: {
                      nodeType: "expression",
                      term: { termType: "variable", name: "y" },
                      rest: [
                        {
                          op: ">",
                          term: { termType: "variable", name: "topWall" },
                        },
                      ],
                    },
                  },
                },
                rest: [],
              },
              body: [
                {
                  statementType: "letStatement",
                  name: "wall",
                  value: {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 3 },
                    rest: [],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "y",
                  value: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "topWall" },
                    rest: [],
                  },
                },
              ],
              else: [],
            },
            {
              statementType: "ifStatement",
              condition: {
                nodeType: "expression",
                term: {
                  termType: "unaryExpression",
                  op: "~",
                  term: {
                    termType: "groupedExpression",
                    expression: {
                      nodeType: "expression",
                      term: { termType: "variable", name: "y" },
                      rest: [
                        {
                          op: "<",
                          term: { termType: "variable", name: "bottomWall" },
                        },
                      ],
                    },
                  },
                },
                rest: [],
              },
              body: [
                {
                  statementType: "letStatement",
                  name: "wall",
                  value: {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 4 },
                    rest: [],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "y",
                  value: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "bottomWall" },
                    rest: [],
                  },
                },
              ],
              else: [],
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "show",
                parameters: [],
              },
            },
            {
              statementType: "returnStatement",
              value: {
                nodeType: "expression",
                term: { termType: "variable", name: "wall" },
                rest: [],
              },
            },
          ],
        },
      },
      {
        type: "method",
        returnType: "void",
        name: "bounce",
        parameters: [{ type: "int", name: "bouncingDirection" }],
        body: {
          varDecs: [
            {
              type: "int",
              names: ["newx", "newy", "divLengthx", "divLengthy", "factor"],
            },
          ],
          statements: [
            {
              statementType: "letStatement",
              name: "divLengthx",
              value: {
                nodeType: "expression",
                term: { termType: "variable", name: "lengthx" },
                rest: [
                  { op: "/", term: { termType: "numericLiteral", value: 10 } },
                ],
              },
            },
            {
              statementType: "letStatement",
              name: "divLengthy",
              value: {
                nodeType: "expression",
                term: { termType: "variable", name: "lengthy" },
                rest: [
                  { op: "/", term: { termType: "numericLiteral", value: 10 } },
                ],
              },
            },
            {
              statementType: "ifStatement",
              condition: {
                nodeType: "expression",
                term: { termType: "variable", name: "bouncingDirection" },
                rest: [
                  { op: "=", term: { termType: "numericLiteral", value: 0 } },
                ],
              },
              body: [
                {
                  statementType: "letStatement",
                  name: "factor",
                  value: {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 10 },
                    rest: [],
                  },
                },
              ],
              else: [
                {
                  statementType: "ifStatement",
                  condition: {
                    nodeType: "expression",
                    term: {
                      termType: "groupedExpression",
                      expression: {
                        nodeType: "expression",
                        term: {
                          termType: "groupedExpression",
                          expression: {
                            nodeType: "expression",
                            term: {
                              termType: "unaryExpression",
                              op: "~",
                              term: {
                                termType: "groupedExpression",
                                expression: {
                                  nodeType: "expression",
                                  term: {
                                    termType: "variable",
                                    name: "lengthx",
                                  },
                                  rest: [
                                    {
                                      op: "<",
                                      term: {
                                        termType: "numericLiteral",
                                        value: 0,
                                      },
                                    },
                                  ],
                                },
                              },
                            },
                            rest: [],
                          },
                        },
                        rest: [
                          {
                            op: "&",
                            term: {
                              termType: "groupedExpression",
                              expression: {
                                nodeType: "expression",
                                term: {
                                  termType: "variable",
                                  name: "bouncingDirection",
                                },
                                rest: [
                                  {
                                    op: "=",
                                    term: {
                                      termType: "numericLiteral",
                                      value: 1,
                                    },
                                  },
                                ],
                              },
                            },
                          },
                        ],
                      },
                    },
                    rest: [
                      {
                        op: "|",
                        term: {
                          termType: "groupedExpression",
                          expression: {
                            nodeType: "expression",
                            term: {
                              termType: "groupedExpression",
                              expression: {
                                nodeType: "expression",
                                term: { termType: "variable", name: "lengthx" },
                                rest: [
                                  {
                                    op: "<",
                                    term: {
                                      termType: "numericLiteral",
                                      value: 0,
                                    },
                                  },
                                ],
                              },
                            },
                            rest: [
                              {
                                op: "&",
                                term: {
                                  termType: "groupedExpression",
                                  expression: {
                                    nodeType: "expression",
                                    term: {
                                      termType: "variable",
                                      name: "bouncingDirection",
                                    },
                                    rest: [
                                      {
                                        op: "=",
                                        term: {
                                          termType: "groupedExpression",
                                          expression: {
                                            nodeType: "expression",
                                            term: {
                                              termType: "unaryExpression",
                                              op: "-",
                                              term: {
                                                termType: "numericLiteral",
                                                value: 1,
                                              },
                                            },
                                            rest: [],
                                          },
                                        },
                                      },
                                    ],
                                  },
                                },
                              },
                            ],
                          },
                        },
                      },
                    ],
                  },
                  body: [
                    {
                      statementType: "letStatement",
                      name: "factor",
                      value: {
                        nodeType: "expression",
                        term: { termType: "numericLiteral", value: 20 },
                        rest: [],
                      },
                    },
                  ],
                  else: [
                    {
                      statementType: "letStatement",
                      name: "factor",
                      value: {
                        nodeType: "expression",
                        term: { termType: "numericLiteral", value: 5 },
                        rest: [],
                      },
                    },
                  ],
                },
              ],
            },
            {
              statementType: "ifStatement",
              condition: {
                nodeType: "expression",
                term: { termType: "variable", name: "wall" },
                rest: [
                  { op: "=", term: { termType: "numericLiteral", value: 1 } },
                ],
              },
              body: [
                {
                  statementType: "letStatement",
                  name: "newx",
                  value: {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 506 },
                    rest: [],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "newy",
                  value: {
                    nodeType: "expression",
                    term: {
                      termType: "groupedExpression",
                      expression: {
                        nodeType: "expression",
                        term: { termType: "variable", name: "divLengthy" },
                        rest: [
                          {
                            op: "*",
                            term: {
                              termType: "groupedExpression",
                              expression: {
                                nodeType: "expression",
                                term: {
                                  termType: "unaryExpression",
                                  op: "-",
                                  term: {
                                    termType: "numericLiteral",
                                    value: 50,
                                  },
                                },
                                rest: [],
                              },
                            },
                          },
                        ],
                      },
                    },
                    rest: [
                      {
                        op: "/",
                        term: { termType: "variable", name: "divLengthx" },
                      },
                    ],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "newy",
                  value: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "y" },
                    rest: [
                      {
                        op: "+",
                        term: {
                          termType: "groupedExpression",
                          expression: {
                            nodeType: "expression",
                            term: { termType: "variable", name: "newy" },
                            rest: [
                              {
                                op: "*",
                                term: { termType: "variable", name: "factor" },
                              },
                            ],
                          },
                        },
                      },
                    ],
                  },
                },
              ],
              else: [
                {
                  statementType: "ifStatement",
                  condition: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "wall" },
                    rest: [
                      {
                        op: "=",
                        term: { termType: "numericLiteral", value: 2 },
                      },
                    ],
                  },
                  body: [
                    {
                      statementType: "letStatement",
                      name: "newx",
                      value: {
                        nodeType: "expression",
                        term: { termType: "numericLiteral", value: 0 },
                        rest: [],
                      },
                    },
                    {
                      statementType: "letStatement",
                      name: "newy",
                      value: {
                        nodeType: "expression",
                        term: {
                          termType: "groupedExpression",
                          expression: {
                            nodeType: "expression",
                            term: { termType: "variable", name: "divLengthy" },
                            rest: [
                              {
                                op: "*",
                                term: { termType: "numericLiteral", value: 50 },
                              },
                            ],
                          },
                        },
                        rest: [
                          {
                            op: "/",
                            term: { termType: "variable", name: "divLengthx" },
                          },
                        ],
                      },
                    },
                    {
                      statementType: "letStatement",
                      name: "newy",
                      value: {
                        nodeType: "expression",
                        term: { termType: "variable", name: "y" },
                        rest: [
                          {
                            op: "+",
                            term: {
                              termType: "groupedExpression",
                              expression: {
                                nodeType: "expression",
                                term: { termType: "variable", name: "newy" },
                                rest: [
                                  {
                                    op: "*",
                                    term: {
                                      termType: "variable",
                                      name: "factor",
                                    },
                                  },
                                ],
                              },
                            },
                          },
                        ],
                      },
                    },
                  ],
                  else: [
                    {
                      statementType: "ifStatement",
                      condition: {
                        nodeType: "expression",
                        term: { termType: "variable", name: "wall" },
                        rest: [
                          {
                            op: "=",
                            term: { termType: "numericLiteral", value: 3 },
                          },
                        ],
                      },
                      body: [
                        {
                          statementType: "letStatement",
                          name: "newy",
                          value: {
                            nodeType: "expression",
                            term: { termType: "numericLiteral", value: 250 },
                            rest: [],
                          },
                        },
                        {
                          statementType: "letStatement",
                          name: "newx",
                          value: {
                            nodeType: "expression",
                            term: {
                              termType: "groupedExpression",
                              expression: {
                                nodeType: "expression",
                                term: {
                                  termType: "variable",
                                  name: "divLengthx",
                                },
                                rest: [
                                  {
                                    op: "*",
                                    term: {
                                      termType: "groupedExpression",
                                      expression: {
                                        nodeType: "expression",
                                        term: {
                                          termType: "unaryExpression",
                                          op: "-",
                                          term: {
                                            termType: "numericLiteral",
                                            value: 25,
                                          },
                                        },
                                        rest: [],
                                      },
                                    },
                                  },
                                ],
                              },
                            },
                            rest: [
                              {
                                op: "/",
                                term: {
                                  termType: "variable",
                                  name: "divLengthy",
                                },
                              },
                            ],
                          },
                        },
                        {
                          statementType: "letStatement",
                          name: "newx",
                          value: {
                            nodeType: "expression",
                            term: { termType: "variable", name: "x" },
                            rest: [
                              {
                                op: "+",
                                term: {
                                  termType: "groupedExpression",
                                  expression: {
                                    nodeType: "expression",
                                    term: {
                                      termType: "variable",
                                      name: "newx",
                                    },
                                    rest: [
                                      {
                                        op: "*",
                                        term: {
                                          termType: "variable",
                                          name: "factor",
                                        },
                                      },
                                    ],
                                  },
                                },
                              },
                            ],
                          },
                        },
                      ],
                      else: [
                        {
                          statementType: "letStatement",
                          name: "newy",
                          value: {
                            nodeType: "expression",
                            term: { termType: "numericLiteral", value: 0 },
                            rest: [],
                          },
                        },
                        {
                          statementType: "letStatement",
                          name: "newx",
                          value: {
                            nodeType: "expression",
                            term: {
                              termType: "groupedExpression",
                              expression: {
                                nodeType: "expression",
                                term: {
                                  termType: "variable",
                                  name: "divLengthx",
                                },
                                rest: [
                                  {
                                    op: "*",
                                    term: {
                                      termType: "numericLiteral",
                                      value: 25,
                                    },
                                  },
                                ],
                              },
                            },
                            rest: [
                              {
                                op: "/",
                                term: {
                                  termType: "variable",
                                  name: "divLengthy",
                                },
                              },
                            ],
                          },
                        },
                        {
                          statementType: "letStatement",
                          name: "newx",
                          value: {
                            nodeType: "expression",
                            term: { termType: "variable", name: "x" },
                            rest: [
                              {
                                op: "+",
                                term: {
                                  termType: "groupedExpression",
                                  expression: {
                                    nodeType: "expression",
                                    term: {
                                      termType: "variable",
                                      name: "newx",
                                    },
                                    rest: [
                                      {
                                        op: "*",
                                        term: {
                                          termType: "variable",
                                          name: "factor",
                                        },
                                      },
                                    ],
                                  },
                                },
                              },
                            ],
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "setDestination",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "variable", name: "newx" },
                    rest: [],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "variable", name: "newy" },
                    rest: [],
                  },
                ],
              },
            },
            { statementType: "returnStatement" },
          ],
        },
      },
    ],
  },
  Pong_Main: {
    name: "Main",
    varDecs: [],
    subroutines: [
      {
        type: "function",
        returnType: "void",
        name: "main",
        parameters: [],
        body: {
          varDecs: [{ type: "PongGame", names: ["game"] }],
          statements: [
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "PongGame.newInstance",
                parameters: [],
              },
            },
            {
              statementType: "letStatement",
              name: "game",
              value: {
                nodeType: "expression",
                term: {
                  termType: "subroutineCall",
                  name: "PongGame.getInstance",
                  parameters: [],
                },
                rest: [],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "game.run",
                parameters: [],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "game.dispose",
                parameters: [],
              },
            },
            { statementType: "returnStatement" },
          ],
        },
      },
    ],
  },
  Pong_Bat: {
    name: "Bat",
    varDecs: [
      { varType: "field", type: "int", names: ["x", "y"] },
      { varType: "field", type: "int", names: ["width", "height"] },
      { varType: "field", type: "int", names: ["direction"] },
    ],
    subroutines: [
      {
        type: "constructor",
        returnType: "Bat",
        name: "new",
        parameters: [
          { type: "int", name: "Ax" },
          { type: "int", name: "Ay" },
          { type: "int", name: "Awidth" },
          { type: "int", name: "Aheight" },
        ],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "letStatement",
              name: "x",
              value: {
                nodeType: "expression",
                term: { termType: "variable", name: "Ax" },
                rest: [],
              },
            },
            {
              statementType: "letStatement",
              name: "y",
              value: {
                nodeType: "expression",
                term: { termType: "variable", name: "Ay" },
                rest: [],
              },
            },
            {
              statementType: "letStatement",
              name: "width",
              value: {
                nodeType: "expression",
                term: { termType: "variable", name: "Awidth" },
                rest: [],
              },
            },
            {
              statementType: "letStatement",
              name: "height",
              value: {
                nodeType: "expression",
                term: { termType: "variable", name: "Aheight" },
                rest: [],
              },
            },
            {
              statementType: "letStatement",
              name: "direction",
              value: {
                nodeType: "expression",
                term: { termType: "numericLiteral", value: 2 },
                rest: [],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "show",
                parameters: [],
              },
            },
            {
              statementType: "returnStatement",
              value: {
                nodeType: "expression",
                term: { termType: "keywordLiteral", value: "this" },
                rest: [],
              },
            },
          ],
        },
      },
      {
        type: "method",
        returnType: "void",
        name: "dispose",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Memory.deAlloc",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "keywordLiteral", value: "this" },
                    rest: [],
                  },
                ],
              },
            },
            { statementType: "returnStatement" },
          ],
        },
      },
      {
        type: "method",
        returnType: "void",
        name: "show",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Screen.setColor",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "keywordLiteral", value: "true" },
                    rest: [],
                  },
                ],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "draw",
                parameters: [],
              },
            },
            { statementType: "returnStatement" },
          ],
        },
      },
      {
        type: "method",
        returnType: "void",
        name: "hide",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Screen.setColor",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "keywordLiteral", value: "false" },
                    rest: [],
                  },
                ],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "draw",
                parameters: [],
              },
            },
            { statementType: "returnStatement" },
          ],
        },
      },
      {
        type: "method",
        returnType: "void",
        name: "draw",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Screen.drawRectangle",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "variable", name: "x" },
                    rest: [],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "variable", name: "y" },
                    rest: [],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "variable", name: "x" },
                    rest: [
                      {
                        op: "+",
                        term: { termType: "variable", name: "width" },
                      },
                    ],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "variable", name: "y" },
                    rest: [
                      {
                        op: "+",
                        term: { termType: "variable", name: "height" },
                      },
                    ],
                  },
                ],
              },
            },
            { statementType: "returnStatement" },
          ],
        },
      },
      {
        type: "method",
        returnType: "void",
        name: "setDirection",
        parameters: [{ type: "int", name: "Adirection" }],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "letStatement",
              name: "direction",
              value: {
                nodeType: "expression",
                term: { termType: "variable", name: "Adirection" },
                rest: [],
              },
            },
            { statementType: "returnStatement" },
          ],
        },
      },
      {
        type: "method",
        returnType: "int",
        name: "getLeft",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "returnStatement",
              value: {
                nodeType: "expression",
                term: { termType: "variable", name: "x" },
                rest: [],
              },
            },
          ],
        },
      },
      {
        type: "method",
        returnType: "int",
        name: "getRight",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "returnStatement",
              value: {
                nodeType: "expression",
                term: { termType: "variable", name: "x" },
                rest: [
                  { op: "+", term: { termType: "variable", name: "width" } },
                ],
              },
            },
          ],
        },
      },
      {
        type: "method",
        returnType: "void",
        name: "setWidth",
        parameters: [{ type: "int", name: "Awidth" }],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "hide",
                parameters: [],
              },
            },
            {
              statementType: "letStatement",
              name: "width",
              value: {
                nodeType: "expression",
                term: { termType: "variable", name: "Awidth" },
                rest: [],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "show",
                parameters: [],
              },
            },
            { statementType: "returnStatement" },
          ],
        },
      },
      {
        type: "method",
        returnType: "void",
        name: "move",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "ifStatement",
              condition: {
                nodeType: "expression",
                term: { termType: "variable", name: "direction" },
                rest: [
                  { op: "=", term: { termType: "numericLiteral", value: 1 } },
                ],
              },
              body: [
                {
                  statementType: "letStatement",
                  name: "x",
                  value: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "x" },
                    rest: [
                      {
                        op: "-",
                        term: { termType: "numericLiteral", value: 4 },
                      },
                    ],
                  },
                },
                {
                  statementType: "ifStatement",
                  condition: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "x" },
                    rest: [
                      {
                        op: "<",
                        term: { termType: "numericLiteral", value: 0 },
                      },
                    ],
                  },
                  body: [
                    {
                      statementType: "letStatement",
                      name: "x",
                      value: {
                        nodeType: "expression",
                        term: { termType: "numericLiteral", value: 0 },
                        rest: [],
                      },
                    },
                  ],
                  else: [],
                },
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "Screen.setColor",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: { termType: "keywordLiteral", value: "false" },
                        rest: [],
                      },
                    ],
                  },
                },
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "Screen.drawRectangle",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: {
                          termType: "groupedExpression",
                          expression: {
                            nodeType: "expression",
                            term: { termType: "variable", name: "x" },
                            rest: [
                              {
                                op: "+",
                                term: { termType: "variable", name: "width" },
                              },
                            ],
                          },
                        },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "numericLiteral", value: 1 },
                          },
                        ],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "y" },
                        rest: [],
                      },
                      {
                        nodeType: "expression",
                        term: {
                          termType: "groupedExpression",
                          expression: {
                            nodeType: "expression",
                            term: { termType: "variable", name: "x" },
                            rest: [
                              {
                                op: "+",
                                term: { termType: "variable", name: "width" },
                              },
                            ],
                          },
                        },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "numericLiteral", value: 4 },
                          },
                        ],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "y" },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "variable", name: "height" },
                          },
                        ],
                      },
                    ],
                  },
                },
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "Screen.setColor",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: { termType: "keywordLiteral", value: "true" },
                        rest: [],
                      },
                    ],
                  },
                },
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "Screen.drawRectangle",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "x" },
                        rest: [],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "y" },
                        rest: [],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "x" },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "numericLiteral", value: 3 },
                          },
                        ],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "y" },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "variable", name: "height" },
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
              else: [
                {
                  statementType: "letStatement",
                  name: "x",
                  value: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "x" },
                    rest: [
                      {
                        op: "+",
                        term: { termType: "numericLiteral", value: 4 },
                      },
                    ],
                  },
                },
                {
                  statementType: "ifStatement",
                  condition: {
                    nodeType: "expression",
                    term: {
                      termType: "groupedExpression",
                      expression: {
                        nodeType: "expression",
                        term: { termType: "variable", name: "x" },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "variable", name: "width" },
                          },
                        ],
                      },
                    },
                    rest: [
                      {
                        op: ">",
                        term: { termType: "numericLiteral", value: 511 },
                      },
                    ],
                  },
                  body: [
                    {
                      statementType: "letStatement",
                      name: "x",
                      value: {
                        nodeType: "expression",
                        term: { termType: "numericLiteral", value: 511 },
                        rest: [
                          {
                            op: "-",
                            term: { termType: "variable", name: "width" },
                          },
                        ],
                      },
                    },
                  ],
                  else: [],
                },
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "Screen.setColor",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: { termType: "keywordLiteral", value: "false" },
                        rest: [],
                      },
                    ],
                  },
                },
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "Screen.drawRectangle",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "x" },
                        rest: [
                          {
                            op: "-",
                            term: { termType: "numericLiteral", value: 4 },
                          },
                        ],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "y" },
                        rest: [],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "x" },
                        rest: [
                          {
                            op: "-",
                            term: { termType: "numericLiteral", value: 1 },
                          },
                        ],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "y" },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "variable", name: "height" },
                          },
                        ],
                      },
                    ],
                  },
                },
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "Screen.setColor",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: { termType: "keywordLiteral", value: "true" },
                        rest: [],
                      },
                    ],
                  },
                },
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "Screen.drawRectangle",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: {
                          termType: "groupedExpression",
                          expression: {
                            nodeType: "expression",
                            term: { termType: "variable", name: "x" },
                            rest: [
                              {
                                op: "+",
                                term: { termType: "variable", name: "width" },
                              },
                            ],
                          },
                        },
                        rest: [
                          {
                            op: "-",
                            term: { termType: "numericLiteral", value: 3 },
                          },
                        ],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "y" },
                        rest: [],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "x" },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "variable", name: "width" },
                          },
                        ],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "y" },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "variable", name: "height" },
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
            },
            { statementType: "returnStatement" },
          ],
        },
      },
    ],
  },
  Pong_PongGame: {
    name: "PongGame",
    varDecs: [
      { varType: "static", type: "PongGame", names: ["instance"] },
      { varType: "field", type: "Bat", names: ["bat"] },
      { varType: "field", type: "Ball", names: ["ball"] },
      { varType: "field", type: "int", names: ["wall"] },
      { varType: "field", type: "boolean", names: ["exit"] },
      { varType: "field", type: "int", names: ["score"] },
      { varType: "field", type: "int", names: ["lastWall"] },
      { varType: "field", type: "int", names: ["batWidth"] },
    ],
    subroutines: [
      {
        type: "constructor",
        returnType: "PongGame",
        name: "new",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Screen.clearScreen",
                parameters: [],
              },
            },
            {
              statementType: "letStatement",
              name: "batWidth",
              value: {
                nodeType: "expression",
                term: { termType: "numericLiteral", value: 50 },
                rest: [],
              },
            },
            {
              statementType: "letStatement",
              name: "bat",
              value: {
                nodeType: "expression",
                term: {
                  termType: "subroutineCall",
                  name: "Bat.new",
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 230 },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 229 },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "batWidth" },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 7 },
                      rest: [],
                    },
                  ],
                },
                rest: [],
              },
            },
            {
              statementType: "letStatement",
              name: "ball",
              value: {
                nodeType: "expression",
                term: {
                  termType: "subroutineCall",
                  name: "Ball.new",
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 253 },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 222 },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 0 },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 511 },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 0 },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 229 },
                      rest: [],
                    },
                  ],
                },
                rest: [],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "ball.setDestination",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 400 },
                    rest: [],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 0 },
                    rest: [],
                  },
                ],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Screen.drawRectangle",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 0 },
                    rest: [],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 238 },
                    rest: [],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 511 },
                    rest: [],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 240 },
                    rest: [],
                  },
                ],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Output.moveCursor",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 22 },
                    rest: [],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 0 },
                    rest: [],
                  },
                ],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Output.printString",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "stringLiteral", value: "Score: 0" },
                    rest: [],
                  },
                ],
              },
            },
            {
              statementType: "letStatement",
              name: "exit",
              value: {
                nodeType: "expression",
                term: { termType: "keywordLiteral", value: "false" },
                rest: [],
              },
            },
            {
              statementType: "letStatement",
              name: "score",
              value: {
                nodeType: "expression",
                term: { termType: "numericLiteral", value: 0 },
                rest: [],
              },
            },
            {
              statementType: "letStatement",
              name: "wall",
              value: {
                nodeType: "expression",
                term: { termType: "numericLiteral", value: 0 },
                rest: [],
              },
            },
            {
              statementType: "letStatement",
              name: "lastWall",
              value: {
                nodeType: "expression",
                term: { termType: "numericLiteral", value: 0 },
                rest: [],
              },
            },
            {
              statementType: "returnStatement",
              value: {
                nodeType: "expression",
                term: { termType: "keywordLiteral", value: "this" },
                rest: [],
              },
            },
          ],
        },
      },
      {
        type: "method",
        returnType: "void",
        name: "dispose",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "bat.dispose",
                parameters: [],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "ball.dispose",
                parameters: [],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Memory.deAlloc",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "keywordLiteral", value: "this" },
                    rest: [],
                  },
                ],
              },
            },
            { statementType: "returnStatement" },
          ],
        },
      },
      {
        type: "function",
        returnType: "void",
        name: "newInstance",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "letStatement",
              name: "instance",
              value: {
                nodeType: "expression",
                term: {
                  termType: "subroutineCall",
                  name: "PongGame.new",
                  parameters: [],
                },
                rest: [],
              },
            },
            { statementType: "returnStatement" },
          ],
        },
      },
      {
        type: "function",
        returnType: "PongGame",
        name: "getInstance",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "returnStatement",
              value: {
                nodeType: "expression",
                term: { termType: "variable", name: "instance" },
                rest: [],
              },
            },
          ],
        },
      },
      {
        type: "method",
        returnType: "void",
        name: "run",
        parameters: [],
        body: {
          varDecs: [{ type: "char", names: ["key"] }],
          statements: [
            {
              statementType: "whileStatement",
              condition: {
                nodeType: "expression",
                term: {
                  termType: "unaryExpression",
                  op: "~",
                  term: { termType: "variable", name: "exit" },
                },
                rest: [],
              },
              body: [
                {
                  statementType: "whileStatement",
                  condition: {
                    nodeType: "expression",
                    term: {
                      termType: "groupedExpression",
                      expression: {
                        nodeType: "expression",
                        term: { termType: "variable", name: "key" },
                        rest: [
                          {
                            op: "=",
                            term: { termType: "numericLiteral", value: 0 },
                          },
                        ],
                      },
                    },
                    rest: [
                      {
                        op: "&",
                        term: {
                          termType: "groupedExpression",
                          expression: {
                            nodeType: "expression",
                            term: {
                              termType: "unaryExpression",
                              op: "~",
                              term: { termType: "variable", name: "exit" },
                            },
                            rest: [],
                          },
                        },
                      },
                    ],
                  },
                  body: [
                    {
                      statementType: "letStatement",
                      name: "key",
                      value: {
                        nodeType: "expression",
                        term: {
                          termType: "subroutineCall",
                          name: "Keyboard.keyPressed",
                          parameters: [],
                        },
                        rest: [],
                      },
                    },
                    {
                      statementType: "doStatement",
                      call: {
                        termType: "subroutineCall",
                        name: "bat.move",
                        parameters: [],
                      },
                    },
                    {
                      statementType: "doStatement",
                      call: {
                        termType: "subroutineCall",
                        name: "moveBall",
                        parameters: [],
                      },
                    },
                    {
                      statementType: "doStatement",
                      call: {
                        termType: "subroutineCall",
                        name: "Sys.wait",
                        parameters: [
                          {
                            nodeType: "expression",
                            term: { termType: "numericLiteral", value: 50 },
                            rest: [],
                          },
                        ],
                      },
                    },
                  ],
                },
                {
                  statementType: "ifStatement",
                  condition: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "key" },
                    rest: [
                      {
                        op: "=",
                        term: { termType: "numericLiteral", value: 130 },
                      },
                    ],
                  },
                  body: [
                    {
                      statementType: "doStatement",
                      call: {
                        termType: "subroutineCall",
                        name: "bat.setDirection",
                        parameters: [
                          {
                            nodeType: "expression",
                            term: { termType: "numericLiteral", value: 1 },
                            rest: [],
                          },
                        ],
                      },
                    },
                  ],
                  else: [
                    {
                      statementType: "ifStatement",
                      condition: {
                        nodeType: "expression",
                        term: { termType: "variable", name: "key" },
                        rest: [
                          {
                            op: "=",
                            term: { termType: "numericLiteral", value: 132 },
                          },
                        ],
                      },
                      body: [
                        {
                          statementType: "doStatement",
                          call: {
                            termType: "subroutineCall",
                            name: "bat.setDirection",
                            parameters: [
                              {
                                nodeType: "expression",
                                term: { termType: "numericLiteral", value: 2 },
                                rest: [],
                              },
                            ],
                          },
                        },
                      ],
                      else: [
                        {
                          statementType: "ifStatement",
                          condition: {
                            nodeType: "expression",
                            term: { termType: "variable", name: "key" },
                            rest: [
                              {
                                op: "=",
                                term: {
                                  termType: "numericLiteral",
                                  value: 140,
                                },
                              },
                            ],
                          },
                          body: [
                            {
                              statementType: "letStatement",
                              name: "exit",
                              value: {
                                nodeType: "expression",
                                term: {
                                  termType: "keywordLiteral",
                                  value: "true",
                                },
                                rest: [],
                              },
                            },
                          ],
                          else: [],
                        },
                      ],
                    },
                  ],
                },
                {
                  statementType: "whileStatement",
                  condition: {
                    nodeType: "expression",
                    term: {
                      termType: "groupedExpression",
                      expression: {
                        nodeType: "expression",
                        term: {
                          termType: "unaryExpression",
                          op: "~",
                          term: {
                            termType: "groupedExpression",
                            expression: {
                              nodeType: "expression",
                              term: { termType: "variable", name: "key" },
                              rest: [
                                {
                                  op: "=",
                                  term: {
                                    termType: "numericLiteral",
                                    value: 0,
                                  },
                                },
                              ],
                            },
                          },
                        },
                        rest: [],
                      },
                    },
                    rest: [
                      {
                        op: "&",
                        term: {
                          termType: "groupedExpression",
                          expression: {
                            nodeType: "expression",
                            term: {
                              termType: "unaryExpression",
                              op: "~",
                              term: { termType: "variable", name: "exit" },
                            },
                            rest: [],
                          },
                        },
                      },
                    ],
                  },
                  body: [
                    {
                      statementType: "letStatement",
                      name: "key",
                      value: {
                        nodeType: "expression",
                        term: {
                          termType: "subroutineCall",
                          name: "Keyboard.keyPressed",
                          parameters: [],
                        },
                        rest: [],
                      },
                    },
                    {
                      statementType: "doStatement",
                      call: {
                        termType: "subroutineCall",
                        name: "bat.move",
                        parameters: [],
                      },
                    },
                    {
                      statementType: "doStatement",
                      call: {
                        termType: "subroutineCall",
                        name: "moveBall",
                        parameters: [],
                      },
                    },
                    {
                      statementType: "doStatement",
                      call: {
                        termType: "subroutineCall",
                        name: "Sys.wait",
                        parameters: [
                          {
                            nodeType: "expression",
                            term: { termType: "numericLiteral", value: 50 },
                            rest: [],
                          },
                        ],
                      },
                    },
                  ],
                },
              ],
            },
            {
              statementType: "ifStatement",
              condition: {
                nodeType: "expression",
                term: { termType: "variable", name: "exit" },
                rest: [],
              },
              body: [
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "Output.moveCursor",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: { termType: "numericLiteral", value: 10 },
                        rest: [],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "numericLiteral", value: 27 },
                        rest: [],
                      },
                    ],
                  },
                },
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "Output.printString",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: { termType: "stringLiteral", value: "Game Over" },
                        rest: [],
                      },
                    ],
                  },
                },
              ],
              else: [],
            },
            { statementType: "returnStatement" },
          ],
        },
      },
      {
        type: "method",
        returnType: "void",
        name: "moveBall",
        parameters: [],
        body: {
          varDecs: [
            {
              type: "int",
              names: [
                "bouncingDirection",
                "batLeft",
                "batRight",
                "ballLeft",
                "ballRight",
              ],
            },
          ],
          statements: [
            {
              statementType: "letStatement",
              name: "wall",
              value: {
                nodeType: "expression",
                term: {
                  termType: "subroutineCall",
                  name: "ball.move",
                  parameters: [],
                },
                rest: [],
              },
            },
            {
              statementType: "ifStatement",
              condition: {
                nodeType: "expression",
                term: {
                  termType: "groupedExpression",
                  expression: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "wall" },
                    rest: [
                      {
                        op: ">",
                        term: { termType: "numericLiteral", value: 0 },
                      },
                    ],
                  },
                },
                rest: [
                  {
                    op: "&",
                    term: {
                      termType: "groupedExpression",
                      expression: {
                        nodeType: "expression",
                        term: {
                          termType: "unaryExpression",
                          op: "~",
                          term: {
                            termType: "groupedExpression",
                            expression: {
                              nodeType: "expression",
                              term: { termType: "variable", name: "wall" },
                              rest: [
                                {
                                  op: "=",
                                  term: {
                                    termType: "variable",
                                    name: "lastWall",
                                  },
                                },
                              ],
                            },
                          },
                        },
                        rest: [],
                      },
                    },
                  },
                ],
              },
              body: [
                {
                  statementType: "letStatement",
                  name: "lastWall",
                  value: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "wall" },
                    rest: [],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "bouncingDirection",
                  value: {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 0 },
                    rest: [],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "batLeft",
                  value: {
                    nodeType: "expression",
                    term: {
                      termType: "subroutineCall",
                      name: "bat.getLeft",
                      parameters: [],
                    },
                    rest: [],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "batRight",
                  value: {
                    nodeType: "expression",
                    term: {
                      termType: "subroutineCall",
                      name: "bat.getRight",
                      parameters: [],
                    },
                    rest: [],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "ballLeft",
                  value: {
                    nodeType: "expression",
                    term: {
                      termType: "subroutineCall",
                      name: "ball.getLeft",
                      parameters: [],
                    },
                    rest: [],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "ballRight",
                  value: {
                    nodeType: "expression",
                    term: {
                      termType: "subroutineCall",
                      name: "ball.getRight",
                      parameters: [],
                    },
                    rest: [],
                  },
                },
                {
                  statementType: "ifStatement",
                  condition: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "wall" },
                    rest: [
                      {
                        op: "=",
                        term: { termType: "numericLiteral", value: 4 },
                      },
                    ],
                  },
                  body: [
                    {
                      statementType: "letStatement",
                      name: "exit",
                      value: {
                        nodeType: "expression",
                        term: {
                          termType: "groupedExpression",
                          expression: {
                            nodeType: "expression",
                            term: { termType: "variable", name: "batLeft" },
                            rest: [
                              {
                                op: ">",
                                term: {
                                  termType: "variable",
                                  name: "ballRight",
                                },
                              },
                            ],
                          },
                        },
                        rest: [
                          {
                            op: "|",
                            term: {
                              termType: "groupedExpression",
                              expression: {
                                nodeType: "expression",
                                term: {
                                  termType: "variable",
                                  name: "batRight",
                                },
                                rest: [
                                  {
                                    op: "<",
                                    term: {
                                      termType: "variable",
                                      name: "ballLeft",
                                    },
                                  },
                                ],
                              },
                            },
                          },
                        ],
                      },
                    },
                    {
                      statementType: "ifStatement",
                      condition: {
                        nodeType: "expression",
                        term: {
                          termType: "unaryExpression",
                          op: "~",
                          term: { termType: "variable", name: "exit" },
                        },
                        rest: [],
                      },
                      body: [
                        {
                          statementType: "ifStatement",
                          condition: {
                            nodeType: "expression",
                            term: { termType: "variable", name: "ballRight" },
                            rest: [
                              {
                                op: "<",
                                term: {
                                  termType: "groupedExpression",
                                  expression: {
                                    nodeType: "expression",
                                    term: {
                                      termType: "variable",
                                      name: "batLeft",
                                    },
                                    rest: [
                                      {
                                        op: "+",
                                        term: {
                                          termType: "numericLiteral",
                                          value: 10,
                                        },
                                      },
                                    ],
                                  },
                                },
                              },
                            ],
                          },
                          body: [
                            {
                              statementType: "letStatement",
                              name: "bouncingDirection",
                              value: {
                                nodeType: "expression",
                                term: {
                                  termType: "unaryExpression",
                                  op: "-",
                                  term: {
                                    termType: "numericLiteral",
                                    value: 1,
                                  },
                                },
                                rest: [],
                              },
                            },
                          ],
                          else: [
                            {
                              statementType: "ifStatement",
                              condition: {
                                nodeType: "expression",
                                term: {
                                  termType: "variable",
                                  name: "ballLeft",
                                },
                                rest: [
                                  {
                                    op: ">",
                                    term: {
                                      termType: "groupedExpression",
                                      expression: {
                                        nodeType: "expression",
                                        term: {
                                          termType: "variable",
                                          name: "batRight",
                                        },
                                        rest: [
                                          {
                                            op: "-",
                                            term: {
                                              termType: "numericLiteral",
                                              value: 10,
                                            },
                                          },
                                        ],
                                      },
                                    },
                                  },
                                ],
                              },
                              body: [
                                {
                                  statementType: "letStatement",
                                  name: "bouncingDirection",
                                  value: {
                                    nodeType: "expression",
                                    term: {
                                      termType: "numericLiteral",
                                      value: 1,
                                    },
                                    rest: [],
                                  },
                                },
                              ],
                              else: [],
                            },
                          ],
                        },
                        {
                          statementType: "letStatement",
                          name: "batWidth",
                          value: {
                            nodeType: "expression",
                            term: { termType: "variable", name: "batWidth" },
                            rest: [
                              {
                                op: "-",
                                term: { termType: "numericLiteral", value: 2 },
                              },
                            ],
                          },
                        },
                        {
                          statementType: "doStatement",
                          call: {
                            termType: "subroutineCall",
                            name: "bat.setWidth",
                            parameters: [
                              {
                                nodeType: "expression",
                                term: {
                                  termType: "variable",
                                  name: "batWidth",
                                },
                                rest: [],
                              },
                            ],
                          },
                        },
                        {
                          statementType: "letStatement",
                          name: "score",
                          value: {
                            nodeType: "expression",
                            term: { termType: "variable", name: "score" },
                            rest: [
                              {
                                op: "+",
                                term: { termType: "numericLiteral", value: 1 },
                              },
                            ],
                          },
                        },
                        {
                          statementType: "doStatement",
                          call: {
                            termType: "subroutineCall",
                            name: "Output.moveCursor",
                            parameters: [
                              {
                                nodeType: "expression",
                                term: { termType: "numericLiteral", value: 22 },
                                rest: [],
                              },
                              {
                                nodeType: "expression",
                                term: { termType: "numericLiteral", value: 7 },
                                rest: [],
                              },
                            ],
                          },
                        },
                        {
                          statementType: "doStatement",
                          call: {
                            termType: "subroutineCall",
                            name: "Output.printInt",
                            parameters: [
                              {
                                nodeType: "expression",
                                term: { termType: "variable", name: "score" },
                                rest: [],
                              },
                            ],
                          },
                        },
                      ],
                      else: [],
                    },
                  ],
                  else: [],
                },
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "ball.bounce",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: {
                          termType: "variable",
                          name: "bouncingDirection",
                        },
                        rest: [],
                      },
                    ],
                  },
                },
              ],
              else: [],
            },
            { statementType: "returnStatement" },
          ],
        },
      },
    ],
  },
  Seven_Main: {
    name: "Main",
    varDecs: [],
    subroutines: [
      {
        type: "function",
        returnType: "void",
        name: "main",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Output.printInt",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 1 },
                    rest: [
                      {
                        op: "+",
                        term: {
                          termType: "groupedExpression",
                          expression: {
                            nodeType: "expression",
                            term: { termType: "numericLiteral", value: 2 },
                            rest: [
                              {
                                op: "*",
                                term: { termType: "numericLiteral", value: 3 },
                              },
                            ],
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            },
            { statementType: "returnStatement" },
          ],
        },
      },
    ],
  },
  Square_Main: {
    name: "Main",
    varDecs: [],
    subroutines: [
      {
        type: "function",
        returnType: "void",
        name: "main",
        parameters: [],
        body: {
          varDecs: [{ type: "SquareGame", names: ["game"] }],
          statements: [
            {
              statementType: "letStatement",
              name: "game",
              value: {
                nodeType: "expression",
                term: {
                  termType: "subroutineCall",
                  name: "SquareGame.new",
                  parameters: [],
                },
                rest: [],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "game.run",
                parameters: [],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "game.dispose",
                parameters: [],
              },
            },
            { statementType: "returnStatement" },
          ],
        },
      },
    ],
  },
  Square_Square: {
    name: "Square",
    varDecs: [
      { varType: "field", type: "int", names: ["x", "y"] },
      { varType: "field", type: "int", names: ["size"] },
    ],
    subroutines: [
      {
        type: "constructor",
        returnType: "Square",
        name: "new",
        parameters: [
          { type: "int", name: "ax" },
          { type: "int", name: "ay" },
          { type: "int", name: "asize" },
        ],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "letStatement",
              name: "x",
              value: {
                nodeType: "expression",
                term: { termType: "variable", name: "ax" },
                rest: [],
              },
            },
            {
              statementType: "letStatement",
              name: "y",
              value: {
                nodeType: "expression",
                term: { termType: "variable", name: "ay" },
                rest: [],
              },
            },
            {
              statementType: "letStatement",
              name: "size",
              value: {
                nodeType: "expression",
                term: { termType: "variable", name: "asize" },
                rest: [],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "draw",
                parameters: [],
              },
            },
            {
              statementType: "returnStatement",
              value: {
                nodeType: "expression",
                term: { termType: "keywordLiteral", value: "this" },
                rest: [],
              },
            },
          ],
        },
      },
      {
        type: "method",
        returnType: "void",
        name: "dispose",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Memory.deAlloc",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "keywordLiteral", value: "this" },
                    rest: [],
                  },
                ],
              },
            },
            { statementType: "returnStatement" },
          ],
        },
      },
      {
        type: "method",
        returnType: "void",
        name: "draw",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Screen.setColor",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "keywordLiteral", value: "true" },
                    rest: [],
                  },
                ],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Screen.drawRectangle",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "variable", name: "x" },
                    rest: [],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "variable", name: "y" },
                    rest: [],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "variable", name: "x" },
                    rest: [
                      { op: "+", term: { termType: "variable", name: "size" } },
                    ],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "variable", name: "y" },
                    rest: [
                      { op: "+", term: { termType: "variable", name: "size" } },
                    ],
                  },
                ],
              },
            },
            { statementType: "returnStatement" },
          ],
        },
      },
      {
        type: "method",
        returnType: "void",
        name: "erase",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Screen.setColor",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "keywordLiteral", value: "false" },
                    rest: [],
                  },
                ],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Screen.drawRectangle",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "variable", name: "x" },
                    rest: [],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "variable", name: "y" },
                    rest: [],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "variable", name: "x" },
                    rest: [
                      { op: "+", term: { termType: "variable", name: "size" } },
                    ],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "variable", name: "y" },
                    rest: [
                      { op: "+", term: { termType: "variable", name: "size" } },
                    ],
                  },
                ],
              },
            },
            { statementType: "returnStatement" },
          ],
        },
      },
      {
        type: "method",
        returnType: "void",
        name: "incSize",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "ifStatement",
              condition: {
                nodeType: "expression",
                term: {
                  termType: "groupedExpression",
                  expression: {
                    nodeType: "expression",
                    term: {
                      termType: "groupedExpression",
                      expression: {
                        nodeType: "expression",
                        term: { termType: "variable", name: "y" },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "variable", name: "size" },
                          },
                        ],
                      },
                    },
                    rest: [
                      {
                        op: "<",
                        term: { termType: "numericLiteral", value: 254 },
                      },
                    ],
                  },
                },
                rest: [
                  {
                    op: "&",
                    term: {
                      termType: "groupedExpression",
                      expression: {
                        nodeType: "expression",
                        term: {
                          termType: "groupedExpression",
                          expression: {
                            nodeType: "expression",
                            term: { termType: "variable", name: "x" },
                            rest: [
                              {
                                op: "+",
                                term: { termType: "variable", name: "size" },
                              },
                            ],
                          },
                        },
                        rest: [
                          {
                            op: "<",
                            term: { termType: "numericLiteral", value: 510 },
                          },
                        ],
                      },
                    },
                  },
                ],
              },
              body: [
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "erase",
                    parameters: [],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "size",
                  value: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "size" },
                    rest: [
                      {
                        op: "+",
                        term: { termType: "numericLiteral", value: 2 },
                      },
                    ],
                  },
                },
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "draw",
                    parameters: [],
                  },
                },
              ],
              else: [],
            },
            { statementType: "returnStatement" },
          ],
        },
      },
      {
        type: "method",
        returnType: "void",
        name: "decSize",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "ifStatement",
              condition: {
                nodeType: "expression",
                term: { termType: "variable", name: "size" },
                rest: [
                  { op: ">", term: { termType: "numericLiteral", value: 2 } },
                ],
              },
              body: [
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "erase",
                    parameters: [],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "size",
                  value: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "size" },
                    rest: [
                      {
                        op: "-",
                        term: { termType: "numericLiteral", value: 2 },
                      },
                    ],
                  },
                },
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "draw",
                    parameters: [],
                  },
                },
              ],
              else: [],
            },
            { statementType: "returnStatement" },
          ],
        },
      },
      {
        type: "method",
        returnType: "void",
        name: "moveUp",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "ifStatement",
              condition: {
                nodeType: "expression",
                term: { termType: "variable", name: "y" },
                rest: [
                  { op: ">", term: { termType: "numericLiteral", value: 1 } },
                ],
              },
              body: [
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "Screen.setColor",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: { termType: "keywordLiteral", value: "false" },
                        rest: [],
                      },
                    ],
                  },
                },
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "Screen.drawRectangle",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "x" },
                        rest: [],
                      },
                      {
                        nodeType: "expression",
                        term: {
                          termType: "groupedExpression",
                          expression: {
                            nodeType: "expression",
                            term: { termType: "variable", name: "y" },
                            rest: [
                              {
                                op: "+",
                                term: { termType: "variable", name: "size" },
                              },
                            ],
                          },
                        },
                        rest: [
                          {
                            op: "-",
                            term: { termType: "numericLiteral", value: 1 },
                          },
                        ],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "x" },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "variable", name: "size" },
                          },
                        ],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "y" },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "variable", name: "size" },
                          },
                        ],
                      },
                    ],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "y",
                  value: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "y" },
                    rest: [
                      {
                        op: "-",
                        term: { termType: "numericLiteral", value: 2 },
                      },
                    ],
                  },
                },
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "Screen.setColor",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: { termType: "keywordLiteral", value: "true" },
                        rest: [],
                      },
                    ],
                  },
                },
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "Screen.drawRectangle",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "x" },
                        rest: [],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "y" },
                        rest: [],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "x" },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "variable", name: "size" },
                          },
                        ],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "y" },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "numericLiteral", value: 1 },
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
              else: [],
            },
            { statementType: "returnStatement" },
          ],
        },
      },
      {
        type: "method",
        returnType: "void",
        name: "moveDown",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "ifStatement",
              condition: {
                nodeType: "expression",
                term: {
                  termType: "groupedExpression",
                  expression: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "y" },
                    rest: [
                      { op: "+", term: { termType: "variable", name: "size" } },
                    ],
                  },
                },
                rest: [
                  { op: "<", term: { termType: "numericLiteral", value: 254 } },
                ],
              },
              body: [
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "Screen.setColor",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: { termType: "keywordLiteral", value: "false" },
                        rest: [],
                      },
                    ],
                  },
                },
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "Screen.drawRectangle",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "x" },
                        rest: [],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "y" },
                        rest: [],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "x" },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "variable", name: "size" },
                          },
                        ],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "y" },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "numericLiteral", value: 1 },
                          },
                        ],
                      },
                    ],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "y",
                  value: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "y" },
                    rest: [
                      {
                        op: "+",
                        term: { termType: "numericLiteral", value: 2 },
                      },
                    ],
                  },
                },
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "Screen.setColor",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: { termType: "keywordLiteral", value: "true" },
                        rest: [],
                      },
                    ],
                  },
                },
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "Screen.drawRectangle",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "x" },
                        rest: [],
                      },
                      {
                        nodeType: "expression",
                        term: {
                          termType: "groupedExpression",
                          expression: {
                            nodeType: "expression",
                            term: { termType: "variable", name: "y" },
                            rest: [
                              {
                                op: "+",
                                term: { termType: "variable", name: "size" },
                              },
                            ],
                          },
                        },
                        rest: [
                          {
                            op: "-",
                            term: { termType: "numericLiteral", value: 1 },
                          },
                        ],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "x" },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "variable", name: "size" },
                          },
                        ],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "y" },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "variable", name: "size" },
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
              else: [],
            },
            { statementType: "returnStatement" },
          ],
        },
      },
      {
        type: "method",
        returnType: "void",
        name: "moveLeft",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "ifStatement",
              condition: {
                nodeType: "expression",
                term: { termType: "variable", name: "x" },
                rest: [
                  { op: ">", term: { termType: "numericLiteral", value: 1 } },
                ],
              },
              body: [
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "Screen.setColor",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: { termType: "keywordLiteral", value: "false" },
                        rest: [],
                      },
                    ],
                  },
                },
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "Screen.drawRectangle",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: {
                          termType: "groupedExpression",
                          expression: {
                            nodeType: "expression",
                            term: { termType: "variable", name: "x" },
                            rest: [
                              {
                                op: "+",
                                term: { termType: "variable", name: "size" },
                              },
                            ],
                          },
                        },
                        rest: [
                          {
                            op: "-",
                            term: { termType: "numericLiteral", value: 1 },
                          },
                        ],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "y" },
                        rest: [],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "x" },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "variable", name: "size" },
                          },
                        ],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "y" },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "variable", name: "size" },
                          },
                        ],
                      },
                    ],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "x",
                  value: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "x" },
                    rest: [
                      {
                        op: "-",
                        term: { termType: "numericLiteral", value: 2 },
                      },
                    ],
                  },
                },
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "Screen.setColor",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: { termType: "keywordLiteral", value: "true" },
                        rest: [],
                      },
                    ],
                  },
                },
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "Screen.drawRectangle",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "x" },
                        rest: [],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "y" },
                        rest: [],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "x" },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "numericLiteral", value: 1 },
                          },
                        ],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "y" },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "variable", name: "size" },
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
              else: [],
            },
            { statementType: "returnStatement" },
          ],
        },
      },
      {
        type: "method",
        returnType: "void",
        name: "moveRight",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "ifStatement",
              condition: {
                nodeType: "expression",
                term: {
                  termType: "groupedExpression",
                  expression: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "x" },
                    rest: [
                      { op: "+", term: { termType: "variable", name: "size" } },
                    ],
                  },
                },
                rest: [
                  { op: "<", term: { termType: "numericLiteral", value: 510 } },
                ],
              },
              body: [
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "Screen.setColor",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: { termType: "keywordLiteral", value: "false" },
                        rest: [],
                      },
                    ],
                  },
                },
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "Screen.drawRectangle",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "x" },
                        rest: [],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "y" },
                        rest: [],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "x" },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "numericLiteral", value: 1 },
                          },
                        ],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "y" },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "variable", name: "size" },
                          },
                        ],
                      },
                    ],
                  },
                },
                {
                  statementType: "letStatement",
                  name: "x",
                  value: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "x" },
                    rest: [
                      {
                        op: "+",
                        term: { termType: "numericLiteral", value: 2 },
                      },
                    ],
                  },
                },
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "Screen.setColor",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: { termType: "keywordLiteral", value: "true" },
                        rest: [],
                      },
                    ],
                  },
                },
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "Screen.drawRectangle",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: {
                          termType: "groupedExpression",
                          expression: {
                            nodeType: "expression",
                            term: { termType: "variable", name: "x" },
                            rest: [
                              {
                                op: "+",
                                term: { termType: "variable", name: "size" },
                              },
                            ],
                          },
                        },
                        rest: [
                          {
                            op: "-",
                            term: { termType: "numericLiteral", value: 1 },
                          },
                        ],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "y" },
                        rest: [],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "x" },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "variable", name: "size" },
                          },
                        ],
                      },
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "y" },
                        rest: [
                          {
                            op: "+",
                            term: { termType: "variable", name: "size" },
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
              else: [],
            },
            { statementType: "returnStatement" },
          ],
        },
      },
    ],
  },
  Square_SquareGame: {
    name: "SquareGame",
    varDecs: [
      { varType: "field", type: "Square", names: ["square"] },
      { varType: "field", type: "int", names: ["direction"] },
    ],
    subroutines: [
      {
        type: "constructor",
        returnType: "SquareGame",
        name: "new",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "letStatement",
              name: "square",
              value: {
                nodeType: "expression",
                term: {
                  termType: "subroutineCall",
                  name: "Square.new",
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 0 },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 0 },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 30 },
                      rest: [],
                    },
                  ],
                },
                rest: [],
              },
            },
            {
              statementType: "letStatement",
              name: "direction",
              value: {
                nodeType: "expression",
                term: { termType: "numericLiteral", value: 0 },
                rest: [],
              },
            },
            {
              statementType: "returnStatement",
              value: {
                nodeType: "expression",
                term: { termType: "keywordLiteral", value: "this" },
                rest: [],
              },
            },
          ],
        },
      },
      {
        type: "method",
        returnType: "void",
        name: "dispose",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "square.dispose",
                parameters: [],
              },
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Memory.deAlloc",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "keywordLiteral", value: "this" },
                    rest: [],
                  },
                ],
              },
            },
            { statementType: "returnStatement" },
          ],
        },
      },
      {
        type: "method",
        returnType: "void",
        name: "moveSquare",
        parameters: [],
        body: {
          varDecs: [],
          statements: [
            {
              statementType: "ifStatement",
              condition: {
                nodeType: "expression",
                term: { termType: "variable", name: "direction" },
                rest: [
                  { op: "=", term: { termType: "numericLiteral", value: 1 } },
                ],
              },
              body: [
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "square.moveUp",
                    parameters: [],
                  },
                },
              ],
              else: [],
            },
            {
              statementType: "ifStatement",
              condition: {
                nodeType: "expression",
                term: { termType: "variable", name: "direction" },
                rest: [
                  { op: "=", term: { termType: "numericLiteral", value: 2 } },
                ],
              },
              body: [
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "square.moveDown",
                    parameters: [],
                  },
                },
              ],
              else: [],
            },
            {
              statementType: "ifStatement",
              condition: {
                nodeType: "expression",
                term: { termType: "variable", name: "direction" },
                rest: [
                  { op: "=", term: { termType: "numericLiteral", value: 3 } },
                ],
              },
              body: [
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "square.moveLeft",
                    parameters: [],
                  },
                },
              ],
              else: [],
            },
            {
              statementType: "ifStatement",
              condition: {
                nodeType: "expression",
                term: { termType: "variable", name: "direction" },
                rest: [
                  { op: "=", term: { termType: "numericLiteral", value: 4 } },
                ],
              },
              body: [
                {
                  statementType: "doStatement",
                  call: {
                    termType: "subroutineCall",
                    name: "square.moveRight",
                    parameters: [],
                  },
                },
              ],
              else: [],
            },
            {
              statementType: "doStatement",
              call: {
                termType: "subroutineCall",
                name: "Sys.wait",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 5 },
                    rest: [],
                  },
                ],
              },
            },
            { statementType: "returnStatement" },
          ],
        },
      },
      {
        type: "method",
        returnType: "void",
        name: "run",
        parameters: [],
        body: {
          varDecs: [
            { type: "char", names: ["key"] },
            { type: "boolean", names: ["exit"] },
          ],
          statements: [
            {
              statementType: "letStatement",
              name: "exit",
              value: {
                nodeType: "expression",
                term: { termType: "keywordLiteral", value: "false" },
                rest: [],
              },
            },
            {
              statementType: "whileStatement",
              condition: {
                nodeType: "expression",
                term: {
                  termType: "unaryExpression",
                  op: "~",
                  term: { termType: "variable", name: "exit" },
                },
                rest: [],
              },
              body: [
                {
                  statementType: "whileStatement",
                  condition: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "key" },
                    rest: [
                      {
                        op: "=",
                        term: { termType: "numericLiteral", value: 0 },
                      },
                    ],
                  },
                  body: [
                    {
                      statementType: "letStatement",
                      name: "key",
                      value: {
                        nodeType: "expression",
                        term: {
                          termType: "subroutineCall",
                          name: "Keyboard.keyPressed",
                          parameters: [],
                        },
                        rest: [],
                      },
                    },
                    {
                      statementType: "doStatement",
                      call: {
                        termType: "subroutineCall",
                        name: "moveSquare",
                        parameters: [],
                      },
                    },
                  ],
                },
                {
                  statementType: "ifStatement",
                  condition: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "key" },
                    rest: [
                      {
                        op: "=",
                        term: { termType: "numericLiteral", value: 81 },
                      },
                    ],
                  },
                  body: [
                    {
                      statementType: "letStatement",
                      name: "exit",
                      value: {
                        nodeType: "expression",
                        term: { termType: "keywordLiteral", value: "true" },
                        rest: [],
                      },
                    },
                  ],
                  else: [],
                },
                {
                  statementType: "ifStatement",
                  condition: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "key" },
                    rest: [
                      {
                        op: "=",
                        term: { termType: "numericLiteral", value: 90 },
                      },
                    ],
                  },
                  body: [
                    {
                      statementType: "doStatement",
                      call: {
                        termType: "subroutineCall",
                        name: "square.decSize",
                        parameters: [],
                      },
                    },
                  ],
                  else: [],
                },
                {
                  statementType: "ifStatement",
                  condition: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "key" },
                    rest: [
                      {
                        op: "=",
                        term: { termType: "numericLiteral", value: 88 },
                      },
                    ],
                  },
                  body: [
                    {
                      statementType: "doStatement",
                      call: {
                        termType: "subroutineCall",
                        name: "square.incSize",
                        parameters: [],
                      },
                    },
                  ],
                  else: [],
                },
                {
                  statementType: "ifStatement",
                  condition: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "key" },
                    rest: [
                      {
                        op: "=",
                        term: { termType: "numericLiteral", value: 131 },
                      },
                    ],
                  },
                  body: [
                    {
                      statementType: "letStatement",
                      name: "direction",
                      value: {
                        nodeType: "expression",
                        term: { termType: "numericLiteral", value: 1 },
                        rest: [],
                      },
                    },
                  ],
                  else: [],
                },
                {
                  statementType: "ifStatement",
                  condition: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "key" },
                    rest: [
                      {
                        op: "=",
                        term: { termType: "numericLiteral", value: 133 },
                      },
                    ],
                  },
                  body: [
                    {
                      statementType: "letStatement",
                      name: "direction",
                      value: {
                        nodeType: "expression",
                        term: { termType: "numericLiteral", value: 2 },
                        rest: [],
                      },
                    },
                  ],
                  else: [],
                },
                {
                  statementType: "ifStatement",
                  condition: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "key" },
                    rest: [
                      {
                        op: "=",
                        term: { termType: "numericLiteral", value: 130 },
                      },
                    ],
                  },
                  body: [
                    {
                      statementType: "letStatement",
                      name: "direction",
                      value: {
                        nodeType: "expression",
                        term: { termType: "numericLiteral", value: 3 },
                        rest: [],
                      },
                    },
                  ],
                  else: [],
                },
                {
                  statementType: "ifStatement",
                  condition: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "key" },
                    rest: [
                      {
                        op: "=",
                        term: { termType: "numericLiteral", value: 132 },
                      },
                    ],
                  },
                  body: [
                    {
                      statementType: "letStatement",
                      name: "direction",
                      value: {
                        nodeType: "expression",
                        term: { termType: "numericLiteral", value: 4 },
                        rest: [],
                      },
                    },
                  ],
                  else: [],
                },
                {
                  statementType: "whileStatement",
                  condition: {
                    nodeType: "expression",
                    term: {
                      termType: "unaryExpression",
                      op: "~",
                      term: {
                        termType: "groupedExpression",
                        expression: {
                          nodeType: "expression",
                          term: { termType: "variable", name: "key" },
                          rest: [
                            {
                              op: "=",
                              term: { termType: "numericLiteral", value: 0 },
                            },
                          ],
                        },
                      },
                    },
                    rest: [],
                  },
                  body: [
                    {
                      statementType: "letStatement",
                      name: "key",
                      value: {
                        nodeType: "expression",
                        term: {
                          termType: "subroutineCall",
                          name: "Keyboard.keyPressed",
                          parameters: [],
                        },
                        rest: [],
                      },
                    },
                    {
                      statementType: "doStatement",
                      call: {
                        termType: "subroutineCall",
                        name: "moveSquare",
                        parameters: [],
                      },
                    },
                  ],
                },
              ],
            },
            { statementType: "returnStatement" },
          ],
        },
      },
    ],
  },
};

export const compiledFiles: Record<string, string> = {
  Average_Main: `function Main.main 4
push constant 18
call String.new 1
push constant 72
call String.appendChar 2
push constant 111
call String.appendChar 2
push constant 119
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 109
call String.appendChar 2
push constant 97
call String.appendChar 2
push constant 110
call String.appendChar 2
push constant 121
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 110
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 109
call String.appendChar 2
push constant 98
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 114
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 63
call String.appendChar 2
push constant 32
call String.appendChar 2
call Keyboard.readInt 1
pop local 1
push local 1
call Array.new 1
pop local 0
push constant 0
pop local 2
label L0
push local 2
push local 1
lt
not
if-goto L1
push local 2
push local 0
add
push constant 16
call String.new 1
push constant 69
call String.appendChar 2
push constant 110
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 114
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 97
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 110
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 109
call String.appendChar 2
push constant 98
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 114
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
call Keyboard.readInt 1
pop temp 0
pop pointer 1
push temp 0
pop that 0
push local 3
push local 2
push local 0
add
pop pointer 1
push that 0
add
pop local 3
push local 2
push constant 1
add
pop local 2
goto L0
label L1
push constant 15
call String.new 1
push constant 84
call String.appendChar 2
push constant 104
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 97
call String.appendChar 2
push constant 118
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 114
call String.appendChar 2
push constant 97
call String.appendChar 2
push constant 103
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 105
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 32
call String.appendChar 2
call Output.printString 1
pop temp 0
push local 3
push local 1
call Math.divide 2
call Output.printInt 1
pop temp 0
push constant 0
return`,
  ComplexArrays_Main: `function Main.main 3
push constant 10
call Array.new 1
pop local 0
push constant 5
call Array.new 1
pop local 1
push constant 1
call Array.new 1
pop local 2
push constant 3
push local 0
add
push constant 2
pop temp 0
pop pointer 1
push temp 0
pop that 0
push constant 4
push local 0
add
push constant 8
pop temp 0
pop pointer 1
push temp 0
pop that 0
push constant 5
push local 0
add
push constant 4
pop temp 0
pop pointer 1
push temp 0
pop that 0
push constant 3
push local 0
add
pop pointer 1
push that 0
push local 1
add
push constant 3
push local 0
add
pop pointer 1
push that 0
push constant 3
add
pop temp 0
pop pointer 1
push temp 0
pop that 0
push constant 3
push local 0
add
pop pointer 1
push that 0
push local 1
add
pop pointer 1
push that 0
push local 0
add
push constant 5
push local 0
add
pop pointer 1
push that 0
push local 0
add
pop pointer 1
push that 0
push constant 7
push constant 3
push local 0
add
pop pointer 1
push that 0
sub
push constant 2
call Main.double 1
sub
push constant 1
add
push local 1
add
pop pointer 1
push that 0
call Math.multiply 2
pop temp 0
pop pointer 1
push temp 0
pop that 0
push constant 0
push local 2
add
push constant 0
pop temp 0
pop pointer 1
push temp 0
pop that 0
push constant 0
push local 2
add
pop pointer 1
push that 0
pop local 2
push constant 43
call String.new 1
push constant 84
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 49
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 120
call String.appendChar 2
push constant 112
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 99
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 100
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 114
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 53
call String.appendChar 2
push constant 59
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 97
call String.appendChar 2
push constant 99
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 97
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 114
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
call Output.printString 1
pop temp 0
push constant 2
push local 1
add
pop pointer 1
push that 0
call Output.printInt 1
pop temp 0
call Output.println 0
pop temp 0
push constant 44
call String.new 1
push constant 84
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 50
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 120
call String.appendChar 2
push constant 112
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 99
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 100
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 114
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 52
call String.appendChar 2
push constant 48
call String.appendChar 2
push constant 59
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 97
call String.appendChar 2
push constant 99
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 97
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 114
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
call Output.printString 1
pop temp 0
push constant 5
push local 0
add
pop pointer 1
push that 0
call Output.printInt 1
pop temp 0
call Output.println 0
pop temp 0
push constant 43
call String.new 1
push constant 84
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 51
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 120
call String.appendChar 2
push constant 112
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 99
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 100
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 114
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 48
call String.appendChar 2
push constant 59
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 97
call String.appendChar 2
push constant 99
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 97
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 114
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
call Output.printString 1
pop temp 0
push local 2
call Output.printInt 1
pop temp 0
call Output.println 0
pop temp 0
push constant 0
pop local 2
push local 2
push constant 0
eq
not
if-goto L1
push local 0
push constant 10
call Main.fill 2
pop temp 0
push constant 3
push local 0
add
pop pointer 1
push that 0
pop local 2
push constant 1
push local 2
add
push constant 33
pop temp 0
pop pointer 1
push temp 0
pop that 0
push constant 7
push local 0
add
pop pointer 1
push that 0
pop local 2
push constant 1
push local 2
add
push constant 77
pop temp 0
pop pointer 1
push temp 0
pop that 0
push constant 3
push local 0
add
pop pointer 1
push that 0
pop local 1
push constant 1
push local 1
add
push constant 1
push local 1
add
pop pointer 1
push that 0
push constant 1
push local 2
add
pop pointer 1
push that 0
add
pop temp 0
pop pointer 1
push temp 0
pop that 0
goto L0
label L1
label L0
push constant 44
call String.new 1
push constant 84
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 52
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 120
call String.appendChar 2
push constant 112
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 99
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 100
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 114
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 55
call String.appendChar 2
push constant 55
call String.appendChar 2
push constant 59
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 97
call String.appendChar 2
push constant 99
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 97
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 114
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
call Output.printString 1
pop temp 0
push constant 1
push local 2
add
pop pointer 1
push that 0
call Output.printInt 1
pop temp 0
call Output.println 0
pop temp 0
push constant 45
call String.new 1
push constant 84
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 53
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 120
call String.appendChar 2
push constant 112
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 99
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 100
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 114
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 49
call String.appendChar 2
push constant 49
call String.appendChar 2
push constant 48
call String.appendChar 2
push constant 59
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 97
call String.appendChar 2
push constant 99
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 97
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 114
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
call Output.printString 1
pop temp 0
push constant 1
push local 1
add
pop pointer 1
push that 0
call Output.printInt 1
pop temp 0
call Output.println 0
pop temp 0
push constant 0
return
function Main.double 0
push argument 0
push constant 2
call Math.multiply 2
return
function Main.fill 0
label L2
push argument 1
push constant 0
gt
not
if-goto L3
push argument 1
push constant 1
sub
pop argument 1
push argument 1
push argument 0
add
push constant 3
call Array.new 1
pop temp 0
pop pointer 1
push temp 0
pop that 0
goto L2
label L3
push constant 0
return`,
  ConvertToBin_Main: `function Main.main 1
push constant 8001
push constant 16
push constant 1
neg
call Main.fillMemory 3
pop temp 0
push constant 8000
call Memory.peek 1
pop local 0
push local 0
call Main.convert 1
pop temp 0
push constant 0
return
function Main.convert 3
push constant 1
pop local 2
label L0
push local 2
not
if-goto L1
push local 1
push constant 1
add
pop local 1
push local 0
call Main.nextMask 1
pop local 0
push local 1
push constant 16
gt
not
not
if-goto L3
push argument 0
push local 0
and
push constant 0
eq
not
not
if-goto L5
push constant 8000
push local 1
add
push constant 1
call Memory.poke 2
pop temp 0
goto L4
label L5
push constant 8000
push local 1
add
push constant 0
call Memory.poke 2
pop temp 0
label L4
goto L2
label L3
push constant 0
pop local 2
label L2
goto L0
label L1
push constant 0
return
function Main.nextMask 0
push argument 0
push constant 0
eq
not
if-goto L7
push constant 1
return
goto L6
label L7
push argument 0
push constant 2
call Math.multiply 2
return
label L6
function Main.fillMemory 0
label L8
push argument 1
push constant 0
gt
not
if-goto L9
push argument 0
push argument 2
call Memory.poke 2
pop temp 0
push argument 1
push constant 1
sub
pop argument 1
push argument 0
push constant 1
add
pop argument 0
goto L8
label L9
push constant 0
return`,
  Pong_Ball: `function Ball.new 0
push constant 15
call Memory.alloc 1
pop pointer 0
push argument 0
pop this 0
push argument 1
pop this 1
push argument 2
pop this 10
push argument 3
push constant 6
sub
pop this 11
push argument 4
pop this 12
push argument 5
push constant 6
sub
pop this 13
push constant 0
pop this 14
push pointer 0
call Ball.show 1
pop temp 0
push pointer 0
return
function Ball.dispose 0
push argument 0
pop pointer 0
push pointer 0
call Memory.deAlloc 1
pop temp 0
push constant 0
return
function Ball.show 0
push argument 0
pop pointer 0
push constant 1
call Screen.setColor 1
pop temp 0
push pointer 0
call Ball.draw 1
pop temp 0
push constant 0
return
function Ball.hide 0
push argument 0
pop pointer 0
push constant 0
call Screen.setColor 1
pop temp 0
push pointer 0
call Ball.draw 1
pop temp 0
push constant 0
return
function Ball.draw 0
push argument 0
pop pointer 0
push this 0
push this 1
push this 0
push constant 5
add
push this 1
push constant 5
add
call Screen.drawRectangle 4
pop temp 0
push constant 0
return
function Ball.getLeft 0
push argument 0
pop pointer 0
push this 0
return
function Ball.getRight 0
push argument 0
pop pointer 0
push this 0
push constant 5
add
return
function Ball.setDestination 3
push argument 0
pop pointer 0
push argument 1
push this 0
sub
pop this 2
push argument 2
push this 1
sub
pop this 3
push this 2
call Math.abs 1
pop local 0
push this 3
call Math.abs 1
pop local 1
push local 0
push local 1
lt
pop this 7
push this 7
not
if-goto L1
push local 0
pop local 2
push local 1
pop local 0
push local 2
pop local 1
push this 1
push argument 2
lt
pop this 8
push this 0
push argument 1
lt
pop this 9
goto L0
label L1
push this 0
push argument 1
lt
pop this 8
push this 1
push argument 2
lt
pop this 9
label L0
push constant 2
push local 1
call Math.multiply 2
push local 0
sub
pop this 4
push constant 2
push local 1
call Math.multiply 2
pop this 5
push constant 2
push local 1
push local 0
sub
call Math.multiply 2
pop this 6
push constant 0
return
function Ball.move 0
push argument 0
pop pointer 0
push pointer 0
call Ball.hide 1
pop temp 0
push this 4
push constant 0
lt
not
if-goto L3
push this 4
push this 5
add
pop this 4
goto L2
label L3
push this 4
push this 6
add
pop this 4
push this 9
not
if-goto L5
push this 7
not
if-goto L7
push this 0
push constant 4
add
pop this 0
goto L6
label L7
push this 1
push constant 4
add
pop this 1
label L6
goto L4
label L5
push this 7
not
if-goto L9
push this 0
push constant 4
sub
pop this 0
goto L8
label L9
push this 1
push constant 4
sub
pop this 1
label L8
label L4
label L2
push this 8
not
if-goto L11
push this 7
not
if-goto L13
push this 1
push constant 4
add
pop this 1
goto L12
label L13
push this 0
push constant 4
add
pop this 0
label L12
goto L10
label L11
push this 7
not
if-goto L15
push this 1
push constant 4
sub
pop this 1
goto L14
label L15
push this 0
push constant 4
sub
pop this 0
label L14
label L10
push this 0
push this 10
gt
not
not
if-goto L17
push constant 1
pop this 14
push this 10
pop this 0
goto L16
label L17
label L16
push this 0
push this 11
lt
not
not
if-goto L19
push constant 2
pop this 14
push this 11
pop this 0
goto L18
label L19
label L18
push this 1
push this 12
gt
not
not
if-goto L21
push constant 3
pop this 14
push this 12
pop this 1
goto L20
label L21
label L20
push this 1
push this 13
lt
not
not
if-goto L23
push constant 4
pop this 14
push this 13
pop this 1
goto L22
label L23
label L22
push pointer 0
call Ball.show 1
pop temp 0
push this 14
return
function Ball.bounce 5
push argument 0
pop pointer 0
push this 2
push constant 10
call Math.divide 2
pop local 2
push this 3
push constant 10
call Math.divide 2
pop local 3
push argument 1
push constant 0
eq
not
if-goto L25
push constant 10
pop local 4
goto L24
label L25
push this 2
push constant 0
lt
not
push argument 1
push constant 1
eq
and
push this 2
push constant 0
lt
push argument 1
push constant 1
neg
eq
and
or
not
if-goto L27
push constant 20
pop local 4
goto L26
label L27
push constant 5
pop local 4
label L26
label L24
push this 14
push constant 1
eq
not
if-goto L29
push constant 506
pop local 0
push local 3
push constant 50
neg
call Math.multiply 2
push local 2
call Math.divide 2
pop local 1
push this 1
push local 1
push local 4
call Math.multiply 2
add
pop local 1
goto L28
label L29
push this 14
push constant 2
eq
not
if-goto L31
push constant 0
pop local 0
push local 3
push constant 50
call Math.multiply 2
push local 2
call Math.divide 2
pop local 1
push this 1
push local 1
push local 4
call Math.multiply 2
add
pop local 1
goto L30
label L31
push this 14
push constant 3
eq
not
if-goto L33
push constant 250
pop local 1
push local 2
push constant 25
neg
call Math.multiply 2
push local 3
call Math.divide 2
pop local 0
push this 0
push local 0
push local 4
call Math.multiply 2
add
pop local 0
goto L32
label L33
push constant 0
pop local 1
push local 2
push constant 25
call Math.multiply 2
push local 3
call Math.divide 2
pop local 0
push this 0
push local 0
push local 4
call Math.multiply 2
add
pop local 0
label L32
label L30
label L28
push pointer 0
push local 0
push local 1
call Ball.setDestination 3
pop temp 0
push constant 0
return`,
  Pong_Main: `function Main.main 1
call PongGame.newInstance 0
pop temp 0
call PongGame.getInstance 0
pop local 0
push local 0
call PongGame.run 1
pop temp 0
push local 0
call PongGame.dispose 1
pop temp 0
push constant 0
return`,
  Pong_Bat: `function Bat.new 0
push constant 5
call Memory.alloc 1
pop pointer 0
push argument 0
pop this 0
push argument 1
pop this 1
push argument 2
pop this 2
push argument 3
pop this 3
push constant 2
pop this 4
push pointer 0
call Bat.show 1
pop temp 0
push pointer 0
return
function Bat.dispose 0
push argument 0
pop pointer 0
push pointer 0
call Memory.deAlloc 1
pop temp 0
push constant 0
return
function Bat.show 0
push argument 0
pop pointer 0
push constant 1
call Screen.setColor 1
pop temp 0
push pointer 0
call Bat.draw 1
pop temp 0
push constant 0
return
function Bat.hide 0
push argument 0
pop pointer 0
push constant 0
call Screen.setColor 1
pop temp 0
push pointer 0
call Bat.draw 1
pop temp 0
push constant 0
return
function Bat.draw 0
push argument 0
pop pointer 0
push this 0
push this 1
push this 0
push this 2
add
push this 1
push this 3
add
call Screen.drawRectangle 4
pop temp 0
push constant 0
return
function Bat.setDirection 0
push argument 0
pop pointer 0
push argument 1
pop this 4
push constant 0
return
function Bat.getLeft 0
push argument 0
pop pointer 0
push this 0
return
function Bat.getRight 0
push argument 0
pop pointer 0
push this 0
push this 2
add
return
function Bat.setWidth 0
push argument 0
pop pointer 0
push pointer 0
call Bat.hide 1
pop temp 0
push argument 1
pop this 2
push pointer 0
call Bat.show 1
pop temp 0
push constant 0
return
function Bat.move 0
push argument 0
pop pointer 0
push this 4
push constant 1
eq
not
if-goto L1
push this 0
push constant 4
sub
pop this 0
push this 0
push constant 0
lt
not
if-goto L3
push constant 0
pop this 0
goto L2
label L3
label L2
push constant 0
call Screen.setColor 1
pop temp 0
push this 0
push this 2
add
push constant 1
add
push this 1
push this 0
push this 2
add
push constant 4
add
push this 1
push this 3
add
call Screen.drawRectangle 4
pop temp 0
push constant 1
call Screen.setColor 1
pop temp 0
push this 0
push this 1
push this 0
push constant 3
add
push this 1
push this 3
add
call Screen.drawRectangle 4
pop temp 0
goto L0
label L1
push this 0
push constant 4
add
pop this 0
push this 0
push this 2
add
push constant 511
gt
not
if-goto L5
push constant 511
push this 2
sub
pop this 0
goto L4
label L5
label L4
push constant 0
call Screen.setColor 1
pop temp 0
push this 0
push constant 4
sub
push this 1
push this 0
push constant 1
sub
push this 1
push this 3
add
call Screen.drawRectangle 4
pop temp 0
push constant 1
call Screen.setColor 1
pop temp 0
push this 0
push this 2
add
push constant 3
sub
push this 1
push this 0
push this 2
add
push this 1
push this 3
add
call Screen.drawRectangle 4
pop temp 0
label L0
push constant 0
return`,
  Pong_PongGame: `function PongGame.new 0
push constant 7
call Memory.alloc 1
pop pointer 0
call Screen.clearScreen 0
pop temp 0
push constant 50
pop this 6
push constant 230
push constant 229
push this 6
push constant 7
call Bat.new 4
pop this 0
push constant 253
push constant 222
push constant 0
push constant 511
push constant 0
push constant 229
call Ball.new 6
pop this 1
push this 1
push constant 400
push constant 0
call Ball.setDestination 3
pop temp 0
push constant 0
push constant 238
push constant 511
push constant 240
call Screen.drawRectangle 4
pop temp 0
push constant 22
push constant 0
call Output.moveCursor 2
pop temp 0
push constant 8
call String.new 1
push constant 83
call String.appendChar 2
push constant 99
call String.appendChar 2
push constant 111
call String.appendChar 2
push constant 114
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 48
call String.appendChar 2
call Output.printString 1
pop temp 0
push constant 0
pop this 3
push constant 0
pop this 4
push constant 0
pop this 2
push constant 0
pop this 5
push pointer 0
return
function PongGame.dispose 0
push argument 0
pop pointer 0
push this 0
call Bat.dispose 1
pop temp 0
push this 1
call Ball.dispose 1
pop temp 0
push pointer 0
call Memory.deAlloc 1
pop temp 0
push constant 0
return
function PongGame.newInstance 0
call PongGame.new 0
pop static 0
push constant 0
return
function PongGame.getInstance 0
push static 0
return
function PongGame.run 1
push argument 0
pop pointer 0
label L0
push this 3
not
not
if-goto L1
label L2
push local 0
push constant 0
eq
push this 3
not
and
not
if-goto L3
call Keyboard.keyPressed 0
pop local 0
push this 0
call Bat.move 1
pop temp 0
push pointer 0
call PongGame.moveBall 1
pop temp 0
push constant 50
call Sys.wait 1
pop temp 0
goto L2
label L3
push local 0
push constant 130
eq
not
if-goto L5
push this 0
push constant 1
call Bat.setDirection 2
pop temp 0
goto L4
label L5
push local 0
push constant 132
eq
not
if-goto L7
push this 0
push constant 2
call Bat.setDirection 2
pop temp 0
goto L6
label L7
push local 0
push constant 140
eq
not
if-goto L9
push constant 1
pop this 3
goto L8
label L9
label L8
label L6
label L4
label L10
push local 0
push constant 0
eq
not
push this 3
not
and
not
if-goto L11
call Keyboard.keyPressed 0
pop local 0
push this 0
call Bat.move 1
pop temp 0
push pointer 0
call PongGame.moveBall 1
pop temp 0
push constant 50
call Sys.wait 1
pop temp 0
goto L10
label L11
goto L0
label L1
push this 3
not
if-goto L13
push constant 10
push constant 27
call Output.moveCursor 2
pop temp 0
push constant 9
call String.new 1
push constant 71
call String.appendChar 2
push constant 97
call String.appendChar 2
push constant 109
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 79
call String.appendChar 2
push constant 118
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 114
call String.appendChar 2
call Output.printString 1
pop temp 0
goto L12
label L13
label L12
push constant 0
return
function PongGame.moveBall 5
push argument 0
pop pointer 0
push this 1
call Ball.move 1
pop this 2
push this 2
push constant 0
gt
push this 2
push this 5
eq
not
and
not
if-goto L15
push this 2
pop this 5
push constant 0
pop local 0
push this 0
call Bat.getLeft 1
pop local 1
push this 0
call Bat.getRight 1
pop local 2
push this 1
call Ball.getLeft 1
pop local 3
push this 1
call Ball.getRight 1
pop local 4
push this 2
push constant 4
eq
not
if-goto L17
push local 1
push local 4
gt
push local 2
push local 3
lt
or
pop this 3
push this 3
not
not
if-goto L19
push local 4
push local 1
push constant 10
add
lt
not
if-goto L21
push constant 1
neg
pop local 0
goto L20
label L21
push local 3
push local 2
push constant 10
sub
gt
not
if-goto L23
push constant 1
pop local 0
goto L22
label L23
label L22
label L20
push this 6
push constant 2
sub
pop this 6
push this 0
push this 6
call Bat.setWidth 2
pop temp 0
push this 4
push constant 1
add
pop this 4
push constant 22
push constant 7
call Output.moveCursor 2
pop temp 0
push this 4
call Output.printInt 1
pop temp 0
goto L18
label L19
label L18
goto L16
label L17
label L16
push this 1
push local 0
call Ball.bounce 2
pop temp 0
goto L14
label L15
label L14
push constant 0
return`,
  Seven_Main: `function Main.main 0
push constant 1
push constant 2
push constant 3
call Math.multiply 2
add
call Output.printInt 1
pop temp 0
push constant 0
return`,
  Square_Main: `function Main.main 1
call SquareGame.new 0
pop local 0
push local 0
call SquareGame.run 1
pop temp 0
push local 0
call SquareGame.dispose 1
pop temp 0
push constant 0
return`,
  Square_Square: `function Square.new 0
push constant 3
call Memory.alloc 1
pop pointer 0
push argument 0
pop this 0
push argument 1
pop this 1
push argument 2
pop this 2
push pointer 0
call Square.draw 1
pop temp 0
push pointer 0
return
function Square.dispose 0
push argument 0
pop pointer 0
push pointer 0
call Memory.deAlloc 1
pop temp 0
push constant 0
return
function Square.draw 0
push argument 0
pop pointer 0
push constant 1
call Screen.setColor 1
pop temp 0
push this 0
push this 1
push this 0
push this 2
add
push this 1
push this 2
add
call Screen.drawRectangle 4
pop temp 0
push constant 0
return
function Square.erase 0
push argument 0
pop pointer 0
push constant 0
call Screen.setColor 1
pop temp 0
push this 0
push this 1
push this 0
push this 2
add
push this 1
push this 2
add
call Screen.drawRectangle 4
pop temp 0
push constant 0
return
function Square.incSize 0
push argument 0
pop pointer 0
push this 1
push this 2
add
push constant 254
lt
push this 0
push this 2
add
push constant 510
lt
and
not
if-goto L1
push pointer 0
call Square.erase 1
pop temp 0
push this 2
push constant 2
add
pop this 2
push pointer 0
call Square.draw 1
pop temp 0
goto L0
label L1
label L0
push constant 0
return
function Square.decSize 0
push argument 0
pop pointer 0
push this 2
push constant 2
gt
not
if-goto L3
push pointer 0
call Square.erase 1
pop temp 0
push this 2
push constant 2
sub
pop this 2
push pointer 0
call Square.draw 1
pop temp 0
goto L2
label L3
label L2
push constant 0
return
function Square.moveUp 0
push argument 0
pop pointer 0
push this 1
push constant 1
gt
not
if-goto L5
push constant 0
call Screen.setColor 1
pop temp 0
push this 0
push this 1
push this 2
add
push constant 1
sub
push this 0
push this 2
add
push this 1
push this 2
add
call Screen.drawRectangle 4
pop temp 0
push this 1
push constant 2
sub
pop this 1
push constant 1
call Screen.setColor 1
pop temp 0
push this 0
push this 1
push this 0
push this 2
add
push this 1
push constant 1
add
call Screen.drawRectangle 4
pop temp 0
goto L4
label L5
label L4
push constant 0
return
function Square.moveDown 0
push argument 0
pop pointer 0
push this 1
push this 2
add
push constant 254
lt
not
if-goto L7
push constant 0
call Screen.setColor 1
pop temp 0
push this 0
push this 1
push this 0
push this 2
add
push this 1
push constant 1
add
call Screen.drawRectangle 4
pop temp 0
push this 1
push constant 2
add
pop this 1
push constant 1
call Screen.setColor 1
pop temp 0
push this 0
push this 1
push this 2
add
push constant 1
sub
push this 0
push this 2
add
push this 1
push this 2
add
call Screen.drawRectangle 4
pop temp 0
goto L6
label L7
label L6
push constant 0
return
function Square.moveLeft 0
push argument 0
pop pointer 0
push this 0
push constant 1
gt
not
if-goto L9
push constant 0
call Screen.setColor 1
pop temp 0
push this 0
push this 2
add
push constant 1
sub
push this 1
push this 0
push this 2
add
push this 1
push this 2
add
call Screen.drawRectangle 4
pop temp 0
push this 0
push constant 2
sub
pop this 0
push constant 1
call Screen.setColor 1
pop temp 0
push this 0
push this 1
push this 0
push constant 1
add
push this 1
push this 2
add
call Screen.drawRectangle 4
pop temp 0
goto L8
label L9
label L8
push constant 0
return
function Square.moveRight 0
push argument 0
pop pointer 0
push this 0
push this 2
add
push constant 510
lt
not
if-goto L11
push constant 0
call Screen.setColor 1
pop temp 0
push this 0
push this 1
push this 0
push constant 1
add
push this 1
push this 2
add
call Screen.drawRectangle 4
pop temp 0
push this 0
push constant 2
add
pop this 0
push constant 1
call Screen.setColor 1
pop temp 0
push this 0
push this 2
add
push constant 1
sub
push this 1
push this 0
push this 2
add
push this 1
push this 2
add
call Screen.drawRectangle 4
pop temp 0
goto L10
label L11
label L10
push constant 0
return`,
  Square_SquareGame: `function SquareGame.new 0
push constant 2
call Memory.alloc 1
pop pointer 0
push constant 0
push constant 0
push constant 30
call Square.new 3
pop this 0
push constant 0
pop this 1
push pointer 0
return
function SquareGame.dispose 0
push argument 0
pop pointer 0
push this 0
call Square.dispose 1
pop temp 0
push pointer 0
call Memory.deAlloc 1
pop temp 0
push constant 0
return
function SquareGame.moveSquare 0
push argument 0
pop pointer 0
push this 1
push constant 1
eq
not
if-goto L1
push this 0
call Square.moveUp 1
pop temp 0
goto L0
label L1
label L0
push this 1
push constant 2
eq
not
if-goto L3
push this 0
call Square.moveDown 1
pop temp 0
goto L2
label L3
label L2
push this 1
push constant 3
eq
not
if-goto L5
push this 0
call Square.moveLeft 1
pop temp 0
goto L4
label L5
label L4
push this 1
push constant 4
eq
not
if-goto L7
push this 0
call Square.moveRight 1
pop temp 0
goto L6
label L7
label L6
push constant 5
call Sys.wait 1
pop temp 0
push constant 0
return
function SquareGame.run 2
push argument 0
pop pointer 0
push constant 0
pop local 1
label L8
push local 1
not
not
if-goto L9
label L10
push local 0
push constant 0
eq
not
if-goto L11
call Keyboard.keyPressed 0
pop local 0
push pointer 0
call SquareGame.moveSquare 1
pop temp 0
goto L10
label L11
push local 0
push constant 81
eq
not
if-goto L13
push constant 1
pop local 1
goto L12
label L13
label L12
push local 0
push constant 90
eq
not
if-goto L15
push this 0
call Square.decSize 1
pop temp 0
goto L14
label L15
label L14
push local 0
push constant 88
eq
not
if-goto L17
push this 0
call Square.incSize 1
pop temp 0
goto L16
label L17
label L16
push local 0
push constant 131
eq
not
if-goto L19
push constant 1
pop this 1
goto L18
label L19
label L18
push local 0
push constant 133
eq
not
if-goto L21
push constant 2
pop this 1
goto L20
label L21
label L20
push local 0
push constant 130
eq
not
if-goto L23
push constant 3
pop this 1
goto L22
label L23
label L22
push local 0
push constant 132
eq
not
if-goto L25
push constant 4
pop this 1
goto L24
label L25
label L24
label L26
push local 0
push constant 0
eq
not
not
if-goto L27
call Keyboard.keyPressed 0
pop local 0
push pointer 0
call SquareGame.moveSquare 1
pop temp 0
goto L26
label L27
goto L8
label L9
push constant 0
return`,
};
