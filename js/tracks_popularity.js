const chartDiv = document.getElementById("viz2");

//const MARGIN = { top: 10, right: 10, bottom: 10, left: 10 };
const margin = {
    top: 10,
    right: 50,
    bottom: 150,
    left: 50
  },
  width = chartDiv.clientWidth * 0.8,
  height = chartDiv.clientHeight * 0.5,
  contextHeight = 30;
  contextWidth = width;

const svg = d3.select("#viz2").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", (height + margin.top + margin.bottom));

  // create a tooltip
const Tooltip = d3.select("#viz2")
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

  var group_color = {
    Popularity: "#1abc9c",
    Danceability: "#DE9B88",
    Energy: "#EEC519",
    Valence: "#d9534f",
    Acousticness: "#585A51",
    Instrumentalness: "#5bc0de",
    Liveness: "#95ABD4"
  }

  var genres = [];

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

  d3.select("#selectButton")
      .selectAll('myOptions')
     	.data(groups)
      .enter()
    	.append('option')
      .text(function (d) { return d; })
      .attr("value", function (d) { return d; })


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

  // When the button is changed, run the updateChart function
  d3.select("#selectButton").on("change", function(d) {
      // recover the option that has been chosen
      var selectedOption = d3.select(this).property("value")
      // run the updateChart function with this selected option
      charts[0].update(selectedOption);
  })

	// Create a context for a brush
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
		.on("brush", onBrush);

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

  // Brush handler. Get time-range from a brush and pass it to the charts.
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

    // Bound yScale using minDataPoint and maxDataPoint
    this.yScale = d3.scaleLinear()
      .range([0, this.height])
      .domain([this.minDataPoint, this.maxDataPoint]);
    let xS = this.xScale;
    let yS = this.yScale;

    this.genre_color = d3.scaleOrdinal()
      .domain(this.genres)
      .range(d3.schemeCategory20);

    let gColor = this.genre_color;


    this.area = d3.area()
      .x(function(d) {
        return xS(d.release_date);
      })
      .y0(this.height)
      .y1(function(d) {
        return yS(d.popularity);
      })
      .curve(d3.curveCatmullRom);

    // Add the chart to the HTML page
    this.chartContainer = svg.append("g")
      .attr('class', "popularity")
      .attr("transform", "translate(" + this.margin.left + "," + (this.margin.top + (this.height * this.id) + (10 * this.id)) + ")");

    this.chartContainer.append("path")
      .data([this.chartData])
      .attr("class", "chart")
      .attr("clip-path", "url(#clip-" + this.id + ")")
      .attr("d", this.area)
      .attr("fill", this.group_color["Popularity"]);

      // Three function that change the tooltip when user hover / move / leave a cell
      let mouseover = function(d) {
        Tooltip
          .style("opacity", 1);
        d3.select(this)
      	  .transition()
      	  .duration(500)
      	  .attr('stroke-width', 12);
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
          .attr('stroke-width', 0);
      }

      let genre_mouseover = function(d) {
        Tooltip
          .style("opacity", 1);
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
      }

    let margin_rect = this.width/this.num_data/2;

    this.chartContainer.selectAll("rect")
      .data(this.chartData)
      .enter()
      .append("rect")
      .attr("width", this.width/this.num_data)
      .attr("height", 7)
      .attr("x", function(d) { return xS(d.release_date) - margin_rect} )
      .attr("y", -10)
      .attr("fill",  function(d){ return gColor(d.genres); })
      .on('mouseover', genre_mouseover)
      .on('mousemove', genre_mousemove)
      .on('mouseleave', genre_mouseleave);

    this.chartContainer.selectAll("dot")
      .data(this.chartData)
      .enter()
      .append("circle")
      .attr("r", 2.5)
      .attr("cx", function(d) { return xS(d.release_date) })
      .attr("cy", function(d) { return yS(d.popularity); })
      .attr('fill', function (d) { return d.fill })
      .attr('stroke','black')
      .attr('stroke-width',0)
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
    this.xScale.domain(b);

    let years_domain = b.map( (v) => {return v.getFullYear();} );
    let years = years_domain[1] - years_domain[0];
    if ( years <= 0 ) {
      years = 1;
    }

    let margin_rect = this.width/years/2;

    // let width_comp = this.width + margin_rect * 2;
    let xS = this.xScale;
    this.chartContainer.select("path").data([this.chartData]).attr("d", this.area);
    this.chartContainer.select(".x.axis.bottom").call(this.xAxisBottom);
    this.chartContainer.selectAll("circle")
      .data(this.chartData)
      .attr("cx", function(d) { return xS(d.release_date); });
    this.chartContainer.selectAll("rect")
      .data(this.chartData)
      .attr("x", function(d) {
        // if ( xS(d.release_date) - margin_rect > 0 )
          return xS(d.release_date) - margin_rect;
        // else
          // return 0;
      })
      .attr("width", margin_rect * 2);

  }
}

d3.json( "data/most_popular_songs_by_year.json", create_chart );
