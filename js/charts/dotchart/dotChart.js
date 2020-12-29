function dotChart() {
  var w = 200, h = 570;
  

  var svg = null;


  let fillColor = function(d) {
    //return "#80b7ff";
    //return  "#92acce";
    return "#FFFFFF";
  }

  let firstTime = true;
  
  function chart(selection) {
    selection.each(function(data) {
      if (svg == null) {
        let max = d3.max(data, function(d) {
          return +d.value
        })
        svg = selection.append("svg")
          .attr("width", w)
          .attr("height", h)     
      } else {
        firstTime = false;
      }


      var cellSize = 8;
      var cellPadding = 1;
      var cols = Math.floor((w) / (cellSize + cellPadding));
      var r = 0;
      var c = 0;
      data.forEach(function(d) {
        d.row = r;
        d.col = c;
        if (c == cols - 1 ) {
          c = 0;   
          r++;       
        } else {
          c++;
        }
      })
     


      var rects = svg.selectAll("rect")
        .data(data);
      
      var rectsEnter = rects.enter().append("rect")
        .attr("width", function(d, i){ return cellSize; })
        .attr("height", function(d, i){ return cellSize; })
        .attr("x", function(d, i){ return d.col * (cellSize + cellPadding) })
        .attr("y", function(d, i){ return h - ((d.row+1) * (cellSize + cellPadding)) })
        .style("fill", fillColor )
        .style("opacity", function(d, i){ return 0; })
        .style("stroke", function(d, i){ return "rgb(21,21,21)"; })
        .style("stroke-width", .5)
        .style("pointer-events", "all");
    
      rectsEnter = rects.merge(rectsEnter)

      rects.exit().remove();

      //rects.attr("r", function(d, i){ return d.r; })
     
      rectsEnter
        .transition()
        .ease(d3.easeLinear)
        .delay(function(d, i) { return (i) * .5; })
        .style("opacity", "1")

    })

  }

  chart.fillColor = function(_) {
    if (!arguments.length) return fillColor;
    fillColor = _;
    return chart;
  };

  return chart;
}