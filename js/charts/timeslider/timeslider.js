function timeslider() {

  var formatDateIntoYear = d3.timeFormat("%b %d %Y");
  var formatDate = d3.timeFormat("%m-%d");
  var formatClassDate = d3.timeFormat("%b-%d");
  var parseDate = d3.timeParse("%m/%d/%y");
  var formatYMD = d3.timeFormat("%Y-%m-%d")

  var startDate = new Date("2020-03-16"),
      endDate = new Date(maxDate);


  var countField = 'counts';

  let dates = [];

  var margin = {top:0, right:100, bottom:10, left:100},
      width  = 900,
      height = 70;

  var moving = false;
  var currentValue = 0;
  var currentDate = new Date(startDate);
  var targetValue = null;
  var dateTicks = [];
  var countRecords = [];


  var svg = null;

  let timer = null;

  var selection = null;


  ////////// slider //////////
  function chart(theSelection) {
    selection = theSelection
    theSelection.each(function(data) {



      dateTicks = [];
      countRecords = [];
      let lastDate = startDate;
      dateTicks.push(startDate);
      let dateKey = formatYMD(lastDate);
      countRecords.push({ date: lastDate })
      while (lastDate < endDate) {
        lastDate = d3.timeDay.offset(lastDate, 7); 
        if (lastDate < endDate) {
        } else if (lastDate == endDate) {
        } else {
          lastDate = d3.timeDay.offset(endDate, 1); 
        }
        dateTicks.push(lastDate);
        dateKey = formatYMD(lastDate);
        countRecords.push({date: lastDate  })          
      }
      svg = selection.select(".timeslider-chart")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom);  

      var playButton = selection.select("#play-button");

      let innerWidth = width - margin.left - margin.right;
      let innerHeight = height - margin.top - margin.bottom;
      targetValue = innerWidth;

          
      var x = d3.scaleTime()
          .domain([startDate, dateTicks[dateTicks.length-1]])
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
              .on("start", function() {
                update(x.invert(d3.event.x))
              })
              .on("drag", function() {
                update(x.invert(d3.event.x))
              })
              .on("end", function() {
                currentValue = d3.event.x;
                let theDate = x.invert(currentValue);
                let matchedDate = findClosestDate(theDate)
                if (matchedDate) {
                  currentDate = matchedDate
                  currentValue = x(currentDate)
                  update(matchedDate); 
                }
              })
          );



      slider.insert("g", ".track-overlay")
          .attr("class", "ticks")
          .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
          .data(dateTicks)
          .enter()
          .append("text")
          .attr("x", x)
          .attr("y", 10)
          .attr("text-anchor", function(d,i) {
            return "middle"
          })
          .text(function(d,i) { 
            if ( i < dateTicks.length - 1 ) {
              if ( i == 0 || i % 4 == 0) {
                return formatDate(d); 
              } else {
                return "";
              }
            } else {
              var time_diff = dateTicks[i].getTime() - dateTicks[i-1].getTime();
              var day_diff = time_diff / (1000 * 3600 * 24);
              if (day_diff > 4) {
                return formatDate(d)
              } else{
                return "";
              }
            }
          })
          .attr("class", function(d) {
            return  formatClassDate(d)
          })


      var handle = slider.insert("circle", ".track-overlay")
          .attr("class", "handle")
          .attr("r", 9)
          .attr("cx", x.range()[0])


      playButton
          .on("click", function() {
            var button = d3.select(this);
            var buttonText = selection.select("#play-button").text();

            if (buttonText == "Pause") {
              moving = false;
              clearInterval(timer);
              // timer = 0;
              button.text("Play")
            } else {
              moving = true;

              firstStep();
              button.text("Pause")
            }
        })

      function prepare(d) {
        d.id = d.id;
        d.date = parseDate(d.date);
        return d;
      }

      function firstStep() {
        step();
        timer = setInterval(step, 50)
      }
        
      function step() {
        if (currentValue == targetValue) {
          update(x.invert(currentValue));
          moving = false;
          clearInterval(timer);
          let button = selection.select("#play-button");
          button.text("Play")

          svg.selectAll(".ticks text").classed("current", false)
          svg.selectAll(".ticks text." + formatClassDate(d3.timeDay.offset(endDate, 1))).classed("current", true)          

          onStopTimeline(currentDate);
          currentValue = 0;
          currentDate = startDate;
        } else {


          update(x.invert(currentValue));

          let formatter = d3.timeFormat("%Y-%m-%d")
          currentDate = d3.timeDay.offset(currentDate, 1); 
          currentValue = x(currentDate)
        }



      }


      function update(h) {
        // update position and text of label according to slider scale
        handle.attr("cx", x(h));
        //label
        //  .attr("x", x(h))
        //  .text(formatDate(h));

        if (!svg.selectAll(".ticks text." + formatClassDate(h)).empty()) {
          svg.selectAll(".ticks text").classed("current", false)
          svg.selectAll(".ticks text." + formatClassDate(h)).classed("current", true)          
        }


        onTimelineTick(h)
      }


      function findClosestDate(theDate) {
        let matchedDate = null;
        if (currentDate <= theDate) {
          dateTicks.forEach(function(aDate) {
            if (matchedDate == null) {
              if (formatDateIntoYear(aDate) == formatDateIntoYear(theDate)) {
                matchedDate = aDate;
              } else if (currentDate < theDate) {
                if (aDate > theDate) {
                  matchedDate = aDate;
                }
              }                   
            }
          })
        } else {
          let reversedDateTicks = dateTicks.slice().reverse();
          reversedDateTicks.forEach(function(aDate) {
            if (matchedDate == null) {
              if (theDate > aDate) {
                matchedDate = aDate;
              }
            }
          })
        }
        return matchedDate;
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
  chart.countField = function(_) {
    if (!arguments.length) return countField;
    countField = _;
    return chart;
  };

  chart.reset = function() {
    currentValue = 0;
    currentDate = startDate;
  }

  return chart;
}
