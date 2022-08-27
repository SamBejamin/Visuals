import {
  format,
  hierarchy,
  linkHorizontal,
  max,
  rollup,
  scaleSqrt,
  select,
  sum,
  tree,
} from "d3";
import textures from "textures";
import theme from "../theme";

// https://observablehq.com/@d3/collapsible-tree
export default class VisCollapsibleTree {
  constructor({ el, data }) {
    this.el = el;
    this.data = data;
    this.update = this.update.bind(this);
    this.init();
  }

  init() {
    this.maxRadius = 64;
    this.margin = {
      top: this.maxRadius,
      right: 576,
      bottom: this.maxRadius,
      left: 8,
    };
    this.dx = 80;
    this.dy = 200;
    this.topN = 10;
    this.duration = 500;

    this.formatValue = format(".3~r");

    this.root = this.processData(this.data, this.topN);
    this.root.x0 = 0;
    this.root.y0 = 0;
    this.root.children.forEach((d) => (d.children = null));

    this.width =
      this.dy * this.root.height + this.margin.left + this.margin.right;

    this.r = scaleSqrt()
      .domain([0, max(this.root.children, (d) => d.value)])
      .range([4, this.maxRadius]);

    this.tree = tree().nodeSize([this.dx, this.dy]);

    this.diagonal = linkHorizontal()
      .x((d) => d.y)
      .y((d) => d.x);

    this.texture = textures
      .lines()
      .size(8)
      .strokeWidth(1)
      .stroke(theme.palette.primary.main)
      .background(theme.palette.primary.light);

    this.container = select(this.el)
      .append("div")
      .attr("class", "collapsible-tree");
    this.svg = this.container
      .append("svg")
      .attr("viewBox", [
        -this.margin.left,
        -this.margin.top,
        this.width,
        this.dx,
      ])
      .attr("width", this.width)
      .attr("height", this.dx)
      .call(this.texture);
    this.linksG = this.svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke", theme.palette.primary.main)
      .attr("stroke-opacity", 0.5);
    this.nodesG = this.svg
      .append("g")
      .attr("cursor", "pointer")
      .attr("pointer-events", "all");

    this.update(this.root);
  }

  processData(data, topN) {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const orderedDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const accessor = {
      layer1: (d) => days[d.date.getDay()],
      layer2: (d) => d.trackName + " - " + d.artistName,
      value: (d) => d.hoursPlayed * 60,
    };
    const rolluped = rollup(
      data,
      (v) => sum(v, accessor.value),
      accessor.layer1,
      accessor.layer2
    );
    const root = hierarchy(rolluped);
    root.each(
      (d) =>
        (d.data = d.children
          ? {
              name: d.data[0],
            }
          : {
              name: d.data[0],
              value: d.data[1],
            })
    );
    root
      .sum((d) => d.value)
      .sort((a, b) => {
        if (a.depth === 2 && b.depth === 2) return b.value - a.value;
        if (a.depth === 1 && b.depth === 1)
          return (
            orderedDays.indexOf(a.data.name) - orderedDays.indexOf(b.data.name)
          );
        return null;
      });
    root.children = root.children.slice(0, topN);
    root.children.forEach((d) => {
      if (d.children.length > topN) {
        const rest = d.children.slice(topN);
        const restNode = d.children[topN];
        restNode.data = {
          name: "Other Songs",
        };
        restNode.value = sum(rest, (d) => d.value);
        d.children = [...d.children.slice(0, topN), restNode];
      }
    });
    root.descendants().forEach((d, i) => {
      d.id = i;
      d._children = d.children;
    });
    return root;
  }

  update(source) {
    const nodes = this.root.descendants().slice(1);
    const links = this.root.links();

    this.tree(this.root);

    let left = this.root;
    let right = this.root;
    this.root.eachBefore((node) => {
      if (node.x < left.x) left = node;
      if (node.x > right.x) right = node;
    });

    this.height = right.x - left.x + this.margin.top + this.margin.bottom;

    const transition = this.svg
      .transition()
      .duration(this.duration)
      .attr("viewBox", [
        -this.margin.left,
        left.x - this.margin.top,
        this.width,
        this.height,
      ])
      .attr("height", this.height);

    const node = this.nodesG.selectAll("g").data(nodes, (d) => d.id);

    const nodeEnter = node
      .enter()
      .append("g")
      .attr("transform", `translate(${source.y0},${source.x0})`)
      .attr("fill-opacity", 0)
      .attr("stroke-opacity", 0)
      .on("click", (event, d) => {
        d.children = d.children ? null : d._children;
        this.update(d);
      });

    nodeEnter
      .append("circle")
      .attr("r", (d) => this.r(d.value))
      .attr("fill", this.texture.url())
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    nodeEnter
      .append("text")
      .attr("class", "halo")
      .attr("dy", `${0.31 - 0.6}em`)
      .attr("x", 6)
      .text((d) => d.data.name);

    nodeEnter
      .append("text")
      .attr("class", "halo muted")
      .attr("dy", `${0.31 + 0.6}em`)
      .attr("x", 6)
      .text((d) => this.formatValue(d.value) + "Minutes");

    const nodeUpdate = node
      .merge(nodeEnter)
      .transition(transition)
      .attr("transform", (d) => `translate(${d.y},${d.x})`)
      .attr("fill-opacity", 1)
      .attr("stroke-opacity", 1);

    const nodeExit = node
      .exit()
      .transition(transition)
      .remove()
      .attr("transform", `translate(${source.y},${source.x})`)
      .attr("fill-opacity", 0)
      .attr("stroke-opacity", 0);

    const link = this.linksG.selectAll("path").data(links, (d) => d.target.id);

    const linkEnter = link
      .enter()
      .append("path")
      .attr("d", () => {
        const o = { x: source.x0, y: source.y0 };
        return this.diagonal({ source: o, target: o });
      });

    link.merge(linkEnter).transition(transition).attr("d", this.diagonal);

    link
      .exit()
      .transition(transition)
      .remove()
      .attr("d", () => {
        const o = { x: source.x, y: source.y };
        return this.diagonal({ source: o, target: o });
      });

    this.root.eachBefore((d) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  unmount() {
    this.svg.interrupt().selectAll("*").interrupt();
    select(this.el).selectAll("*").remove();
  }
}
