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


var promiseAddMarkers = function(layer) {
  return new Promise(function(resolve, reject) {

    let data = Object.keys(layer.dataMap).map(function(key) {
      return layer.dataMap[key]
    })
    let maxValue = d3.max(data, function(d, i) {
      return layer.getValue(d)
    })
    if (layer.scale == null) {
      layer.scale = d3.scaleLinear().domain([1, maxValue]).range([2,25])
      layer.scaleQuantile = d3.scaleQuantize()
                              .domain([1, maxValue])
                              .range([2,5,10,25])
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
            fillColor: "#ff6666",
            color: "#e63939",
            weight: 1,
            opacity: 1,
            fillOpacity: .6,
            dataObject: row,
          }).addTo(layer.leafletLayer);



        }

        resolve();
      });      
    } else {
      resolve();
    }
  
    
    
  })
}

var setMarkerSize = function(layer) {

  function getRadius(d) {
    let value = layer.getValue(d.options.dataObject);
    if (value == 0) {
      return 0;
    } else {
      return layer.scale(value);
    }
  }
  layer.leafletLayer.eachLayer(function (marker) {      
    marker.setRadius(getRadius(marker));
  });    
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

        if (countyFips == "" ) {
          let countyInfo = countyInfoMap[county];
          if (countyInfo) {
            countyFips = countyInfo.us_county_fips;
          }
        }
        if (county == 'New York City') {
          countyFips = "36061"
        }

        let countyObject = countyMap[countyFips];
        if (countyObject == null) {
          countyObject = {countyFips: countyFips, state: state, county: county, dates: {}};
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
        dateObject.deaths = deaths;

        if (+cases > maxCasesCounty) {
          maxCasesCounty = cases;
          maxCounty = countyObject;
        }
        if (+deaths > maxDeathsCounty) {
          maxDeathsCounty = deaths;
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
      + county.dates[currentDate][layers.covid_cases_counties.countField]
      + '</td></tr>';
    innerHTML +=  "<tr class='detail'>"
      + "<td>"
      + "Covid deaths"
      + '</td><td>'
      + county.dates[currentDate][layers.covid_deaths_counties.countField]
      + '</td></tr>';
  }
  innerHTML += '</table></div>';
  content.html(innerHTML);
}

var removeHighlights = function() {

  d3.select(".info-panel").classed("hide", true);

}

