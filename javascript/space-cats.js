(function() {
  var _this = this;

  this.debug = false;

  this.gameInPlay = true;
  this.creatingPizzas = false;
  this.userScore = 0;
  this.lives = 3;

  this.pizzas = [];
  this.pizzaCount = 10;
  this.pizzaDefaultSpeed = 8;
  this.pizzaSliceDefaultSpeed = 12;

  this.leftPressed = false;
  this.rightPressed = false;
  this.upPressed = false;
  this.downPressed = false;
  this.firingLazors = false;

  this.touchX = 0;
  this.touchY = 0;

  this.gameWidth = 0;
  this.gameHeight = 0;

  var pizzaReady = false;
  var pizzaImage = new Image();
  pizzaImage.onload = function () {
    pizzaReady = true;
  };
  pizzaImage.src = "images/pizza.png";

  var sliceReady = false;
  var sliceImage = new Image();
  sliceImage.onload = function () {
    sliceReady = true;
  };
  sliceImage.src = "images/pizza-slice.png";

  var explosionReady = false;
  var explosionImage = new Image();
  explosionImage.onload = function () {
    explosionReady = true;
  };
  explosionImage.src = "images/explosion.png";

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
      maximumVelocity: 60,
      acceleration: 0.9,
      brakeCoefficient: 0.99,
      turnSpeed: 9,
      angle: 0,
      speedX: 0,
      speedY: 0,
      positionX: _this.gameWidth/2,
      positionY: _this.gameHeight/2,
      width: 130,
      height: 70,
      lazorRechargeTime: 100, //milliseconds
      lazorDefaultVelocity: 10,
      lazorsReady: true,
      lazors: [],
      hitPoints: 100,
      mass: 100.0,
      damage: 5
    },opts);

    this.move = function() {
      handleTouch();
      handleTurning();
      handleVelocity();
      moveCat();
      wrapScreen();
      fireLazors();

      function handleTouch() {
        if(_this.touchX != 0 && _this.touchY != 0) {
          var playerCenter = _this.findCenterOfRotatedRect(_this.userCat.positionX, _this.userCat.positionY, _this.userCat.width, _this.userCat.height, _this.userCat.angle);
          var dy = _this.touchY - playerCenter.y;
          var dx = _this.touchX - playerCenter.x;
          var minimumTurnThreshold = 5;
          var rads = Math.atan2(dy, dx);
          var touchAngle = ((rads * 180/Math.PI) + 360) % 360// rads to degs
          var lineDistance = _this.distanceBetweenTwoPoints(_this.touchX, _this.touchY, playerCenter.x, playerCenter.y);
          self.velocity += self.acceleration * (2*(lineDistance / Math.min(_this.gameWidth, _this.gameHeight)));

          if(Math.abs(self.angle - touchAngle) > minimumTurnThreshold ) {
            if(shouldTurnLeft(self.angle, touchAngle)) {
              self.angle -= self.turnSpeed;
            }
            else {
              self.angle += self.turnSpeed;
            }
          }
        }
        function shouldTurnLeft(playerAngle, touchAngle) {
          var result = false;
          if(playerAngle >=0 && playerAngle < 180) {
            result = !(playerAngle < touchAngle && (playerAngle + 180) % 360 > touchAngle);
          }
          else {
            result = (playerAngle > touchAngle && (playerAngle + 180) % 360 < touchAngle);
          }
          return result;//touchAngle >= playerAngle && touchAngle < (playerAngle + 180) % 360
        }
      }

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
        screenWidth = _this.gameWidth,
        screenHeight = _this.gameHeight;
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
            positionX: self.positionX + self.width/2,
            positionY: self.positionY + self.height/2,
            velocity: self.velocity + self.lazorDefaultVelocity
          }));
        }
      }
    }

    this.draw = function() {
      _this.drawRotatedImage(userImage, self.positionX, self.positionY, self.width, self.height, self.angle);
    }

    this.kill = function() {
      _this.userCat = new User();
    }
  }

  /*********************************************************************************/
  /********************************PIZZA MODEL**************************************/
  /*********************************************************************************/

  this.Pizza = function(opts) {
    var self = this;

    $.extend(this, {
      velocity: _this.pizzaDefaultSpeed,
      angle: Math.floor(Math.random()*360), //angle of velocity
      orientation: Math.floor(Math.random()*360), //directional orientation
      positionX: Math.floor(Math.random()*_this.gameWidth),
      positionY: Math.floor(Math.random()*_this.gameHeight),
      width: 80,
      height: 80,
      rotation: Math.floor(Math.random()*5),
      hitPoints: 5,
      mass: 12.0,
      damage: 5,
      value: 1000
    },opts);

    this.init = function() {
      self.speedX = self.velocity * Math.cos(self.angle* Math.PI / 180);
      self.speedY = self.velocity * Math.sin(self.angle* Math.PI / 180);
      self.draw();
    }

    this.move = function() {      
      self.positionX += self.speedX;
      self.positionY += self.speedY;
      self.orientation += self.rotation;

      //wrap screen
      leftMargin = self.positionX,
      topMargin = self.positionY,
      pizzaDiameter = self.height,
      screenWidth = _this.gameWidth,
      screenHeight = _this.gameHeight;
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
      _this.drawRotatedImage(pizzaImage, self.positionX, self.positionY, self.width, self.height, self.orientation);
      
    }

    this.kill = function() {
      if(_this.gameInPlay) _this.userScore += self.value;
      var index = _this.pizzas.indexOf(self);
      _this.pizzas.splice(index,1);
      var childSlices = Math.max(3, Math.floor(Math.random()*8)),
        i = 0;
      do {
        _this.pizzas.push(new PizzaSlice({
          positionX: self.positionX,
          positionY: self.positionY
        }));
        i++;
      } while (i < childSlices)
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
      angle: Math.floor(Math.random()*360), //angle of velocity
      orientation: Math.floor(Math.random()*360), //directional orientation
      positionX: Math.floor(Math.random()*_this.gameWidth),
      positionY: Math.floor(Math.random()*_this.gameHeight),
      width: 40,
      height: 40,
      rotation: Math.floor(Math.random() * 8)-4,
      hitPoints: 5,
      mass: 3.0,
      damage: 1,
      value: 250,
      image: sliceImage,
      dead: false
    },opts);

    this.init = function() {
      self.speedX = self.velocity * Math.cos(self.angle* Math.PI / 180);
      self.speedY = self.velocity * Math.sin(self.angle* Math.PI / 180);
      self.draw();
    }

    this.move = function() {      
      self.positionX += self.speedX;
      self.positionY += self.speedY;
      self.orientation += self.rotation;

      //wrap screen
      leftMargin = self.positionX,
      topMargin = self.positionY,
      pizzaDiameter = self.height,
      screenWidth = _this.gameWidth,
      screenHeight = _this.gameHeight;
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
      _this.drawRotatedImage(self.image, self.positionX, self.positionY, self.width, self.height, self.orientation);
    }

    this.kill = function() {
      if(!self.dead){
        self.dead = true;
        if(_this.gameInPlay) _this.userScore += self.value;
        self.image = explosionImage;
        setTimeout(function() {
          var index = _this.pizzas.indexOf(self);
          _this.pizzas.splice(index,1);
        }, 250);
      }
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
      height: 2,
      damage: 5
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
      screenWidth = _this.gameWidth,
      screenHeight = _this.gameHeight;
      if((leftMargin > screenWidth || topMargin > screenHeight || leftMargin < 0 || topMargin < 0)) {
        self.kill();
      }
    }
    this.draw = function() {
      _this.drawRotatedRect("rgb(250, 0, 0)", self.positionX, self.positionY, self.width, self.height, self.angle);
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
    _this.applyBindings();
    $(document).ready(function() {
      _this.gameWidth = document.body.clientWidth;
      _this.gameHeight = document.body.clientHeight;
      _this.canvas = document.getElementById('space-canvas');
      _this.canvas.height = _this.gameHeight;
      _this.canvas.width = _this.gameWidth;
      _this.context = canvas.getContext('2d');
      _this.userCat = new User();
      _this.createPizzas();
    });
  }

  this.createPizzas = function() {
    _this.creatingPizzas = true;
    for(var i=0; i< _this.pizzaCount ; i++) {
      _this.pizzas.push(new Pizza({}));
    }
    _this.creatingPizzas = false;
  }

  this.applyBindings = function() {
    $(document).bind('touchstart', function(event){
      _this.handleTouchStart(event);
    });
    $(document).bind('touchmove', function(event){
      _this.handleTouchMove(event);
    });
    $(document).bind('touchend', function(event){
      _this.handleTouchEnd(event);
    });

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
      //the comma key
      if(e.keyCode == 188) {
        _this.toggleDebug();
      }
    });
  }

  this.handleTouchStart = function(event) {
    _this.handleTouchEvent(event);
  }

  this.handleTouchMove = function(event) {
    _this.handleTouchEvent(event);
  }

  this.handleTouchEnd = function(event) {
    _this.touchX = 0;
    _this.touchY = 0;
    //_this.handleTouchEvent(event);
  }

  this.handleTouchEvent = function(event) {
    var xPos = event.originalEvent.touches[0].pageX;
    var yPos = event.originalEvent.touches[0].pageY;

    _this.touchX = xPos;
    _this.touchY = yPos;
  }

  this.toggleDebug = function() {
    if(_this.debug){
      _this.debug = false;
    }
    else {
      _this.debug = true;
    }
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
    _this.context.translate(x+(width/2), y+(height/2));
    _this.context.rotate(angle * Math.PI/180);
    _this.context.drawImage(image, -(width/2), -(height/2), width, height);
    _this.context.restore(); 
  }

  this.drawRotatedRect = function(color, x, y, width, height, angle) {   
    _this.context.save(); 
    _this.context.fillStyle = color;
    _this.context.translate(x, y);
    _this.context.rotate(angle * Math.PI/180);
    _this.context.fillRect(-(width/2), -(height/2), width, height);
    _this.context.restore(); 
  }

  this.loop = function() {
    _this.moveObjects();
    _this.drawObjects();
    _this.checkCollisions();
    _this.gameInPlay = _this.maintainUser();
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
      if(_this.collides(_this.pizzas[i], _this.userCat)){
        _this.userCat.hitPoints -= _this.pizzas[i].damage;
        _this.pizzas[i].kill();
      }
      for(var j = 0; j < _this.userCat.lazors.length; j++){
        if(_this.collides(_this.pizzas[i], _this.userCat.lazors[j])) {
          _this.pizzas[i].kill();
          _this.userCat.lazors[j].kill();
        }
      }
      for(var k = 0; k < _this.pizzas.length; k++){
        if(k != i){
          if(_this.collides(_this.pizzas[i], _this.pizzas[k])){
            _this.bounce(_this.pizzas[i], _this.pizzas[k]);
          }
        }
      }
    }
    if(!_this.pizzas.length && !_this.creatingPizzas) {
      _this.creatingPizzas = true;
      setTimeout(function() {
        _this.createPizzas();
      }, 3000);
    }
  }

  this.bounce = function(object1, object2) {
    //this shit is out of control!s
     // object1.speedX = (object1.speedX * (object1.mass - object2.mass) + (2 * object2.mass * object2.speedX)) / (object1.mass + object2.mass);
     // object1.speedY = (object1.speedY * (object1.mass - object2.mass) + (2 * object2.mass * object2.speedY)) / (object1.mass + object2.mass);
     // object2.speedX = (object2.speedX * (object2.mass - object1.mass) + (2 * object1.mass * object1.speedX)) / (object1.mass + object2.mass);
     // object2.speedY = (object2.speedY * (object2.mass - object1.mass) + (2 * object1.mass * object1.speedY)) / (object1.mass + object2.mass);
     // object1.move();
     // object2.move();
  }

  this.drawObjects = function() {
    _this.drawBackground();
    _this.drawPizzas();
    _this.drawLazors();
    _this.drawCats();
    _this.drawHud();
    _this.drawDebug();
  }

  this.drawBackground = function() {
    _this.context.fillStyle = "rgb(250, 250, 250)";
    _this.context.drawImage(backgroundImage, 0, 0, _this.gameWidth, _this.gameHeight);
    _this.context.fonts = "5px helvetica";
    _this.context.fillText("404 - page not found, sucka",361,200);
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

  this.drawHud = function() {
    var healthBarWidth = 100,
      healthBarHeight = 20,
      healthBarPositionX = 10,
      healthBarPositionY = 10,
      scorePositionX = _this.gameWidth - 150,
      scorePositionY = 50,
      lifeMargin = 2,
      livesOriginX = lifeMargin + 20,
      livesOriginY = 80,
      livesOffsetX = 0,
      livesOffsetY = 0,
      lifeWidth = 50,
      lifeHeight = 30;

    _this.context.fillStyle = "rgb(250, 250, 250)";
    _this.context.fillRect(healthBarPositionX-1, healthBarPositionY-1, healthBarWidth+2, healthBarHeight+2);
    _this.context.fillStyle = "rgb(250,0,0)";
    _this.context.fillRect(healthBarPositionX, healthBarPositionY, Math.max(0, _this.userCat.hitPoints), healthBarHeight);
    _this.context.fillStyle = "rgb(250, 250, 250)";
    _this.context.fonts = "10pt helvetica";
    _this.context.fillText("HP",healthBarPositionX+3, healthBarPositionY+(healthBarHeight/2));
    _this.context.fillText("SCORE:" + _this.userScore, scorePositionX, scorePositionY);

    for( var i=0; i< _this.lives; i++) {
      _this.drawRotatedImage(userImage,livesOriginX+livesOffsetX, livesOriginY+livesOffsetY,lifeWidth, lifeHeight, 270);
      livesOffsetX += lifeWidth + lifeMargin;
    }
  }

  this.drawDebug = function() {
    if(_this.debug) {
      if(_this.touchX > 0 && _this.touchY > 0) {
        var playerCenter = _this.findCenterOfRotatedRect(_this.userCat.positionX, _this.userCat.positionY, _this.userCat.width, _this.userCat.height, _this.userCat.angle);
        _this.context.fillStyle = "rgb(250, 0, 0)";
        _this.context.beginPath();
        _this.context.arc(_this.touchX, _this.touchY, 10, 0, Math.PI*2); 
        _this.context.closePath();
        _this.context.fill();

        _this.context.strokeStyle = "rgb(145,145,0)";
        _this.context.lineWidth = 5;
        _this.context.beginPath();
        _this.context.moveTo(_this.touchX, _this.touchY);
        _this.context.lineTo(playerCenter.x, playerCenter.y);
        _this.context.stroke();
      }
    }
  }

  this.maintainUser = function() {
    if(_this.userCat.angle < 0) _this.userCat.angle += 360;
    if(_this.userCat.angle >= 360) _this.userCat.angle = _this.userCat.angle % 360 ;
    if(_this.userCat.hitPoints < 0){
      _this.lives -= 1;
      if(_this.lives > 0){
        _this.userCat = new User();
      }
      else {
        _this.gameOver(); 
        return false; 
      }
    }
    if(_this.gameInPlay) _this.userScore += 1;
    return true;
  }

  this.gameOver = function() {
    _this.context.fonts = "80pt helvetica";
    _this.context.fillText("GAME OVER",_this.gameWidth/2,_this.gameHeight/2);
  }

  _this.initializeSpaceCats();

  setInterval(function() {
    if(_this.gameInPlay){}
    _this.loop();
  },33);//30 times a second
})();