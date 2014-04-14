// Generated by CoffeeScript 1.7.1
(function() {
  $(document).ready(function() {
    var $canvasBack, $canvasCaret, $canvasDraw, $menu, DIRECTION_CLOCKWISE, DIRECTION_IN, DIRECTION_OUT, asInt, asRadian, backgroundColour, black, blinkCaretCanvas, blinkerTimeout, canvasBack, canvasCaret, canvasDraw, caretCanvasTimeout, clearCanvas, clearData, contextBack, contextCaret, contextDraw, cursorBlink, direction, directionX, directionY, displayData, drawBlank, dumpData, error, getAOICenter, getCenter, getMousePos, height, hideAllPanes, hidePane, initialScoping, lastPoint, lpad, newEdgeFinderPoint, newLineMakerPoint, newPoint, parsed, randomisePoint, resizeCanvas, seen, showPane, sign, unseen, width, _blinkCaretCanvas, _commonHidePaneTask, _commonShowPaneTask, _drawPoint;
    asRadian = function(degree) {
      return (degree / 180) * Math.PI;
    };
    sign = function(x) {
      if (typeof x === 'number') {
        if (x) {
          if (x < 0) {
            return -1;
          } else {
            return 1;
          }
        } else {
          if (x === x) {
            return 0;
          } else {
            return NaN;
          }
        }
      } else {
        return NaN;
      }
    };
    asInt = function(x) {
      return parseInt(x, 10);
    };
    error = function(msg) {
      return alert("Sorry there was an error " + msg + ", please refresh and try again.  If it persists,\ndrop an email to 'point dot mover at gmail dot com' and I'll do my best to respond and help.");
    };
    lpad = function(str) {
      var pad;
      pad = '00000';
      return pad.substring(0, pad.length - str.length) + str;
    };
    getMousePos = function(canvas, evt) {
      var position, rect;
      rect = canvas.getBoundingClientRect();
      position = {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
      };
      return position;
    };
    $menu = $('#menu');
    $menu.mouseenter(function() {
      $menu.animate({
        opacity: 1
      });
      return $menu.find('ul').fadeIn();
    });
    $menu.mouseleave(function() {
      return $menu.animate({
        opacity: 0
      });
    });
    hideAllPanes = function(options) {
      if (options.fadeOut == null) {
        options.fadeOut = true;
      }
      if (options.hideContainers == null) {
        options.hideContainers = true;
      }
      if (options.fadeOut) {
        if (options.hideContainers) {
          $('.pane-container').fadeOut();
        }
        return $('.pane-container > div').fadeOut();
      } else {
        if (options.hideContainers) {
          $('.pane-container').hide();
        }
        return $('.pane-container > div').hide();
      }
    };
    _commonShowPaneTask = function(elementId) {
      var hidePaneFunction, _i, _len, _ref;
      _ref = _.values(hidePane);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        hidePaneFunction = _ref[_i];
        hidePaneFunction({
          fadeOut: false
        });
      }
      return $(elementId).fadeIn().parent().fadeIn();
    };
    showPane = {
      help: function() {
        _commonShowPaneTask('#help-text');
        return dumpData();
      },
      area: function() {
        var mousePosition, startPosition, stopPosition;
        drawBlank({
          showInvestigationArea: false
        });
        _commonShowPaneTask('#select-area');
        $canvasCaret.hide();
        startPosition = void 0;
        stopPosition = void 0;
        mousePosition = void 0;
        $canvasDraw.mousemove(function(evt) {
          var mousePosition2;
          if (startPosition) {
            if (stopPosition) {
              mousePosition2 = stopPosition;
            } else {
              mousePosition2 = getMousePos(canvasDraw, evt);
            }
            clearCanvas(contextDraw);
            return contextDraw.strokeRect(startPosition.x - 0.5, startPosition.y - 0.5, mousePosition2.x - startPosition.x, mousePosition2.y - startPosition.y);
          }
        });
        return $canvasDraw.click(function(evt) {
          var center, h, link, w, x, y;
          if (!startPosition) {
            startPosition = getMousePos(canvasDraw, evt);
          } else if (!stopPosition) {
            stopPosition = getMousePos(canvasDraw, evt);
            center = getCenter();
            x = startPosition.x - center.x;
            y = startPosition.y - center.y;
            w = stopPosition.x - startPosition.x;
            h = stopPosition.y - startPosition.y;
            link = "?aoi-x=" + x + "&aoi-y=" + y + "&aoi-w=" + w + "&aoi-h=" + h;
            $('#area-link').removeClass('disabled').attr('href', link);
          } else {
            $('#area-link').addClass('disabled');
            startPosition = getMousePos(canvasDraw, evt);
            stopPosition = void 0;
          }
        });
      },
      save: function() {
        var d, data, filename, hours, link, minutes, uriContent;
        _commonShowPaneTask('#save');
        data = dumpData();
        uriContent = "data:application/octet-stream," + encodeURIComponent(data);
        d = new Date();
        hours = lpad(d.getHours().toString());
        minutes = lpad(d.getMinutes().toString());
        filename = "Point Mover data " + (d.getFullYear()) + "-" + (d.getMonth()) + "-" + (d.getDate()) + " " + hours + "_" + minutes + ".json";
        $('#save').find('a').remove();
        link = $('<a>').attr('href', uriContent).attr('download', filename).html("Click to save: " + filename);
        return $('#save').append(link);
      },
      load: function() {
        return _commonShowPaneTask('#load');
      }
    };
    _commonHidePaneTask = function(options) {
      if (options == null) {
        options = {};
      }
      if (options.hideContainers == null) {
        options.hideContainers = true;
      }
      if (options.fadeOut == null) {
        options.fadeOut = true;
      }
      return hideAllPanes(options);
    };
    hidePane = {
      help: function(options) {
        if (options == null) {
          options = {};
        }
        return _commonHidePaneTask(options);
      },
      area: function(options) {
        if (options == null) {
          options = {};
        }
        _commonHidePaneTask(options);
        return $canvasCaret.show();
      },
      save: function(options) {
        if (options == null) {
          options = {};
        }
        return _commonHidePaneTask(options);
      },
      load: function(options) {
        if (options == null) {
          options = {};
        }
        return _commonHidePaneTask(options);
      }
    };
    $('#menu li').click(function(evt) {
      var option;
      option = $(evt.target).data('option');
      return showPane[option]();
    });
    $('.close').click(function(evt) {
      var option;
      option = $(evt.target).data('option');
      return hidePane[option]();
    });
    $('#area-link').click(function(evt) {
      if ($(evt.target).hasClass('disabled')) {
        evt.preventDefault();
        alert('Area is not defined yet, please select an area by clicking once, and moving to a second point and clicking again.');
      } else {
        return 'allow click to load new page';
      }
    });
    $('#files').change(function() {
      var file, fr;
      fr = new FileReader();
      file = $('#files')[0].files[0];
      fr.readAsBinaryString(file);
      return fr.onload = function(response) {
        var content, e;
        content = response.target.result;
        try {
          window.PMState = JSON.parse(content);
          displayData();
          newPoint();
          return hideAllPanes({
            fadeOut: true
          });
        } catch (_error) {
          e = _error;
          error('loading points from file');
          throw e;
        }
      };
    });
    backgroundColour = 'rgba(251,251,251,1)';
    black = 'rgba(0,0,0,1)';
    cursorBlink = {
      on: 500,
      off: 400
    };
    blinkerTimeout = void 0;
    caretCanvasTimeout = void 0;
    $canvasBack = $('#canvas-back');
    canvasBack = $canvasBack[0];
    contextBack = canvasBack.getContext('2d');
    $canvasDraw = $('#canvas-draw');
    canvasDraw = $canvasDraw[0];
    contextDraw = canvasDraw.getContext('2d');
    $canvasCaret = $('#canvas-caret');
    canvasCaret = $canvasCaret[0];
    contextCaret = canvasCaret.getContext('2d');
    resizeCanvas = function(cxt) {
      cxt.canvas.width = window.innerWidth;
      return cxt.canvas.height = window.innerHeight;
    };
    resizeCanvas(contextBack);
    resizeCanvas(contextDraw);
    resizeCanvas(contextCaret);
    blinkCaretCanvas = function() {
      window.allowBlink = true;
      return _blinkCaretCanvas();
    };
    _blinkCaretCanvas = function() {
      var done;
      if (!window.allowBlink) {
        return;
      }
      done = function() {
        return $canvasCaret.animate({
          opacity: 1
        }, {
          duration: cursorBlink.off,
          done: _blinkCaretCanvas
        });
      };
      return $canvasCaret.animate({
        opacity: 0
      }, {
        duration: cursorBlink.on,
        done: done
      });
    };
    width = canvasBack.width;
    height = canvasBack.height;
    getCenter = function() {
      var p;
      p = {
        x: asInt(width / 2),
        y: asInt(height / 2)
      };
      return p;
    };
    clearData = function() {
      var parsed;
      parsed = purl(window.location);
      return window.PMState = {
        increment: asInt(parsed.param('increment') || '3'),
        pointSize: asInt(parsed.param('pointSize') || '2'),
        point: {
          x: 0,
          y: 0
        },
        seen: [],
        unseen: [],
        all: [],
        areaOfInvestigation: {
          x: asInt(parsed.param('aoi-x') || '-100'),
          y: asInt(parsed.param('aoi-y') || '-150'),
          width: asInt(parsed.param('aoi-w') || '200'),
          height: asInt(parsed.param('aoi-h') || '200')
        },
        strategy: {
          edgeFinder: true
        }
      };
    };
    dumpData = function() {
      var data;
      console.clear();
      data = JSON.stringify(window.PMState);
      console.log(data);
      return data;
    };
    _drawPoint = function(point, colour, context) {
      var center;
      context.strokeStyle = colour;
      center = getCenter();
      context.strokeRect(center.x + point.x - 0.5, center.y + point.y - 0.5, window.PMState.pointSize, window.PMState.pointSize);
    };
    window.showPoint = function(point, options) {
      var func;
      if (options == null) {
        options = {};
      }
      if (options.colour == null) {
        options.colour = black;
      }
      if (options.blink == null) {
        options.blink = false;
      }
      if (options.context == null) {
        options.context = contextBack;
      }
      if (options.makeInt == null) {
        options.makeInt = true;
      }
      if (options.makeInt) {
        point.x = asInt(point.x);
        point.y = asInt(point.y);
      }
      _drawPoint(point, options.colour, options.context);
      if (options.blink) {
        clearTimeout(blinkerTimeout);
        func = function() {
          hidePoint(point, {
            blink: true
          });
        };
        blinkerTimeout = setTimeout(func, cursorBlink.on);
      }
    };
    window.hidePoint = function(point, options) {
      var func;
      if (options == null) {
        options = {};
      }
      if (options.colour == null) {
        options.colour = backgroundColour;
      }
      if (options.blink == null) {
        options.blink = false;
      }
      if (options.context == null) {
        options.context = contextBack;
      }
      _drawPoint(point, options.colour, options.context);
      if (options.blink) {
        clearTimeout(blinkerTimeout);
        func = function() {
          showPoint(point, {
            blink: true
          });
        };
        blinkerTimeout = setTimeout(func, cursorBlink.off);
      }
    };
    window.showInvestigationArea = function() {
      var center;
      center = getCenter();
      contextBack.strokeRect(center.x + window.PMState.areaOfInvestigation.x - 0.5, center.y + window.PMState.areaOfInvestigation.y - 0.5, window.PMState.areaOfInvestigation.width, window.PMState.areaOfInvestigation.height);
    };
    clearCanvas = function(ctx) {
      ctx.clearRect(0, 0, width, height);
    };
    drawBlank = function(options) {
      var ctx, _i, _len, _ref;
      if (options == null) {
        options = {};
      }
      if (options.showInvestigationArea == null) {
        options.showInvestigationArea = true;
      }
      _ref = [contextBack, contextDraw, contextCaret];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ctx = _ref[_i];
        clearCanvas(ctx);
      }
      contextBack.fillStyle = backgroundColour;
      contextBack.fillRect(0, 0, width, height);
      showPoint({
        x: 0,
        y: 0
      });
      if (options.showInvestigationArea) {
        showInvestigationArea();
      }
    };
    getAOICenter = function() {
      var aoi, p;
      aoi = window.PMState.areaOfInvestigation;
      p = {
        x: aoi.x + asInt(aoi.width / 2),
        y: aoi.y + asInt(aoi.height / 2)
      };
      return p;
    };
    randomisePoint = function() {
      var x, y;
      x = window.PMState.areaOfInvestigation.x + asInt(Math.random() * window.PMState.areaOfInvestigation.width);
      y = window.PMState.areaOfInvestigation.y + asInt(Math.random() * window.PMState.areaOfInvestigation.height);
      return {
        x: x,
        y: y
      };
    };
    lastPoint = function(goBack) {
      if (goBack == null) {
        goBack = 1;
      }
      return window.PMState.all[window.PMState.all.length - goBack];
    };
    directionX = 1;
    directionY = 0;
    initialScoping = true;
    newLineMakerPoint = function() {
      var last, lastBy1, lastBy2, point;
      last = lastPoint();
      if (!last) {
        point = getAOICenter();
      } else {
        last.directionX = directionX;
        last.directionY = directionY;
        if (!last.seen) {
          point.x += directionX * window.PMState.increment;
          point.y += directionY * window.PMState.increment;
        } else {
          lastBy1 = lastPoint(2);
          lastBy2 = lastPoint(3);
          if ((!lastBy1.seen) && lastBy2.seen && lastBy2.stepBack) {
            point = getAOICenter();
            if (initialScoping) {
              if (directionX === 1) {
                window.PMState.strategy.lineMaker.maxX = point.x;
                directionX = -1;
              } else {
                window.PMState.strategy.lineMaker.minX = point.x;
                directionX = 0;
                if (directionY === 0) {
                  directionY = 1;
                } else if (directionY === 1) {
                  window.PMState.strategy.lineMaker.maxY = point.y;
                  directionY = -1;
                } else {
                  window.PMState.strategy.lineMaker.minY = point.y;
                  directionY = 0;
                  console.log('finished initial scope');
                  initialScoping = false;
                }
              }
            } else {
              console.log('erm');
            }
          } else {
            point.x -= directionX * window.PMState.increment;
            point.y -= directionY * window.PMState.increment;
            last.stepBack = true;
          }
        }
      }
      return showPoint(point, {
        context: contextCaret
      });
    };
    DIRECTION_OUT = 0;
    DIRECTION_CLOCKWISE = 0.5;
    DIRECTION_IN = 1;
    direction = DIRECTION_OUT;
    newEdgeFinderPoint = function() {
      var angle, center, last, lastBy1, point;
      last = lastPoint();
      if (last) {
        point = _.clone(last);
        lastBy1 = lastPoint(2);
        if (point.seen) {
          if (direction === DIRECTION_OUT) {
            direction = DIRECTION_CLOCKWISE;
          } else if (direction === DIRECTION_CLOCKWISE) {
            direction = DIRECTION_IN;
          }
        } else {
          if (direction === DIRECTION_CLOCKWISE) {
            direction = DIRECTION_OUT;
          } else if (direction === DIRECTION_IN) {
            direction = DIRECTION_CLOCKWISE;
          }
        }
        center = getAOICenter();
        angle = Math.atan2(center.x - point.x, center.y - point.y);
        angle += Math.PI * direction;
        point.x -= Math.sin(angle) * window.PMState.increment;
        point.y -= Math.cos(angle) * window.PMState.increment;
      } else {
        point = getAOICenter();
      }
      window.PMState.point = point;
      showPoint(point, {
        context: contextCaret
      });
    };
    newPoint = function(force) {
      var point;
      if (force == null) {
        force = false;
      }
      if (window.PMState.strategy.lineMaker) {
        return newLineMakerPoint();
      } else if (window.PMState.strategy.edgeFinder) {
        return newEdgeFinderPoint();
      } else if (window.PMState.strategy.showingRandomPoints || force) {
        point = randomisePoint();
        return showPoint(point, {
          blink: true
        });
      }
    };
    unseen = function() {
      var p;
      p = {
        x: window.PMState.point.x,
        y: window.PMState.point.y,
        seen: false
      };
      window.PMState.all.push(p);
      window.PMState.unseen.push(p);
      drawBlank({
        showInvestigationArea: false
      });
      return newPoint();
    };
    seen = function() {
      var p;
      p = {
        x: window.PMState.point.x,
        y: window.PMState.point.y,
        seen: true
      };
      window.PMState.all.push(p);
      window.PMState.seen.push(p);
      drawBlank({
        showInvestigationArea: false
      });
      return newPoint();
    };
    displayData = function() {
      var point, _i, _j, _len, _len1, _ref, _ref1, _results;
      drawBlank({
        showInvestigationArea: true
      });
      _ref = window.PMState.seen;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        point = _ref[_i];
        showPoint(point, {
          colour: 'rgba(0,250,0,1)'
        });
      }
      _ref1 = window.PMState.unseen;
      _results = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        point = _ref1[_j];
        _results.push(showPoint(point, {
          colour: 'rgba(250,0,0,1)'
        }));
      }
      return _results;
    };
    $(document).on('keydown', function(evt) {
      var confirmed;
      if (evt.keyCode === 32) {
        evt.preventDefault();
        return console.log('space');
      } else if (evt.keyCode === 37) {
        console.log('left');
        evt.preventDefault();
        hidePoint(point);
        return point.x -= window.PMState.increment;
      } else if (evt.keyCode === 39) {
        console.log('right');
        evt.preventDefault();
        hidePoint(point);
        return point.x += window.PMState.increment;
      } else if (evt.keyCode === 38) {
        console.log('up');
        evt.preventDefault();
        hidePoint(point);
        return point.y -= window.PMState.increment;
      } else if (evt.keyCode === 40) {
        console.log('down');
        evt.preventDefault();
        hidePoint(point);
        return point.y += window.PMState.increment;
      } else if (evt.keyCode === 67) {
        console.log('c');
        confirmed = confirm('Are you sure you want to clear the data?');
        if (confirmed) {
          clearData();
          drawBlank({
            showInvestigationArea: false
          });
          return newPoint();
        }
      } else if (evt.keyCode === 68) {
        console.log('d');
        displayData();
        return newPoint();
      } else if (evt.keyCode === 81) {
        return console.log('q');
      } else if (evt.keyCode === 82) {
        return console.log('r');
      } else if (evt.keyCode === 83) {
        console.log('s');
        return showPane.save();
      } else if (evt.keyCode === 187) {
        console.log('plus');
        return seen();
      } else if (evt.keyCode === 189) {
        console.log('minus');
        return unseen();
      } else if (evt.keyCode === 221) {
        return console.log(']');
      } else {
        return console.warn('unhandled event key', evt.keyCode);
      }
    });
    clearData();
    drawBlank({
      showInvestigationArea: false
    });
    newPoint(true);
    blinkCaretCanvas();
    parsed = purl(window.location);
    if (parsed.param('hide-license')) {
      hidePane.help({
        fadeOut: false
      });
    }
  });

}).call(this);
