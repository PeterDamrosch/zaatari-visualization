
function createPopulationVisualization (data) {
    //Log Data
    console.log(data)

    //Constants
    var w = 600,
        h = 400,
        margin = {top: 60, bottom: 20, left: 50, right:0};

    //Create area chart svg
    var svg = d3.select('#area-div').append('svg')
        .attr('height', h + margin.top + margin.bottom)
        .attr('width', w + margin.left + margin.right);

    //Create scales for x and y axes
    var xScale = d3.time.scale()
        .domain([d3.min(data, function(d) {return d.date}),
            d3.max(data, function(d) {return d.date})])
        .range([margin.left, w]);

    var yScale = d3.scale.linear()
        .domain([0, d3.max(data, function(d) {return d.population})])
        .range([h, margin.top]);

    //Line generation function
    var lineFunction = d3.svg.line()
        .x(function(d) {return xScale(d.date)})
        .y(function(d) {return yScale(d.population)})
        .interpolate('linear');

    //Draw the line
    var path1 = svg.append('path')
        .datum(data)
        .attr("class", "population-line")
        .attr("d", lineFunction(data));

    //Area generation function
    var area = d3.svg.area()
        .x(function(d) {return xScale(d.date)})
        .y0(h)
        .y1(function(d) {return yScale(d.population)});

    //Draw the area
    var path = svg.append('path')
        .datum(data)
        .attr("class", "area")
        .attr("d", area);

    //Create x and y axes
    var xAxisFormat = d3.time.format("%b '%y");
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .tickFormat(xAxisFormat)
        .orient("bottom");

    svg.append("g")
        .attr("class", "axis x-axis")
        .call(xAxis)
        .attr("transform", "translate (0, " + h + ")");

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")

    svg.append("g")
        .attr("class", "axis y-axis")
        .call(yAxis)
        .attr("transform", "translate(" + margin.left + ")")

    //Create chart title
    svg.append("text")
        .attr("class", "chart-title")
        .text("Refugees in Zaatari: 2013-2015")
        .attr("transform", "translate(" + 0.3 * w +", " + (margin.top - 15) + ")")

    //TOOL TIP INFO FROM : http://www.d3noob.org/2014/07/my-favourite-tooltip-method-for-line.html
    //Bisector accessor function to get tool-tip index
    var bisect = d3.bisector(function(d) {return d.date;}).left;

    //Tool tip group
    var focus = svg.append('g')
        .style('display', 'none')

    //Tool tip circles
    focus.append('circle')
        .attr("class", "tool-circle")
        .style('fill', 'none')
        .style('stroke', '#2C3539')
        .style('stroke-width', 2)
        .attr('r', 4)

    //Tool tip line
    focus.append('line')
        .attr("class", "tool-line")
        .style('fill', 'none')
        .style('stroke', '#2C3539')
        .style('stroke-width', 2)
        .attr('y0', 0)
        .attr('y1', h - margin.top)

    //Tool tip text
    focus.append('text')
        .attr('class', 'tool-text1')
        .style("stroke", "white")       //this give a nice drop-shadow effect with a white background
        .style("stroke-width", "3.5px")
        .style("opacity", 0.8)
        .style('font-family', 'sans-serif')
        .style('font-size', '13px')
        .attr("dx", 8)  //dy and dx are positioning units (relative, not absolute like x and y)
        .attr("dy", "-2em"); //1em is 1 font-size unit, here - makes it moved up
    focus.append('text')
        .attr('class', 'tool-text2')
        .style('font-family', 'sans-serif')
        .style('font-size', '13px')
        .style("stroke-width", "3.5px")
        .style('color', '#2C3539')
        .attr("dx", 8)
        .attr("dy", "-2em");
    focus.append('text')
        .attr('class', 'tool-text3')
        .style("stroke", "white")       //this give a nice drop-shadow effect with a white background
        .style("stroke-width", "3.5px")
        .style("opacity", 0.8)
        .style('font-family', 'sans-serif')
        .style('font-size', '11.5px')
        .attr("dx", 8)  //dy and dx are positioning units (relative, not absolute like x and y)
        .attr("dy", "-1em"); //1em is 1 font-size unit, here - makes it moved up
    focus.append('text')
        .attr('class', 'tool-text4')
        .style('font-family', 'sans-serif')
        .style('font-size', '11.5px')
        .style("stroke-width", "3.5px")
        .style('color', '#2C3539')
        .attr("dx", 8)
        .attr("dy", "-1em");

    //Append rectangle to capture mouse position
    svg.append('rect')
        .attr('width', w)
        .attr('height', h)
        .style('fill', 'none')
        .style('pointer-events', 'all')
        .on('mouseover', function() {focus.style('display', null);})
        .on('mouseout', function() {focus.style("display", "none")})
        .on("mousemove", mousemove);

    //Mousemove
    function mousemove() {
        var x0 = xScale.invert(d3.mouse(this)[0]),//d3.mouse(this)[0] captures x position of mouse. .invert reverse-maps the scale, here mouse position to date
            i = bisect(data, x0, 1),//takes as inputs data and the date corresponding to the mouse pos (x0), returns index of data array that is nearest to mouse pos (left)
            d0 = data[i - 1], //d0 and d1 are the value of the date above and below our mouse pos [i] and [i-1]
            d1 = data[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0; //shorthand JS if statement, makes d either d1 or d0 depending on if the mouse is closer to one or the other

        //Check that d has been correctly calculated
        console.log(d);

        //Update circle based on mouse position
        focus.select(".tool-circle")
            .attr("transform",
                    "translate(" + xScale(d.date) + "," + yScale(d.population) + ")");

        //Update line based on mouse position
        focus.select('.tool-line')
            .attr("transform",
                "translate(" + xScale(d.date) + "," + margin.top + ")")
            .attr("")

        //Update text based on mouse position, formating with thousands-comma and month/day/year
        var formatToolTip = d3.format(',');
        focus.select('.tool-text1')
            .text(formatToolTip(d.population))
            .attr("transform",
                "translate(" + xScale(d.date) + "," + yScale(d.population) + ")");

        focus.select('.tool-text2')
            .text(formatToolTip(d.population))
            .attr("transform",
                "translate(" + xScale(d.date) + "," + yScale(d.population) + ")");

        var formatDateTip = d3.time.format('%m/%d/%y')
        focus.select('.tool-text3')
            .text(formatDateTip(d.date))
            .attr("transform",
                "translate(" + xScale(d.date) + "," + yScale(d.population) + ")");

        focus.select('.tool-text4')
            .text(formatDateTip(d.date))
            .attr("transform",
                "translate(" + xScale(d.date) + "," + yScale(d.population) + ")");
    }
};

//Second Chart - Housing Type
function createHousingVisualization(data) {
    console.log(data);
    //Sizing Constants
    var w = 300,
        h = 400,
        margin = {top: 60, bottom: 20, left: 50, right:20},
        barPadding = 30,
        barWidth = 41;

    var svg = d3.select("#bar-div").append("svg")
        .attr('height', h + margin.top + margin.bottom)
        .attr('width', w + margin.left + margin.right);

    //Define x and y scales
    var yScale = d3.scale.linear()
        .domain([0, 1])
        .range([h, margin.top]);

    var xScale = d3.scale.ordinal()
        .domain(["Caravans", "Tents", "Caravans and Tents"])
        .rangeBands([margin.left, w]);

    //Create bars
    var bars = svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr("class", "bars")
        .attr("x", function(d,i) {return xScale(d.name) + 0.5 * barWidth})
        //.attr("x", function(d, i) {return i * (barPadding + barWidth) + 20})
        .attr("y", function (d) {return yScale(d.value)})
        .attr("width", barWidth)
        .attr("height", function(d) {return h - yScale(d.value)});

    //Create bar labels
    var barLabels = svg.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "labels")
        .text(function(d) {return d3.round(d.value * 100, 2) + "%"})
        .attr("x", function(d) { return xScale(d.name) + 0.625 * barWidth})
        .attr ("y", function(d) { return yScale(d.value) - 6});

    //Create x and y axes
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");

    svg.append("g")
        .attr("class", "axis x-axis")
        .call(xAxis)
        .attr("transform", "translate (0, " + h + ")");
    var yFormat = d3.format("%")
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .tickFormat(yFormat);

    svg.append("g")
        .attr("class", "axis y-axis")
        .call(yAxis)
        .attr("transform", "translate(" + margin.left + ")");

    //Create chart title
    svg.append("text")
        .attr("class", "chart-title")
        .text("Housing Type")
        .attr("transform", "translate(" + 0.4 * w +", " + (margin.top - 15) + ")")
};

//Load population data and reformat strings
d3.csv("data/zaatari-refugee-camp-population.csv", function(dataset) {

    monthDayYear = d3.time.format("%x");

    for (i=0; i < dataset.length; i++) {
        dataset[i].population = +dataset[i].population;
        dataset[i].date = monthDayYear.parse(dataset[i].date)
    }

    createPopulationVisualization(dataset)
});

//Load Housing Data
d3.json("data/zaatari-housing.json", function(dataset) {
   createHousingVisualization(dataset)
});