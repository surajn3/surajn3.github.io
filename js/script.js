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
                    return parseFloat(d.new_cases);
                });


    // Add 5% extra room on Y axis for clarity
    var y = d3.scaleLinear()
                .domain([0, maxNewCases + maxNewCases * 0.05])
                .range([height, 0]);

    var x = d3.scaleLinear()
                .domain([0, countryData.length])
                .range([0, width - 40]);

    //date format
    var dateParser = d3.timeParse("%Y-%m-%d");

    var timeScale = d3.scaleTime()
                        .domain(d3.extent(countryData, function(d){
                            return dateParser(d.date);
                        }))
                        .range([0, width - 40]);

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
                return height - y(parseFloat(d.new_cases));
            })
            .attr("x", function(d, i){
                return 40 + timeScale(dateParser(d.date));
            })
            .attr("y", function(d){
                return y(parseFloat(d.new_cases)) - 30;
            })
            .append("title").text(function(d) {return parseFloat(d.new_cases) + " new cases on " + d.date;});

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
    var height = 800;

    if(data.length == 0) {
        data = await d3.csv("https://raw.githubusercontent.com/surajn3/surajn3.github.io/master/data/owid-covid-data.csv");
        console.log("Loaded "+ data.length + " records.");
    }
    
    // Filter data based on selected date
    var countryData = data.filter(function(d){
        return d.date === "2020-06-01" & d.location != "World";})

    var yData = countryData.map(function(d){return parseFloat(d['total_cases']);});

    var xData = countryData.map(function(d){return parseFloat(d['total_deaths']);});

    console.log("Extent x data : " + d3.extent(xData));
    console.log("Extent y data : " + d3.extent(yData));

    // Add 5% extra room on Y axis for clarity
    var y = d3.scaleLog()
                .base(10)
                .domain([1,2000000])
                .range([height, 0]);

    var x = d3.scaleLog()
                .base(10)
                .domain([1,120000])
                .range([0, width - 40]);                    

    //countryDropDownDiv
    var locations = countryData.map(function(d){return d.location;}).sort();

    visualizationTarget
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .classed("scatterplot", true);

    var svg = d3.select(".scatterplot"); 
    

    svg.append("g")
        .attr("transform","translate(20,0)")
        .selectAll("circle")
        .data(countryData)
        .enter()
            .append("circle")
            .attr("cx", function(d){
                var scaledX = x(parseFloat(d['total_deaths']));
                console.log("Calculated scaledX : " + scaledX)
                if(isNaN(scaledX)) {
                    scaledX = 0;
                }
                console.log("Nan Replaced scaledX : " + scaledX)
                return scaledX;
            })
            .attr("cy", function(d){return y(parseFloat(d['total_cases']));})
            .attr("r", 5)
                .append("title")
                .text(function(d){ return d.location;})

         
}


async function thirdPage() {
    var countryName = "United States";

    var visualizationTarget = d3.select("#visualizationTarget");
    var countryDropDownDiv = d3.select("#countryDropDownDiv");

    var width = visualizationTarget.node().getBoundingClientRect().width;
    var height = 400;

    if(data.length == 0) {
        data = await d3.csv("https://raw.githubusercontent.com/surajn3/surajn3.github.io/master/data/owid-covid-data.csv");
        console.log("Loaded "+ data.length + " records.");
    }
    
    // Filter data based on selected location
    var countryData = data.filter(function(d){
       return d.location === countryName;
    });

    var countryTotal = countryData.map(function(d){ return d.total_cases;});
    console.log("countryTotal : " + countryTotal);

    //countryDropDownDiv
    var locations = Array.from(new Set(data.map(function(d){return d.location;}))).sort();

    var dateParser = d3.timeParse("%Y-%m-%d");

    var maxTotalCases = d3.max(countryData, function(d){
                    return parseFloat(d.total_cases);
                });


    // Add 5% extra room on Y axis for clarity
    var y = d3.scaleLinear()
                .domain([0, maxTotalCases + maxTotalCases * 0.05])
                .range([height, 0]);

    var timeScale = d3.scaleTime()
                        .domain(d3.extent(countryData, function(d){
                            return dateParser(d.date);
                        }))
                        .range([0, width - 40]);

    var line = d3.line()
                .x(function(d){
                    var date = dateParser(d.date);
                    return timeScale(date);
                })
                .y(function(d){
                    return y(d.total_cases);
                });

     visualizationTarget
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .classed("trendline", true);


    var svg = d3.select(".trendline");

    svg.append("g")
        .attr("transform", "translate(0,-10)")
        .selectAll("path")
        .data([countryData])
        .enter()
            .append("path")
            .attr("d", function(d){ return line(d);})

}