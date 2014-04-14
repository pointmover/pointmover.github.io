$(document).ready(->
  asRadian = (degree) ->
    return (degree/180) * Math.PI

  sign = (x) ->
    return if typeof x == 'number' then (if x then (if x < 0 then -1 else 1) else (if x == x then 0 else NaN)) else NaN

  asInt = (x) ->
    return parseInt(x, 10)

  error = (msg) ->
    alert """Sorry there was an error #{msg}, please refresh and try again.  If it persists,
    drop an email to 'point dot mover at gmail dot com' and I'll do my best to respond and help."""

  lpad = (str, len=2) ->
    pad = ('0' for i in new Array(len)).join('')
    return pad.substring(0, pad.length - str.length) + str

  getMousePos = (canvas, evt) ->
    rect = canvas.getBoundingClientRect()
    position =
      x: evt.clientX - rect.left
      y: evt.clientY - rect.top
    return position

  # Set up menu and menu items
  $menu = $('#menu')
  $menu.mouseenter ->
    $menu.animate({opacity: 1})
    $menu.find('ul').fadeIn()
  $menu.mouseleave ->
    $menu.animate({opacity: 0})
  hideAllPanes = (options) ->
    options.fadeOut ?= true
    options.hideContainers ?= true
    if options.fadeOut
      if options.hideContainers
        $('.pane-container').fadeOut()
      $('.pane-container > div').fadeOut()
    else
      if options.hideContainers
        $('.pane-container').hide()
      $('.pane-container > div').hide()

  _commonShowPaneTask = (elementId) ->
    for hidePaneFunction in _.values(hidePane)
      hidePaneFunction({fadeOut: false})
    $(elementId).fadeIn().parent().fadeIn()

  showPane =
    help: ->
      _commonShowPaneTask('#help-text')
      dumpData()
    area: ->
      drawBlank({showInvestigationArea: false})
      _commonShowPaneTask('#select-area')
      $canvasCaret.hide()
      startPosition = undefined
      stopPosition = undefined
      mousePosition = undefined
      $canvasDraw.mousemove (evt) ->
        if startPosition
          if stopPosition
            mousePosition2 = stopPosition
          else
            mousePosition2 = getMousePos(canvasDraw, evt)
          clearCanvas(contextDraw)
          contextDraw.strokeRect(
            startPosition.x - 0.5, startPosition.y - 0.5,
            mousePosition2.x - startPosition.x, mousePosition2.y - startPosition.y)
      $canvasDraw.click (evt) ->
        if not startPosition
          startPosition = getMousePos(canvasDraw, evt)
        else if not stopPosition
          stopPosition = getMousePos(canvasDraw, evt)
          center = getCenter()
          x = startPosition.x - center.x
          y = startPosition.y - center.y
          w = stopPosition.x - startPosition.x
          h = stopPosition.y - startPosition.y
          link = "?aoi-x=#{x}&aoi-y=#{y}&aoi-w=#{w}&aoi-h=#{h}"
          $('#area-link').removeClass('disabled').attr('href', link)
        else
          # reset
          $('#area-link').addClass('disabled')
          startPosition = getMousePos(canvasDraw, evt)
          stopPosition = undefined
        return

    save: ->
      _commonShowPaneTask('#save')
      data = dumpData()
      uriContent = "data:application/octet-stream," + encodeURIComponent(data);
      d = new Date()
      hours = lpad(d.getHours().toString())
      minutes = lpad(d.getMinutes().toString())
      filename = "Point Mover data #{d.getFullYear()}-#{d.getMonth()}-#{d.getDate()} #{hours}_#{minutes}.json"
      $('#save').find('a').remove()
      link = $('<a>').attr('href', uriContent).attr('download', filename).html("Click to save: #{filename}")
      $('#save').append(link)
    load: ->
      _commonShowPaneTask('#load')

  _commonHidePaneTask = (options={}) ->
    options.hideContainers ?= true
    options.fadeOut ?= true
    hideAllPanes(options)

  hidePane =
    help: (options={}) ->
      _commonHidePaneTask(options)
    area:(options={}) ->
      _commonHidePaneTask(options)
      $canvasCaret.show()
    save:(options={}) ->
      _commonHidePaneTask(options)
    load:(options={}) ->
      _commonHidePaneTask(options)

  $('#menu li').click (evt) ->
    option = $(evt.target).data('option')
    showPane[option]()
  $('.close').click (evt) ->
    option = $(evt.target).data('option')
    hidePane[option]()

  $('#area-link').click (evt) ->
    if $(evt.target).hasClass('disabled')
      evt.preventDefault()
      alert 'Area is not defined yet, please select an area by clicking once, and moving to a second point and clicking again.'
      return
    else
      'allow click to load new page'
  $('#files').change ->
    fr = new FileReader()
    file =  $('#files')[0].files[0]
    fr.readAsBinaryString(file)
    fr.onload = (response) ->
      content = response.target.result
      try
        window.PMState = JSON.parse(content)
        displayData()
        newPoint()
        hideAllPanes({fadeOut: true})
      catch e
        error('loading points from file')
        throw e

  backgroundColour = 'rgba(251,251,251,1)'
  black = 'rgba(0,0,0,1)'
  cursorBlink =
    on: 500
    off: 400
  blinkerTimeout = undefined
  caretCanvasTimeout = undefined

  # setup
  $canvasBack = $('#canvas-back')
  canvasBack  = $canvasBack[0]
  contextBack = canvasBack.getContext('2d')
  $canvasDraw = $('#canvas-draw')
  canvasDraw  = $canvasDraw[0]
  contextDraw = canvasDraw.getContext('2d')
  $canvasCaret = $('#canvas-caret')
  canvasCaret  = $canvasCaret[0]
  contextCaret = canvasCaret.getContext('2d')
  # set the canvases to fit the window
  resizeCanvas = (cxt) ->
    cxt.canvas.width  = window.innerWidth
    cxt.canvas.height  = window.innerHeight
  resizeCanvas(contextBack)
  resizeCanvas(contextDraw)
  resizeCanvas(contextCaret)

  blinkCaretCanvas = ->
    window.allowBlink = true
    _blinkCaretCanvas()

  _blinkCaretCanvas = ->
    if not window.allowBlink
      return
    done = ->
      $canvasCaret.animate({opacity: 1}, {duration: cursorBlink.off, done: _blinkCaretCanvas})
    $canvasCaret.animate({opacity: 0}, {duration: cursorBlink.on, done: done})

  width = canvasBack.width
  height = canvasBack.height
  getCenter = ->
    p =
      x: asInt(width/2)
      y: asInt(height/2)
    return p


  clearData = ->
    # try to get the areaOfInvestigation from the params
    parsed = purl(window.location)

    window.PMState =
      increment: asInt(parsed.param('increment') or '3')
      pointSize: asInt(parsed.param('pointSize') or '2')
      point:
        x: 0
        y: 0
      seen: []
      unseen: []
      all: []
      areaOfInvestigation:
        x: asInt(parsed.param('aoi-x') or '-100')
        y: asInt(parsed.param('aoi-y') or '-150')
        width: asInt(parsed.param('aoi-w') or '200')
        height: asInt(parsed.param('aoi-h') or '200')
      strategy:
        # showingRandomPoints: true
        # lineMaker:
        #   maxX: 0
        #   minX: 100000
        #   maxY: 0
        #   minY: 100000
        edgeFinder: true

  dumpData = ->
    console.clear()
    data = JSON.stringify(window.PMState)
    console.log data
    return data

  _drawPoint = (point, colour, context) ->
    context.strokeStyle = colour
    center = getCenter()
    context.strokeRect(
      center.x + point.x-0.5,
      center.y + point.y-0.5,
      window.PMState.pointSize,
      window.PMState.pointSize,
    )
    return

  window.showPoint = (point, options={}) ->
    options.colour ?= black
    options.blink ?= false
    options.context ?= contextBack
    options.makeInt ?= true
    if options.makeInt
      point.x = asInt(point.x)
      point.y = asInt(point.y)
    _drawPoint(point, options.colour, options.context)
    if options.blink
      clearTimeout(blinkerTimeout)
      func = ->
        hidePoint(point, {blink: true})
        return
      blinkerTimeout = setTimeout(func, cursorBlink.on)
    return

  window.hidePoint = (point, options={}) ->
    options.colour ?= backgroundColour
    options.blink ?= false
    options.context ?= contextBack
    _drawPoint(point, options.colour, options.context)
    if options.blink
      clearTimeout(blinkerTimeout)
      func = ->
        showPoint(point, {blink: true})
        return
      blinkerTimeout = setTimeout(func, cursorBlink.off)
    return

  window.showInvestigationArea = ->
    center = getCenter()
    contextBack.strokeRect(
      center.x + window.PMState.areaOfInvestigation.x-0.5,
      center.y + window.PMState.areaOfInvestigation.y-0.5,
      window.PMState.areaOfInvestigation.width,
      window.PMState.areaOfInvestigation.height,
    )
    return

  clearCanvas = (ctx) ->
    ctx.clearRect(0, 0, width, height)
    return

  drawBlank = (options={}) ->
    options.showInvestigationArea ?= true

    # clear all the canvases
    for ctx in [contextBack, contextDraw, contextCaret]
      clearCanvas(ctx)

    # faint background
    contextBack.fillStyle = backgroundColour
    contextBack.fillRect(0, 0, width, height)
    # dot in center
    showPoint({x: 0, y: 0})
    if options.showInvestigationArea
      showInvestigationArea()
    return

  getAOICenter = ->
    aoi = window.PMState.areaOfInvestigation
    p =
      x: aoi.x + asInt(aoi.width/2)
      y: aoi.y + asInt(aoi.height/2)
    return p

  randomisePoint = ->
    x = window.PMState.areaOfInvestigation.x + asInt(Math.random() * window.PMState.areaOfInvestigation.width)
    y = window.PMState.areaOfInvestigation.y + asInt(Math.random() * window.PMState.areaOfInvestigation.height)
    return {x, y}

  lastPoint = (goBack=1) ->
    return window.PMState.all[window.PMState.all.length-goBack]

  directionX = 1
  directionY = 0
  initialScoping = true
  newLineMakerPoint = ->
    last = lastPoint()
    if not last
      point = getAOICenter()
    else
      last.directionX = directionX
      last.directionY = directionY
      if not last.seen
        point.x += directionX * window.PMState.increment
        point.y += directionY * window.PMState.increment
      else
        lastBy1 = lastPoint(2)
        lastBy2 = lastPoint(3)
        if ((not lastBy1.seen) and lastBy2.seen and lastBy2.stepBack)
          point = getAOICenter()
          # find a new point to start from
          if initialScoping
            if directionX == 1
              window.PMState.strategy.lineMaker.maxX = point.x
              directionX = -1
            else
              window.PMState.strategy.lineMaker.minX = point.x
              directionX = 0
              if directionY == 0
                directionY = 1
              else if directionY == 1
                window.PMState.strategy.lineMaker.maxY = point.y
                directionY = -1
              else
                window.PMState.strategy.lineMaker.minY = point.y
                directionY = 0
                console.log 'finished initial scope'
                initialScoping = false
          else
            console.log 'erm'

        else
          point.x -= directionX * window.PMState.increment
          point.y -= directionY * window.PMState.increment
          last.stepBack = true
    showPoint(point, {context: contextCaret})

  DIRECTION_OUT = 0
  DIRECTION_CLOCKWISE = 0.5
  DIRECTION_IN = 1
  direction = DIRECTION_OUT
  newEdgeFinderPoint = ->
    # Relies on there:
    # * being only one area of vision missing,
    # * that this area is roughly circular
    # * that the center of the area of investigation
    #     is within the missing area of vision
    last = lastPoint()
    if last
      point = _.clone(last)
      lastBy1 = lastPoint(2)
      if point.seen
        # move either radially if previously moving out
        # or move inwards if previously moving radially
        if direction == DIRECTION_OUT
          direction = DIRECTION_CLOCKWISE
        else if direction == DIRECTION_CLOCKWISE
          direction = DIRECTION_IN
      else #if lastBy1 and lastBy1.seen
        if direction == DIRECTION_CLOCKWISE
          direction = DIRECTION_OUT
        else if direction == DIRECTION_IN
          direction = DIRECTION_CLOCKWISE

      # angle from center to point vs vertical:
      center = getAOICenter()
      angle = Math.atan2(center.x - point.x, center.y - point.y)
      # add on the necessary change in direction
      angle += Math.PI * direction

      point.x -= Math.sin(angle) * window.PMState.increment
      point.y -= Math.cos(angle) * window.PMState.increment
    else
      point = getAOICenter()
    window.PMState.point = point
    showPoint(point, {context: contextCaret})
    return

  # alert 'ready...'
  newPoint = (force=false) ->
    if window.PMState.strategy.lineMaker
      newLineMakerPoint()
    else if window.PMState.strategy.edgeFinder
      newEdgeFinderPoint()
    else if window.PMState.strategy.showingRandomPoints or force
      point = randomisePoint()
      showPoint(point, {blink: true})

  unseen = ->
    p = {x: window.PMState.point.x, y: window.PMState.point.y, seen: false}
    window.PMState.all.push(p)
    window.PMState.unseen.push(p)
    drawBlank({showInvestigationArea: false})
    newPoint()

  seen = ->
    p = {x: window.PMState.point.x, y: window.PMState.point.y, seen: true}
    window.PMState.all.push(p)
    window.PMState.seen.push(p)
    drawBlank({showInvestigationArea: false})
    newPoint()

  displayData = ->
    drawBlank({showInvestigationArea: true})
    for point in window.PMState.seen
      showPoint(point, {colour: 'rgba(0,250,0,1)'})
    for point in window.PMState.unseen
      showPoint(point, {colour: 'rgba(250,0,0,1)'})


  $(document).on('keydown', (evt) ->
    if evt.keyCode == 32
      evt.preventDefault()
      console.log 'space'
    else if evt.keyCode == 37
      console.log 'left'
      evt.preventDefault()
      hidePoint(point)
      point.x -= window.PMState.increment
    else if evt.keyCode == 39
      console.log 'right'
      evt.preventDefault()
      hidePoint(point)
      point.x += window.PMState.increment
    else if evt.keyCode == 38
      console.log 'up'
      evt.preventDefault()
      hidePoint(point)
      point.y -= window.PMState.increment
    else if evt.keyCode == 40
      console.log 'down'
      evt.preventDefault()
      hidePoint(point)
      point.y += window.PMState.increment
    else if evt.keyCode == 67
      console.log 'c'
      confirmed = confirm('Are you sure you want to clear the data?')
      if confirmed
        clearData()
        drawBlank({showInvestigationArea: false})
        newPoint()
    else if evt.keyCode == 68
      console.log 'd'
      displayData()
      newPoint()
    else if evt.keyCode == 81
      console.log 'q'
    else if evt.keyCode == 82
      console.log 'r'
    else if evt.keyCode == 83
      console.log 's'
      showPane.save()
    else if evt.keyCode == 187
      console.log 'plus'
      seen()
    else if evt.keyCode == 189
      console.log 'minus'
      unseen()
    else if evt.keyCode == 221
      console.log ']'
    else
      console.warn 'unhandled event key', evt.keyCode
  )

  clearData()
  drawBlank({showInvestigationArea: false})
  newPoint(true)
  blinkCaretCanvas()
  parsed = purl(window.location)
  if parsed.param('hide-license')
    hidePane.help({fadeOut: false})

  return
)