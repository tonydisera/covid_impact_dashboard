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

