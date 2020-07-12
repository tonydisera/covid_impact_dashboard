function timeslider() {

  var formatDateIntoYear = d3.timeFormat("%m-%d");
  var formatDate = d3.timeFormat("%b %d %Y");
  var parseDate = d3.timeParse("%m/%d/%y");

  var startDate = new Date("2020-03-13"),
      endDate = new Date(asOfDate);

  var margin = {top:0, right:50, bottom:10, left:50},
      width  = 800,
      height = 20;

  var moving = false;
  var currentValue = 0;
  var targetValue = null;

  ////////// slider //////////
  function chart(selection) {
    selection.each(function(data) {

      var svg = selection.select(".timeslider-chart")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom);  

      var playButton = selection.select("#play-button");

      let innerWidth = width - margin.left - margin.right;
      let innerHeight = height - margin.top - margin.bottom;
      targetValue = innerWidth;
          
      var x = d3.scaleTime()
          .domain([startDate, endDate])
          .range([0, targetValue])
          .clamp(true);

      var slider = svg.append("g")
          .attr("class", "slider")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      slider.append("line")
          .attr("class", "track")
          .attr("x1", x.range()[0])
          .attr("x2", x.range()[1])
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
          .attr("class", "track-inset")
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
          .attr("class", "track-overlay")
          .call(d3.drag()
              .on("start.interrupt", function() { slider.interrupt(); })
              .on("start drag", function() {
                currentValue = d3.event.x;
                update(x.invert(currentValue)); 
              })
          );

      slider.insert("g", ".track-overlay")
          .attr("class", "ticks")
          .attr("transform", "translate(0," + 10 + ")")
        .selectAll("text")
          .data(x.ticks(10))
          .enter()
          .append("text")
          .attr("x", x)
          .attr("y", 13)
          .attr("text-anchor", "middle")
          .text(function(d) { return formatDateIntoYear(d); });

      var handle = slider.insert("circle", ".track-overlay")
          .attr("class", "handle")
          .attr("r", 9)
          .attr("cx", x.range()[1])

      var label = slider.append("text")  
          .attr("class", "label")
          .attr("text-anchor", "middle")
          .text(formatDate(endDate))
          .attr("x", x.range()[1])
          .attr("transform", "translate(0," + (-25) + ")")

      playButton
          .on("click", function() {
          var button = d3.select(this);
          if (button.text() == "Pause") {
            moving = false;
            clearInterval(timer);
            // timer = 0;
            button.text("Play");
            onStopTimeline();
          } else {
            moving = true;
            timer = setInterval(step, 250);
            button.text("Pause");
          }
        })

      function prepare(d) {
        d.id = d.id;
        d.date = parseDate(d.date);
        return d;
      }
        
      function step() {
        update(x.invert(currentValue));
        currentValue = currentValue + (targetValue/151);
        if (currentValue > targetValue) {
          moving = false;
          currentValue = 0;
          clearInterval(timer);
          // timer = 0;
          playButton.text("Play");
          onStopTimeline();
        }
      }

      function update(h) {
        // update position and text of label according to slider scale
        handle.attr("cx", x(h));
        label
          .attr("x", x(h))
          .text(formatDate(h));

        onTimelineTick(h)
      }


    })
  }


  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };
  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };
  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };  

  return chart;
}
