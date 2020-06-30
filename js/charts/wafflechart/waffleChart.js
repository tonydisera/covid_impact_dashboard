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


fillWaffleChart = function(theWaffleData) {

  waffleData = theWaffleData;

  const boxes = uncount(waffleData, d => d.boxes);

  let nest = d3
    .nest()
    .key(d => d.name)
    .entries(boxes);

  let graph = d3.select(".waffle-chart");
  

  let group = graph
    .selectAll(".box-container")
    .data(nest)
    .join("div")
    .attr("class", "box-container");

  group
    .append("div")
    .attr("class", "label-container")
    .text(function(d) {
      return d.key;
    })

  group
    .selectAll(".box")
    .data(d => d.values)
    .join("div")
    .attr("class", "box")
    .style("background-color", (d,i) => scaleColor(d.name));




  //intitiate paused animation
  let anim = new TimelineLite({paused: true});
  anim.staggerTo(".box", 1, {
    scale: 1,
    ease: Back.easeOut,
    stagger: {
      grid: "auto",
      from: "start",
      axis: "y",
      each: 0.08
    }
  });



  if(!anim.isActive()) {
    anim.play(0);
  }
}



