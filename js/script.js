var data = [];
var firstLoad = true;

function setCountry(countryName) {
    console.log("Setting country name to " + countryName);
    document.getElementById("dropDownButton").innerHTML = countryName;
    console.log(document.getElementById("dropDownButton").innerHTML);
}

async function firstPage() {

    // Append div to body for tooltip
    d3.select("body").append("div").attr("id", "tooltip");
    d3.select("body").append("div").attr("id", "tooltip-bar");

    // Cleanup from 2nd page
    d3.select("#firstPageBackButton").remove();
    d3.select("#secondPageNextButton").remove();
    d3.select("#dropDownButtonDiv").style("display", "block");
    d3.select("#inputSelectDateDiv").style("display", "none");
    d3.select("#inputStartDateDiv").style("display", "block");
    d3.select("#inputEndDateDiv").style("display", "block");

    d3.select("#p1").style("display", "block");
    d3.select("#p2").style("display", "none");
    d3.select("#p3").style("display", "none");

    d3.select("#refreshButton").attr("onClick", "firstPage()");

    var startDateInput = document.getElementById("inputStartDate").value;
    var endDateInput = document.getElementById("inputEndDate").value;

    var countryName = "United States";

    var visualizationTarget = d3.select("#visualizationTarget");
    var countryDropDownDiv = d3.select("#countryDropDownDiv");

    var width = visualizationTarget.node().getBoundingClientRect().width;
    var height = 800;

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
        data = data.filter(function(d){return d.location != "World" & d.location != "International"})
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
            .attr("x", function(d, i){
                return 40 + timeScale(dateParser(d.date));
            })
            .attr("y", height-30)
            .attr("height", 0)
            .on("mouseover", function(d,i){
                d3.select(this)
                    .classed("default-rect-color",false)
                    .classed("highlighted-rect-color",true)

                var l = d3.event.pageX - 10;
                var t = d3.event.pageY - 40;

                d3.select("#tooltip-bar")
                    .style("left", l + "px")
                    .style("top", t + "px")
                    //.style("width", + d.location.length * 11 + "px")
                    //.style("height", "35px")
                    .style("opacity", 1)
                    .text(parseInt(d.new_cases))
            })
            .on("mouseout", function(d,i){
                d3.select(this)
                    .classed("highlighted-rect-color",false)
                    .classed("default-rect-color",true)

                d3.select("#tooltip-bar")
                    .style("opacity", 0);   

            })
            .transition()
            .duration(2000)
            .attr("y", function(d){
                return y(parseFloat(d.new_cases)) - 30;
            })
            .attr("height", function(d) {
                return height - y(parseFloat(d.new_cases));
            });

    svg.append("g")
        .classed("p1-y", true)
        .attr("transform", "translate(40,-30)")
        .call(d3.axisLeft(y));

    svg.append("g")
        .classed("p1-x", true)
        .attr("transform", "translate(40," + (height - 30) +")")
        .call(d3.axisBottom(timeScale));


    visualizationTarget
        .append("button")
        .classed("btn btn-primary",true)
        .attr("id", "firstPageNextButton")
        .attr("type", "button")
        .attr("onClick", "secondPage()")
        .text("Next");
}

async function secondPage() {
    console.log("In secondPage")

    var countryName = "United States";


    d3.select(".scatterplot").remove();
    d3.select(".trendline").remove();
    d3.select(".legend-svg").remove();
    d3.select(".barchart").remove();
    d3.select("#dropDownButtonDiv").style("display", "none");
    d3.select("#inputSelectDateDiv").style("display", "block");
    d3.select("#inputStartDateDiv").style("display", "none");
    d3.select("#inputEndDateDiv").style("display", "none");
    //d3.select("#countryDropDownDiv").remove();
    d3.select("#firstPageNextButton").remove();
    d3.select("#secondPageBackButton").remove();
    d3.select("#firstPageBackButton").remove();
    d3.select("#secondPageNextButton").remove();

    d3.select("#p1").style("display", "none");
    d3.select("#p2").style("display", "block");
    d3.select("#p3").style("display", "none");

    // Set target for Refresh
    d3.select("#refreshButton").attr("onClick", "secondPage()");


    var visualizationTarget = d3.select("#visualizationTarget");

    var width = visualizationTarget.node().getBoundingClientRect().width;
    var height = 800;

    if(data.length == 0) {
        data = await d3.csv("https://raw.githubusercontent.com/surajn3/surajn3.github.io/master/data/owid-covid-data.csv");
        console.log("Loaded "+ data.length + " records.");
        data = data.filter(function(d){return d.location != "World" & d.location != "International"})
    }
    
    var selectedDate = document.getElementById("inputSelectDate").value;

    // Filter data based on selected date
    var countryData = data.filter(function(d){
        return d.date === selectedDate;})

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
            })
            .on("mouseout", function(d,i){
                d3.select(this)
                    .classed("highlighted-circle-color",false)
                    .classed("default-circle-color",true)
                    .attr("r", 4);

                d3.select("#tooltip")
                    .style("opacity", 0);   

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
            })
            .attr("cx", function(d){
                var scaledX = x(parseFloat(d['total_deaths']));
                if(isNaN(scaledX)) {
                    scaledX = 0;
                }
                return scaledX;
            })
            .attr("cy",height-40)
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

    visualizationTarget
        .append("button")
        .classed("btn btn-primary",true)
        .attr("id", "firstPageBackButton")
        .attr("type", "button")
        .attr("onClick", "firstPage()")
        .text("Back");

    visualizationTarget
        .append("button")
        .classed("btn btn-primary",true)
        .attr("id", "secondPageNextButton")
        .attr("type", "button")
        .attr("onClick", "thirdPage()")
        .text("Next");
}


async function thirdPage() {
    var countryName = "United States";

    d3.select("#refreshButton").attr("onClick", "thirdPage()");

    // Cleanup
    d3.select(".trendline").remove();
    d3.select(".legend-svg").remove();
    d3.select(".scatterplot").remove();
    d3.select("#firstPageBackButton").remove();
    d3.select("#secondPageNextButton").remove();
    d3.select("#secondPageBackButton").remove();

    d3.select("#dropDownButtonDiv").style("display", "none");
    d3.select("#inputSelectDateDiv").style("display", "none");
    d3.select("#inputStartDateDiv").style("display", "block");
    d3.select("#inputEndDateDiv").style("display", "block");

    d3.select("#p1").style("display", "none");
    d3.select("#p2").style("display", "none");
    d3.select("#p3").style("display", "block");


    var visualizationTarget = d3.select("#visualizationTarget");

    var width = visualizationTarget.node().getBoundingClientRect().width;
    var height = 800;

    if(data.length == 0) {
        data = await d3.csv("https://raw.githubusercontent.com/surajn3/surajn3.github.io/master/data/owid-covid-data.csv");
        console.log("Loaded "+ data.length + " records.");
        data = data.filter(function(d){return d.location != "World" & d.location != "International"})
    }

    var startDateInput = document.getElementById("inputStartDate").value;
    var endDateInput = document.getElementById("inputEndDate").value;

    var data2 = data.filter(function(d){
        return d.date >= startDateInput & d.date <= endDateInput;
    });

    //var locations = Array.from(new Set(data.map(function(d){return d.location;}))).sort();

    var locations = ["United States", "Brazil", "Italy", "India"];
    
    // Filter data based on selected location
    var countryData = locations.map(function(loc){
        return data2.filter(function(d){
        return d.location === loc;
    });
    });

    
    var dateParser = d3.timeParse("%Y-%m-%d");

    // TODO : Change this to include data only for top N countries
    var maxTotalCases = d3.max(data2, function(d){
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
                        .domain(d3.extent(data2, function(d){
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

    var colorScale = d3.scaleOrdinal(d3.schemeCategory10);            

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
            .style("stroke",function(d,i){ return colorScale(i);})

    svg.append("g")
        .attr("transform", "translate(80,-30)")
        .call(d3.axisLeft(y));


    svg.append("g")
        .attr("transform", "translate(80," + (height - 30) +")")
        .call(d3.axisBottom(timeScale));

    visualizationTarget
        .append("svg")
        .attr("width", width)
        .attr("height", 40)
        .classed("legend-svg", true);

    var svg2 = d3.select(".legend-svg");

    svg2.selectAll("circle")
        .data(locations)
        .enter()
            .append("circle")
                .attr("cy",10)
                .attr("cx",function(d,i){
                    return (i+1) * 150;
                })
                .attr("r", 6).style("fill", function(d,i){
                    return colorScale(i);
                })

    svg2.selectAll("text")
        .data(locations)
        .enter()
            .append("text")
                .attr("y",10)
                .attr("x",function(d,i){
                    return (i+1) * 150 + 10;
                })
                .text(function(d,i){
                    return d;
                }).style("font-size", "15px").attr("alignment-baseline","middle");
            

     


    visualizationTarget
        .append("button")
        .classed("btn btn-primary",true)
        .attr("id", "secondPageBackButton")
        .attr("type", "button")
        .attr("onClick", "secondPage()")
        .text("Back");  

}