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
      arr.push({
        ...item
      })
    }
    return arr
  }, []);


fillWaffleChart = function(theWaffleData, selector, animate=true) {

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

  } else {
    outerGroup.transition()
          .duration(function(d,i) {
            return i*1000;
          })
          .style("opacity", 1)

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
        each: 0.03
      }
    });



    if(!anim.isActive()) {
      anim.play(0);
    }    
  }
}



