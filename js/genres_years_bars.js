// Setup dimensions/margins

let chartDiv2 = document.getElementById("viz2");
let toggleDiv2 = document.getElementById("toggle_viz2");

let width2 = chartDiv2.offsetWidth * 0.9;
let height2 = chartDiv2.offsetHeight * 0.85;

const margin2 = {
    top: 20,
    right: 50,
    bottom: 20,
    left: 50
  };

var svg1 = d3.select("#viz2")
             .classed("svg-container", true)
             .append("svg")
             .attr("preserveAspectRatio", "xMinYMin meet")
             .attr("viewBox", "0 0 " + (width2 + margin2.left + margin2.right + " " +  (height2 + margin2.top + margin2.bottom)))
             .attr("class", "svg-content-responsive mt-5");
                    
let GENRES_COLOR =  {"rock" : "#4d000a",            // brown
                     "soul" : "#4287f5",            // blue
                     "folk" : "#f542a7",            // pink
                     "blues" : "#1aab1e",           // green
                     "latin" : "#e3d327",           // yellow
                     "classical" : "#853978",       // light violet
                     "adult standards" : "#e38e27", // orange
                     "pop" : "#27e0e3",             // light blue
                     "jazz" : "#e32727",            // red
                     "r&b" : "#6e5f4e",             // grayish
                     "hip hop" : "#000759",         // dark blue
                     "rap" : "#999999",             // light gray
                     "soul" : "#9c0acc",            // violet
                     "hard rock" : "#9ccc0a"};      // light green

function create_chart(data) {

    let years = data.map(d => d["year"]);
    let genres = data.columns.slice(1);
    let starting_genres = ["latin", "classical"]
    let starting_data = filter_genres(data, starting_genres)

    // years/decades scale
    x = d3.scaleBand()
          .domain(years)
          .range([0,  width2])

    max = get_max(data)
     
    // popularity scale
    y = d3.scaleLinear()
          .domain([0, max])
          .range([height2, 0])

    // AXES
    let axis_height = height2 + 20;

    svg1.append("g")
        .attr("transform", "translate(" + margin2.left + "," + axis_height + ")")
        .attr("class", "axisWhite")
        .call(d3.axisBottom(x));
    
    var yaxis = svg1.append("g")
                    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")")
                    .attr("class", "axisWhite")
                    .attr("fill", "white")
                    .call(d3.axisLeft(y));

    svg1.append("text")
        .attr("transform", "translate(10," + ((height2/2) + margin2.top + 60) + ") rotate(-90)")
        .attr("fill", "white")
        .text("Number of tracks")
        .attr("font-size", "14")
    
    // CHART
    update_chart(starting_data, x, y, yaxis, starting_genres)

    // TOOLTIP
    var tooltip = svg1.append("g")
                      .attr("class", "tooltip_genres")
                      .style("display", "none");
      
    tooltip.append("rect")
            .attr("width", 120)
            .attr("height", 20)
            .attr("fill", "white")
            .style("opacity", 0.5);

    tooltip.append("text")
            .attr("x", 60)
            .attr("dy", "1.2em")
            .style("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("font-weight", "bold");

    // TOGGLES
    toggle_div =  d3.select("#toggle_viz2")           

    // Add classes for the colors   
    // https://stackoverflow.com/questions/1720320/how-to-dynamically-create-css-class-in-javascript-and-apply 
    genres.forEach(g => {
        var genre = g;
        if (genre === "r&b") { genre = "randb"} // the & in r&b creates problems with css/html
        var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = '#btn-' + genre.replace( /\s/g, '') + '.active' + ' { background-color: ' + GENRES_COLOR[g] + '; }';
            document.getElementsByTagName('head')[0].appendChild(style);
    });

    // https://www.d3-graph-gallery.com/graph/interactivity_button.html
    toggles = toggle_div.selectAll("div")
                   .data(genres) //reverse to have the same order as displayed on the viz
                   .enter()
                   .append("div")
                   .attr("class", "btn-group-toggle")
                   .attr("data-toggle", "buttons")
                   .append("label")
                   .attr("class", function(d) { return "btn btn-secondary btn-block mb-2" })
                   .attr("id", function(d) {
                        var genre = d;
                        if (genre === "r&b") { genre = "randb"}
                       return "btn-" + genre.replace( /\s/g, '')
                    })
                   .text(function(d) { return d; })
                   .append("input")
                   .attr("type", "checkbox")
                   .attr("name", "checkboxGenre")
                   .attr("value", function(d) { return d; })
                   .attr("checked", function(d) {
                       if(starting_genres.includes(d)) {
                           return "checked" 
                       } else {
                           return null
                       }
                   })
                   .attr("id", function(d, i) { 
                        var genre = d;
                        if (genre === "r&b") { genre = "randb"}
                       return "genre-toggle-" + genre.replace( /\s/g, ''); })

    //ADD UPDATE TO EVERY TOGGLE BUTTONS
    genres.reverse().forEach(g => {
        var genre = g;
        if (genre === "r&b") { genre = "randb"}
        d3.select("#btn-" + genre.replace( /\s/g, '')) // get all buttons
          .on("click", function() { 
            let new_genres = []
            genres.forEach(g => {
                var temp_genre = g;
                if (temp_genre === "r&b") { temp_genre = "randb"}
                let checkbox = document.getElementById("genre-toggle-" + temp_genre.replace( /\s/g, ''))
                if(checkbox.checked) {
                    new_genres.push(g)
                }
            });

            // remove previous bars
            svg1.selectAll("rect")
                .transition().duration(1000)
                .attr("y", height2)
                .attr("height", 0)
                .remove()

            let new_data = filter_genres(data, new_genres)

            // Add new bars
            update_chart(new_data, x, y, yaxis, new_genres)

          });
    });
};

function update_chart(data, x, y, yaxis, genres) {
    // Function that allows to draw and upade the stacked bar chart
    // partly inspired by : https://www.d3-graph-gallery.com/graph/barplot_stacked_basicWide.html

    max = get_max(data)

    y.domain([0, max])

    yaxis.transition().duration(1000)
         .call(d3.axisLeft(y));

    let stacked_data = d3.stack().keys(genres)(data)
        
    var curr_genre = ""
    bars = svg1.append("g")
                .attr("transform", "translate(" + margin2.left + ","  + margin2.top + ")")
                .selectAll("g")
                .data(stacked_data)
                .enter().append("g")
                .attr("fill", function(d, i) { 
                    curr_genre = d.key
                    return GENRES_COLOR[d.key]; })
                .selectAll("rect")  
                .data(function(d) { return d; })
                .enter().append("rect")
                .attr("class", function(d) {return "bar-" + curr_genre.replace( /\s/g, '')})
                .attr("x", function(d) { return x(d.data.year) + 0.1*x.bandwidth(); })
                .attr("y", height2)
                .attr("width", x.bandwidth()*0.8)
                .attr("height", 0)

    bars.transition().delay(1000).duration(1000)
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })

    bars.on("mouseover", function() { tooltip.style("display", null); })
        .on("mouseout", function() { tooltip.style("display", "none"); })
        .on("mousemove", function(d) {
            var xPosition = d3.mouse(this)[0] - 5;
            var yPosition = d3.mouse(this)[1] - 5;
            tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            tooltip.select("text").text("No of tracks: " + ((d[1]-d[0]).toFixed(2)).toString()); // could add genre
        });

    // TOOLTIP
    var tooltip = svg1.append("g")
                    .attr("class", "tooltip_genres")
                    .style("display", "none");

    tooltip.append("rect")
           .attr("width", 120)
           .attr("height", 20)
           .attr("fill", "white")
           .style("opacity", 0.5);

    tooltip.append("text")
           .attr("x", 60)
           .attr("dy", "1.2em")
           .style("text-anchor", "middle")
           .attr("font-size", "12px")
           .attr("font-weight", "bold");
};

function filter_genres(data, genres) {
    var new_data = JSON.parse(JSON.stringify(data)) //copy data

    for(i = 0; i < new_data.length; ++i) {
        year_data = new_data[i] //one year of data
        var keys = Object.keys(new_data[i]); //year + all the genres in original data
        for(j = 1; j < keys.length; ++j) { //iterate only over the genres
            var genre = keys[j]
            if(!genres.includes(genre)) {
                delete new_data[i][genre] 
            } else {
                new_data[i][genre] = parseFloat(new_data[i][genre])
            }
        }
    }

    new_data.columns = genres

    return new_data
};

function get_max(data) {
    // Function to get the maximum value for the sum in a year
    var max = 0
    for(i = 0; i < data.length; ++i) {
        var curr_max = 0
        year_data = data[i]
        var keys = Object.keys(data[i]);
        for(j = 1; j < keys.length; ++j) {
            let value = year_data[keys[j]];
            curr_max += value
        }

        if(curr_max > max) max = curr_max;
    }

    return max;
};

d3.csv("data/genres_decades_count.csv", create_chart);
