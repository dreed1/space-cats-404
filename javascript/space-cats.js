(function() {
  var _this = this;

  this.userSpeedX = 0;
  this.userSpeedY = 0;
  this.userVelocity = 0;
  this.userAcceleration = 0.7;
  this.maximumVelocity = 30;
  this.userBrakeCoefficient = 0.95;

  this.initializeSpaceCats = function() {
    _this.applyBindings();
  }

  this.applyBindings = function() {
    //apply bindings to control your space cat with arrow keys
    $(document).keydown(function (e) {
      var keyCode = e.keyCode || e.which,
        arrow = {left: 37, up: 38, right: 39, down: 40 };

      switch (keyCode) {
        case arrow.left:
          _this.leftPressed();
        break;
        case arrow.up:
          _this.upPressed();
        break;
        case arrow.right:
          _this.rightPressed();
        break;
        case arrow.down:
          _this.downPressed();
        break;
      }
    });
  }

  this.leftPressed = function() {
    $('#user-cat').css({'-webkit-transform': 'rotate(' + (_this.getRotationDegrees($('#user-cat')) - 6) + 'deg)'});
  }

  this.rightPressed = function() {
    $('#user-cat').css({'-webkit-transform': 'rotate(' + (_this.getRotationDegrees($('#user-cat')) + 6) + 'deg)'});
  }

  this.upPressed = function() {
    _this.userVelocity += _this.userAcceleration;
    if(_this.userVelocity > _this.maximumVelocity) _this.userVelocity = _this.maximumVelocity;
  }

  this.downPressed = function() {
    _this.userVelocity -= _this.userAcceleration;
    if(_this.userVelocity > _this.maximumVelocity) _this.userVelocity = _this.maximumVelocity;
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

  this.loop = function() {
    _this.moveUser();
    _this.bleedUserSpeed();
  }

  this.moveUser = function() {
    var angle = _this.getRotationDegrees($('#user-cat'));
    _this.userSpeedX = this.userVelocity * Math.cos(angle* Math.PI / 180);
    _this.userSpeedY = this.userVelocity * Math.sin(angle* Math.PI / 180);

    var userCat = $('#user-cat');
    userCat.css({
      'margin-left': "+=" + _this.userSpeedX + "px",
      'margin-top': "+=" + _this.userSpeedY + "px",
    })
    _this.wrapScreen();
  }

  this.wrapScreen = function() {
    var userCat = $('#user-cat'),
    leftMargin = parseInt($('#user-cat').css('margin-left').split('p').shift()),
    topMargin = parseInt($('#user-cat').css('margin-top').split('p').shift()),
    screenWidth = document.width,
    screenHeight = document.height;
    if(leftMargin > screenWidth) {
      userCat.css({'margin-left': '0px'});
    }
    if(topMargin > screenHeight) {
      userCat.css({'margin-top': '0px'});
    }
    if(leftMargin < 0) {
      userCat.css({'margin-left':screenWidth + 'px'});
    }
    if(topMargin < 0) {
      userCat.css({'margin-top': screenHeight + 'px'});
    }
  }

  this.bleedUserSpeed = function() {
    _this.userVelocity *= _this.userBrakeCoefficient;
    console.log('user velocity: ' + _this.userVelocity)
  }

  _this.initializeSpaceCats();

  setInterval(function() {
    _this.loop();
  },33);//30 times a second
})();