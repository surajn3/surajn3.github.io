async function init() {
    var countryName = "United States";

    var visualizationTarget = d3.select("#visualizationTarget");
    //console.log(visualizationTarget.node().getBoundingClientRect().width);

    var width = visualizationTarget.node().getBoundingClientRect().width;
    var height = 400;

    console.log(d3.select("#countryName"));
    var inputCountryName = document.getElementById("countryName").value;
    if (inputCountryName != "") {
        countryName = inputCountryName;
        d3.select("svg").remove();
        console.log(visualizationTarget.select("p").remove());
    }

    visualizationTarget
        .append("p")
        .text("Displaying for Country Name : " + countryName);

    var data = await d3.csv("https:/raw.githubusercontent.com/surajn3/surajn3.github.io/master/data/owid-covid-data.csv");
    console.log("Loaded "+ data.length + " records.");
    
    // Filter data based on selected location
    var countryData = data.filter(function(d){
       return d.location === countryName;
    })

    var maxNewCases = d3.max(countryData, function(d){
                    return parseInt(d.new_cases);
                });


    var y = d3.scaleLinear()
                .domain([0, maxNewCases])
                .range([height, 0]);

    var x = d3.scaleLinear()
                .domain([0, countryData.length])
                .range([0, width]);

    //date format
    var dateParser = d3.timeParse("%Y-%m-%d");

    var timeScale = d3.scaleTime()
                        .domain(d3.extent(countryData, function(d){
                            return dateParser(d.date);
                        }))
                        .range([0, width]);

    visualizationTarget
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .classed("barchart", true);


    var svg = d3.select(".barchart");

    console.log("setting width to " + timeScale(dateParser(countryData[1].date)));

    svg.append("g")
        .selectAll("rect")
        .data(countryData)
        .enter()
            .append("rect")
            .attr("width", timeScale(dateParser(countryData[1].date)) - 1)
            .attr("height", function(d) {
                //console.log(y(parseInt(d.new_cases)));
                return height - y(parseInt(d.new_cases));
            })
            .attr("x", function(d, i){
                return timeScale(dateParser(d.date));
            })
            .attr("y", function(d){
                return y(parseInt(d.new_cases)) - 20;
            })
            .append("title").text(function(d) {return parseInt(d.new_cases) + " new cases on " + d.date;});

    svg.append("g")
        .attr("transform", "translate(40,-20)")
        .call(d3.axisLeft(y));


    svg.append("g")
        .attr("transform", "translate(40," + (height - 20) +")")
        .call(d3.axisBottom(timeScale));

        
}