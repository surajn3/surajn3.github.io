var data = [];
var firstLoad = true;

function setCountry(countryName) {
    console.log("Setting country name to " + countryName);
    document.getElementById("dropDownButton").innerHTML = countryName;
    console.log(document.getElementById("dropDownButton").innerHTML);
    firstPage();
}

async function firstPage() {
    var countryName = "United States";

    var visualizationTarget = d3.select("#visualizationTarget");
    var countryDropDownDiv = d3.select("#countryDropDownDiv");

    var width = visualizationTarget.node().getBoundingClientRect().width;
    var height = 400;

    var inputCountryName = document.getElementById("dropDownButton").innerHTML;
    
    if (inputCountryName != "") {
        countryName = inputCountryName.trim();
        // Cleanup logic
        d3.select("svg").remove();
        visualizationTarget.select("button").remove();
    } else {
        console.log("Setting Default Country to US");
        countryName = "United States";
    }

    if(data.length == 0) {
        data = await d3.csv("https://raw.githubusercontent.com/surajn3/surajn3.github.io/master/data/owid-covid-data.csv");
        console.log("Loaded "+ data.length + " records.");
    }
    
    // Filter data based on selected location
    var countryData = data.filter(function(d){
       return d.location === countryName;
    })

    //countryDropDownDiv
    var locations = Array.from(new Set(data.map(function(d){return d.location;}))).sort();

    countryDropDownDiv
        .selectAll("a")
        .data(locations)
        .enter()
            .append("a")
            .classed("dropdown-item", true)
            .attr("href", function(d){ return "JavaScript:setCountry('" + d +"');"})
            .text(function(d){return d;});

    var maxNewCases = d3.max(countryData, function(d){
                    return parseInt(d.new_cases);
                });


    // Add 5% extra room on Y axis for clarity
    var y = d3.scaleLinear()
                .domain([0, maxNewCases + maxNewCases * 0.05])
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

    //d.setDate(d.getDate() + 1)
    var startDate = dateParser(countryData[0].date);
    console.log(startDate);
    startDate.setDate(startDate.getDate() + 1);
    console.log(startDate);
    console.log(timeScale(startDate));
    console.log(dateParser(countryData[1].date) + " " + timeScale(dateParser(countryData[1].date)));
    //console.log((dateParser(countryData[0].date) + 1) + " " + timeScale(dateParser(countryData[0].date)) + 1);
    
    svg.append("g")
        .selectAll("rect")
        .data(countryData)
        .enter()
            .append("rect")
            .attr("width", timeScale(startDate) - 1)
            .attr("height", function(d) {
                return height - y(parseInt(d.new_cases));
            })
            .attr("x", function(d, i){
                return 40 + timeScale(dateParser(d.date));
            })
            .attr("y", function(d){
                return y(parseInt(d.new_cases)) - 30;
            })
            .append("title").text(function(d) {return parseInt(d.new_cases) + " new cases on " + d.date;});

    svg.append("g")
        .attr("transform", "translate(40,-30)")
        .call(d3.axisLeft(y));


    svg.append("g")
        .attr("transform", "translate(40," + (height - 30) +")")
        .call(d3.axisBottom(timeScale));


    visualizationTarget
        .append("button")
        .classed("btn btn-primary",true)
        .attr("type", "button")
        .attr("onClick", "secondPage()")
        .text("Next");
}

async function secondPage() {
    console.log("In secondPage")

    var countryName = "United States";

    d3.select("svg").remove();
    d3.select("#dropDownButton").remove();
    d3.select("#countryDropDownDiv").remove();


    var visualizationTarget = d3.select("#visualizationTarget");

    var width = visualizationTarget.node().getBoundingClientRect().width;
    var height = 400;

    if(data.length == 0) {
        data = await d3.csv("https://raw.githubusercontent.com/surajn3/surajn3.github.io/master/data/owid-covid-data.csv");
        console.log("Loaded "+ data.length + " records.");
    }
    
    // Filter data based on selected location
    var countryData = data.filter(function(d){
       return d.location === countryName;
    })

    //countryDropDownDiv
    var locations = Array.from(new Set(data.map(function(d){return d.location;}))).sort();

/*
    var countryDropDownDiv = d3.select("#countryDropDownDiv");

    countryDropDownDiv
        .selectAll("a")
        .data(locations)
        .enter()
            .append("a")
            .classed("dropdown-item", true)
            .attr("href", function(d){ return "JavaScript:setCountry('" + d +"');"})
            .text(function(d){return d;});

    var maxNewCases = d3.max(countryData, function(d){
                    return parseInt(d.new_cases);
                });


    // Add 5% extra room on Y axis for clarity
    var y = d3.scaleLinear()
                .domain([0, maxNewCases + maxNewCases * 0.05])
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

    console.log(dateParser(countryData[0].date) + " " + timeScale(dateParser(countryData[0].date)));
    console.log(dateParser(countryData[1].date) + " " + timeScale(dateParser(countryData[1].date)));
    console.log(dateParser(countryData[2].date) + " " + timeScale(dateParser(countryData[2].date)));

    svg.append("g")
        .selectAll("rect")
        .data(countryData)
        .enter()
            .append("rect")
            .attr("width", timeScale(dateParser(countryData[1].date)) - 1)
            .attr("height", function(d) {
                return height - y(parseInt(d.new_cases));
            })
            .attr("x", function(d, i){
                return 40 + timeScale(dateParser(d.date));
            })
            .attr("y", function(d){
                return y(parseInt(d.new_cases)) - 30;
            })
            .append("title").text(function(d) {return parseInt(d.new_cases) + " new cases on " + d.date;});

    svg.append("g")
        .attr("transform", "translate(40,-30)")
        .call(d3.axisLeft(y));


    svg.append("g")
        .attr("transform", "translate(40," + (height - 30) +")")
        .call(d3.axisBottom(timeScale));

  */      
}