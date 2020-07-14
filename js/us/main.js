
Split(['#one', '#two'], {
    sizes:       [30, 70],
    minSize:     [320, 500],
    expandToMin: true,
    gutterSize:  5
})




var map = L.map('mapid1', {zoomControl: false, scrollWheelZoom: false})
registerMap(map, 'map')

activateLayers('map', [

  'covid_cases_counties',
  'covid_cases_counties_markers',  

  ], true)

registerMapOverlaysGrouped('map', 'covid_cases_counties');

map.setView(centerPoint, defaultZoomLevel);

var zoom_bar = new L.Control.ZoomBar({position: 'topleft', zoomDelta: .5}).addTo(map);


var timeslider = timeslider()
                  .width(750)
                  .margin({top:28, right:50, bottom:15, left:50})
timeslider(d3.select("#timeslider"));


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
  //return Promise.resolve();
  return promiseAddMarkers(layers.covid_cases_counties_markers);  
})
.then(function() {
  return promiseAddCountyLayer(map, layers.covid_deaths_counties);  
})
.then(function() {
  addMapLegends('map');

  //expandLayerControl('map')

  addInfoPanel('map')

  //uncheckLayer('map', 'covid_cases_counts')

  bubbleChartCases = bubbleChart();
  bubbleChartCases.fillColor(function(d,i) {
    //return "white";
    return layers.covid_cases_states.getColorForValue(d.value)
  })

  dotChartDeaths = dotChart();
  dotChartDeaths.fillColor(function(d,i) {
    return deathColor;
  })

  d3.select(".case-stats").classed("hide", false)
  d3.select(".death-stats").classed("hide", false)

  showCaseCount(currentDate);
  
  getCountsByState(currentDate)
 

})



function onStopTimeline() {
  setTimeout(function(d) {
    showCaseCount(asOfDate);
    showDeathWaffleChart(asOfDate);    
  }, 100)
}

function onTimelineTick(date) {



  if (firstTimePlay) {
    resetLayerStyles(date)
    uncheckAllLayersExcept("map", "Cases by county (circles)")
    checkLayer("map", "covid_cases_counties_markers")
    setTimeout(function() {
      layers["covid_cases_counties_markers"].showLegend(true);
    },1500)
    firstTimePlay = false;
  } else {
    resetLayerStyles(date);
  }
} 
function resetLayerStyles(date) {
  var formatDate = d3.timeFormat("%Y-%m-%d");
  currentDate = formatDate(date);


  theMonth = d3.timeFormat("%b")(date);
  d3.select("#month_display").text(theMonth)


  //restyleStateLayer(layers.covid_cases_states)
  //restyleStateLayer(layers.covid_deaths_states)
  restyleCountyLayer(layers.covid_cases_counties)
  //restyleCountyLayer(layers.covid_deaths_counties)

  //showCaseBubbleChart(currentDate)
  showCaseCount(currentDate)
  showDeathDotChart(currentDate)
  setMarkerSize(layers.covid_cases_counties_markers)

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
  bubbleChartCases(selection)
}

function getCountsByState(date) {

  let countMap = {}

  let stateCounts = Object.keys(stateMap).map(function (key) { 
    if (stateMap[key].dates[date]) { 
      return {key: key, 
        state: stateMap[key].state,
        stateAbbr: stateMap[key].stateAbbr,
        cases: +stateMap[key].dates[date].cases, 
        deaths: +stateMap[key].dates[date].deaths
      }
    } else {
      return null;
    }
  })
 


  stateCounts.forEach(function(stateCount) {
    let counts = countMap[stateCount.key];
    if (counts == null) {
      counts = {cases: 0, deaths: 0, state: stateCount.state, stateAbbr: stateCount.stateAbbr, key: stateCount.key}
      countMap[stateCount.key] = counts;
    }
    counts.cases += stateCount.cases;
    counts.deaths += stateCount.deaths;
  })

  countsByState = Object.keys(countMap).map(function(key) {
    return countMap[key];
  })

  console.log(getRankedStatesByDeath())
}

function getRankedStatesByDeath() {
  return countsByState.sort(function(a,b) {
    if (a.deaths > b.deaths) {
      return -1;
    } else if (a.deaths < b.deaths) {
      return 1
    } else {
      return 0;
    }
  })
}

function getRankedStatesByCases() {
  return countsByState.sort(function(a,b) {
    if (a.cases > b.cases) {
      return -1;
    } else if (a.cases < b.cases) {
      return 1
    } else {
      return 0;
    }
  })
}

function showCaseCount(date) {
  d3.select("#covid-case-counter-header").classed("hide", false)
  let totalCases = Object.keys(stateMap).map(function (key) { 
    return stateMap[key].dates[date] ? +stateMap[key].dates[date].cases : 0; 
  })    
  .reduce(function(total,val) {
    return total + val
  }, 0)
  let totalDeaths = Object.keys(stateMap).map(function (key) { 
    return stateMap[key].dates[date] ? +stateMap[key].dates[date].deaths : 0; 
  })    
  .reduce(function(total,val) {
    return total + val
  }, 0)


  covidDeaths.deaths = totalDeaths;
  covidDeaths.boxes = totalDeaths/deathFactor;
  covidDeaths.capacity =  covidDeaths.boxes + 50;

  d3.select("#covid-case-counter").text(d3.format(".2s")(totalCases))

  d3.select("#covid-death-counter").classed("hide", false)
  d3.select("#covid-death-counter").text(d3.format(",")(totalDeaths))

}

function showDeathDotChart(date) {
  d3.select("#dot-chart").classed("hide", false);
  d3.select(".waffle-chart").classed("hide", true)
  d3.select("#state-death-waffle-chart").classed("hide", true)
  d3.select("#state-death-waffle-header").classed("hide", true)

  let selection = d3.select("#dot-chart");
  deathPoints = [];
  for (var key in stateMap) {
    if (stateMap[key].dates[date]) {
      let deaths = stateMap[key].dates[date].deaths;
      if (deaths < 50) {
        deathPoints.push({ID: key + "-0", value: deathFactor})        
      }
      else {
        let deathsPer50 = deaths / deathFactor
        for (var i = 0; i < deathsPer50; i++) {
          deathPoints.push({ID: key + "-" + i, value: deathFactor})
        }
      }
    }
  }

  selection.datum(deathPoints)
  dotChartDeaths(selection)
}

function showDeathWaffleChart(date) {
  d3.select("#dot-chart").classed("hide", true);
  d3.select("#death-waffle-chart").classed("hide", false)
  fillWaffleChart(deathData, "#death-waffle-chart")  

  setTimeout(function(d) {
    let rankedStates = getRankedStatesByDeath();
    stateDeathData = []
    for (i = 0; i < 5; i++) {
      let deathObject = {
        name: rankedStates[i].state,
        capacity: (rankedStates[0].deaths + 100 )/deathFactor,
        boxes: rankedStates[i].deaths/deathFactor,
        deaths: rankedStates[i].deaths,
        color: deathColor
      };
      stateDeathData.push(deathObject);
    }
    /*
    d3.select("#state-death-waffle-header").classed("hide", false)
    d3.select("#state-death-waffle-chart").classed("hide", false)
    fillWaffleChart(stateDeathData, "#state-death-waffle-chart", false)   
    */   
  }, 6000)


}

function onCheckLayer() {

}



