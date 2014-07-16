$(function() {
    var config = {
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
        
        //console.log(xH1, yH1, xH2, yH2)
        
        var horizontalLine = sVector.line(xH1, yH1, xH2, yH2)
        grid.add(horizontalLine)
        
        // Calculate the points for horizontal grid
        var xV1 = config.area.margin + i * gridWidth
        , yV1 = config.area.margin - config.grid.lineWidth / 2
        , xV2 = config.area.margin + i * gridWidth
        , yV2 = config.area.margin + height + config.grid.lineWidth / 2
        
        //console.log(xV1, yV1, xV2, yV2)
        
        var verticalLine = sVector.line(xV1, yV1, xV2, yV2)
        grid.add(verticalLine)
    }
    
    grid.attr(gridAttributes)
    
    /* DRAW CURVES */
    var curves = [
        {
            xS: 5,
            yS: 5,
            xP: 10,
            yP: 10
        }
    ]
    , path = null
    
    drawPath()
    
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
            strokeWidth: config.path.lineWidth
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
    }
    
    function drawCross(x, y, width, height) {
        var cross = sVector.g()
        
        var l1 = sVector.line(x - width / 2, y - height / 2, x + width / 2, y + height / 2)
        , l2 = sVector.line(x - width / 2, y + height / 2, x + width / 2, y - height / 2)
        
        cross.add(l1, l2)
        
        return cross
    }
})
