(function() {
  var _this = this;

  this.debug = false;

  this.pizzas = [];
  this.pizzaCount = 5;
  this.pizzaDefaultSpeed = 8;
  this.pizzaSliceDefaultSpeed = 12;

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

    $.extend(this, {
      velocity: 0,
      maximumVelocity: 30,
      acceleration: 0.7,
      brakeCoefficient: 0.95,
      turnSpeed: 9,
      angle: 270,
      speedX: 0,
      speedY: 0,
      positionX: document.width/2,
      positionY: document.height/2,
      width: 130,
      height: 70,
      lazorRechargeTime: 100, //milliseconds
      lazorDefaultVelocity: 10,
      lazorsReady: true,
      lazors: []
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
      fireLazors();

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
        if(_this.firingLazors) {
          if(self.lazorsReady) {
            fireLazor();
            self.lazorsReady = false;
            window.setTimeout(function() {
              self.lazorsReady = true;
            },self.lazorRechargeTime);
          }
        }
        function fireLazor() {
          self.lazors.push(new Lazor({
            angle: self.angle,
            positionX: self.positionX,
            positionY: self.positionY,
            velocity: self.velocity + self.lazorDefaultVelocity
          }));
        }
      }
    }

    this.draw = function() {
      _this.drawRotatedImage(userImage, self.positionX, self.positionY, self.width, self.height, self.angle);
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
      height: 80,
      rotation: 0
    },opts);

    this.init = function() {
      self.draw();
    }

    this.move = function() {      
      self.positionX += self.velocity * Math.cos(self.angle* Math.PI / 180);
      self.positionY += self.velocity * Math.sin(self.angle* Math.PI / 180);
      //self.angle += self.rotation;

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
      //_this.drawRotatedImage(pizzaImage, self.positionX, self.positionY, self.width, self.height, self.angle);
      _this.context.drawImage(pizzaImage, self.positionX, self.positionY, self.width, self.height);
    }

    this.kill = function() {
      var index = _this.pizzas.indexOf(self);
      _this.pizzas.splice(index,1);
      var childSlices = Math.max(3, Math.floor(Math.random()*8)),
        i= 0;
      do {
        _this.pizzas.push(new PizzaSlice({
          positionX: self.positionX,
          positionY: self.positionY
        }));
        i++;
      } while (i < childSlices)
      
      //_this.pizzas.push(new Pizza({}));
    }

    this.collides = function(other_object) {
      return _this.doCollide(self, other_object);
    }

    self.init();
  }

  /*********************************************************************************/
  /*****************************PIZZA SLICE MODEL***********************************/
  /*********************************************************************************/

  this.PizzaSlice = function(opts) {
    var self = this;

    $.extend(this, {
      velocity: _this.pizzaSliceDefaultSpeed,
      angle: Math.floor(Math.random()*360),
      positionX: Math.floor(Math.random()*document.width),
      positionY: Math.floor(Math.random()*document.height),
      width: 40,
      height: 40,
      rotation: 0
    },opts);

    this.init = function() {
      self.draw();
    }

    this.move = function() {      
      self.positionX += self.velocity * Math.cos(self.angle* Math.PI / 180);
      self.positionY += self.velocity * Math.sin(self.angle* Math.PI / 180);
      //self.angle += self.rotation;

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
      //_this.drawRotatedImage(pizzaImage, self.positionX, self.positionY, self.width, self.height, self.angle);
      _this.context.drawImage(pizzaImage, self.positionX, self.positionY, self.width, self.height);
    }

    this.kill = function() {
      var index = _this.pizzas.indexOf(self);
      _this.pizzas.splice(index,1);
      //_this.pizzas.push(new Pizza({}));
    }

    this.collides = function(other_object) {
      return _this.doCollide(self, other_object);
    }

    self.init();
  }

  /*********************************************************************************/
  /********************************LAZOR MODEL**************************************/
  /*********************************************************************************/

  this.Lazor = function(opts) {
    var self = this;
    $.extend(this, {
      velocity: _this.userCat.lazorDefaultVelocity,
      angle: 0,
      positionX: 0,
      positionY: 0,
      width: 10,
      height: 2
    },opts);

    this.init = function() {
      self.speedX = self.velocity * Math.cos(self.angle* Math.PI / 180);
      self.speedY = self.velocity * Math.sin(self.angle* Math.PI / 180);
    }
    this.move = function() {
      self.positionX += self.speedX;
      self.positionY += self.speedY;

      //kill it if it gets off screen
      leftMargin = self.positionX,
      topMargin = self.positionY,
      screenWidth = document.width,
      screenHeight = document.height;
      if((leftMargin > screenWidth || topMargin > screenHeight || leftMargin < 0 || topMargin < 0)) {
        self.kill();
      }
    }
    this.draw = function() {
      _this.drawRotatedRect(self.positionX, self.positionY, self.width, self.height, self.angle);
    }

    this.kill = function() {
      var index = _this.userCat.lazors.indexOf(self);
      _this.userCat.lazors.splice(index,1);
    }

    this.collides = function(other_object) {
      return _this.doCollide(self, other_object);
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
      _this.pizzas.push(new Pizza({}));
    }
  }

  this.applyBindings = function() {
    //apply bindings to control your space cat with arrow keys
    _this.userCat.applyBindings();
  }

  this.collides = function(object1, object2) {
    var radius1 = Math.min(object1.height, object1.width)/2;
    var radius2 = Math.min(object2.height, object2.width)/2;
    var center1 = _this.findCenterOfRotatedRect(object1.positionX, object1.positionY, object1.width, object1.height, object1.angle);
    var center2 = _this.findCenterOfRotatedRect(object2.positionX, object2.positionY, object2.width, object2.height, object2.angle);
    if(_this.debug == true) {
      _this.context.fillStyle = "rgb(0, 250, 0)";
      _this.context.beginPath();
      _this.context.arc(center1.x, center1.y, radius1, 0, Math.PI*2); 
      _this.context.closePath();
      _this.context.fill();
      _this.context.beginPath();
      _this.context.arc(center2.x, center2.y, radius2, 0, Math.PI*2); 
      _this.context.closePath();
      _this.context.fill();
      _this.context.fillStyle = "rgb(0, 0, 250)";
      _this.context.fillRect((center1.x), (center1.y), 4, 4);
      _this.context.fillRect((center2.x), (center2.y), 4, 4);
      _this.context.fillStyle = "rgb(0, 250, 250)";
      _this.context.fillRect((object1.positionX), (object1.positionY), 4, 4);
      _this.context.fillRect((object2.positionX), (object2.positionY), 4, 4);
    }
    if(_this.distanceBetweenTwoPoints(center1.x, center1.y, center2.x, center2.y) < radius1 + radius2) {
      return true;
    }
    return false;
  }

  this.findCenterOfRotatedRect = function(x, y, width, height, angle_degrees) {
    //var angle_rad = angle_degrees * Math.PI / 180;
    //var cosa = Math.cos(angle_rad);
    //var sina = Math.sin(angle_rad);
    //var wp = width/2;
    //var hp = height/2;
    //return { x: ( x + wp * cosa - hp * sina ),
    //         y: ( y + wp * sina + hp * cosa ) };
    return {x: x + width/2, y: y + height/2};
  }

  this.distanceBetweenTwoPoints = function(x1,y1, x2,y2) { 
    var dx  = x1 - x2,
      dy = y1 - y2;
    return Math.sqrt( dx*dx + dy*dy ); 
  }

  this.drawRotatedImage = function(image, x, y, width, height, angle) {   
    _this.context.save(); 
    _this.context.translate(x, y);
    _this.context.rotate(angle * Math.PI/180);
    _this.context.drawImage(image, -(width/2), -(height/2), width, height);
    _this.context.restore(); 
  }

  this.drawRotatedRect = function(x, y, width, height, angle) {   
    _this.context.save(); 
    _this.context.fillStyle = "rgb(250, 0, 0)";
    _this.context.translate(x, y);
    _this.context.rotate(angle * Math.PI/180);
    _this.context.fillRect(-(width/2), -(height/2), width, height);
    _this.context.restore(); 
  }

  this.loop = function() {
    _this.moveObjects();
    _this.drawObjects();
    _this.checkCollisions();
  }

  this.moveObjects = function() {
    _this.moveCats();
    _this.moveLazors();
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

  this.checkCollisions = function() {
    for(var i = 0; i < _this.pizzas.length; i++){
      for(var j = 0; j < _this.userCat.lazors.length; j++){
        if(_this.collides(_this.pizzas[i], _this.userCat.lazors[j])) {
          _this.pizzas[i].kill();
          _this.userCat.lazors[j].kill();
        }
      }
    }
  }

  this.drawObjects = function() {
    _this.drawBackground();
    _this.drawHud();
    _this.drawPizzas();
    _this.drawLazors();
    _this.drawCats();
  }

  this.drawHud = function() {
    var healthBarWidth = 100,
      healthBarHeight = 20,
      healthBarPositionX = 10,
      healthBarPositionY = 10;

    _this.context.fillStyle = "rgb(250, 250, 250)";
    _this.context.fillRect(healthBarPositionX-1, healthBarPositionY-1, healthBarWidth+2, healthBarHeight+2);
    _this.context.fillStyle = "rgb(250,0,0)";
    _this.context.fillRect(healthBarPositionX, healthBarPositionY, healthBarWidth, healthBarHeight);
    _this.context.fillStyle = "rgb(250, 250, 250)";
    _this.context.fonts = "5px helvetica";
    _this.context.fillText("404 page not found",161,100);
    _this.context.fillText("HP",healthBarPositionX+3, healthBarPositionY+(healthBarHeight/2));
  }


  this.drawBackground = function() {
    _this.context.fillStyle = "rgb(250, 250, 250)";
    _this.context.drawImage(backgroundImage, 0, 0, document.width, document.height);
  }

  this.drawCats = function() {
    _this.userCat.draw();
  }

  this.drawPizzas = function() {
    for(var i=0; i< _this.pizzas.length; i++){
      _this.pizzas[i].draw();
    }
  }

  this.drawLazors = function() {
    for(var i=0; i< _this.userCat.lazors.length; i++){
      _this.userCat.lazors[i].draw();
    }
  }

  _this.initializeSpaceCats();

  setInterval(function() {
    _this.loop();
  },33);//30 times a second
})();