async function init() {
    var visualizationTarget = d3.select("#visualizationTarget");
    //console.log(visualizationTarget.node().getBoundingClientRect().width);

    var width = visualizationTarget.node().getBoundingClientRect().width;
    var height = 400;

    var data = ["Hello"];

    visualizationTarget
        .append("h1")
        .text("Hello")

    var data = await d3.csv("https://raw.githubusercontent.com/surajn3/surajn3.github.io/master/data/owid-covid-data.csv");
    console.log(data.length);
    
    // Filter data based on selected location
    var countryData = data.filter(function(d){
       return d.location === "United States";
    })

    var maxNewCases = d3.max(countryData, function(d){
                    return parseInt(d.new_cases);
                });

    console.log("maxNewCases : " + maxNewCases)

    var y = d3.scaleLinear()
                .domain([0, maxNewCases])
                .range([height, 0]);

    var x = d3.scaleLinear()
                .domain([0, countryData.length])
                .range([0, width]);            

    console.log("y(0) : " +y(0));
    console.log("y(3000) : " +y(78427));

    visualizationTarget
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .classed("barchart", true);


    var svg = d3.select(".barchart");

    svg.selectAll("rect")
        .data(countryData)
        .enter()
            .append("rect")
            .attr("width", x(1) - 1)
            .attr("height", function(d) {
                //console.log(y(parseInt(d.new_cases)));
                return height - y(parseInt(d.new_cases));
            })
            .attr("x", function(d, i){
                return x(i);
            })
            .attr("y", function(d){
                return y(parseInt(d.new_cases));
            });


        
}