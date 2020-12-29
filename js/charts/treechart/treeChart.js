function treeChart() {
var margin = {top: 10, right: 50, bottom: 40, left: 10},
  width = 900 - margin.left - margin.right,
  height = 540 - margin.top - margin.bottom;

  var svg = null;
  var tooltip = null; 
 


  let fillColor = function(d) {
    //return "#80b7ff";
    //return  "#92acce";
    return "#FFFFFF";
  }

  let getValue = function(d) {
    return +d['COVID-19 Deaths']
  }
  let getCategory = function(d) {
    return +d['Age group']
  }
  let tooltipFields = []
  let getTooltipHTML = function(d) {
    let buf = ""
    let fields = tooltipFields.length > 0 ? tooltipFields : Object.keys(d);
    fields.forEach(function(key) {
      if (key != 'parent') {
        let label = key[0].toUpperCase() + key.substring(1);
        let value = $.isNumeric(d[key]) ? d3.format(",")(d[key]) : d[key];
        buf += "<div><span class='tooltip-label'>" + label + "</span><span class='tooltip-value'>" + value + "</span></div>"
      }
    })
    return buf;
  }



  let firstTime = true;
  
  function chart(selection) {
    selection.each(function(data) {
      if (svg == null) {
        svg = selection
                .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                .append("g")
                  .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");   
      } else {
        firstTime = false;
      }

      if (tooltip == null) {
        tooltip = d3.select("body").append("div") 
          .attr("class", "tooltip treemap shadow")       
          .style("opacity", 0);
      }

      let min = d3.min(data, function(d) {
        if (d.parent) {
          return getValue(d);
        } else {
          return 99999999;
        }
      })
      let max = d3.max(data, function(d) {
        if (d.parent) {
          return getValue(d);
        } else {
          return 0;
        }
      })
      let colorScale = d3.scaleSequential(d3.interpolateViridis)
        .domain( [max, min])


      var root = d3.stratify()
        .id(function(d) { return getCategory(d) })   // Name of the entity (column name is name in csv)
        .parentId(function(d) { return d.parent; })   // Name of the parent (column name is parent in csv)
        (data);
      root.sum(function(d) { 
            return getValue(d) 
          })   // Compute the numeric value for each entity
          .sort(function (a, b) {
            return b.height - a.height || b.value - a.value;
          });
      // Then d3.treemap computes the position of each element of the hierarchy
      // The coordinates are added to the root object above
      d3.treemap()
        .size([width, height])
        .padding(2)
        (root)

      let duration = 2000;

      let rects = svg
        .selectAll("rect")
        .data(root.leaves(), function(d) {
          return getCategory(d.data)
        })

      rects.exit()
           .style("opacity", 1)
           .transition().duration(duration)
              .style("opacity", 1e-6)
              .remove();

      rects.transition().duration(duration)
          .attr('x', function (d) { return d.x0; })
          .attr('y', function (d) { return d.y0; })
          .attr("width", d => d.x1 - d.x0)
          .attr("height", d => d.y1 - d.y0)
          .style("fill", function(d,i) {
            return colorScale(d.value);
          })  

      rects  
        .enter()
        .append("rect")
          .attr('x', function (d) { return d.x0; })
          .attr('y', function (d) { return d.y0; })
          .attr('width', function (d) { return d.x1 - d.x0; })
          .attr('height', function (d) { return d.y1 - d.y0; })
          .style("stroke", "black")
          .style("fill", function(d,i) {
            return colorScale(d.value);
          })
          .on("mouseover", function(d,i) {
            tooltip.style("opacity", 0)
            let html = getTooltipHTML(d.data) 
            tooltip.html(html)  
            let h = tooltip.node().offsetHeight
            tooltip.style("left", (d3.event.pageX) + "px")   
                  .style("top", ((d3.event.pageY) - h) + "px");  
            tooltip.transition()    
                .duration(1000)    
                .style("opacity", 1);   
          })
          .on("mouseout", function(d,i) {
            tooltip.transition()    
                .duration(1000)    
                .style("opacity", 0); 
          })  
          .transition().duration(duration)
            .style("opacity", 1);

      // and to add the text labels
      let labels = svg
        .selectAll("text.category")
        .data(root.leaves(), d => getCategory(d.data));

      labels.exit().remove()

      labels.transition().duration(duration)
          .attr("class", "category")
          .attr("x", function(d){ return d.x0+10})    // +10 to adjust position (more right)
          .attr("y", function(d){ return d.y0+20})    // +20 to adjust position (lower)
          .text(function(d){ 
            return getCategory(d.data)
          })
          .attr("font-size", function(d) {
            let w = d.x1 - d.x0
            if (w < 50) {
              return "10px"
            } else if (w < 80) {
              return "11px"
            } else if (w < 110) {
              return "12px"
            } else {
              return "13px"
            }
          })
          .attr("fill", function(d) {
            let hsl = d3.hsl(colorScale(d.value))
            if (hsl.l > .49) {
              return "#212121"
            } else {
              return "white"
            }

          })
          .style("pointer-events", "none")

      labels
        .enter()
        .append("text")
          .attr("class", "category")
          .attr("x", function(d){ return d.x0+10})    // +10 to adjust position (more right)
          .attr("y", function(d){ return d.y0+20})    // +20 to adjust position (lower)
          .text(function(d){ 
            return getCategory(d.data)
          })
          .attr("font-size", function(d) {
            let w = d.x1 - d.x0
            if (w < 50) {
              return "10px"
            } else if (w < 80) {
              return "11px"
            } else if (w < 110) {
              return "12px"
            } else {
              return "13px"
            }
          })
          .attr("fill", function(d) {
            let hsl = d3.hsl(colorScale(d.value))
            if (hsl.l > .49) {
              return "#212121"
            } else {
              return "white"
            }

          })
          .style("pointer-events", "none")
          .transition().duration(duration)
            .style("opacity", 1);

      let labelValues = svg
        .selectAll("text.value")
        .data(root.leaves(), d => getCategory(d.data));

      labelValues.exit().remove()

      labelValues.transition().duration(duration)
          .attr("class", "value")
          .attr("x", function(d){ return d.x0+10})    // +10 to adjust position (more right)
          .attr("y", function(d){ return d.y0+35})    // +20 to adjust position (lower)
          .text(function(d){ 
            let h = d.y1 - d.y0
            if (h >= 40) {
              return d3.format(",")(getValue(d.data)) 
            } else {
              return ""
            }
          })
          .attr("font-size", function(d) {
            let w = d.x1 - d.x0
            if (w < 50) {
              return "10px"
            } else if (w < 80) {
              return "11px"
            } else if (w < 110) {
              return "12px"
            } else {
              return "13px"
            }
          })
          .attr("fill", function(d) {
            let hsl = d3.hsl(colorScale(d.value))
            if (hsl.l > .49) {
              return "#212121"
            } else {
              return "white"
            }

          })
          .style("pointer-events", "none")

      labelValues.enter()         
        .append("text")
          .attr("class", "value")
          .attr("x", function(d){ return d.x0+10})    // +10 to adjust position (more right)
          .attr("y", function(d){ return d.y0+35})    // +20 to adjust position (lower)
          .text(function(d){ 
            let h = d.y1 - d.y0
            if (h >= 40) {
              return d3.format(",")(getValue(d.data)) 
            } else {
              return ""
            }
          })
          .attr("font-size", function(d) {
            let w = d.x1 - d.x0
            if (w < 50) {
              return "10px"
            } else if (w < 80) {
              return "11px"
            } else if (w < 110) {
              return "12px"
            } else {
              return "13px"
            }
          })
          .attr("fill", function(d) {
            let hsl = d3.hsl(colorScale(d.value))
            if (hsl.l > .49) {
              return "#212121"
            } else {
              return "white"
            }

          })
          .style("pointer-events", "none")
          .transition().duration(duration)
            .style("opacity", 1);

    })

  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.getValue = function(_) {
    if (!arguments.length) return getValue;
    getValue = _;
    return chart;
  };
  chart.getTooltipHTML = function(_) {
    if (!arguments.length) return getTooltipHTML;
    getTooltipHTML = _;
    return chart;
  };
  chart.tooltipFields = function(_) {
    if (!arguments.length) return tooltipFields;
    tooltipFields = _;
    return chart;
  };
  chart.getCategory = function(_) {
    if (!arguments.length) return getCategory;
    getCategory = _;
    return chart;
  };
  return chart;
}