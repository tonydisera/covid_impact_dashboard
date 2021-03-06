$( document ).ready(function() {
  if (inIframe()) {

    setTimeout(function() {
      init();
    }, 500);

  } else {    
    init();
  }
});

function inIframe () {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

function onDeathPerCapita() {
  d3.select("#deathByStateModal #button-death-per-capita").classed("hide", true)
  d3.select("#deathByStateModal #button-total-death").classed("hide", false)
  d3.select("#deathByStateModal .modal-title").text("U.S. COVID-19 deaths (per 100K) by state")
  treeChartDeathsByState.getValue(function(d) {
    return d['COVID-19 Deaths per 100K']
  })

  //d3.select("death-by-state-chart-container").classed("hide", false)
  let selection = d3.select("#death-by-state-chart-container")
                    .datum(deathByStateData);

  treeChartDeathsByState(selection)
}

function onDeathTotal() {
  d3.select("#deathByStateModal #button-death-per-capita").classed("hide", false)
  d3.select("#deathByStateModal #button-total-death").classed("hide", true)
  d3.select("#deathByStateModal .modal-title").text("U.S. COVID-19 deaths (total) by state")
  treeChartDeathsByState.getValue(function(d) {
    return d['COVID-19 Deaths']
  })
  
  //d3.select("death-by-state-chart-container").classed("hide", false)
  let selection = d3.select("#death-by-state-chart-container")
                    .datum(deathByStateData);

  treeChartDeathsByState(selection)
}

var dataSourcesContent =  '<div id="data-credits" class="hide">' +
        '<div> ' +
          'COVID-19 Data from <a href="https://github.com/nytimes/covid-19-data">NY Times</a>' +
        '</div>' +
        '<div>' +
        'Deaths other events from <a href="https://time.com/5815367/coronavirus-deaths-comparison">Time article</a>' +
        '</div>'+
      '</div> "';


function init() {


  d3.select('body').classed("mobile", isMobileOrTablet())

  $('#data-sources-popover').popover({
    html: true,
    content: function() {
      var content = $(this).attr("data-popover-content");
      return $(content).children(".popover-body").html();
    }
  })
  
  promiseParseStatePopulation()
  .then( function() {
    return promiseParseCovidStateData(layers.covid_cases_states)
  })
  .then(function() {
    return promiseParseCovidAgeData();
  })
  .then(function() {
    return promiseParseCountyInfoData();
  })
  .then(function() {
    return promiseParseCovidCountyData(layers.covid_cases_counties)
  })
  .then(function() {
    currentDate = maxDate;

    aggregateMonthlyTotals();

    
    map = L.map('mapid1', {zoomControl: false, scrollWheelZoom: false,  zoomSnap: 0.1})
    registerMap(map, 'map')

    activateLayers('map', [

      'covid_cases_counties_markers', 
      'covid_cases_counties',      
      'covid_deaths_counties_markers', 

      ], true)

    registerMapOverlaysGrouped('map', 'covid_cases_counties_markers');

    map.setView(centerPoint, defaultZoomLevel);

    var zoom_bar = new L.Control.ZoomBar({position: 'bottomleft', zoomDelta: .1}).addTo(map);

    createColorScales('map');


    timeslider = timeslider()
                  .width(isMobileOrTablet? 450 : 600)
                  .height(30)
                  .margin({top:18, right:10, bottom:15, left:18})
    timeslider(d3.select("#timeslider"));

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
    return promiseAddMarkers(layers.covid_cases_counties_markers, true);  
  })
  .then(function() {
    return promiseAddCountyLayer(map, layers.covid_deaths_counties);  
  })
  .then(function() {
    //return Promise.resolve();
    return promiseAddMarkers(layers.covid_deaths_counties_markers);  
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

    treeChartDeathsByAge = treeChart();
    treeChartDeathsByAge.getCategory(function(d) {
      return d['Age Group']
    })
    .margin({top: 10, right: 80, bottom: 40, left: 10})
    .tooltipFields(["Age Group", "COVID-19 Deaths", "Total Deaths", 
      "Pneumonia Deaths", "Pneumonia and COVID-19 Deaths", 
      "Influenza Deaths", "Pneumonia, Influenza, or COVID-19 Deaths"]
    )
    treeChartDeathsByState = treeChart();
    treeChartDeathsByState.getCategory(function(d) {
      return d['State']
    })
    treeChartDeathsByState.getValue(function(d) {
      return d['COVID-19 Deaths']
    })
    .tooltipFields( ["State", "COVID-19 Deaths","COVID-19 Deaths per 100K",  "population", ])

    d3.select(".case-stats").classed("hide", false)
    d3.select(".death-stats").classed("hide", false)

    showCaseCount(currentDate);

    let theMonth = d3.timeFormat("%b %d %Y")(Date.parse(currentDate + "T12:00:00"));
    d3.select("#month_display").text(theMonth);


    getCountsByState(currentDate)
   
    setTimeout(function(d) {
      d3.select("#timeslider").classed("hide", false);
    }, 1000)

    d3.select("#loading-spinner").classed("hide", true)

  })


}


  


function onStopTimeline(date) {
  resetLayerStyles(date)
  showCaseCount(maxDate);

  let theMonth = d3.timeFormat("%b %d %Y")(Date.parse(currentDate + "T12:00:00"));
  d3.select("#month_display").text(theMonth);
  setTimeout(function(d) {    
    showDeathWaffleChart(maxDate); 

    setTimeout(function(d) {
      uncheckAllLayersExcept("map", "Deaths by county (circles)")
      checkLayer("map", "covid_deaths_counties_markers")
      setTimeout(function() {
        layers["covid_deaths_counties_markers"].showLegend(true);
      },1500)
    }, 7000)   
  }, 2000)
}

function onPlay() {

  uncheckAllLayersExcept("map", "Cases by county (circles)")
  checkLayer("map", "covid_cases_counties_markers")
  setTimeout(function() {
    layers["covid_cases_counties_markers"].showLegend(true);
  },1500)

}

function onTimelineTick(date) {
  resetLayerStyles(date);
} 
function resetLayerStyles(date) {
  var formatDate = d3.timeFormat("%Y-%m-%d");
  currentDate = formatDate(date);


  let theMonth = d3.timeFormat("%B %Y")(date);
  d3.select("#month_display").text(theMonth)


  //restyleStateLayer(layers.covid_cases_states)
  //restyleStateLayer(layers.covid_deaths_states)
  restyleCountyLayer(layers.covid_cases_counties)
  //restyleCountyLayer(layers.covid_deaths_counties)

  //showCaseBubbleChart(currentDate)
  showCaseCount(currentDate)
  showDeathDotChart(currentDate)
  setMarkerSize(layers.covid_cases_counties_markers)
  //setMarkerSize(layers.covid_deaths_counties_markers)

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

  //console.log(getRankedStatesByDeath())
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
  d3.select("#death-waffle-months").classed("hide", true)
  d3.select("#state-death-waffle-chart-container").classed("hide", true)
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
  d3.select("#death-waffle-chart-container").classed("hide", false)
  d3.select("#death-waffle-chart").classed("hide", false)
 

  let height = (covidDeaths.boxes/WAFFLE_CELLS_PER_ROW)*WAFFLE_CELL_SIZE

  fillWaffleChart(deathData, "#death-waffle-chart", true,
      casesByMonth, height, "#death-waffle-months")  

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

function showDeathByAgeChart() {
  $('#deathByAgeModal').modal('show')
  d3.select("#dot-chart").classed("hide", true);
  d3.select("#death-waffle-chart-container").classed("hide", true)
  d3.select("#death-waffle-chart").classed("hide", true)

  setTimeout(function() {
    d3.select("death-by-age-chart-container").classed("hide", false)
    let selection = d3.select("#death-by-age-chart-container")
                      .datum(deathByAgeData);

    treeChartDeaths(selection)

  }, 2000)

}

function showDeathByAgeChart() {
  $('#deathByAgeModal').modal('show')
  d3.select("#death-by-age-chart-container").classed("hide", false)
  let selection = d3.select("#death-by-age-chart-container")
                    .datum(deathByAgeData);

  treeChartDeathsByAge(selection)
}

function showDeathByStateChart() {
  $('#deathByStateModal').modal('show')
  d3.select("#death-by-state-chart-container").classed("hide", false)
  let selection = d3.select("#death-by-state-chart-container")
                    .datum(deathByStateData);

  treeChartDeathsByState(selection)
}

function onCheckLayer() {

}


function onCheckLayer() {

}



