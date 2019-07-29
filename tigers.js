(function() {
    var width = 1175,
        //height = 550;
        height = 575;

    var svg = d3.select("#chart")
        .append("svg")
        .attr("height", height)
        .attr("width", width)
        .append("g")
        .attr("transform", "translate(0,250)")

    var defs = svg.append("defs")

    defs.append("pattern")
        .attr("id", "stripes")
        .attr("height", "100%")
        .attr("width", "100%")
        .attr("patternContentUnits", "objectBoundingBox")
        .append("image")
        .attr("height", 1)
        .attr("width", 1)            
        .attr("preserveAspectRatio", "none")
        .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
        .attr("xlink:href", "tiger_pattern_color.png")

    var radiusScale = d3.scaleSqrt()
        //.domain([14, 2250])
        .domain([5, 2967])
        //.range([7, 105])
        .range([5, 125]) // eye-test correction

    var subspecies_x = [175, 450, 650, 850, 1050]

    //var subspecies = ["bengal", "siberian", "sumatran", "indochinese", "malayan"]    
    var subspecies = ["bengal", "sumatran", "siberian", "indochinese", "malayan"] // when n sumatran > n siberian

    //var scientifics = ["P. tigris tigris", "P. tigris corbetti", "P. tigris jacksoni", "P. tigris sondaica", "P. tigris altaica"] // wrong
    //var scientifics = ["P. tigris tigris", "P. tigris altaica", "P. tigris sondaica", "P. tigris corbetti", "P. tigris jacksoni"] // fixed
    var scientifics = ["P. tigris tigris", "P. tigris sondaica", "P. tigris altaica", "P. tigris corbetti", "P. tigris jacksoni"] // when n sumatran > n siberian

    // bubbles simulation defs
    var forceXCombine = d3.forceX(width / 2)
        .strength(0.05)

    var forceXSeparate = d3.forceX(function(d) {
        return subspecies_x[subspecies.indexOf(d.subspecies)]
        }).strength(0.05)

    var forceXLeave = d3.forceX(width + 200).strength(1)

    //var forceYCombine = d3.forceY(0).strength(0.05)
    var forceYCombine = d3.forceY(50).strength(0.05) // to allign with maps

    var forceCollide = d3.forceCollide(function(d) {
            return  radiusScale((parseInt(d.min) + parseInt(d.max)) / 2) + 3
        })

    var simulation = d3.forceSimulation()
        .force("x", forceXCombine)
        .force("y", forceYCombine)
        .force("collide", forceCollide)

    var simulation_ = d3.forceSimulation()        
        .force("collide", forceCollide)
        .force("y", forceYCombine)

    var simulation_d = d3.forceSimulation()
        .force("x", forceXLeave)


    // preloading data
    d3.queue()
        .defer(d3.csv, "tigers.csv")
        .await(ready)

    // visualizing data
    function ready (error, datapoints) {
        //console.log(datapoints)

        //var format = d3.format(",") // # THOUSANDS COMMA BUG
        var totaltigers = d3.sum(datapoints, function(d) { 
        //var totaltigers = format(d3.sum(datapoints, function(d) { // # THOUSANDS COMMA BUG
            return Math.floor((parseInt(d.min) + parseInt(d.max)) / 2)
        }) 
        //})) // # THOUSANDS COMMA BUG

        // globals
        var text_location = svg.append("text")
            .attr("x", 1100)
            .attr("y", -165)
            .attr("id", "location")
            .attr("class", "globals")
            .attr("font-size", 22)            
            .attr("text-anchor", "end")
            .attr("opacity", 1)
            .text("Worldwide")

        var text_number = svg.append("text")
            .attr("x", 1100)
            .attr("y", -200)
            .attr("id", "total")
            .attr("class", "globals")
            .attr("font-size", 30)
            .attr("text-anchor", "end")
            .attr("opacity", 1)
            .text(totaltigers)

        // total circle
        var circle = svg.append("circle")
            .attr("id", "totalcircle")
            .attr("cx", 200)
            .attr("cy", 50)
            .attr("r", radiusScale(totaltigers))
            .attr("fill", "none")
            .attr("stroke", "black")            
            .attr("stroke-dasharray", "7,7")
            .attr("opacity", 0)                   

        // maps
        // preload all maps lags, so we will use only one and load the correspondent image when needed
        var maps = svg
            // .selectAll(".maps")
            // .data(datapoints)
            // .enter()
            .append("image")
            // .attr("xlink:href", function(d) {
            //     return d.country + ".png"
            // })
            // .attr("xlink:href", "russia.png")
            .attr("x", 500)
            .attr("y", -200)
            .attr("height", 450)
            .attr("width", 500)
            .attr("right", 950)            
            // .attr("id", function(d) {
            //     return "map_" + d.country.toLowerCase()
            // })
            .attr("id", "map")
            .attr("class", "maps")
            .attr("opacity", 0)
            .attr("align", "right")

        // subspecies
        var figures = svg.selectAll(".figures")
            .data(subspecies)
            .enter()
        // subspecies figures
        figures.append("text")
            .attr("class", "subspecies")
            .attr("font-size", 30)
            .attr("x", function(d, i) {
                return subspecies_x[i]
            })
            .attr("y", 185 + 45)            
            .attr("text-anchor", "middle")
            .attr("opacity", 0)
            .text(function(d) {
                return d3.sum(datapoints, function(e) {
                    return e.subspecies === d ? Math.floor((parseInt(e.min) + parseInt(e.max)) / 2) : 0
                    }).toLocaleString()
                })
        // subspecies names
        figures.append("text")
            .attr("class", "subspecies")
            .attr("font-size", 16)
            .attr("x", function(d, i) {
                return subspecies_x[i]
            })
            .attr("y", 215 + 45)            
            .attr("text-anchor", "middle")
            .attr("opacity", 0)
            .text(function(d) {
                return d[0].toUpperCase() + d.substr(1) + " Tigers" 
            })
        // subspecies scientific names
        figures.append("text")
            .attr("class", "subspecies")
            .attr("font-size", 13)
            .attr("x", function(d, i) {
                return subspecies_x[i]
            })
            .attr("y", 235 + 45)            
            .attr("text-anchor", "middle")
            .attr("font-style", "italic")
            .attr("opacity", 0)
            .text(function(d, i) {
                return "(" + scientifics[i] + ")"
            })

        // radio buttons text
        var text_button = svg.append("text")
            .attr("x", 65)
            .attr("y", -209)                        
            .text("All Tigers")

        var text_button2 = svg.append("text")
            .attr("x", 65)
            .attr("y", -179)                           
            .text("By Subspecies")

        // radio buttons background
        var button_bg = svg.append("circle")
            .attr("x", 0)
            .attr("y", 0)
            .attr("transform", "translate(50,-215)")
            .attr("r", "7")
            .attr("fill", "white")                

        var button2_bg = svg.append("circle")
            .attr("x", 0)
            .attr("y", 0)
            .attr("transform", "translate(50,-185)")
            .attr("r", "7")
            .attr("fill", "white") 

        // radio buttons inside
        var button = svg.append("circle")
            .attr("x", 0)
            .attr("y", 0)
            .attr("transform", "translate(50,-215)")
            .attr("r", "4")
            .attr("fill", "black")          
            .attr("id", "alltigers")
            .attr("stroke", "white")
            .attr("stroke-width", "1px")            

        var button2 = svg.append("circle")
            .attr("x", 0)
            .attr("y", 0)
            .attr("transform", "translate(50,-185)")
            .attr("r", "4")
            .attr("fill", "white")           
            .attr("id", "bysubspecies")
            .attr("stroke", "white")
            .attr("stroke-width", "1px")

        // bubbles
        var bubbles = svg.selectAll(".bubbles")
            .data(datapoints)
            .enter().append("circle")
            .attr("class", "bubbles")
            .attr("r", function(d) {
               return  radiusScale(Math.floor((parseInt(d.min) + parseInt(d.max)) / 2))
            })
            .attr("fill", "orange")            
            .on("click", function(d) {
                console.log(d)
            })
            .on("click", function(d) {
                this.setAttribute("selected", "selected")
                this.setAttribute("fill", "url(#stripes)")
                d3.select("#bysubspecies").attr("fill", "white")
                d3.select("#alltigers").attr("fill", "white")
                var selected = [...d3.selectAll(".bubbles")._groups[0]].map(function(e) {
                    return e.getAttribute("selected")
                })
                if (selected.some(function(e) {
                        return e !== null })) {
                    // simulation.force("y", d3.forceY().y(function(b) {                        
                    //     return b.country !== d.country ? - 1000 : 50;
                    // }));
                    // simulation.force("x", d3.forceX().x(function(b) {                        
                    //     return b.country !== d.country ? width / 2 : 200 + radiusScale(totaltigers) - radiusScale(Math.floor((parseInt(b.min) + parseInt(b.max)) / 2));
                    // }));       
                    simulation.force('x', d3.forceX().x(function(b) {
                        // check if bubble is selected to apply different x lineforces, "stay line" or "go line"
                        // when staying x lineforce changes with the radius of the bubble to keep it at total circle's edge
                        return b.country !== d.country ? width + 300 : 200 + radiusScale(totaltigers) - radiusScale(Math.floor((parseInt(b.min) + parseInt(b.max)) / 2));
                    }));
                    simulation.force("y", d3.forceY().y(50))
                    simulation.alpha(1).restart()
                    d3.select("#totalcircle").transition().duration(750).style("opacity", 1);                
                }
                d3.selectAll(".subspecies").transition().duration(750).style("opacity", 0)
                //d3.select("#map_" + d.country.toLowerCase()) 
                //d3.select("#map").attr("xlink:href", d.country + ".png")
                d3.select("#map").attr("xlink:href", d.country.toLowerCase() + ".png") // needed in gist
                .transition().duration(1500).style("opacity", 1)
            })             
            .on("mouseover", function(d) {                
                //this.setAttribute("stroke", "black")
                //this.setAttribute("stroke-width", "1")                
                //console.log(this.getAttribute("r"))
                this.setAttribute("fill", "url(#stripes)")
                var selected = [...d3.selectAll(".bubbles")._groups[0]].map(function(e) {
                    return e.getAttribute("selected")
                })
                if (selected.every(function(e) {
                    return e === null})) {
                    d3.select("#location")
                        .style("opacity", 0)
                        .transition()
                            .duration(1000)
                            .text(d.country)
                            .style("opacity", 1)                                                
                    d3.select("#total")                                
                        .style("opacity", 0)
                        .transition()
                            .duration(1000)
                            .text(Math.floor((parseInt(d.min) + parseInt(d.max)) / 2)
                                .toLocaleString())
                            .style("opacity", 1)
                }
            })
            .on("mouseout", function() {
                this.setAttribute("stroke", "none")
                // this.setAttribute("fill", "orange")
                this.setAttribute("fill", this.getAttribute("selected") === "selected" ? "url(#stripes)" : "orange")
                // console.log(d3.selectAll(".bubbles")._groups[0])
                // is a nodelist, we need an array to map
                var selected = [...d3.selectAll(".bubbles")._groups[0]].map(function(e) {
                    return e.getAttribute("selected")
                })
                if (selected.every(function(e) {
                    return e === null})) {
                    d3.select("#location")
                        .style("opacity", 0)
                        .transition()
                            .duration(1000)
                            .text("Worldwide")
                            .style("opacity", 1)
                    d3.select("#total")
                        .style("opacity", 0)
                        .transition()
                            .duration(1000)
                            .text(d3.sum(datapoints, function(d) {
                                return Math.floor((parseInt(d.min) + parseInt(d.max)) / 2) })
                                .toLocaleString())
                            .style("opacity", 1)
                }            
            })            

        // by subspecies on click
        d3.select("#bysubspecies").on("click", function() {
            simulation
                .force("x", forceXSeparate)
                .alphaTarget(0.3)
                .restart()
            d3.selectAll(".globals").transition().duration(1000).style("opacity", 0)
            d3.selectAll(".subspecies").transition().duration(5000).style("opacity", 1)            
            d3.select("#bysubspecies").attr("fill", "black")
            d3.select("#alltigers").attr("fill", "white")
            d3.select("#totalcircle").transition().duration(750).style("opacity", 0)
            d3.selectAll(".maps").transition().duration(750).style("opacity", 0)
            d3.selectAll(".bubbles").attr("fill", "orange")
            d3.selectAll(".bubbles").attr("selected", null);
        })
        // all tigers on click
        d3.select("#alltigers").on("click", function() {
            simulation
                .force("x", forceXCombine)
                .alphaTarget(0.3)
                .restart()
            d3.select("#bysubspecies").attr("fill", "white")
            d3.select("#alltigers").attr("fill", "black")
            d3.select("#totalcircle").transition().duration(750).style("opacity", 0)
            d3.selectAll(".maps").transition().duration(750).style("opacity", 0)
            d3.selectAll(".bubbles").attr("fill", "orange")
            d3.selectAll(".bubbles").attr("selected", null);
            d3.selectAll(".subspecies").transition().duration(400).style("opacity", 0)
            d3.selectAll("#location")
                .transition().duration(400).style("opacity", 0)
                .transition().duration(3000).style("opacity", 1)
                    .text("Worldwide")
            d3.selectAll("#total")
                .transition().duration(400).style("opacity", 0)
                .transition().duration(3000).style("opacity", 1)
                    .text(d3.sum(datapoints, function(d) {
                        return Math.floor((parseInt(d.min) + parseInt(d.max)) / 2) })
                        .toLocaleString())
            // d3.selectAll(".globals").transition().duration(3000).style("opacity", 1)
            
        })

        simulation.nodes(datapoints)
            .on("tick", ticked)

        function ticked() {
            bubbles
                .attr("cx", function(d) {
                    return d.x
                })
               .attr("cy", function(d) {
                    return d.y
                })
        }
    }

})();







    /*


    // failed attempt to make size of pattern image inversely proportional to size of bubbles        
    .attr("height", function() {
        return 1 / (this.getAttribute("r") / 100)
    })
    .attr("width", function() {
        return 1 / (this.getAttribute("r") / 100)
    })


    // dinamic way of calculating subspecies (need to be sorted after)
    var subspecies = [...new Set(datapoints.map(function(d) {
        return d.subspecies
        }))];


    // wheel transition for numbers
    var format = d3.format(",d");

    d3.select("#total").transition()
                            .duration(2500)
                            .on("start", function repeat() {
                              d3.active(this)
                                  .tween("text", function() {
                                    var that = d3.select(this),
                                        i = d3.interpolateNumber(that.text().replace(/,/g, ""), parseInt(d.min));
                                    return function(t) { that.text(format(i(t))); };
                                  })
                                .transition()
                                  .delay(0)
                                  .on("start", repeat);
                            });

    */