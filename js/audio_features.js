const audioFeaturesRoot = document.getElementById("viz3");

const audioFeaturesDataPath = 'data/audio_features_by_genre.json';

d3.json(audioFeaturesDataPath, createAudioChart);

function createAudioChart(data) {

  const features = Object.keys(data);
  const genres = Object.keys(data[features[0]]);
  const startingGenres = ['all']

  // Transform data points to a list
  for (let i in data) {
    for (let j in data[i]) {
      data[i][j] = Object.entries(data[i][j]).map(function(d) {
        return {
          x: new Date(d[0], 0, 1),  // Transform to Date object
          y: d[1] * 100  // Map 0-1 to 0-100
        };
      })
    }
  }

  const width = audioFeaturesRoot.offsetWidth * 0.7 - 100;
  const height = audioFeaturesRoot.offsetHeight * 0.6;
  const margin = {
    top: 20,
    right: 50,
    bottom: 150,
    left: 50
  };
  const minDataPoint = 0;
  const maxDataPoint = 100;
  const contextHeight = 30;
  const contextWidth = width;

  const svg = d3.select("#viz3").append("svg")
    .attr("class", "my-5")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  // List for selecting features
  const selectFeature = d3.select("#selectFeature")
  selectFeature.selectAll('myOptions')
   	.data(features)
    .enter()
  	.append('option')
    .text(function (d) { return d.charAt(0).toUpperCase() + d.slice(1); })
    .attr("value", function (d) { return d; })

  const initialFeature = selectFeature.property("value");

  // When the selection changes, run the updateFeature function
  selectFeature.on("change", function(d) {
      // recover the option that has been chosen
      const selectedOption = d3.select(this).property("value");
      chart.updateFeature(selectedOption);
  })

  // Buttons for selecting genres
  toggle =  d3.select("#checkbox-af")

  // Color palette
  var colors = d3.scaleOrdinal()
                .domain(genres)
                .range(d3.schemeCategory10.concat(["#a8327f", "#a89e32", "#3283a8", "#a83232"]));

  // Add classes for the colors
  genres.forEach(g => {
      var style = document.createElement('style');
          style.type = 'text/css';
          style.innerHTML = '#btn-af-' + g.replace( /\s/g, '') + '.active' + ' { background-color: ' + colors(g)+ '; }';
          document.getElementsByTagName('head')[0].appendChild(style);
  });

  toggles = toggle.selectAll("div")
    .data(genres)
    .enter()
    .append("label")
    .attr("class", function(d) { return "btn btn-secondary col-sm-3" })
    .style("margin", "3px")
    .attr("id", function(d) {return "btn-af-" + d.replace( /[\s&]/g, '')})
    .text(function(d) { return d; })
    .append("input")
    .attr("type", "checkbox")
    .attr("name", "checkbox-af")
    .attr("value", function(d) { return d; })
    .attr("checked", function(d) {
      if(startingGenres.includes(d)) {
        return "checked";
      } else {
        return null;
      }
    })
   .attr("id", function(d, i) { return "checkbox-af-" + d.replace( /[\s&]/g, ''); })
   .on("change", function(d) {
      const activatedGenres = [];
      genres.forEach(function(g) {
        const cb = d3.select("#" + "checkbox-af-" + g.replace( /[\s&]/g, ''));
        if (cb.property("checked")) {
					activatedGenres.push(g);
				}
      })
      chart.updateGenre(activatedGenres);
   });

  const chart = new AudioChart({
    data: data,
    width: width,
    height: height,
    minDataPoint: minDataPoint,
    maxDataPoint: maxDataPoint,
    svg: svg,
    margin: margin,
    feature: initialFeature,
    genres: startingGenres,
    allGenres: genres,
    colors: colors
  });

  // create a context for a brush
	const contextXScale = d3.scaleTime()
		.range([0, contextWidth])
		.domain(chart.xScale.domain())

	const contextAxis = d3.axisBottom(contextXScale)
    .ticks(20)
		.tickSize(contextHeight + 30)
		.tickPadding(5);

	const contextArea = d3.area()
		.x(function(d) {
			return contextXScale(d.date);
		})
		.y0(contextHeight-20)
		.y1(0)
		.curve(d3.curveBasis);


	const brush = d3.brushX()
		.extent([
			[contextXScale.range()[0], 5],
			[contextXScale.range()[1], contextHeight + 25]
		])
		.on("brush", onBrush)
    .on("end", function() {
      if(!d3.event.selection) {
        // reset brush
        chart.showOnly(contextXScale.domain())
      }
    });

  const context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + (margin.left) + "," + (height + margin.top + 30) + ")");

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
    chart.showOnly(b);
  }

}

class AudioChart {
  constructor(options) {
    this.allData = options.data;
    this.width = options.width;
    this.height = options.height;
    this.minDataPoint = options.minDataPoint;
    this.maxDataPoint = options.maxDataPoint;
    this.svg = options.svg;
    this.id = options.id;
    this.margin = options.margin;
    this.feature = options.feature;
    this.genres = options.genres;
    this.allGenres = options.allGenres;
    this.colors = options.colors;

    this.chartData = this.allData[this.feature];

    // Associate xScale with time
    this.xScale = d3.scaleTime()
      .range([0, this.width])
      .domain(d3.extent(this.chartData['all'].map(function(d) {
        return d.x;
      })));

    // Bound yScale using minDataPoint and maxDataPoint and switch coordinates
    this.yScale = d3.scaleLinear()
      .range([this.height, 0])
      .domain([this.minDataPoint, this.maxDataPoint]);

    let xS = this.xScale;
    let yS = this.yScale;

    // Add the chart to the HTML page
    this.chartContainer = this.svg.append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // Create the lines
    this.lines = [];
    this.paths = [];
    const that = this;
    this.allGenres.forEach(function(genre, i) {
      const line = d3.line()
        .x(function(d) {
          return xS(d.x);
        })
        .y(function(d) {
          return yS(d.y);
        })
        .curve(d3.curveBasis);

      const opacity = that.genres.includes(genre) ? 1 : 0;
      const path = that.chartContainer.append("path")
        .data([that.chartData[genre]])
        .attr("fill", "none")
        .attr("stroke", that.colors(genre))
        .attr("stroke-width", 2)
        .attr("class", "chart")
        .attr("d", line)
        .style("opacity", opacity);

      that.lines.push(line);
      that.paths.push(path);
    })

    // Add x axis
    this.xAxisBottom = d3.axisBottom(xS);
    this.chartContainer.append("g")
        .attr("class", "x axis bottom")
        .attr("transform", "translate(0," + this.height + ")")
        .call(this.xAxisBottom);

    // Add y axis
    this.yAxisLeft = d3.axisLeft(this.yScale).ticks(10);
    this.yAxisRight = d3.axisRight(this.yScale).ticks(10);
    this.chartContainer.append("g")
      .attr("class", "y axis left")
      .call(this.yAxisLeft);
    this.chartContainer.append("g")
      .attr("class", "y axis right")
      .attr("transform", "translate(" + this.width + ",0)")
      .call(this.yAxisRight);

  }

  showOnly(b) {
    // Update chart after using the brush
    this.xScale.domain(b);
    const that = this;
    this.allGenres.forEach(function(genre, i) {
      that.paths[i]
        .data([that.chartData[genre]])
        .attr("d", that.lines[i]);
    });
    this.chartContainer.select(".x.axis.bottom").call(this.xAxisBottom);
  }

  updateFeature(selectedGroup) {
    // Change the feature displayed on the chart
    this.feature = selectedGroup;
    this.chartData = this.allData[this.feature];
    const that = this;
    this.allGenres.forEach(function(genre, i) {
      that.paths[i]
        .data([that.chartData[genre]])
        .transition()
        .duration(1000)
        .attr("d", that.lines[i]);
    });
    return
  }

  updateGenre(activatedGenres) {
    // Hide and unhide lines according to the activated genres
    this.genres = activatedGenres;
    const that = this;
    this.allGenres.forEach(function(genre, i) {
      const opacity = activatedGenres.includes(genre) ? 1 : 0;
      that.paths[i]
        .style("opacity", opacity);
    });
  }

}
