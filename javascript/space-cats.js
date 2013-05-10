(function() {
  var _this = this;

  this.userSpeedX = 0;
  this.userSpeedY = 0;
  this.userVelocity = 0;
  this.userTurnSpeed = 9; // degrees
  this.userAcceleration = 0.7;
  this.maximumVelocity = 30;
  this.userBrakeCoefficient = 0.95;

  this.lazorRechargeTime = 100; //milliseconds
  this.lazorDefaultSpeed = 10;
  this.lazorsReady = true;
  this.userLazors = [];

  this.pizzas = [];
  this.pizzaCount = 5;
  this.pizzaDefaultSpeed = 8;

  this.leftPressed = false;
  this.rightPressed = false;
  this.upPressed = false;
  this.downPressed = false;
  this.firingLazors = false;

  this.initializeSpaceCats = function() {
    _this.applyBindings();
    $(document).ready(function() {
      _this.createPizzas();
    })
  }

  this.createPizzas = function() {
    for(var i=0; i< _this.pizzaCount ; i++) {
      _this.pizzas.push(new Pizza({

      }));
    }
  }

  this.applyBindings = function() {
    //apply bindings to control your space cat with arrow keys
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

  this.moveUser = function() {
    handleTurning();
    handleVelocity();
    handleSpeed();
    moveCat();
    wrapScreen();
    fireLazors();

    function handleTurning() {
      if(_this.leftPressed) {
        $('#user-cat').css({'-webkit-transform': 'rotate(' + (_this.getRotationDegrees($('#user-cat')) - _this.userTurnSpeed) + 'deg)'});
        $('#user-cat').css({'-moz-transform': 'rotate(' + (_this.getRotationDegrees($('#user-cat')) - _this.userTurnSpeed) + 'deg)'});
        $('#user-cat').css({'-o-transform': 'rotate(' + (_this.getRotationDegrees($('#user-cat')) - _this.userTurnSpeed) + 'deg)'});
        $('#user-cat').css({'-ms-transform': 'rotate(' + (_this.getRotationDegrees($('#user-cat')) - _this.userTurnSpeed) + 'deg)'});
        $('#user-cat').css({'transform': 'rotate(' + (_this.getRotationDegrees($('#user-cat')) - _this.userTurnSpeed) + 'deg)'});
      }
      if(_this.rightPressed) {
        $('#user-cat').css({'-webkit-transform': 'rotate(' + (_this.getRotationDegrees($('#user-cat')) + _this.userTurnSpeed) + 'deg)'});
        $('#user-cat').css({'-moz-transform': 'rotate(' + (_this.getRotationDegrees($('#user-cat')) + _this.userTurnSpeed) + 'deg)'});
        $('#user-cat').css({'-o-transform': 'rotate(' + (_this.getRotationDegrees($('#user-cat')) + _this.userTurnSpeed) + 'deg)'});
        $('#user-cat').css({'-ms-transform': 'rotate(' + (_this.getRotationDegrees($('#user-cat')) + _this.userTurnSpeed) + 'deg)'});
        $('#user-cat').css({'transform': 'rotate(' + (_this.getRotationDegrees($('#user-cat')) + _this.userTurnSpeed) + 'deg)'});
      }
    }

    function handleVelocity() {
      if(_this.upPressed) {
        _this.userVelocity += _this.userAcceleration;
        if(_this.userVelocity > _this.maximumVelocity) _this.userVelocity = _this.maximumVelocity;
      }
      if(this.downPressed) {
        _this.userVelocity -= _this.userAcceleration;
        if(_this.userVelocity > _this.maximumVelocity) _this.userVelocity = _this.maximumVelocity;
      }
    }

    function handleSpeed() {
      var angle = _this.getRotationDegrees($('#user-cat'));
      _this.userSpeedX = this.userVelocity * Math.cos(angle* Math.PI / 180);
      _this.userSpeedY = this.userVelocity * Math.sin(angle* Math.PI / 180);
    }

    function moveCat() {
      var userCat = $('#user-cat');
      userCat.css({
        'margin-left': "+=" + _this.userSpeedX + "px",
        'margin-top': "+=" + _this.userSpeedY + "px",
      })
    }

    function wrapScreen() {
      var userCat = $('#user-cat'),
      leftMargin = parseInt($('#user-cat').css('margin-left').split('p').shift()),
      topMargin = parseInt($('#user-cat').css('margin-top').split('p').shift()),
      userHeight = Math.max(parseInt(userCat.css('height').split('p').shift()), parseInt(userCat.css('width').split('p').shift()))
      screenWidth = document.width,
      screenHeight = document.height;
      if(leftMargin > screenWidth + userHeight) {
        userCat.css({'margin-left': -userHeight + 'px'});
      }
      if(topMargin > screenHeight + userHeight) {
        userCat.css({'margin-top': -userHeight + 'px'});
      }
      if(leftMargin < 0 - userHeight) {
        userCat.css({'margin-left': screenWidth + userHeight + 'px'});
      }
      if(topMargin < 0 - userHeight) {
        userCat.css({'margin-top': screenHeight + userHeight + 'px'});
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
        _this.userLazors.push(new Lazor({
          angle: _this.getRotationDegrees($('#user-cat')),
          positionX: parseInt($('#user-cat').css('margin-left').split('p').shift()) + (parseInt($('#user-cat').css('width').split('p').shift())/2),
          positionY: parseInt($('#user-cat').css('margin-top').split('p').shift() + (parseInt($('#user-cat').css('height').split('p').shift())/2))
        }));
      }
    }
  }

  this.bleedUserSpeed = function() {
    _this.userVelocity *= _this.userBrakeCoefficient;
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
      positionY: Math.floor(Math.random()*document.height)
    },opts);

    this.init = function() {
      self.speedX = self.velocity * Math.cos(self.angle* Math.PI / 180);
      self.speedY = self.velocity * Math.sin(self.angle* Math.PI / 180);
      self.id = 'pizza-' + Math.floor(Math.random()*10000);
      self.html = '<div class="pizza" id="' + self.id + '"></div>';
      $('.space-background').append(self.html);
      $('#' + self.id).css({
        'margin-left': "+=" + self.positionX + "px",
        'margin-top': "+=" + self.positionY + "px"
      })
    }
    this.move = function() {
      var pizza = $('#' + self.id);
      pizza.css({
        'margin-left': "+=" + self.speedX + "px",
        'margin-top': "+=" + self.speedY + "px",
      })

      //kill it if it gets off screen
      leftMargin = parseInt(pizza.css('margin-left').split('p').shift()),
      topMargin = parseInt(pizza.css('margin-top').split('p').shift()),
      pizzaDiameter = parseInt(pizza.css('height').split('p').shift()),
      screenWidth = document.width,
      screenHeight = document.height;
      if(leftMargin > screenWidth + pizzaDiameter) {
        pizza.css({'margin-left': -pizzaDiameter + 'px'});
      }
      if(topMargin > screenHeight + pizzaDiameter) {
        pizza.css({'margin-top': -pizzaDiameter + 'px'});
      }
      if(leftMargin < 0 - pizzaDiameter) {
        pizza.css({'margin-left':screenWidth + pizzaDiameter + 'px'});
      }
      if(topMargin < 0 - pizzaDiameter) {
        pizza.css({'margin-top': screenHeight + pizzaDiameter + 'px'});
      }
    }
    this.kill = function() {
      $('#' + self.id).remove();
      var index = _this.pizzas.indexOf(self);
      _this.pizzas.splice(index,1);
      //replace itself
      _this.pizzas.push(new Pizza({

      }));
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
      })
    }
    this.move = function() {
      var lazor = $('#' + self.id);
      lazor.css({
        'margin-left': "+=" + self.speedX + "px",
        'margin-top': "+=" + self.speedY + "px",
      })

      //kill it if it gets off screen
      leftMargin = parseInt(lazor.css('margin-left').split('p').shift()),
      topMargin = parseInt(lazor.css('margin-top').split('p').shift()),
      screenWidth = document.width,
      screenHeight = document.height;
      if(leftMargin > screenWidth || topMargin > screenHeight || leftMargin < 0 || topMargin < 0) {
        self.kill();
      }
    }
    this.kill = function() {
      $('#' + self.id).remove();
      var index = _this.userLazors.indexOf(self);
      _this.userLazors.splice(index,1);
    }
    self.init();
  }

  this.moveLazors = function() {
    for(var i=0; i< _this.userLazors.length; i++){
      var lazor = _this.userLazors[i];
      lazor.move();
    }
  }

  this.movePizzas = function() {
    for(var i=0; i< _this.pizzas.length; i++){
      var pizza = _this.pizzas[i];
      pizza.move();
    }
  }

  this.loop = function() {
    _this.moveUser();
    _this.bleedUserSpeed();
    _this.moveLazors();
    _this.movePizzas();
  }

  _this.initializeSpaceCats();

  setInterval(function() {
    _this.loop();
  },33);//30 times a second
})();