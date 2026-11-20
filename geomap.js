
Promise.all([
    d3.json("./topo.json"),
    d3.csv("./cities.csv"),
    d3.csv("./states.csv")
]).then((data) => {

    console.log("Loaded Data:", data);

    const topology = data[0];
    const cities = data[1];
    const states = data[2];

    const topo = topojson.feature(topology, topology.objects.states);

    console.log("State Features:", topo);
    console.log("Cities:", cities);
    console.log("States:", states);

    const stateDictionary = new Map();

    states.forEach((state) => {
        stateDictionary.set(
            state.State.trim(),
            +state["2018 Population"].replace(/,/g, "")
        );
    });

    console.log("State Population Dictionary:", stateDictionary);

    const blues = d3.scaleSequential()
        .domain(d3.extent(stateDictionary.values()))
        .interpolator(d3.interpolateRgb("white", "steelblue"));

    const projection = d3.geoAlbersUsa()
        .scale(700)
        .translate([487.5, 305]);

    const path = d3.geoPath(projection);

    const svg = d3.select("#geomap")
        .append("g")
        .attr("transform", "translate(50,50)");

    svg.append("g")
        .selectAll("path")
        .data(topo.features)
        .join("path")
        .attr("d", path)
        .attr("fill", (d) => {
            const population = stateDictionary.get(d.properties.name);

            return population !== undefined
                ? blues(population)
                : "whitesmoke";
        })
        .attr("stroke", "black")
        .attr("stroke-width", "1px");

    svg.append("g")
        .selectAll("circle")
        .data(cities)
        .join("circle")
        .attr("cx", (d) => {
            const coordinates = projection([
                +d.longitude,
                +d.latitude
            ]);

            return coordinates ? coordinates[0] : -100;
        })
        .attr("cy", (d) => {
            const coordinates = projection([
                +d.longitude,
                +d.latitude
            ]);

            return coordinates ? coordinates[1] : -100;
        })
        .attr("r", 4)
        .attr("fill", "indianred")
        .attr("stroke", "black")
        .attr("stroke-width", 0.5);

}).catch((error) => {
    console.error("Error loading map data:", error);
});
