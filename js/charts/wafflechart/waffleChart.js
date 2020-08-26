//set up buttons
let waffleData = [];
  

const colors = ["#ffa290", "#FF8E79", "#FF6B5B", "#FF4941", "#DB1D25"];
scaleColor = d3.scaleOrdinal()
  .domain(waffleData.map(d => d.name))
  .range(colors);

uncount = (data, accessor) =>
  waffleData.reduce((arr, item) => {
    const count = accessor(item)
    for (let i = 0; i < count; i++) {
      arr.push(item)
    }
    return arr
  }, []);

fillWaffleChartMonths = function(casesByMonth, containerHeight, theHeight, selector) {
  d3.select(selector).select("svg").remove();

  //h = d3.select(".box-container").node().offsetHeight + 10;

  let svg = d3.select(selector).append("svg")
                                   .attr("height", containerHeight)
                                   .attr("width", 40)
  let group = svg.append("g")
                 .attr("transform", "translate(0," + (+containerHeight - +theHeight) + ")");
  group.selectAll("text")
     .data(casesByMonth)
     .enter()
     .append("text")
     .attr("class", function(d,i) {
        return "death-month " + (i % 2 == 0 ? "alt" : "");
     })
     .attr("x", "10")
     .attr("y", function(d) {
      let midPoint = (d.endY - d.startY) / 2;
      let y = (theHeight - d.startY)  - (midPoint + 1);
      if (y < theHeight) {
        return y;
      } else {
        return theHeight;
      }
     })
     .text(function(d, i) {
      if (d.deaths > 10) {
        return d.monthDisplay
      } else {
        return "";
      }
     })

  group.selectAll("line.vertical")
     .data(casesByMonth)
     .enter()
     .append("line")
     .attr("class", function(d,i) {
        return "death-month vertical " + (i % 2 == 0 ? "alt" : "");
     })
     .attr("x1", "5")
     .attr("x2", "5")
     .attr("y1", function(d) {
      return theHeight - d.startY;
     })
     .attr("y2", function(d) {
      return theHeight - d.endY;
     })
  group.selectAll("line.horizontal")
     .data(casesByMonth)
     .enter()
     .append("line")
     .attr("class", function(d,i) {
        return "death-month horizontal" + (i % 2 == 0 ? "alt" : "");
     })
     .attr("x1", "0")
     .attr("x2", "5")
     .attr("y1", function(d) {
      return (theHeight - d.startY);
     })     
     .attr("y2", function(d) {
      return (theHeight - d.startY);
     })     
     
}


fillWaffleChart = function(theWaffleData, selector, animate=true, 
  casesByMonth, theHeight, monthSelector) {

  waffleData = theWaffleData;
  let selection = d3.select(selector);

  const boxes = uncount(waffleData, d => d.boxes);

  let nest = d3
    .nest()
    .key(d => d.name)
    .entries(boxes);

  let graph = selection;
  
  graph.selectAll(".outer-container").remove();
  graph.selectAll(".box-container").remove();
  graph.selectAll(".label-container").remove();
  graph.selectAll(".count-container").remove();

  let outerGroup = graph.selectAll(".group-container")
                        .data(nest)
                        .join("div")
                        .attr("class", "group-container")
                        .style("opacity", animate ? 1 : 0)

  let labels = outerGroup
    .append("div")
    .attr("class", "label-container")
    .text(function(d) {
      return d.key;
    })
    .style("opacity", animate ? 0 : 1 )

  let group = outerGroup
    .append("div")
    .attr("class", "box-container")


  group
    .selectAll(".box")
    .data(function(d)  {
      return d.values
    })
    .join("div")
    .attr("class", "box")
    //.style("background-color", (d,i) => scaleColor(d.name));
    .style("background-color", d => d.color)

  let counts = group
    .append("div")
    .attr("class", "count-container")
    .text(function(d) {
      return d3.format(",")(d.values[0].deaths);
    })
    .style("opacity",  animate ? 0 : 1 )


  if (animate) {
    counts.transition()
          .delay(5000)
          .style("opacity", 1)

    labels.transition()
          .duration(function(d,i) {
            return i*1000;
          })
          .style("opacity", 1)

    let containerHeight = $(".box-container").outerHeight();
    setTimeout(function() {
        fillWaffleChartMonths(casesByMonth, containerHeight, theHeight, monthSelector);
    }, 5000);

  } else {
    outerGroup.transition()
          .duration(function(d,i) {
            return i*1000;
          })
          .style("opacity", 1)
    let containerHeight = $(".box-container").outerHeight();
    fillWaffleChartMonths(casesByMonth, containerHeight, theHeight, monthSelector);
  }



  //intitiate paused animation
  if (animate) {
    let anim = new TimelineLite({paused: true});
    anim.staggerTo(selector + " .box", 1, {
      scale: 1,
      ease: Back.easeOut,
      stagger: {
        grid: "auto",
        from: "start",
        axis: "y",
        each: 0.02
      }
    });



    if(!anim.isActive()) {
      anim.play(0);
    }    
  }
}



