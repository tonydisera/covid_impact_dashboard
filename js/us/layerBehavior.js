var promiseAddStateLayer = function(map, layer) {
  return new Promise(function(resolve, reject) {

    if (layer.active) {

      function regionStyle(feature) {
        return {
          className: 'region-polygon',
          fillColor: layer.getColor ? layer.getColor(feature.properties.STATEFP) : 'transparent',
          fillOpacity: 1,
          color: '#8c8c8c',
          weight: 1
       };
      }
        
      $.getJSON( layers.states.file, function( json ) {
        L.geoJSON(json, {
          style: regionStyle,
          onEachFeature: function onEachFeature(feature, featureLayer) {
            let state     = feature.properties.NAME;
            let stateFips = feature.properties.STATEFP;
            let stateAbbr = feature.properties.STUSPS;

            let centerPoint = featureLayer.getBounds().getCenter();

            let stateObject = stateMap[stateFips]
            if (stateObject == null) {
              stateObject = {};
              stateMap[stateFips] = stateObject;
            }
            stateObject = $.extend(stateObject, 
              {'stateAbbr': stateAbbr, 
               'state': state, 
               'fips': stateFips,
               'lat': centerPoint.lat,
               'lng': centerPoint.lng,
              }
            )

            featureLayer.on('mouseover', function() {
              this.setStyle({
                color: '#000000',
                weight: 4   
              });
              let state = stateMap[this.feature.properties.STATEFP];
              highlightState(state);
            });
            featureLayer.on('mouseout', function() {
              this.setStyle({
                  color: '#8c8c8c',
                  weight: 1

              });
              removeHighlights();
            });


          }
        }).addTo(layer.leafletLayer);
        resolve();
      });          
    } else {
      resolve();
    }
  })
}

var restyleStateLayer = function(layer) {
  function regionStyle(feature) {
    return {
      className: 'region-polygon',
      fillColor: layer.getColor ? layer.getColor(feature.properties.STATEFP) : 'white',
      fillOpacity: 1,
      color: '#8c8c8c',
      weight: 1
   };
  }
  layer.leafletLayer.eachLayer(function(featureLayer) {
    featureLayer.setStyle(regionStyle)
  })
}

var restyleCountyLayer = function(layer) {
  function regionStyle(feature) {
    return {
      className: 'region-polygon',
      fillColor: layer.getColor ? layer.getColor(feature.properties.STATEFP + feature.properties.COUNTYFP) : 'white',
      fillOpacity: 1,
      color: '#cccccc',
      weight: 1
   };
  }
  layer.leafletLayer.eachLayer(function(featureLayer) {
    featureLayer.setStyle(regionStyle)
  })
}

var promiseAddCountyLayer = function(map, layer) {
  return new Promise(function(resolve, reject) {

    if (layer.active) {

      function regionStyle(feature) {
        return {
          className: 'region-polygon',
          fillColor: layer.getColor ? layer.getColor(feature.properties.STATEFP + feature.properties.COUNTYFP) : 'white',
          fillOpacity: 1,
          color: '#cccccc',
          weight: 1
       };
      }
        
      $.getJSON( layers.counties.file, function( json ) {
        L.geoJSON(json, {
          style: regionStyle,
          onEachFeature: function onEachFeature(feature, featureLayer) {
            let county     = feature.properties.NAME;
            let stateFips  = feature.properties.STATEFP;
            let countyFips = stateFips + feature.properties.COUNTYFP;

            let centerPoint = featureLayer.getBounds().getCenter();

            let countyObject = countyMap[countyFips]
            if (countyObject == null) {
              countyObject = {};
              countyMap[countyFips] = countyObject;
            }
            countyObject = $.extend(countyObject, 
              {'county': county,
               'stateFips': stateFips, 
               'countyFips': countyFips,
               'lat': centerPoint.lat,
               'lng': centerPoint.lng
              }
            )

            featureLayer.on('mouseover', function() {
              this.setStyle({
                color: '#000000',
                weight: 2   
              });
              let county = countyMap[this.feature.properties.STATEFP + this.feature.properties.COUNTYFP];
              highlightCounty(county);
            });
            featureLayer.on('mouseout', function() {
              this.setStyle({
                  color: '#cccccc',
                  weight: 1

              });
              removeHighlights();
            });


          }
        }).addTo(layer.leafletLayer);
        resolve();
      });          
    } else {
      resolve();
    }
  })
}


var promiseAddMarkers = function(layer, hide=false) {
  return new Promise(function(resolve, reject) {

    let data = Object.keys(layer.dataMap).map(function(key) {
      return layer.dataMap[key]
    })
    let maxValue = d3.max(data, function(d, i) {
      return layer.getValue(d)
    })
    if (layer.scale == null) {
      layer.scale = d3.scaleSqrt()
                        .domain([10, maxValue])
                        .range([1, 32]);
    }

    function getRadius(row) {
      let value = layer.getValue(row);
      if (value > 0) {
        return layer.scale(value);
      } else {
        return 0;
      }
    } 
    
    if (layer.active) {
      data.forEach(function(row) {
        if (row.lat  && row.lng) {
          let val = layer.getValue(row);

          var circle = L.circleMarker([row.lat,  row.lng], {
            radius: getRadius(row),
            fillColor: layer.markerColors.fillColor,
            color: layer.markerColors.color,
            weight: 1,
            opacity: (hide ? 0 : (val == 0 ? 0 : .55)),
            fillOpacity: (hide ? 0 : (val == 0 ? 0 : .55)),
            dataObject: row,
          }).addTo(layer.leafletLayer);
        }
      });      
      layer.leafletLayer.eachLayer(function(featureLayer) {
        featureLayer.on('mouseover', function() {
          this.setStyle({
            fillColor: "#ffffff",
            color: layer.markerColors.color,
          });
          highlightCounty(featureLayer.options.dataObject);
        });
        featureLayer.on('mouseout', function() {
          this.setStyle({
            fillColor: layer.markerColors.fillColor,
            color: layer.markerColors.color,
          });
          removeHighlights();
        });

      })      
      resolve();
    } else {
      resolve();
    }
  })
}

var setMarkerSize = function(layer) {

  function getRadius(d) {
    let value = layer.getValue(d.options.dataObject);
    if (value == null || value == 0 || value == '' || +value == 0) {
      return 0;
    } else {
      return layer.scale(value);
    }
  }
  function getOpacity(d) {
    let value = layer.getValue(d.options.dataObject);
    if (value == null || value == 0 || value == '' || +value == 0) {
      return 0;
    } else {
      return .55;
    }
  }
  layer.leafletLayer.eachLayer(function (marker) {      
    marker.setRadius(getRadius(marker));
    opacity = getOpacity(marker)
    marker.setStyle({"opacity": opacity, "fillOpacity": opacity, "strokeOpacity": opacity})
  });    
}

var aggregateMonthlyTotals = function() {
  var monthlyTotals = {};
  let prev = null;
  for (var key in stateMap) {
    let stateObject = stateMap[key];
    let sortedDateKeys = Object.keys(stateObject.dates).sort();
    sortedDateKeys.forEach(function(dateKey) {
      let dateObject  = stateObject.dates[dateKey];
      let month       = dateKey.split("-")[1]
      let year        = dateKey.split("-")[0]
      let monthKey    = year + "-" + month

      if (prev != null && monthKey != prev.monthKey) {
        let monthCases = monthlyTotals[prev.monthKey];
        if (monthCases == null) {
          monthCases = {cases: 0, deaths: 0};
          monthlyTotals[prev.monthKey] = monthCases;
        }

        monthCases.month  = prev.month
        monthCases.year = prev.year
        monthCases.monthKey = prev.monthKey
        monthCases.monthDisplay =  d3.timeFormat("%b")(new Date(prev.date))
        monthCases.cases  += +prev.dateObject.cases;
        monthCases.deaths += +prev.dateObject.deaths;        
      }
      prev = {monthKey: monthKey, year: year, month: month, dateObject: dateObject, date: dateKey}
    })
    let monthCases = monthlyTotals[prev.monthKey];
    if (monthCases == null) {
      monthCases = {cases: 0, deaths: 0, month: prev.month, year: prev.year, monthDisplay: d3.timeParse("%b")(prev.dateObject)};
      monthlyTotals[prev.monthKey] = monthCases;
    }

    monthCases.month    = prev.month
    monthCases.year     = prev.year
    monthCases.monthKey = prev.monthKey
    monthCases.monthDisplay =  d3.timeFormat("%b")(new Date(prev.date))
    monthCases.cases  += +prev.dateObject.cases;
    monthCases.deaths += +prev.dateObject.deaths;        

    prev = null;
  }

  casesByMonth = []; 
  let sortedMonthKeys = Object.keys(monthlyTotals).sort(); 
  sortedMonthKeys.forEach(function(monthKey){
    let monthCases = monthlyTotals[monthKey];
    casesByMonth.push(monthCases);
  })

  casesByMonth[0].casesForMonth = casesByMonth[0].cases;
  casesByMonth[0].deathsForMonth = casesByMonth[0].deaths;
  for (var i = 1; i < casesByMonth.length; i++) {
    let monthCases = casesByMonth[i];
    let prevMonthCases = casesByMonth[i-1]
    monthCases.casesForMonth = monthCases.cases - prevMonthCases.cases;
    monthCases.deathsForMonth = monthCases.deaths - prevMonthCases.deaths;
  }

  for (var i = 0; i < casesByMonth.length; i++) {
    let monthObject = casesByMonth[i]
    let nextMonthObject = null;
    if (i < casesByMonth.length-1) {
      nextMonthObject = casesByMonth[i+1]
    }

    let rows = monthObject.deaths / (deathFactor*WAFFLE_CELLS_PER_ROW);
    let endY = rows * WAFFLE_CELL_SIZE;
    monthObject.endY = endY;
    if (nextMonthObject) {
      nextMonthObject.startY = endY;
    } else {
      monthObject.startY = casesByMonth[i-1].endY;
    }

    if (i == 0) {
      monthObject.startY = 0;
    }
  }


  let totalCases = 0;
  let totalDeaths= 0;
  casesByMonth.forEach(function(a){ 
    totalCases += a.casesForMonth
    totalDeaths += a.deathsForMonth
  })
  console.log(totalCases);
  console.log(totalDeaths);

}

var promiseParseCovidAgeData = function() {
  let ageGroup1 = ['All Ages',
                  '0-17 years',
                  '18-29 years',
                  '30-49 years',
                  '50-64 years',
                  '65-74 years',
                  '75-84 years',
                  '85 years and over'
  ]
  let ageGroup2 = [
                  'All Ages',
                  '1-4 years',
                  '5-14 years',
                  '15-24 years',
                  '25-34 years',
                  '35-44 years',
                  '45-54 years',
                  '55-64 years',
                  '65-74 years',
                  '75-84 years',
                  '85 years and over'
  ]
  return new Promise(function(resolve, reject) {
    d3.csv("https://data.cdc.gov/api/views/9bhg-hcku/rows.csv?accessType=DOWNLOAD").then(function(data) {
     
      deathByAgeData = data.filter(function(row) {
        return row.Sex == 'All Sexes' 
        && row.State == 'United States'
        && row.Group == "By Total"
        && ageGroup2.indexOf(row['Age Group']) >= 0;
      })
      deathByAgeData.forEach(function(row) {
        if (row['Age Group'] == 'All Ages') {
          row.parent = null
        } else {
          row.parent = 'All Ages'
        }
      })
      deathByAgeData.forEach(function(row) {
        if (row['Age Group'] == 'All Ages') {
          row['COVID-19 Deaths'] = 0
        } 
      })
      
      deathByState = data.filter(function(row) {
        return row.Sex == 'All Sexes' 
        && row.Group == "By Total"
        && row['Age Group'] == 'All Ages';
      })
      deathByState.forEach(function(row) {
        if (row['State'] == 'United States') {
          row.parent = null
        } else {
          row.parent = 'United States'
          if (row['State'] == 'New York City') {
            row['State'] = "New York"
          }
        }
      })
      deathByState.forEach(function(row) {
        if (row['State'] == 'United States') {
          row['COVID-19 Deaths'] = 0
        } 
      })

      deathByStateNestedData = d3.nest()
      .key(function(d) { 
        return d.State; 
      })
      .rollup(function(v) { 
        return d3.sum(v, function(d) {
          return +d['COVID-19 Deaths']; 
        })
      })
      .object(deathByState);
      
      deathByStateData = Object.entries(deathByStateNestedData).map(function(d) {
        let covidDeaths = d[1]
        let state = d[0]
        let pop = state != 'United States' ? statePopulationMap[state] : 0;
        let deathPer100K = 0;
        if (pop != 0 && covidDeaths != 0) {
          deathPer100K = Math.round((covidDeaths / pop) * 100000, 0);
        };
        return {'State': state, 'COVID-19 Deaths': covidDeaths, 'parent': state == 'United States' ? null : 'United States', 'population': pop, 'COVID-19 Deaths per 100K': deathPer100K}
      })


      resolve();
    })
  })
}

var promiseParseStatePopulation = function() {
  return new Promise(function(resolve, reject) {
    d3.csv("data/us_state_population.csv").then(function(data) {
      data.forEach(function(d) {
        statePopulationMap[d.state] = +d.population_2019;
      })
      resolve()
    })
  })
}


var promiseParseCovidStateData = function(layer) {
  return new Promise(function(resolve, reject) {
    d3.csv(layer.file).then(function(data) {
      data.forEach(function(row) {
        let stateFips = row.fips;
        let date      = row.date;
        let state     = row.state;
        let cases     = row.cases;
        let deaths    = row.deaths;
        let stateObject = stateMap[stateFips];
        if (stateObject == null) {
          stateObject = {stateFips: stateFips, state: state, dates: {}};
          stateMap[stateFips] = stateObject;
        }
        if (stateObject.dates == null) {
          stateObject.dates = {}
        }
        let dateObject = stateObject.dates[date];
        if (dateObject == null) {
          dateObject = {}
          stateObject.dates[date] = dateObject;
        }
        dateObject.cases = cases;
        dateObject.deaths = deaths;

        if (+cases > maxCasesState) {
          maxCasesState = +cases;
        }
        if (+deaths > maxDeathsState) {
          maxDeathsState = +deaths;
        }    
      })
      resolve();
    })
  })
}

var promiseParseCovidCountyData = function(layer) {
  return new Promise(function(resolve, reject) {
    d3.csv(layer.file).then(function(data) {
      data.forEach(function(row) {
        let countyFips = row.fips;
        let date       = row.date;
        let state      = row.state;
        let county     = row.county;
        let cases      = row.cases;
        let deaths     = row.deaths;
        let countyPop  = 0;

        let countyInfo = countyInfoMap[county];
        if (countyInfo) {
          countyPop  = countyInfo.population;
        }
        if (countyFips == "" ) {
          if (countyInfo) {
            countyFips = countyInfo.us_county_fips;
            countyPop  = $.isNumeric(countyInfo.population) ? +countyInfo.population : 0;
          }
        }
        if (county == 'New York City') {
          countyFips = "36061"
        }

        let countyObject = countyMap[countyFips];
        if (countyObject == null) {
          countyObject = {countyFips: countyFips, state: state, county: county, population: countyPop, dates: {}};
          countyMap[countyFips] = countyObject;
        }
        if (countyObject.dates == null) {
          countyObject.dates = {}
        }
        let dateObject = countyObject.dates[date];
        if (dateObject == null) {
          dateObject = {}
          countyObject.dates[date] = dateObject;
        }
        dateObject.cases = cases;
        dateObject.casesPer100K = Math.round((+cases / +countyPop) * 100000, 0)
        dateObject.deaths = deaths;
        dateObject.deathsPer100K = Math.round((+deaths / +countyPop) * 100000, 0)

        if (+cases > maxCasesCounty) {
          maxCasesCounty = cases;
          maxCounty = countyObject;
        }
        if (+deaths > maxDeathsCounty) {
          maxDeathsCounty = deaths;
        }
        if (date > maxDate) {
          maxDate = date;
        }

      })
      resolve();
    })
  })
}
var promiseParseCountyInfoData = function() {
  return new Promise(function(resolve, reject) {
    d3.json("./data/population.json").then(function(data) {
      data.forEach(function(countyRow) {
        countyInfoMap[countyRow.subregion] = countyRow;
      })
      resolve();
    })
  })

}
var highlightState = function(state) {
  d3.select(".info-panel").classed("hide", false);
  d3.select(".info-panel div").remove();
  let content = d3.select(".info-panel")
                  .append("div")

  var innerHTML = "<div><table class='info-panel-table'>";
  var firstTime = true;
  let layer = layers.states;
  for (var p in layer.popupFields) {
    let val = (state[p] != null ? state[p] : '.');
    innerHTML += (!firstTime ? "<tr class='detail'>" : "<tr>")
      + "<td>"
      + layer.popupFields[p]
      + '</td><td>'
      + val
      + '</td></tr>';
    firstTime = false;
  }
  if (state.dates && state.dates[currentDate]) {
    innerHTML +=  "<tr class='detail'>"
      + "<td>"
      + "Covid cases"
      + '</td><td>'
      + state.dates[currentDate][layers.covid_cases_states.countField]
      + '</td></tr>';
    innerHTML +=  "<tr class='detail'>"
      + "<td>"
      + "Covid deaths"
      + '</td><td>'
      + state.dates[currentDate][layers.covid_deaths_states.countField]
      + '</td></tr>';
  }
  innerHTML += '</table></div>';
  content.html(innerHTML);
}
var highlightCounty = function(county) {
  d3.select(".info-panel").classed("hide", false);
  d3.select(".info-panel div").remove();
  let content = d3.select(".info-panel")
                  .append("div")

  var innerHTML = "<div><table class='info-panel-table'>";
  var firstTime = true;
  let layer = layers.counties;
  for (var p in layer.popupFields) {
    let val = (county[p] != null ? county[p] : '.');
    innerHTML += (!firstTime ? "<tr class='detail'>" : "<tr>")
      + "<td>"
      + layer.popupFields[p]
      + '</td><td>'
      + val
      + '</td></tr>';
    firstTime = false;
  }
  if (county.dates && county.dates[currentDate]) {
    innerHTML +=  "<tr class='detail'>"
      + "<td>"
      + "Covid cases"
      + '</td><td>'
      + d3.format(",")(county.dates[currentDate][layers.covid_cases_counties.countField])
      + '</td></tr>';
    innerHTML +=  "<tr class='detail'>"
      + "<td>"
      + "Covid deaths"
      + '</td><td>'
      + d3.format(",")(county.dates[currentDate][layers.covid_deaths_counties.countField])
      + '</td></tr>';
      /*
    innerHTML +=  "<tr class='detail'>"
      + "<td>"
      + "Covid cases per 100K"
      + '</td><td>'
      + d3.format(",")(county.dates[currentDate]['casesPer100K'])
      + '</td></tr>';
    innerHTML +=  "<tr class='detail'>"
      + "<td>"
      + "Covid deaths per 100K"
      + '</td><td>'
      + d3.format(",")(county.dates[currentDate]['deathsPer100K'])
      + '</td></tr>';
     innerHTML +=  "<tr class='detail'>"
      + "<td>"
      + "Population"
      + '</td><td>'
      + d3.format(",")(county['population'])
      + '</td></tr>'; 
      */
  }
  innerHTML += '</table></div>';
  content.html(innerHTML);
}

var removeHighlights = function() {

  d3.select(".info-panel").classed("hide", true);

}

