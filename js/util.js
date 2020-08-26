var darkenScheme = function(colors, step=1) {
  let darkerColors = []
  colors.forEach(function(theColor) {
    newColor = d3.hsl(theColor).darker(step).toString()
    darkerColors.push(newColor.toString())
  })
  return darkerColors;
}

var changeOpacity = function(theColor, opacity) {
  let newColor = d3.hsl(theColor)
  newColor.opacity = opacity;
  return newColor.toString();
}

var getLegendValues = function(numberOfSteps, stepSize, maxValue) {
  let values = []
  let steps = Math.round(maxValue / numberOfSteps, 0);
  if (steps % stepSize != 0) {
    steps += (stepSize - (steps % stepSize))
  }
  for (let i = 0; i < numberOfSteps; i++) {
    values.push( i * steps);
  }
  return values;
}

var getLegendValuesDecimals = function(numberOfSteps, stepSize, minValue, maxValue, decimals) {
  let values = []
  let range = maxValue - minValue;
  let steps = Math.round( range / numberOfSteps, decimals);
  if (steps % stepSize != 0) {
    steps += (stepSize - (steps % stepSize))
  }
  for (let i = 0; i < numberOfSteps; i++) {
    values.push( Math.floor(minValue,decimals) + (i * steps));
  }
  return values;
}

function isPointInsidePolygon(lat, lng, poly) {
        
    var x = lat, y = lng;

    var inside = false;
    for (var ii=0;ii<poly.getLatLngs().length;ii++){
        var polyPoints = poly.getLatLngs()[ii];
        for (var i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
            var xi = polyPoints[i].lat, yi = polyPoints[i].lng;
            var xj = polyPoints[j].lat, yj = polyPoints[j].lng;

            var intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
    }

    return inside;
};

function addHistogramCheckbox(parentSelector, histChartSelector, histChart) {
	let div = d3.select(parentSelector)
	            .append("div")
	            .attr("class", "form-check")
	            
	div.append("input")
	   .attr("class", "form-check-input")
	   .attr("type", "checkbox")
	div.append("label")
	   .attr("class", "form-check-label")
	   .text("log x-axis")

  $( parentSelector + ' input.form-check-input').on('change', function() {
    var logXAxis = $(parentSelector + ' input.form-check-input').is(':checked');
    histChart.logX(logXAxis);
    d3.select(histChartSelector + " svg").remove();
    let selection = d3.select(histChartSelector);
    histChart(selection);
  })

}

function addChartTitleDataDate(chartSelector, layer) {
  if (layer.dataDate) {
    d3.select(chartSelector + " .chart-title")
      .append("div")
      .attr("class", "data-date")
      .text("as of " + layer.dataDate);
  }
}


capitalizeFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


function detectChrome() {
  var isChromium = window.chrome,
    winNav = window.navigator,
    vendorName = winNav.vendor,
    isOpera = winNav.userAgent.indexOf("OPR") > -1,
    isIEedge = winNav.userAgent.indexOf("Edge") > -1,
    isIOSChrome = winNav.userAgent.match("CriOS");

  var isChrome = /Chrome/.test(window.navigator.userAgent) && /Google Inc/.test(window.navigator.vendor);  

  if(isChrome) {
    return true;
  } else if (isIOSChrome) {
    return true;
  } else if (
    isChromium !== null &&
    typeof isChromium !== "undefined" &&
    vendorName === "Google Inc." &&
    isOpera === false &&
    isIEedge === false
  ) {
    return true;
  } else {
    return false;
  }
}



/**
 * detect IE
 * returns version of IE or false, if browser is not Internet Explorer
 */
function detectIE() {
    var ua = window.navigator.userAgent;

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
       // IE 12 => return version number
       return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}

function detectSafari() {
  return (navigator.userAgent.indexOf('Safari') != -1 && !detectChrome());
}