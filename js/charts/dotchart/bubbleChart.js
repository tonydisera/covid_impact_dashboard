function bubbleChart() {
  var w = 500, h = 300;
  
  var radius = 6;
  var centerScale = d3.scalePoint().padding(1).range([0, w]);
  var forceStrength = 0.5;

  var svg = null;

  var simulation = null;

  let circleScale = null;

  let fillColor = function(d) {
    return 'white';
  }

  let firstTime = true;
  
  function chart(selection) {
    selection.each(function(data) {


      if (svg == null) {
        let max = d3.max(data, function(d) {
          return +d.value
        })
        circleScale = d3.scaleLinear()
                            .domain([0,max])
                            .range([2, 70])
                            .nice()              



        svg = selection.append("svg")
          .attr("width", w)
          .attr("height", h)     

        simulation = d3.forceSimulation()
          .force('collision', d3.forceCollide().radius(function(d) {
            return d.r + 1
          }).iterations(4))

          .force('charge', d3.forceManyBody().strength(5))
          .force('center', d3.forceCenter(w / 2, h / 2))
          

      } else {
        firstTime = false;
      }


      data.forEach(function(d){
        if (!d.r) {
          d.x = w / 2;
          d.y = h / 2;          
        }
        d.r = circleScale(+d.value);
        
      })

      var circles = svg.selectAll("circle")
        .data(data, function(d){ return d.ID ;});
      
      var circlesEnter = circles.enter().append("circle")
        .attr("r", function(d, i){ return d.r; })
        .attr("cx", function(d, i){ return 0 })
        .attr("cy", function(d, i){ return 0 })
        .style("fill", fillColor )
        .style("opacity", function(d, i){ return 1; })
        .style("stroke", function(d, i){ return "gray"; })
        .style("stroke-width", 1)
        .style("pointer-events", "all");
    
      circles = circles.merge(circlesEnter)

      circles.attr("r", function(d, i){ return d.r; })
      
      function ticked() {
        circles
            .attr("cx", function(d){ return d.x; })
            .attr("cy", function(d){ return d.y; });
      }   

      simulation
            .nodes(data)
            .on("tick", ticked);

      // @v4 Reset the 'x' force to draw the bubbles to the center.
      if (firstTime) {
        simulation.force('x', d3.forceX().strength(forceStrength).x(w / 2));
        simulation.force('y', d3.forceY().strength(forceStrength).y(h / 2));
        // @v4 We can reset the alpha value and restart the simulation
        simulation.alpha(.75).restart();

      } else {
        simulation.alpha(.05).restart();

      }
      

    })

  }

  chart.fillColor = function(_) {
    if (!arguments.length) return fillColor;
    fillColor = _;
    return chart;
  };

  return chart;
}