let chartDiv2 = document.getElementById("viz2");
let toggleDiv2 = document.getElementById("toggle_viz2");

let width2 = chartDiv2.offsetWidth * 0.9;
let height2 = chartDiv2.offsetHeight * 0.85;

var svg1 = d3.select("#viz2")
             .append("svg")
             .attr("class", "mt-5")
             .attr("width", width2)
             .attr("height", height2*1.2);
            
let GENRES_COLORS = ["#961c0a", "#2b5688", "#991c45", "#4f35cd","#056e70",
                     "#824475", "#1c4a06", "#98065b", "#71470f", "#14675a",
                     "#373b3b", "#6d3f46", "#3c27f0", "#176234"];

function create_chart(data) {

    let years = data.map(d => d["year"]);
    let genres = data.columns.slice(1);
    let starting_genres = ["latin", "classical"]

    starting_data = filter_genres(data, starting_genres)
    starting_data = get_percentage(starting_data)

    var max = 0
    for(i = 0; i < starting_data.length; ++i) {
        year_data = starting_data[i]
        var keys = Object.keys(starting_data[i]);
        for(j = 1; j < keys.length; ++j) {
            let value = year_data[keys[j]];
            if(value > max) max = value;
        }
    }

    // years/decades scale
    x = d3.scaleBand()
            .domain(years)
            .range([0,  width2])
            
    // popularity scale
    y = d3.scaleLinear()
               .domain([0, 100]) // 100 since using percentage
               .range([height2, 0])

    // Color palette
    var color = d3.scaleOrdinal()
                  .domain(genres)
                  .range(d3.schemeCategory10.concat(["#a8327f", "#a89e32", "#3283a8", "#a83232"]));

    var stackedData = d3.stack().keys(starting_genres)(starting_data)
    
    // CHART
    var curr_genre = ""

    bars = svg1.append("g")
        .selectAll("g")
        .data(stackedData)
        .enter().append("g")
        .attr("fill", function(d, i) { 
            curr_genre = d.key
            return color(d.key); })
        .selectAll("rect")  
        .data(function(d) { return d; })
        .enter().append("rect")
        .attr("class", function(d) {return "bar-"+curr_genre.replace( /\s/g, '')})
        .attr("x", function(d) { return x(d.data.year) + 0.1*x.bandwidth(); })
        .attr("y", height2)
        .attr("width", x.bandwidth()*0.8)
        .attr("height", 0)

    bars.transition().duration(1000)
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })

    bars.on("mouseover", function() { tooltip.style("display", null); })
        .on("mouseout", function() { tooltip.style("display", "none"); })
        .on("mousemove", function(d) {
            var xPosition = d3.mouse(this)[0] - 5;
            var yPosition = d3.mouse(this)[1] - 5;
            tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            tooltip.select("text").text("Popularity: " + ((d[1]-d[0]).toFixed(2)).toString()); // could add genre
        });

    // AXES
    let axis_height = height2 + 20;
    svg1.append("g")
        .attr("transform", "translate(0," + axis_height + ")")
        .attr("class", "axisWhite")
        .call(d3.axisBottom(x));

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

    // TOGGLE
    toggle_div =  d3.select("#toggle_viz2")
                    

    // Add classes for the colors    
    genres.forEach(g => {
        var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = '#btn-' + g.replace( /\s/g, '') + '.active' + ' { background-color: ' + color(g)+ '; }';
            document.getElementsByTagName('head')[0].appendChild(style);
    });

    toggles = toggle_div.selectAll("div")
                   .data(genres) //reverse to have the same order as displayed on the viz
                   .enter()
                   .append("div")
                   .attr("class", "btn-group-toggle mx-5")
                   .attr("data-toggle", "buttons")
                   .append("label")
                   .attr("class", function(d) { return "btn btn-secondary btn-block mb-2" })
                   .attr("id", function(d) {return "btn-" + d.replace( /\s/g, '')})
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
                   .attr("id", function(d, i) { return "genre-toggle-" + d.replace( /\s/g, ''); })

//UPDATE DATA
    genres.reverse().forEach(genre => {
        d3.select("#btn-" + genre.replace( /\s/g, '')) // get all buttons
          .on("click", function() { 
            let new_genres = []
            genres.forEach(g => {
                let checkbox = document.getElementById("genre-toggle-" + g.replace( /\s/g, ''))
                if(checkbox.checked) {
                    new_genres.push(g)
                }
            });

            let new_data = filter_genres(data, new_genres)
            new_data = get_percentage(new_data)

            let new_stacked_data = d3.stack().keys(new_genres)(new_data)

            svg1.selectAll("rect")
                .transition().duration(1000)
                .attr("y", height2)
                .attr("height", 0)
                .remove()
                
            var curr_genre = ""
            bars = svg1.append("g")
                        .selectAll("g")
                        .data(new_stacked_data)
                        .enter().append("g")
                        .attr("fill", function(d, i) { 
                            curr_genre = d.key
                            return color(d.key); })
                        .selectAll("rect")  
                        .data(function(d) { return d; })
                        .enter().append("rect")
                        .attr("class", function(d) {return "bar-" + curr_genre.replace( /\s/g, '')})
                        .attr("x", function(d) { return x(d.data.year); })
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
                    tooltip.select("text").text("Popularity: " + ((d[1]-d[0]).toFixed(2)).toString()); // could add genre
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
          });
    });
}

function get_percentage(data) {

    let genres = data.columns;

    for(i = 0; i < data.length; ++i) {
        // Get max
        var sum = 0
        genres.forEach(g => {
            sum += data[i][g];
        });

        // Set sum to 1 if sum == 0 to ensure no division by 0
        if(sum === 0) { 
            sum = 1;
        };

        //divide per max to get percentage
        genres.forEach(g => {
            data[i][g] = 100*data[i][g] / sum
        });
    }

    return data
}

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
}

d3.csv("data/genres_decades.csv", create_chart);
