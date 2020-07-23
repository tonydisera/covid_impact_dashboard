var mapLayers = {
  'map':  {
    map: null, 
    baseMap: {}, 
    layers: [], 
    overlays: {}, 
    baseLayers: {}, 
    control: ""
  }
}

var layers = {
  'states': {
    active: false, 
    overlay: false,
    group: 'Base',
    title: "state",
    file: "./spatial/state.json",
    leafletLayer: null,
    popupFields: {
      'state': 'State'    
    }
  },
  'counties': {
    active: false, 
    overlay: false,
    group: 'Base',
    title: "state",
    file: "./spatial/county.json",
    leafletLayer: null,
    popupFields: {
      'state': 'State',
      'county': 'County'
    }
  },







  'covid_cases_states': {
    title: "Cases",
    dataDate: "2020-06-27",    
    active: false,
    overlay: true,
    title: 'COVID Cases',
    group: 'COVID',
    groupExclusive: true,
    file: "./data/nytimes-us-states.csv",
    leafletLayer: null,
    popupFields: {
      'state': 'State'    
    },
    countField: 'cases',
    dataMap: stateMap,
    getValue: function(stateObject) {
      if (stateObject && stateObject.dates && stateObject.dates[currentDate]) {      
        let val = stateObject.dates[currentDate][layers.covid_cases_states.countField];
        if ( val && val != '' && val != 'NA') {
          return parseInt(val);
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    },
    createColorScale: function() {
      createColorScale('covid_cases_states', 
        [0, maxCasesState], 
        d3.interpolateYlOrRd, .3, 
        'COVID-19 cases',
        10, .1,
        true, false)
    },
  },
  'covid_deaths_states': {
    title: "Cases",
    dataDate: "2020-06-27",    
    active: false,
    overlay: true,
    title: 'COVID Deaths',
    group: 'COVID',
    groupExclusive: true,
    file: "./data/nytimes-us-states.csv",
    leafletLayer: null,
    popupFields: {
      'state': 'State'    
    },
    countField: 'deaths',
    dataMap: stateMap,
    getValue: function(stateObject) {
      if (stateObject && stateObject.dates && stateObject.dates[currentDate]) {      
        let val = stateObject.dates[currentDate][layers.covid_deaths_states.countField];
        if ( val && val != '' && val != 'NA') {
          return parseInt(val);
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    },
    createColorScale: function() {
      createColorScale('covid_deaths_states', 
        [0, maxDeathsState], 
        d3.interpolateReds, 0, 
        'COVID-19 deaths',
        10, .1,
        true, false)
    },
  },






  'covid_cases_counties': {
    dataDate: "2020-06-27",    
    active: false,
    overlay: true,
    title: 'Cases by county',
    group: 'COVID',
    groupExclusive: true,
    file: "./data/nytimes-us-counties.csv",
    leafletLayer: null,
    popupFields: {
      'county': 'County',
      'state': 'State',
      'cases': 'Cumulative cases',
      'deaths': 'Deaths'    
    },
    countField: 'cases',
    dataMap: countyMap,
    getValue: function(countyObject) {
      if (countyObject && countyObject.dates && countyObject.dates[currentDate]) {      
        let val = countyObject.dates[currentDate][layers.covid_cases_counties.countField];
        if ( val && val != '' && val != 'NA') {
          return parseInt(val);
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    },
    createColorScale: function() {
      var data = Object.keys(countyMap).map(function (key) { 
        if (countyMap[key].dates[currentDate]) {
          return +countyMap[key].dates[currentDate][layers.covid_cases_counties.countField]; 
        } else {
          return 0;
        }
      }); 
      var percentile_95 = ss.quantile(data, .95)

      createColorScale('covid_cases_counties', 
        [0, percentile_95], 
        d3.interpolateYlOrRd, .3, 
        'COVID-19 cumulative cases (county)',
        10, .1,
        false, false)
    },
  },

  'covid_deaths_counties': {
    dataDate: "2020-06-27",    
    active: false,
    overlay: true,
    title: 'Deaths by county',
    group: 'COVID',
    groupExclusive: true,
    file: "./data/nytimes-us-counties.csv",
    leafletLayer: null,
    popupFields: {
      'county': 'County',
      'state': 'State',
      'cases': 'Cumulative cases',
      'deaths': 'Deaths'    
    },
    countField: 'deaths',
    dataMap: countyMap,
    getValue: function(countyObject) {
      if (countyObject && countyObject.dates && countyObject.dates[currentDate]) {      
        let val = countyObject.dates[currentDate][layers.covid_deaths_counties.countField];
        if ( val && val != '' && val != 'NA') {
          return parseInt(val);
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    },
    createColorScale: function() {
      var data = Object.keys(countyMap).map(function (key) { 
        if (countyMap[key].dates[currentDate]) {
          return +countyMap[key].dates[currentDate][layers.covid_deaths_counties.countField]; 
        } else {
          return 0;
        }
      }); 
      var maxScale = 220;

      createColorScale('covid_deaths_counties', 
        [0, maxScale], 
        d3.interpolateReds, 0, 
        'COVID-19 deaths by county',
        10, .1,
        true, false)
    },
  },



  'covid_cases_counties_markers': {
    dataDate: "2020-06-27",    
    active: false,
    overlay: true,
    title: 'Cases by county (circles)',
    group: 'COVID',
    groupExclusive: true,
    file: "./data/nytimes-us-counties.csv",
    getRadius: function(value) {
      return value / 10;
    },
    leafletLayer: null,
    popupFields: {
      'county': 'County',
      'countyFips': 'County fips',
      'stateFips': 'State fips'    
    },
    countField: 'cases',
    dataMap: countyMap,
    getValue: function(countyObject) {
      if (countyObject && countyObject.dates && countyObject.dates[currentDate]) {      
        let val = countyObject.dates[currentDate][layers.covid_cases_counties.countField];
        if ( val && val != '' && val != 'NA') {
          return parseInt(val);
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    },
    createColorScale: function() {
      var data = Object.keys(countyMap).map(function (key) { 
        if (countyMap[key].dates[currentDate]) {
          return +countyMap[key].dates[currentDate][layers.covid_cases_counties.countField]; 
        } else {
          return 0;
        }
      }); 
      var percentile_95 = ss.quantile(data, .95)

      createColorScale('covid_cases_counties_markers', 
        [0, percentile_95], 
        d3.interpolateYlOrRd, 0, 
        'COVID-19 cumulative cases at county level',
        10, .1,
        true, false)
    },
    onLegendAdded: function() {

      let layerKey = "covid_cases_counties_markers"

      d3.select(".info.legend."+layerKey).selectAll(".color-legend-row").remove();
      var svg = d3.select(".info.legend."+layerKey).append("svg");

      svg.append("g")
        .attr("class", "legendSize")
        .attr("transform", "translate(10, 34)");

      var legendSize = d3.legendSize()
        .scale(layers.covid_cases_counties_markers.scale)
        .shape('circle')
        .shapePadding(80)
        .shapeWidth(80)
        .labelOffset(10)
        .labelWrap(50)
        .orient('horizontal')
        .labelFormat(".2s")

      svg.select(".legendSize")
        .call(legendSize);
    }

  }  
}

