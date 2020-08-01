async function init() {
    var visualizationTarget = d3.select("#visualizationTarget");
    console.log(visualizationTarget);

    var data = ["Hello"];

    visualizationTarget
        .append("h1")
        .text("Hello")

    var data = await d3.csv("https://raw.githubusercontent.com/surajn3/surajn3.github.io/master/data/owid-covid-data.csv");
    console.log(data.length);
    
    // Filter data based on selected location
    console.log(data.filter(function(d){
       return d.location === "United States";
    }).length);
}