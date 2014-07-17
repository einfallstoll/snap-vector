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
    
    drawPath()
    
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
        
        for (var i = 0; i < curves.length - 1; i++) {
            var x = config.area.margin + curves[i].xP * gridWidth
            , y = config.area.margin + curves[i].yP * gridHeight
            
            var circle = sVector.circle(x, y, 5)
            
            points.add(circle)
        }
        
        points.attr({
            stroke: '#000',
            strokeWidth: 4,
            fill: "none"
        })
    }
    
    // This will draw a cross, needed for start and ending point
    function drawCross(x, y, width, height) {
        var cross = sVector.g()
        
        var l1 = sVector.line(x - width / 2, y - height / 2, x + width / 2, y + height / 2)
        , l2 = sVector.line(x - width / 2, y + height / 2, x + width / 2, y - height / 2)
        
        cross.add(l1, l2)
        
        return cross
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
