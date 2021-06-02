const audioFeaturesRoot = document.getElementById("viz3");

const audioFeaturesDataPath = 'data/audio_features_by_genre.json';

d3.json(audioFeaturesDataPath, createAudioChart);

function createAudioChart(data) {

  data = data['all']['danceability']; // TMP
  // Transform data points to a list
  data = Object.entries(data).map(function(d) {
    return {
      x: new Date(d[0], 0, 1),  // Transform to Date object
      y: d[1] * 100  // Map 0-1 to 0-100
    }
  });
  //const genres = Object.keys(data);
  //const features = Object.keys(data.all);

  const width = audioFeaturesRoot.clientWidth * 0.8;
  const height = audioFeaturesRoot.clientHeight * 0.6;
  const margin = {
    top: 10,
    right: 40,
    bottom: 150,
    left: 60
  };
  const minDataPoint = 0;
  const maxDataPoint = 100;

  const svg = d3.select("#viz3").append("svg")
    .attr("class", "my-5")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  //let charts = [];
  let chart = new AudioChart({
    data: data,
    id: 0,
    // name: "",
    width: width,
    height: height,
    minDataPoint: minDataPoint,
    maxDataPoint: maxDataPoint,
    svg: svg,
    margin: margin,
    // showBottomAxis: true,
    // groups: groups,
    // group_color: group_color,
    // genres: genres
  });

}

class AudioChart {
  constructor(options) {
    this.chartData = options.data;
    this.width = options.width;
    this.height = options.height;
    this.minDataPoint = options.minDataPoint;
    this.maxDataPoint = options.maxDataPoint;
    this.svg = options.svg;
    this.id = options.id;
    // this.name = options.name;
    this.margin = options.margin;
    // this.showBottomAxis = options.showBottomAxis;
    // this.groups = options.groups;
    // this.group_color = options.group_color;
    // this.genres = options.genres;
    // this.num_data = this.chartData.length;

    console.log(this.chartData)

    // Associate xScale with time
    this.xScale = d3.scaleTime()
      .range([0, this.width])
      .domain(d3.extent(this.chartData.map(function(d) {
        return d.x;
      })));

    // Bound yScale using minDataPoint and maxDataPoint and switch coordinates
    this.yScale = d3.scaleLinear()
      .range([this.height, 0])
      .domain([this.minDataPoint, this.maxDataPoint]);

    let xS = this.xScale;
    let yS = this.yScale;

    // Create the chart
    this.line = d3.line()
      .x(function(d) {
        return xS(d.x);
      })
      .y(function(d) {
        return yS(d.y);
      })
      .curve(d3.curveBasis);

    // Add the chart to the HTML page
    this.chartContainer = this.svg.append("g")
      //.attr('class', this.name.toLowerCase())
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    this.chartContainer.append("path")
      .data([this.chartData])
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      //.attr("class", "chart")
      .attr("d", this.line);

    // Add x axis
    this.xAxis = d3.axisBottom(xS);
    this.chartContainer.append("g")
        //.attr("class", "x axis")
        .attr("transform", "translate(0," + this.height + ")")
        .call(this.xAxis);

    // Add y axis
    this.yAxisLeft = d3.axisLeft(this.yScale).ticks(10);
    this.yAxisRight = d3.axisRight(this.yScale).ticks(10);
    this.chartContainer.append("g")
      //.attr("class", "y axis")
      .call(this.yAxisLeft);
    this.chartContainer.append("g")
      //.attr("class", "y axis")
      .attr("transform", "translate(" + this.width + ",0)")
      .call(this.yAxisRight);

  }
}
