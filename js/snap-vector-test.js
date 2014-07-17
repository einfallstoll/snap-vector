$(function() {
    var config = {
        mode: 'add',
        area: {
            margin: 20
        },
        grid: {
            count: 10,
            lineWidth: 2,
            lineColor: '#BBB'
        },
        path: {
            lineWidth: 2,
            lineColor: '#000',
            cross: {
                lineWidth: 4,
                size: 15
            },
            point: {
                outer: {
                    lineWidth: 4,
                    lineColor: '#000',
                    size: 5
                },
                inner: {
                    lineWidth: 4,
                    lineColor: '#DDD',
                    size: 3
                },
                hover: {
                    lineWidth: 2,
                    lineColor: '#000'
                }
            },
            spoint: {
                outer: {
                    lineWidth: 4,
                    lineColor: '#000',
                    size: 5
                },
                inner: {
                    lineWidth: 4,
                    lineColor: '#555',
                    size: 3
                },
                line: {
                    lineWidth: 1,
                    lineColor: '#555'
                }
            }
        }
    }
    
    var sVector = Snap('#vector')
    , jVector = jQuery('#vector')
    
    /* DRAW GRID */
    var grid = sVector.g()
    
    var height = jVector.height()
    , width = jVector.width()
    
    // Subtract twice the margin
    height -= 2 * config.area.margin
    width -= 2 * config.area.margin
    
    // Calculate the grid-width and height
    var gridHeight = height / config.grid.count
    , gridWidth = width / config.grid.count
    
    // Draw the grid
    for (var i = 0; i <= config.grid.count; i++) {
        var gridAttributes = {
            stroke: config.grid.lineColor,
            strokeWidth: config.grid.lineWidth
        }
        
        // Calculate the points for horizontal grid
        var xH1 = config.area.margin - config.grid.lineWidth / 2
        , yH1 = config.area.margin + i * gridHeight
        , xH2 = config.area.margin + width + config.grid.lineWidth / 2
        , yH2 = config.area.margin + i * gridHeight
        
        var horizontalLine = sVector.line(xH1, yH1, xH2, yH2)
        grid.add(horizontalLine)
        
        // Calculate the points for horizontal grid
        var xV1 = config.area.margin + i * gridWidth
        , yV1 = config.area.margin - config.grid.lineWidth / 2
        , xV2 = config.area.margin + i * gridWidth
        , yV2 = config.area.margin + height + config.grid.lineWidth / 2
        
        var verticalLine = sVector.line(xV1, yV1, xV2, yV2)
        grid.add(verticalLine)
    }
    
    grid.attr(gridAttributes)
    
    /* DRAW CURVES */
    var curves = [
        {
            xS: config.grid.count,
            yS: config.grid.count,
            xP: config.grid.count,
            yP: config.grid.count
        }
    ]
    , path = null
    , drawnPoints = null
    
    drawPath()
    
    $('button[data-mode]').click(function() {
        config.mode = $(this).data('mode')
        $('span#current-mode').text($(this).text())
        drawPath()
    })
    
    sVector.click(function(event, x, y) {        
        x -= jVector.offset().left
        y -= jVector.offset().top
        
        switch (config.mode) {
            case 'add':
                addPoint(x, y)
                break;
        }
    })
    
    function drawPath() {
        if (path) {
            path.remove()
        }
        
        if (drawnPoints) {
            drawnPoints.remove()
        }
        
        // Initial Point
        var pathDefinition = 'M' + config.area.margin + ',' + config.area.margin
        
        // Add all curves
        curves.forEach(function(curve) {
            var x1 = curve.xS * gridWidth + config.area.margin
            , y1 = curve.yS * gridHeight + config.area.margin
            , x2 = curve.xP * gridWidth + config.area.margin
            , y2 = curve.yP * gridHeight + config.area.margin
            
            pathDefinition += ' S' + x1 + ',' + y1 + ' ' + x2 + ',' + y2
        })
        
        // Draw path
        path = sVector.path(pathDefinition)
        path.attr({
            stroke: config.path.lineColor,
            strokeWidth: config.path.lineWidth,
            fill: "none"
        })
        
        // Calculate start point
        var startX = config.area.margin
        , startY = config.area.margin
        
        // Draw X on start point
        var startCross = drawCross(startX, startY, config.path.cross.size, config.path.cross.size)
        startCross.attr({
            stroke: config.path.lineColor,
            strokeWidth: config.path.cross.lineWidth
        })
        
        // Calculate start point
        var endX = config.area.margin + curves[curves.length - 1].xP * gridWidth
        , endY = config.area.margin + curves[curves.length - 1].yP * gridHeight
        
        // Draw X on start point
        var endCross = drawCross(endX, endY, config.path.cross.size, config.path.cross.size)
        endCross.attr({
            stroke: config.path.lineColor,
            strokeWidth: config.path.cross.lineWidth
        })
        
        var points = sVector.g()
        if (config.mode != 'curve') {
            for (var i = 0; i < curves.length - 1; i++) {
                var x = config.area.margin + curves[i].xP * gridWidth
                , y = config.area.margin + curves[i].yP * gridHeight

                var outerCircle = sVector.circle(x, y, 5)
                , innerCircle = sVector.circle(x, y, 3)

                // Draw a black outer circle
                outerCircle.attr({
                    stroke: config.path.point.outer.lineColor,
                    strokeWidth: config.path.point.outer.lineWidth,
                    fill: config.path.point.outer.lineColor
                })

                // Draw a grey inner circle
                innerCircle.attr({
                    stroke: config.path.point.inner.lineColor,
                    strokeWidth: config.path.point.inner.lineWidth,
                    fill: "none"
                })

                var point = sVector.g(outerCircle, innerCircle)
                
                point.data('index', i)
                curves[i].point = point
                
                points.add(point)
            }
        } else {
            for (var i = 0; i < curves.length - 1; i++) {
                var x = config.area.margin + curves[i].xS * gridWidth
                , y = config.area.margin + curves[i].yS * gridHeight
                , xP = config.area.margin + curves[i].xP * gridWidth
                , yP = config.area.margin + curves[i].yP * gridHeight

                var line = sVector.line(x, y, xP, yP)
                
                line.attr({
                    stroke: config.path.spoint.line.lineColor,
                    strokeWidth: config.path.spoint.line.lineWidth
                })
                
                points.add(line)
                
                var outerCircle = sVector.circle(x, y, 5)
                , innerCircle = sVector.circle(x, y, 3)

                outerCircle.attr({
                    stroke: config.path.spoint.outer.lineColor,
                    strokeWidth: config.path.spoint.outer.lineWidth,
                    fill: config.path.spoint.outer.lineColor
                })

                innerCircle.attr({
                    stroke: config.path.spoint.inner.lineColor,
                    strokeWidth: config.path.spoint.inner.lineWidth,
                    fill: "none"
                })
                
                var point = sVector.g(outerCircle, innerCircle)

                point.data('index', i)
                curves[i].point = point
                
                points.add(point)
            }
        }
        
        drawnPoints = points
        
        if (config.mode != 'add') {
            for (var i = 0; i < curves.length - 1; i++) {
                var point = curves[i].point
                
                point.mouseover(function() {
                    if (config.moving) return

                    var bbox = this.getBBox()

                    var x = bbox.cx
                    , y = bbox.cy
                    , r = bbox.r0

                    var circle = sVector.circle(x, y, r)

                    sVector.attr({
                        stroke: config.path.point.hover.lineColor,
                        strokeWidth: config.path.point.hover.lineWidth,
                        fill: "none"
                    })

                    curves[this.data('index')].hoverCircle = circle
                }).mouseout(function() {
                    curves[this.data('index')].hoverCircle.remove()
                })
            }
        }
        
        if (config.mode == 'move') {
            // If the mode is move, the point shall move
            for (var i = 0; i < curves.length - 1; i++) {
                var point = curves[i].point
                
                point.drag(function(dx, dy, x, y) { // onmove                                                        
                    x -= jVector.offset().left
                    x -= config.area.margin
                    x /= gridWidth

                    y -= jVector.offset().top
                    y -= config.area.margin
                    y /= gridHeight

                    dx /= gridWidth

                    dy /= gridHeight

                    curves[this.data('index')].xP = x
                    curves[this.data('index')].yP = y

                    // Don't let the bazier-control-point (or the "sPoint") on its place, or the result may be unexpected
                    curves[this.data('index')].xS = curves[this.data('index')].xSo + dx
                    curves[this.data('index')].yS = curves[this.data('index')].ySo + dy

                    drawPath()
                }, function() { // onstart
                    if (curves[this.data('index')].hoverCircle) {
                        curves[this.data('index')].hoverCircle.remove()
                    }

                    // Save the original position, this is needed for a relative movement
                    curves[this.data('index')].xSo = curves[this.data('index')].xS
                    curves[this.data('index')].ySo = curves[this.data('index')].yS

                    config.moving = true
                }, function() { // onend
                    config.moving = false
                })
            }
        } else if (config.mode == 'delete') {
            // Delete the the point on click
            for (var i = 0; i < curves.length - 1; i++) {
                var point = curves[i].point
                
                point.click(function() {
                    if (curves[this.data('index')].hoverCircle) {
                        curves[this.data('index')].hoverCircle.remove()
                    }
                    
                    curves.splice(this.data('index'), 1)
                    drawPath()
                })
            }
        } else if (config.mode == 'curve') {
            // If the mode is curve, the sPoint shall move
            for (var i = 0; i < curves.length - 1; i++) {
                var point = curves[i].point
                , hoverCircle
                
                point.drag(function(dx, dy, x, y) { // onmove                                                        
                    x -= jVector.offset().left
                    x -= config.area.margin
                    x /= gridWidth

                    y -= jVector.offset().top
                    y -= config.area.margin
                    y /= gridHeight

                    curves[this.data('index')].xS = x
                    curves[this.data('index')].yS = y

                    drawPath()
                }, function() { // onstart
                    if (curves[this.data('index')].hoverCircle) {
                        curves[this.data('index')].hoverCircle.remove()
                    }
                    
                    config.moving = true
                }, function() { // onend
                    config.moving = false
                })
            }
        }
    }
    
    // This will draw a cross, needed for start and ending point
    function drawCross(x, y, width, height) {
        var l1 = sVector.line(x - width / 2, y - height / 2, x + width / 2, y + height / 2)
        , l2 = sVector.line(x - width / 2, y + height / 2, x + width / 2, y - height / 2)
        
        return sVector.g(l1, l2)
    }
    
    // Adds a point to the curve
    function addPoint(x, y) {
        
        // Calculate the "in-grid-position"
        x -= config.area.margin
        x /= gridWidth
        
        y -= config.area.margin
        y /= gridHeight
        
        // Out of bounds
        if (x < 0 || x > config.grid.count || y < 0 || y > config.grid.count) return
        
        var distances = []
        
        var last = {
            xS: 0,
            yS: 0,
            xP: 0,
            yP: 0
        }
        
        // Calculate and save the nearest distance to all bezier curves
        curves.forEach(function(curve) {
            var points = [
                [last.xP, last.yP],
                getMirroredPoint(last.xS, last.yS, last.xP, last.yP),
                [curve.xS, curve.yS],
                [curve.xP, curve.yP]
            ]
            
            distances.push(nearestDistanceToBezier(x, y, points))
            
            last = curve
        })
        
        // To start assume the first
        var shortestDistanceIndex = 0
        , shortestDistance = distances[0]
        
        // Find the shortest distance
        for (var i = 0; i < distances.length; i++) {
            if (distances[i] < shortestDistance) {
                shortestDistance = distances[i]
                shortestDistanceIndex = i
            }
        }
        
        // We've got a winner (and a place, where the new point will be added)
        curves.splice(shortestDistanceIndex, 0, {
            xS: x,
            yS: y,
            xP: x,
            yP: y
        })
        
        drawPath()
    }
    
    // This will calculate the distance between to given points
    function calcDistance(x1, y1, x2, y2) {
        var deltaX = x1 - x2
        , deltaY = y1 - y2
        
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    }
    
    // This will mirror the point through another
    // This is needed because of the W3C-specification of "smooth" bezier-control-points
    function getMirroredPoint(x1, y1, x2, y2) {
        var deltaX = x2 - x1
        , deltaY = y2 - y1
        return [x2 + deltaX, y2 + deltaY]
    }
    
    // Calculate the middle between to given points
    function getMiddleOfPoints(x1, y1, x2, y2) {
        var deltaX = x2 - x1
        , deltaY = y2 - y1
        return [x1 + deltaX / 2, y1 + deltaY / 2]
    }
    
    // Calculate the nearest distance to a bezier curve
    // This has only a certain percision
    function nearestDistanceToBezier(x, y, p) {
        var shortestDistance = calcDistance(x, y, p[0][0], p[0][1])
        for (var t = 0; t <= 1; t += 0.1) { // This is the precision, 0.1 will calculate 11 points on the bezier curve
            var point = deCasteljau(p, t)
            var distance = calcDistance(x, y, point[0], point[1])
            
            if (distance < shortestDistance) {
                shortestDistance = distance
            }
        }
        return shortestDistance
    }
    
    // This is the algorithm to calculate the bezier curve
    // It takes 4 points to define the bezier curve and a parameter "t" (0 <= t <= 1)
    // Source: https://gist.github.com/atomizer/1049745
    function deCasteljau(p, t) {
        for (var a = p; a.length > 1; a = b)
            for (var i = 0, b = [], j; i < a.length - 1; i++)
                for (b[i] = [], j = 0; j < a[i].length; j++)
                    b[i][j] = a[i][j] * (1 - t) + a[i + 1][j] * t;
        return a[0];
    }
})
