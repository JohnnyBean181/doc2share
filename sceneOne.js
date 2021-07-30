async function init() {

    // get data from json file
    var data1 = await d3.json("https://raw.githubusercontent.com/JohnnyBean181/doc2share/main/miserables_cut.json");


    // set param for svg
    var width = 300;
    var height = 300;

    // set links and nodes from json
    var links1 = data1.links.map(d => Object.create(d));
    var nodes1 = data1.nodes.map(d => Object.create(d));

    const groups = Array.from(new Set(nodes1.map(d => d.group)));
    var color = d3.scaleOrdinal(groups, d3.schemeCategory10);
    console.log(color(1));

    const simulation = d3.forceSimulation(nodes1)
        .force("link", d3.forceLink(links1).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-250))
        .force("x", d3.forceX())
        .force("y", d3.forceY());

    const svg = d3.select("svg")
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .style("font", "12px sans-serif");

    // Per-type markers, as they don't inherit styles.
    svg.append("defs").append("marker")
        .attr("id","arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -0.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("fill", "#999")
        .attr("d", "M0,-5L10,0L0,5");


    const link = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
        .selectAll("path")
        .data(links1)
        .join("path")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .attr("marker-end", "url(#arrow)");

    const node = svg.append("g")
        .attr("fill", "currentColor")
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .selectAll("g")
        .data(nodes1)
        .join("g")
         .call(drag(simulation));

    console.log(node);

    node.append("circle")
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .attr("r", 4)
        .attr("fill", d => color(d.group));

    node.append("text")
        .attr("x", 8)
        .attr("y", "0.31em")
        .text(d => d.id)
        .clone(true).lower()
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 3);

    simulation.on("tick", () => {
        link.attr("d", linkArc);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
        });

}


function linkArc(d) {
  const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
  return `
    M${d.source.x},${d.source.y}
    A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
  `;
}

drag = simulation => {

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
}