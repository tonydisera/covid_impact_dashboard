var registerMapDeprecated = function(map, mapName) {
  let mapObject = mapLayers[mapName]
  mapObject.map = map;

  mapObject.baseMap = L.tileLayer(
    mapObject.baseTileUrl, 
    mapObject.baseTileOptions).addTo(map);
}

var registerMap = function(map, mapName) {

  let mapObject = mapLayers[mapName]
  mapObject.map = map;

  var CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  });

  CartoDB_Positron.addTo(map)
}

var addMinimap = function(mapName, zoomLevel) {
  let mapObject = mapLayers[mapName]
  var osm2 = L.tileLayer(
    mapObject.minimapBaseTileUrl,
    mapObject.minimapBaseTileOptions);
  var miniMap = new L.Control.MiniMap(osm2, { toggleDisplay: true, zoomLevelFixed: zoomLevel }).addTo(mapObject.map);   
}

var activateLayers = function(mapName, layerNames, activate=true) {
  let mapObject = mapLayers[mapName];
  if (mapObject) {
    layerNames.forEach(function(layerName) {
      if (layers[layerName]) {
        layers[layerName].active =  activate;  
        if (activate) {
          mapObject.layers.push(layerName)
        }
      }
    })    
  }
}

var uncheckLayers = function(mapName, layerNames) {
  let mapObject = mapLayers[mapName];
  if (mapObject) {
    layerNames.forEach(function(layerName) {
      let layer = layers[layerName];
      mapObject.map.removeLayer(layer.leafletLayer)
      if (layer.showLegend) {
        layer.showLegend(false)
      }
    })
  }
}

var uncheckLayer = function(mapName, layerName) {
  let mapObject = mapLayers[mapName];

  let layer = layers[layerName];

  mapObject.map.removeLayer(layer.leafletLayer)
  if (layer.showLegend) {
    layer.showLegend(false)
  }
}

var uncheckAllLayersExcept = function(mapName, layerDisplayName) {
  let mapObject = mapLayers[mapName];

  let layerToShow = getLayerByDisplayName(layerDisplayName);

  if (mapObject && mapObject.map) {
    mapObject.layers.forEach(function(layerName) {
      let layer = layers[layerName];
      if (layer.title != layerDisplayName) { 
        if (!layerToShow.groupExclusive && layerToShow.group == layer.group) {

        } else if (layer.hasOwnProperty('groupExclusive') && !layer.groupExclusive) {

        } else if (layerToShow.hasOwnProperty('groupExclusive') && !layerToShow.groupExclusive) {

        } else {
          mapObject.map.removeLayer(layer.leafletLayer)
          if (layer.showLegend) {
            layer.showLegend(false)
          }
        }
      }
    })
  }


  let groupIdx = 0;
  for ( let group in groupedOverlays) {
    $("#leaflet-control-layers-group-" + groupIdx + " label>span")
    .each(function(i,d) { 
      if (i > 0) {
        let displayNameStr = $(this).text().substr(1);
        let displayName = displayNameStr.substr(0,displayNameStr.length-10)
        let theLayer = getLayerByDisplayName(displayName)
        if (layerDisplayName != displayName && theLayer) {
          if (!layerToShow.groupExclusive && layerToShow.group == theLayer.group) {

          } else if (theLayer.hasOwnProperty('groupExclusive') && !theLayer.groupExclusive) {

          } else if (layerToShow.hasOwnProperty('groupExclusive') && !layerToShow.groupExclusive) {

          } else {
            let checkboxes = $(this).prev();
            for (var cidx = 0; cidx < checkboxes.length; cidx++) {
              checkboxes[cidx].checked = false;
            }                    
          }
        }
      } 
    })
    groupIdx++;
  }

  /*
  if (mapObject && mapObject.map) {
    mapObject.layers.forEach(function(layerName) {
      let layer = layers[layerName];
      if (layer.title != layerDisplayName) {
        if (layer.showLegend) {
          layer.showLegend(false)
        }        
      }
    })
  }
  */


}

var registerMapOverlaysGrouped = function(mapName, defaultLayerName) {
  let mapObject = mapLayers[mapName];

  groupedOverlays = {}

  let options = {
    exclusiveGroups: []
  }

  let defaultLayer = layers[defaultLayerName];


  mapObject.layers.forEach(function(layerName) {
    let layer = layers[layerName];
    if (layer.active) {
      layer.leafletLayer = L.layerGroup( null, {layerName: layerName});
      if (layer.overlay) {
        mapObject.overlays[layer.title] = layer.leafletLayer;
        layer.leafletLayer.addTo(mapObject.map)

        let overlays = groupedOverlays[layer.group];
        if (overlays == null) {
          overlays = {};
          groupedOverlays[layer.group] = overlays;
        }
        overlays[layer.title] = layer.leafletLayer;
      }
    }
  })

  for (let group in groupedOverlays) {
    let isExclusiveGroup = true;
    let overlayObject = groupedOverlays[group];
    for (let layerDisplayName in overlayObject) {
      let layer = getLayerByDisplayName(layerDisplayName)
      if (layer.hasOwnProperty('groupExclusive') && !layer.groupExclusive) {
        isExclusiveGroup = false;
      }
    }
    if (isExclusiveGroup) {
      options.exclusiveGroups.push(group)
    }
  }

  mapObject.baseLayers['map'] = {
    "map": mapObject.baseMap
  };


  mapObject.layerControl = L.control.groupedLayers(null, groupedOverlays, options ).addTo(mapObject.map);


  mapObject.map.on('overlayadd', function(e) {
    showMapLegends(e.layer.options.layerName, true)
    uncheckAllLayersExcept('map', e.name)
  });

  mapObject.map.on('overlayremove', function(e) {
    showMapLegends(e.layer.options.layerName, false);
  });

  setTimeout(function() {
    uncheckAllLayersExcept('map', defaultLayer.title)
  },1000)
}

var expandLayerControl = function(mapName) {
  let mapObject = mapLayers[mapName];
  if (mapObject.layerControl) {
    mapObject.layerControl._expand();
    
  }
}

var registerMapOverlays = function(mapName) {
  let mapObject = mapLayers[mapName];

  mapObject.layers.forEach(function(layerName) {
    let layer = layers[layerName];
    if (layer.active) {
      layer.leafletLayer = L.layerGroup( null, {layerName: layerName});
      if (layer.overlay) {
        mapObject.overlays[layer.title] = layer.leafletLayer;
      }
    }
  })

  mapObject.baseLayers['map'] = {
    "map": mapObject.baseMap
  };

  mapObject.control = L.control
    .layers(null, mapObject.overlays, {collapsed:false, autoZIndex: true, hideSingleBase: true})
    .addTo(mapObject.map);

  mapObject.layers.forEach(function(layerName) {
    let layer = layers[layerName];
    if (layer.active) {
      layer.leafletLayer.addTo(mapObject.map);
    }
  })



  mapObject.map.on('overlayadd', function(e) {
    uncheckAllLayers()
    showMapLegends(e.layer.options.layerName, true)
  });

  mapObject.map.on('overlayremove', function(e) {
    showMapLegends(e.layer.options.layerName, false);
  });



}

var createColorScales = function(mapName) {

  let mapObject = mapLayers[mapName];

  // Add  color scales
  mapObject.layers.forEach(function(layerName) {
    let layer = layers[layerName];
    if (layer.active && layer.createColorScale) {
      layer.createColorScale();
    }
  })

}

var addMapLegends = function(mapName) {

  let mapObject = mapLayers[mapName];

  // Add legends 
  mapObject.layers.forEach(function(layerName) {
    let layer = layers[layerName];
    if (layer.active && layer.addLegend) {
      layer.addLegend(mapObject.map);
    }
  })

}

var showMapLegends = function(layerName, show) {
  let layer = layers[layerName];
  if (layer && layer.showLegend) {
    layer.showLegend(show);
  }
}

var getLayerByDisplayName = function(displayName) {
  let theLayer = null;
  for (let key in layers) {
    let layer = layers[key];
    if (layer.title == displayName) {
      theLayer = layer;
    }
  }
  return theLayer;
}

var addInfoPanel = function(mapName) {
  let mapObject = mapLayers[mapName]
  if (mapObject) {
    var infoPane = L.control({position: 'bottomleft'});

    infoPane.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'info legend info-panel hide');
      div.innerHTML = "<div class='info-header '>" + 'information goes here' + "</div>";
      return div;
    };
    infoPane.addTo(mapObject.map);    

  }
} 
function createColorScale(layerKey, domain, interpolater, darkenStep, 
  legendTitle, steps=10, interval=.1, hideAddedLegend=true, invertScale=false, numberFormat) {
  let layer = layers[layerKey];

  let roundFactor = 10;
  
  let cs = d3.scaleSequential(interpolater)
        .domain(invertScale ? [steps, 0] : [0, steps])
  let colorRange = [];
  let thresholds = [];
  let legendValues = [];
  for (let i = 0; i < steps; i++) {
    colorRange.push(cs(i))

    let th = interval*(i+1);
    thresholds.push(Math.round(th * roundFactor) / roundFactor)
    
    let legend_th = interval*(i);
    legendValues.push(Math.round(legend_th * roundFactor) / roundFactor)
  }
  layer.colorScale = d3.scaleThreshold()
      .domain(thresholds)
      .range(darkenScheme(colorRange, darkenStep))
  layer.xScale = d3.scaleLinear()
                 .domain(domain)
                 .range([0, 1])

  layer.getScaledValue = function(d) {
    let val = layer.getValue(d);
    if (val) {
      return layer.xScale(val)
    } else {
      return null;
    }
  }

  layer.getColor = function(key) {
    let dataObj = layer.dataMap[key]
    if (dataObj) {
      let scaledValue = layer.getScaledValue(dataObj);
      if (scaledValue) {
        return layer.colorScale(scaledValue)
      } else {
        return 'transparent';
      }        
    } else {
      return 'transparent';
    }
  };

  layer.getColorForValue = function(val) {
    let scaledValue = layer.xScale(val);
    if (val != null) {
      return layer.colorScale(scaledValue)
    } else {
      return 'transparent';
    }
  };    

  layer.showLegend = function(show) {
    if (d3.select(".legend." + layerKey).node()) {
      d3.select(".legend." + layerKey ).classed('hide', !show);
    }
  }
  layer.addLegend = function(theMap) {
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {
      
      var div = L.DomUtil.create('div', 'info legend ' 
        + layerKey + ' ' + (hideAddedLegend ? 'hide' : ''));
      div.innerHTML = "<div class='legend-header '>" + legendTitle + "</div>";
      for (var i = 0; i < legendValues.length; i++) {
        //let lower = d3.format(",.0~s")(Math.round(layer.xScale.invert(legendValues[i]),0));
        //let upper = d3.format(",.0~s")(Math.round(layer.xScale.invert(legendValues[i+1]),0));
        
        let lower = null;
        let upper = null;
        if (numberFormat) {
          lower = d3.format(numberFormat)(layer.xScale.invert(legendValues[i]));
          upper = d3.format(numberFormat)(layer.xScale.invert(legendValues[i+1]));
        } else {
          lower = d3.format(",.2~s")(Math.round(layer.xScale.invert(legendValues[i]),0));
          upper = d3.format(",.2~s")(Math.round(layer.xScale.invert(legendValues[i+1]),0));
        }
        div.innerHTML +=
            "<div class='color-legend-row'>"
            + '<i style="opacity:1;background:' 
            + layer.colorScale(legendValues[i]) 
            + '"></i> '
            + "<span class='color-legend-range'>"
            + lower
            + (legendValues[i + 1] ? '&nbsp;&nbsp;&ndash;&nbsp;&nbsp;' 
              + 
              upper
              + "  " : '+')
            + '</span>'
            + "<span class='color-legend-percentile'>" + legendValues[i] + '</span>'
            + '</div>';
      }
      return div;
    };
    legend.addTo(theMap);    
  };  

}

function createHistogram(layerKey,  yLabel,
  width=310, height=110, 
  margin={top: 15, bottom: 30, left: 40, right: 30}, 
  numberOfBins=15, logXAxis=true) {

  let layer = layers[layerKey];

  layer.showHistogram = function(show) {
    d3.select("#chart_" + layerKey).classed("hide", !show);
  }

  layer.addHistogram = function() {
    var theData = Object.keys(layer.dataMap).map(function (key) { 
      return layer.dataMap[key]; 
    }); 

    let summary_total = d3.sum(theData, function(d) {
      let val = layer.getValue(d);
      return val != 'NA' && val != '' ? val : 0;
    })
    d3.select("#chart_" + layerKey + 
      " .chart-summary-stat-value.total").text(d3.format(",")(summary_total));

    // Histogram showing total cropland (ha)
    let selection = d3.select("#histogram_"+ layerKey);

    addChartTitleDataDate("#chart_" + layerKey, layer);

    layer.histChart = histogram();
    layer.histChart.width(width)
             .height(height)
             .margin(margin)
             .numberOfBins(numberOfBins)
             .yLabel(yLabel)
             .fillColor(function(d) {
                return layer.getColorForValue(d);
             })              
             
    layer.histChart.xValue(function(d) {
      return layer.getValue(d);
    })
    layer.histChart.showAxis(true)
    selection.datum(theData)
    layer.histChart(selection);
    d3.select("#chart_" + layerKey).classed("hide", false)

    if (logXAxis) {
      addHistogramCheckbox("#chart_" + layerKey, "#histogram_" + layerKey, layer.histChart);
    }
  }

  layer.addHistogram()

}
