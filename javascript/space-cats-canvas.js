(function() {
  var _this = this;

  this.pizzas = [];
  this.pizzaCount = 25;
  this.pizzaDefaultSpeed = 8;

  this.leftPressed = false;
  this.rightPressed = false;
  this.upPressed = false;
  this.downPressed = false;
  this.firingLazors = false;

  var pizzaReady = false;
  var pizzaImage = new Image();
  pizzaImage.onload = function () {
    pizzaReady = true;
  };
  pizzaImage.src = "images/pizza.png";

  var userReady = false;
  var userImage = new Image();
  userImage.onload = function () {
    userReady = true;
  };
  userImage.src = "images/catstronaut.png";

  var backgroundReady = false;
  var backgroundImage = new Image();
  backgroundImage.onload = function () {
    backgroundReady = true;
  };
  backgroundImage.src = "images/bkgd-bluehorsehead_rosen_2048.jpg";

  /*********************************************************************************/
  /*********************************USER MODEL**************************************/
  /*********************************************************************************/

  this.User = function(opts) {
    var self = this;
    this.lazors = [];

    $.extend(this, {
      velocity: 0,
      maximumVelocity: 30,
      acceleration: 0.7,
      brakeCoefficient: 0.95,
      turnSpeed: 9,
      angle: 0,
      speedX: 0,
      speedY: 0,
      positionX: 0,
      positionY: 0,
      width: 130,
      height: 70,
      lazorRechargeTime: 100, //milliseconds
      lazorDefaultSpeed: 10,
      lazorsReady: true
    },opts);

    this.applyBindings = function() {
      $(document).keydown(function (e) {
        var keyCode = e.keyCode || e.which,
          arrow = {left: 37, up: 38, right: 39, down: 40 };
        switch (keyCode) {
          case arrow.left:
            _this.leftPressed = true;
          break;
          case arrow.up:
            _this.upPressed = true;
          break;
          case arrow.right:
            _this.rightPressed = true;
          break;
          case arrow.down:
            _this.downPressed = true;
          break;
        }
        if(e.keyCode == 32) {
          _this.firingLazors = true;
        }
      });
      $(document).keyup(function (e) {
        var keyCode = e.keyCode || e.which,
          arrow = {left: 37, up: 38, right: 39, down: 40 };
        switch (keyCode) {
          case arrow.left:
            _this.leftPressed = false;
          break;
          case arrow.up:
            _this.upPressed = false;
          break;
          case arrow.right:
            _this.rightPressed = false;
          break;
          case arrow.down:
            _this.downPressed = false;
          break;
        }
        if(e.keyCode == 32) {
          _this.firingLazors = false;
        }
      });
    }
    this.move = function() {
      handleTurning();
      handleVelocity();
      moveCat();
      wrapScreen();
      //fireLazors();

      function handleTurning() {
        if(_this.leftPressed) {
          self.angle -= self.turnSpeed;
        }
        if(_this.rightPressed) {
          self.angle += self.turnSpeed;
        }
      }

      function handleVelocity() {
        if(_this.upPressed) {
          self.velocity += self.acceleration;
          if(self.velocity > self.maximumVelocity) self.velocity = self.maximumVelocity;
        }
        if(_this.downPressed) {
          self.velocity -= self.acceleration;
          if(self.velocity > self.maximumVelocity) self.velocity = self.maximumVelocity;
        }
      }

      function moveCat() {
        self.positionX += self.velocity * Math.cos(self.angle* Math.PI / 180);
        self.positionY += self.velocity * Math.sin(self.angle* Math.PI / 180);
        
        //decelerate
        self.velocity *= self.brakeCoefficient;
      }

      function wrapScreen() {
        var leftMargin = self.positionX,
        topMargin = self.positionY,
        userHeight = Math.max(self.height, self.width)
        screenWidth = document.width,
        screenHeight = document.height;
        if(leftMargin > screenWidth + userHeight) {
          self.positionX = -userHeight;
        }
        if(topMargin > screenHeight + userHeight) {
          self.positionY = -userHeight;
        }
        if(leftMargin < 0 - userHeight) {
          self.positionX = screenWidth + userHeight;
        }
        if(topMargin < 0 - userHeight) {
          self.positionY = screenHeight + userHeight;
        }
      }

      function fireLazors() {
        if(firingLazors) {
          if(_this.lazorsReady) {
            fireLazor();
            _this.lazorsReady = false;
            window.setTimeout(function() {
              _this.lazorsReady = true;
            },_this.lazorRechargeTime);
          }
        }
        function fireLazor() {
          _this.userCat.lazors.push(new Lazor({
            angle: self.angle,
            positionX: self.positionX,
            positionY: self.positionY
          }));
        }
      }
    }

    this.draw = function() {
      _this.drawRotatedImage(userImage, self.positionX, self.positionY, self.width, self.height, self.angle);
      //_this.context.rotate(self.angle*Math.PI/180);
      //_this.context.drawImage(userImage, self.positionX, self.positionY, self.width, self.height);
      //_this.context.restore();
    }
  }

  /*********************************************************************************/
  /********************************PIZZA MODEL**************************************/
  /*********************************************************************************/

  this.Pizza = function(opts) {
    var self = this;

    $.extend(this, {
      velocity: _this.pizzaDefaultSpeed,
      angle: Math.floor(Math.random()*360),
      positionX: Math.floor(Math.random()*document.width),
      positionY: Math.floor(Math.random()*document.height),
      width: 80,
      height: 80
    },opts);

    this.init = function() {
      self.speedX = self.velocity * Math.cos(self.angle* Math.PI / 180);
      self.speedY = self.velocity * Math.sin(self.angle* Math.PI / 180);

      self.draw();
    }
    this.move = function() {
      self.positionX += self.speedX;
      self.positionY += self.speedY;

      //wrap screen
      leftMargin = self.positionX,
      topMargin = self.positionY,
      pizzaDiameter = self.height,
      screenWidth = document.width,
      screenHeight = document.height;
      if(leftMargin > screenWidth + pizzaDiameter) {
        self.positionX =  -pizzaDiameter;
      }
      if(topMargin > screenHeight + pizzaDiameter) {
        self.positionY =  -pizzaDiameter;
      }
      if(leftMargin < 0 - pizzaDiameter) {
        self.positionX = screenWidth + pizzaDiameter;
      }
      if(topMargin < 0 - pizzaDiameter) {
        self.positionY = screenHeight + pizzaDiameter;
      }
    }

    this.draw = function() {
      _this.context.drawImage(pizzaImage, self.positionX, self.positionY, self.width, self.height);
    }

    this.kill = function() {
      var index = _this.pizzas.indexOf(self);
      _this.pizzas.splice(index,1);
      _this.pizzas.push(new Pizza({}));
    }
    self.init();
  }

  /*********************************************************************************/
  /********************************LAZOR MODEL**************************************/
  /*********************************************************************************/

  this.Lazor = function(opts) {
    var self = this;
    $.extend(this, {
      velocity: _this.lazorDefaultSpeed,
      angle: 0,
      positionX: 0,
      positionY: 0
    },opts);

    self.element;

    this.init = function() {
      self.speedX = self.velocity * Math.cos(self.angle* Math.PI / 180);
      self.speedY = self.velocity * Math.sin(self.angle* Math.PI / 180);
      self.id = 'lazor-' + Math.floor(Math.random()*10000);
      self.html = '<div class="lazor" id="' + self.id + '"></div>';
      $('.space-background').append(self.html);
      $('#' + self.id).css({
        'margin-left': "+=" + self.positionX + "px",
        'margin-top': "+=" + self.positionY + "px",
        '-webkit-transform': 'rotate(' + self.angle + 'deg)',
        '-moz-transform': 'rotate(' + self.angle + 'deg)',
        '-ms-transform': 'rotate(' + self.angle + 'deg)',
        '-o-transform': 'rotate(' + self.angle + 'deg)',
        'transform': 'rotate(' + self.angle + 'deg)'
      });
      self.element = $('#' + self.id);
    }
    this.move = function() {
      self.element.css({
        'margin-left': "+=" + self.speedX + "px",
        'margin-top': "+=" + self.speedY + "px",
      })

      //kill it if it gets off screen
      leftMargin = parseInt(self.element.css('margin-left').split('p').shift()),
      topMargin = parseInt(self.element.css('margin-top').split('p').shift()),
      screenWidth = document.width,
      screenHeight = document.height;
      if(leftMargin > screenWidth || topMargin > screenHeight || leftMargin < 0 || topMargin < 0) {
        self.kill();
      }
    }
    this.kill = function() {
      self.element.remove();
      var index = _this.userCat.lazors.indexOf(self);
      _this.userCat.lazors.splice(index,1);
    }
    self.init();
  }

  /*********************************************************************************/
  /*********************************VIEW MODEL**************************************/
  /*********************************************************************************/

  this.initializeSpaceCats = function() {
    _this.userCat = new User();
    _this.applyBindings();
    $(document).ready(function() {
      _this.canvas = document.getElementById('space-canvas');
      _this.canvas.height = document.height;
      _this.canvas.width = document.width;
      _this.context = canvas.getContext('2d');
      _this.createPizzas();
    });
  }

  this.createPizzas = function() {
    for(var i=0; i< _this.pizzaCount ; i++) {
      console.log('creating pizza')
      _this.pizzas.push(new Pizza({}));
    }
  }

  this.applyBindings = function() {
    //apply bindings to control your space cat with arrow keys
    _this.userCat.applyBindings();
  }

  this.getRotationDegrees = function(obj) {
    var matrix = obj.css("-webkit-transform") ||
    obj.css("-moz-transform")    ||
    obj.css("-ms-transform")     ||
    obj.css("-o-transform")      ||
    obj.css("transform");
    if(matrix !== 'none') {
        var values = matrix.split('(')[1].split(')')[0].split(',');
        var a = values[0];
        var b = values[1];
        var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
    } else { var angle = 0; }
    return angle;
  }

  var TO_RADIANS = Math.PI/180; 
  this.drawRotatedImage = function(image, x, y, width, height, angle) { 
   
    // save the current co-ordinate system 
    // before we screw with it
    _this.context.save(); 
   
    // move to the middle of where we want to draw our image
    _this.context.translate(x, y);
   
    // rotate around that point, converting our 
    // angle from degrees to radians 
    _this.context.rotate(angle * TO_RADIANS);
   
    // draw it up and to the left by half the width
    // and height of the image 
    _this.context.drawImage(image, -(width/2), -(height/2), width, height);
   
    // and restore the co-ords to how they were when we began
    _this.context.restore(); 
  }

  this.loop = function() {
    _this.moveObjects();
    _this.drawObjects();
  }

  this.moveObjects = function() {
    _this.moveCats();
    //_this.moveLazors();
    _this.movePizzas();
  }

  this.moveLazors = function() {
    for(var i=0; i< _this.userCat.lazors.length; i++){
      var lazor = _this.userCat.lazors[i];
      lazor.move();
    }
  }

  this.movePizzas = function() {
    for(var i=0; i< _this.pizzas.length; i++){
      var pizza = _this.pizzas[i];
      pizza.move();
    }
  }

  this.moveCats = function() {
    _this.userCat.move();
  }

  this.drawObjects = function() {
    _this.drawBackground();
    _this.drawPizzas();
    //_this.drawLazors();
    _this.drawCats();
  }

  this.drawBackground = function() {
    _this.context.fillStyle = "rgb(250, 250, 250)";
    _this.context.drawImage(backgroundImage, 0, 0);
  }

  this.drawPizzas = function() {
    for(var i=0; i< _this.pizzas.length; i++){
      _this.pizzas[i].draw();
    }
  }

  this.drawCats = function() {
    _this.userCat.draw();
  }

  _this.initializeSpaceCats();

  setInterval(function() {
    _this.loop();
  },33);//30 times a second
})();