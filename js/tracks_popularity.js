const chartDiv = document.getElementById("viz1");

const margin = {
    top: 20,
    right: 50,
    bottom: 150,
    left: 50
  },
  width = chartDiv.offsetWidth * 0.7 - 100,
  height = chartDiv.offsetHeight * 0.45,
  contextHeight = 30;
  contextWidth = width;

const rect_height = height * 0.035;

const info_description = "<p><strong>Statistics<br>" +
                        "Popularity:</strong> measures the current popularity of a track<br>" +
                        "<strong>Danceability:</strong> describes how suitable a track is for dancing " +
                        "based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity<br>" +
                        "<strong>Energy:</strong> represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy<br>" +
                        "<strong>Valence:</strong> describes the musical positiveness conveyed by a track<br>" +
                        "<strong>Acousticness:</strong> measures if a track is acoustic<br>" +
                        "<strong>Instrumentalness:</strong> measures the probability that a track does not contain vocals<br>" +
                        "<strong>Liveness:</strong> detects the presence of an audience in the recording, live performance<br>" +
                        "</p>";

const svg = d3.select("#viz1").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", (height + margin.top + margin.bottom));

// create a tooltip
const Tooltip = d3.select("#viz1")
                  .append("div")
                  .style("opacity", 0)
                  .attr("class", "tooltip")
                  .style("background-color", "white")
                  .style("border", "solid")
                  .style("border-width", "2px")
                  .style("text-align", "center")
                  .style("width", "200px")
                  // .style("heigth", "15px")
                  .style("border-radius", "3px")
                  .style("padding", "2px")
                  .style("position", "absolute");

// create a tooltip for info
const TooltipInfo = d3.select("#viz1")
                      .append("div")
                      .style("opacity", 0)
                      .attr("class", "tooltip")
                      .style("background-color", "white")
                      .style("border", "solid")
                      .style("border-width", "2px")
                      .style("text-align", "center")
                      .style("width", "500px")
                      // .style("heigth", "15px")
                      .style("border-radius", "3px")
                      .style("padding", "2px")
                      .style("position", "absolute");


function create_chart( data ){
	console.log( data );

  let charts = [];
  let maxDataPoint = 0;
  let minDataPoint = 100;

	let startYear = data[0].release_date;
	let endYear = data[data.length - 1].release_date;
	// let chartHeight = height * (1 / count);
  let chartHeight = 1;

  // groups for category
  var groups = ["Popularity", "Danceability", "Energy", "Valence", "Acousticness", "Instrumentalness", "Liveness"]

  // colors for categrories
  var group_color = {
    Popularity: "#1abc9c",
    Danceability: "#DE9B88",
    Energy: "#EEC519",
    Valence: "#d9534f",
    Acousticness: "#CCCCFF",
    Instrumentalness: "#5bc0de",
    Liveness: "#AF7AC5"
  }

  var genres = [];

  // get all genres in the data
  data.map(d => {
    for (let prop in d) {
      if (d.hasOwnProperty(prop) && prop == 'genres') {
        // if ( genres.find( (v) => { v === d[prop].toLowerCase().replace(/\s+/g, ''); }) != true ) {
          genres.push(d[prop]);
        // }
      }
    }
  })

  console.log( genres )

  // add categories to select button
  d3.select("#selectButton")
      .selectAll('myOptions')
     	.data(groups)
      .enter()
    	.append('option')
      .text(function (d) { return d; })
      .attr("value", function (d) { return d; })


  // create tooltip for info
  let info_mouseover = function() {
    TooltipInfo
      .style("opacity", 1);
  }
  let info_mousemove = function() {
    TooltipInfo
      .html(info_description)
      .style("left",  (d3.event.pageX-90) + "px")
      .style("top",  (d3.event.pageY+15) + "px")
  }
  let info_mouseleave = function() {
    TooltipInfo
      .style("opacity", 0)
      .style("left",  0 + "px")
      .style("top",  0 + "px");
  }

  // add info to info circle icon
  d3.selectAll(".infoFeatures")
    .on('mouseover', info_mouseover)
    .on('mousemove', info_mousemove)
    .on('mouseleave', info_mouseleave);


	data.map(d => {
    for (let prop in d) {
      if (d.hasOwnProperty(prop) && prop == 'popularity') {
        d[prop] = parseInt(d[prop]);
      }
    }

    /* Convert "Year" column to Date format to benefit
    from built-in D3 mechanisms for handling dates. */
    d.release_date = new Date(d.release_date, 0, 1);
  });

  // create a chart
  charts.push(new Chart({
    data: data.slice(),
    id: 0,
    name: "",
    width: width,
    height: height,
    maxDataPoint: maxDataPoint,
    minDataPoint: minDataPoint,
    svg: svg,
    margin: margin,
    showBottomAxis: true,
    groups: groups,
    group_color: group_color,
    genres: genres
  }));

  // when the button is changed, run the updateChart function
  d3.select("#selectButton").on("change", function(d) {
      // recover the option that has been chosen
      var selectedOption = d3.select(this).property("value")
      // run the updateChart function with this selected option
      charts[0].update(selectedOption);
  })

	// create a context for a brush
	var contextXScale = d3.scaleTime()
		.range([0, contextWidth])
		.domain(charts[0].xScale.domain())

	var contextAxis = d3.axisBottom(contextXScale)
    .ticks(20)
		.tickSize(contextHeight + 30)
		.tickPadding(5);

	var contextArea = d3.area()
		.x(function(d) {
			return contextXScale(d.date);
		})
		.y0(contextHeight-20)
		.y1(0)
		.curve(d3.curveBasis);


	var brush = d3.brushX()
		.extent([
			[contextXScale.range()[0], 5],
			[contextXScale.range()[1], contextHeight + 25]
		])
		.on("brush", onBrush)
    .on("end", function() {
      if(!d3.event.selection) {
        /* reset brush */
        charts[0].showOnly(contextXScale.domain())
      }
    });

  let context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + (margin.left) + "," + (height + margin.top + chartHeight + 30) + ")");

  context.append("g")
    .attr("class", "x axis top")
    .attr("transform", "translate(0,0)")
    .call(contextAxis)

  context.append("g")
    .attr("class", "x brush")
    .call(brush)
    .selectAll("rect")
    .attr("y", 5)
    .attr("height", contextHeight + 20);

  context.append("text")
    .attr("class", "instructions")
    .attr("transform", "translate(0," + (contextHeight + 80) + ")")
    .text('Click and drag above to zoom / pan the data');

  // brush handler. Get time-range from a brush and pass it to the charts.
  function onBrush() {
    var b = d3.event.selection === null ? contextXScale.domain() : d3.event.selection.map(contextXScale.invert);
    charts[0].showOnly(b);
  }
}

class Chart {
  constructor(options) {
    this.chartData = options.data;
    this.width = options.width;
    this.height = options.height;
    this.maxDataPoint = options.maxDataPoint;
    this.minDataPoint = options.minDataPoint;
    this.svg = options.svg;
    this.id = options.id;
    this.name = options.name;
    this.margin = options.margin;
    this.showBottomAxis = options.showBottomAxis;
    this.groups = options.groups;
    this.group_color = options.group_color;
    this.genres = options.genres;
    this.num_data = this.chartData.length;

    let localName = this.name;

    // Associate xScale with time
    this.xScale = d3.scaleTime()
      .range([0, this.width])
      .domain(d3.extent(this.chartData.map(function(d) {
        return d.release_date;
      })));

    // bound yScale using minDataPoint and maxDataPoint
    this.yScale = d3.scaleLinear()
      .range([0, this.height])
      .domain([this.minDataPoint, this.maxDataPoint]);
    let xS = this.xScale;
    let yS = this.yScale;

    // get a color scale for genres
    this.genre_color = d3.scaleOrdinal()
      .domain(this.genres)
      .range(d3.schemeCategory20);

    let gColor = this.genre_color;

    // create D3 area
    this.area = d3.area()
      .x(function(d) {
        return xS(d.release_date);
      })
      .y0(this.height)
      .y1(function(d) {
        return yS(d.popularity);
      })
      .curve(d3.curveCatmullRom);

    // add the chart to the HTML page
    this.chartContainer = svg.append("g")
      .attr('class', "popularity")
      .attr("transform", "translate(" + this.margin.left + "," + (this.margin.top + (this.height * this.id) + (10 * this.id)) + ")");

    this.chartContainer.append("path")
      .data([this.chartData])
      .attr("class", "chart")
      .attr("clip-path", "url(#clip-" + this.id + ")")
      .attr("d", this.area)
      .attr("fill", this.group_color["Popularity"]);

    // three functions that change the tooltip when user hover / move / leave a data element
    let mouseover = function(d) {
      Tooltip
        .style("opacity", 1);
      d3.select(this)
    	  .transition()
    	  .duration(500)
    	  .attr("r", 7);
    }
    let mousemove = function(d) {
      Tooltip
        .html("<p><strong>" + d.name + "</strong><br>" + d.artists + "</p>")
        .style("left",  (d3.event.pageX-90) + "px")
        .style("top",  (d3.event.pageY+15) + "px")
    }
    let mouseleave = function(d) {
      Tooltip
        .style("opacity", 0)
        .style("left",  0 + "px")
        .style("top",  0 + "px");
      d3.select(this)
        .transition()
        .duration(500)
        .attr("r", 2.5);
    }

    // three functions that change the tooltip when user hover / move / leave a genre element
    let genre_mouseover = function(d) {
      Tooltip
        .style("opacity", 1);
      d3.select(this).style("fill", function() {
        return d3.rgb(d3.select(this).style("fill")).darker(0.3);
      });
    }
    let genre_mousemove = function(d) {
      Tooltip
        .html("<p><strong>" + d.genres + "</strong></p>")
        .style("left",  (d3.event.pageX-90) + "px")
        .style("top",  (d3.event.pageY+15) + "px")
    }
    let genre_mouseleave = function(d) {
      Tooltip
        .style("opacity", 0)
        .style("left",  0 + "px")
        .style("top",  0 + "px");
      d3.select(this)
        .classed("hover", true);
      d3.select(this).style("fill", function() {
        return d3.rgb(d3.select(this).style("fill")).brighter(0.3);
      });
    }

    // initialization of the genres rectangle sizes
    let margin_rect = this.width/this.num_data/2;

    // create rectangles for genres
    this.chartContainer.selectAll("rect")
      .data(this.chartData)
      .enter()
      .append("rect")
      .attr("width", this.width/this.num_data)
      .attr("height", rect_height)
      .attr("x", function(d) { return xS(d.release_date) - margin_rect} )
      .attr("y", -20)
      .attr("fill",  function(d){ return gColor(d.genres); })
      .on('mouseover', genre_mouseover)
      .on('mousemove', genre_mousemove)
      .on('mouseleave', genre_mouseleave);

    // create circles for data points in chart path
    this.chartContainer.selectAll("dot")
      .data(this.chartData)
      .enter()
      .append("circle")
      .attr("r", 2.5)
      .attr("cx", function(d) { return xS(d.release_date) })
      .attr("cy", function(d) { return yS(d.popularity); })
      .attr('fill', function (d) { return d.fill })
      .attr('stroke','black')
      .attr('stroke-width',1)
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseleave', mouseleave);

    this.xAxisBottom = d3.axisBottom(this.xScale).ticks(20);
    this.xAxisTop = d3.axisTop(this.xScale);

    // show only the bottom axis
    if (this.showBottomAxis) {
      this.chartContainer.append("g")
        .attr("class", "x axis bottom")
        .attr("transform", "translate(0," + this.height + ")")
        .call(this.xAxisBottom);
    }

    this.yAxisLeft = d3.axisLeft(this.yScale).ticks(10);
    this.yAxisRight = d3.axisRight(this.yScale).ticks(10);

    this.chartContainer.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(-15,0)")
      .call(this.yAxisLeft);

    this.chartContainer.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + this.width + ",0)")
      .call(this.yAxisRight);
  }

  update(selectedGroup) {
    // change chart plot based on the selected group
    let xS = this.xScale;
    let yS = this.yScale;

    // Create new data with the selection?
    let area = d3.area()
      .x(function(d) {
        return xS(d.release_date);
      })
      .y0(this.height)
      .y1(function(d) {
        return yS(d[selectedGroup.toLowerCase()]);
      })
      .curve(d3.curveCatmullRom);

    this.area = area;

    this.chartContainer.select("path")
      .data([this.chartData])
      .transition()
      .duration(1000)
      .attr("d", area)
      .attr("fill", this.group_color[selectedGroup]);

    this.chartContainer.selectAll("circle")
      .data(this.chartData)
      .transition()
      .duration(1000)
      .attr("cy", function(d) { return yS(d[selectedGroup.toLowerCase()]); })
  }

  showOnly(b) {
    // update on brush
    this.xScale.domain(b);

    // compute rectangle sizes
    let years_domain = b.map( (v) => {return v.getFullYear();} );
    let years = years_domain[1] - years_domain[0];
    if ( years <= 0 ) {
      years = 1;
    }
    let margin_rect = this.width/years/2;

    let xS = this.xScale;

    // resize
    this.chartContainer.select("path").data([this.chartData]).attr("d", this.area);
    this.chartContainer.select(".x.axis.bottom").call(this.xAxisBottom);
    this.chartContainer.selectAll("circle")
      .data(this.chartData)
      .attr("cx", function(d) { return xS(d.release_date); });
    this.chartContainer.selectAll("rect")
      .data(this.chartData)
      .attr("x", function(d) {
          return xS(d.release_date) - margin_rect;
      })
      .attr("width", margin_rect * 2);
  }
}

// read data
d3.json( "data/most_popular_songs_by_year.json", create_chart );
