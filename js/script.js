var data = [];
var firstLoad = true;

function setCountry(countryName) {
    console.log("Setting country name to " + countryName);
    document.getElementById("dropDownButton").innerHTML = countryName;
    console.log(document.getElementById("dropDownButton").innerHTML);
}

async function firstPage() {

    var startDateInput = document.getElementById("inputStartDate").value;
    var endDateInput = document.getElementById("inputEndDate").value;
    console.log("Start Date : " + startDateInput);
    console.log("End Date : " + endDateInput);

    d3.select("#inputStartDate").on("changeDate",function(d,i){
        console.log("changeDate")
    });

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
       return d.location === countryName & d.date >= startDateInput & d.date <= endDateInput;
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
    startDate.setDate(startDate.getDate() + 1);
    
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

    // Append div to body for tooltip
    d3.select("body").append("div").attr("id", "tooltip");


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
        return d.date === "2020-07-28" & d.location != "World";})

    var yData = countryData.map(function(d){return parseFloat(d['total_cases']);});

    var xData = countryData.map(function(d){return parseFloat(d['total_deaths']);});

    // Add 5% extra room on Y axis for clarity
    var y = d3.scaleLog()
                .base(10)
                .domain([1,8000000])
                .range([height, 0]);

    var x = d3.scaleLog()
                .base(10)
                .domain([1,300000])
                .range([0, width - 45]);                    

    //countryDropDownDiv
    var locations = countryData.map(function(d){return d.location;}).sort();

    visualizationTarget
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .classed("scatterplot", true);

    var svg = d3.select(".scatterplot"); 
    

    svg.append("g")
        .attr("transform","translate(45,10)")
        .selectAll("circle")
        .data(countryData)
        .enter()
            .append("circle")
            .classed("default-circle-color", true)
            .on("mouseover", function(d,i){
                d3.select(this)
                    .classed("default-circle-color",false)
                    .classed("highlighted-circle-color",true)
                    .attr("r", 4 + 3);

                var l = d3.event.pageX - 10;
                var t = d3.event.pageY - 40;

                d3.select("#tooltip")
                    .style("left", l + "px")
                    .style("top", t + "px")
                    .style("width", + d.location.length * 11 + "px")
                    .style("height", "35px")
                    .style("opacity", 1)
                    .text(d.location)

                console.log("Mouse Over on " + d.location);
            })
            .on("mouseout", function(d,i){
                d3.select(this)
                    .classed("highlighted-circle-color",false)
                    .classed("default-circle-color",true)
                    .attr("r", 4);

                d3.select("#tooltip")
                    .style("opacity", 0);   

                console.log("Mouse Out on " + d.location);
            })
            .on("mousedown",function(d,i){

                var l = d3.event.pageX - 10;
                var t = d3.event.pageY - 40;

                d3.select("#tooltip")
                    .style("left", l + "px")
                    .style("top", t + "px")
                    .style("width", + (d.location.length + 10) * 10 + "px")
                    .style("height", "80px")
                    .style("opacity", 1)
                    .html("Location : " + d.location + 
                        " <br>Total Deaths : " + parseInt(d.total_deaths) +
                        " <br>Total Cases : " + parseInt(d.total_cases))
                console.log("Mouse clicked on " + d.location);
            })
            .attr("cx", function(d){
                var scaledX = x(parseFloat(d['total_deaths']));
                if(isNaN(scaledX)) {
                    scaledX = 0;
                }
                return scaledX;
            })
            .attr("cy",height)
            .attr("r", 4)
            .transition()
            .duration(2000)
            .attr("cy", function(d){return y(parseFloat(d['total_cases']));})


    svg.append("g")
        .attr("transform", "translate(40,-30)")
        .call(d3.axisLeft(y).tickFormat(d3.format("~s")).tickValues([1, 100, 500, 10000, 100000, 500000, 1000000, 1500000, 2000000, 2500000]));


    svg.append("g")
        .attr("transform", "translate(45," + (height - 30) +")")
        .call(d3.axisBottom(x).tickFormat(d3.format("~s")).tickValues([1, 100, 500, 10000, 50000, 100000, 200000, 500000, 1000000, 2000000]));             

         
}


async function thirdPage() {
    var countryName = "United States";

    // Cleanup
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

    data = data.filter(function(d){
        return d.date > "2020-04-15" & d.location != "World";
    });

    var locations = Array.from(new Set(data.map(function(d){return d.location;}))).sort();

    var locations = ["United States", "Brazil", "Italy", "India"];
    
    // Filter data based on selected location
    var countryData = locations.map(function(loc){
        return data.filter(function(d){
        return d.location === loc;
    });
    });
    
    var dateParser = d3.timeParse("%Y-%m-%d");

    // TODO : Change this to include data only for top N countries
    var maxTotalCases = d3.max(data, function(d){
                    return parseFloat(d.total_cases);
                });


    // Add 5% extra room on Y axis for clarity
    /*
    var y = d3.scaleLog()
                .base(2)
                .domain([1, maxTotalCases + maxTotalCases * 0.05])
                .range([height, 0]);
    */


    var y = d3.scaleLinear()
                .domain([0, maxTotalCases + maxTotalCases * 0.05])
                .range([height, 0]);            

    var timeScale = d3.scaleTime()
                        .domain(d3.extent(data, function(d){
                            return dateParser(d.date);
                        }))
                        .range([0, width - 40]);

    var line = d3.line()
                .x(function(d){
                    var date = dateParser(d.date);
                    return timeScale(date);
                })
                .y(function(d){
                    return y(parseFloat(d.total_cases) + 0.2);
                });

     visualizationTarget
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .classed("trendline", true);


    var svg = d3.select(".trendline");

    svg.append("g")
        .attr("transform", "translate(80,-30)")
        .selectAll("path")
        .data(countryData)
        .enter()
            .append("path")
            .attr("d", function(d){ return line(d);})

    svg.append("g")
        .attr("transform", "translate(80,-30)")
        .call(d3.axisLeft(y));


    svg.append("g")
        .attr("transform", "translate(80," + (height - 30) +")")
        .call(d3.axisBottom(timeScale));        

}