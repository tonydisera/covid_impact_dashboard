
Split(['#one', '#two'], {
    sizes:       [35, 70],
    minSize:     [400, 500],
    expandToMin: true,
    gutterSize:  10
})

// define rectangle geographical bounds
var bounds      = [[38.459873-3,    -94.711468-1], [38.459873+3,   -94.711468+1 ]];
var bounds_mask = [[38.459873-2.6,  -94.711468-1], [38.459873+2.6,  -94.711468+1]];
var centerPoint = [38.459873, -94.711468];
var defaultZoomLevel = 4.5;


var map = L.map('mapid1', {zoomSnap: 0.1, zoomDelta: 0.25, zoomControl: false})

registerMap(map, 'map')

activateLayers('map', [
  'states', 
  'counties', 
  'covid_cases_states', 
  'covid_deaths_states',
  'covid_cases_counties',
  'covid_deaths_counties'], true)

registerMapOverlaysGrouped('map', 'covid_cases_states');

map.setView(centerPoint, defaultZoomLevel);

var zoom_bar = new L.Control.ZoomBar({position: 'topleft'}).addTo(map);

promiseParseCovidStateData(layers.covid_cases_states)
.then(function() {
  return promiseParseCountyInfoData();
})
.then(function() {
  return promiseParseCovidCountyData(layers.covid_cases_counties)
})
.then(function() {
  createColorScales('map');
  return promiseAddStateLayer(map, layers.states);  
})
.then(function() {
  return promiseAddCountyLayer(map, layers.counties);
})
.then(function() {
  return promiseAddStateLayer(map, layers.covid_cases_states);  
})
.then(function() {
  return promiseAddStateLayer(map, layers.covid_deaths_states);  
})
.then(function() {
  return promiseAddCountyLayer(map, layers.covid_cases_counties);  
})
.then(function() {
  return promiseAddCountyLayer(map, layers.covid_deaths_counties);  
})
.then(function() {
  addMapLegends('map');

  expandLayerControl('map')

  addInfoPanel('map')

  //uncheckLayer('map', 'covid_cases_counts')

  bubbleCases = bubbleChart();
  bubbleCases.fillColor(function(d,i) {
    return layers.covid_cases_states.getColorForValue(d.value)
  })

  d3.select(".case-stats").classed("hide", false)
  showCaseBubbleChart(currentDate);

  setTimeout(function() {
    showDeathCount(currentDate);
    d3.select(".death-stats").classed("hide", false)
    showDeathWaffleChart(currentDate);

  },3000)
 

})

function onNewDate(date) {
  var formatDate = d3.timeFormat("%Y-%m-%d");
  currentDate = formatDate(date);


  restyleStateLayer(layers.covid_cases_states)
  restyleStateLayer(layers.covid_deaths_states)
  restyleCountyLayer(layers.covid_cases_counties)
  restyleCountyLayer(layers.covid_deaths_counties)

  showCaseBubbleChart(currentDate)
  showDeathCount(currentDate)
} 

function showCaseBubbleChart(date) {
  let selection = d3.select("#bubblechart");
  if (bubbleData == null) {
    bubbleData = Object.keys(stateMap).map(function (key) { 
      return {ID: key, value: (stateMap[key].dates[date] ? stateMap[key].dates[date].cases : 0)}; 
    });     
  } else {
    bubbleData.forEach(function(bubbleRow) {
      stateObject = stateMap[bubbleRow.ID];
      if (stateObject.dates[date]) {
        bubbleRow.value = stateObject.dates[date].cases;
      }
    })
  }
  let totalCases = bubbleData.map(function(d) {
    return +d.value;
  }).reduce(function(total,val) {
    return total + val
  }, 0)
  d3.select("#covid-case-counter").text(d3.format(".3s")(totalCases))

  selection.datum(bubbleData)
  bubbleCases(selection)
}

function showDeathCount(date) {
  let totalDeaths = Object.keys(stateMap).map(function (key) { 
    return stateMap[key].dates[date] ? +stateMap[key].dates[date].deaths : 0; 
  })    
  .reduce(function(total,val) {
    return total + val
  }, 0)

  d3.select("#covid-death-counter").text(d3.format(",")(totalDeaths))

}

function showDeathWaffleChart(date) {

  fillWaffleChart(deathData)  
}
