import {
  active,
  axisTop,
  hierarchy,
  max,
  rollup,
  scaleLinear,
  select,
  sum,
} from "d3";
import textures from "textures";
import theme from "../theme";

// https://observablehq.com/@d3/hierarchical-bar-chart
export default class VisHierarchicalBar {
  constructor({ el, data }) {
    this.el = el;
    this.data = data;
    this.resized = this.resized.bind(this);
    this.stack = this.stack.bind(this);
    this.stagger = this.stagger.bind(this);
    this.init();
  }

  init() {
    this.margin = {
      top: 40,
      right: 8,
      bottom: 0,
      left: 0,
    };
    this.barStep = 64;
    this.barPadding = 0.25;
    this.barTextHeight = 12;
    this.barTextRectGap = 8;
    this.barRectHeight =
      this.barStep * (1 - this.barPadding) -
      this.barTextHeight -
      this.barTextRectGap;
    this.topN = 10;
    this.duration = 750;

    this.root = this.processData(this.data, this.topN);

    this.height = (() => {
      let max = 1;
      this.root.each(
        (d) => d.children && (max = Math.max(max, d.children.length))
      );
      return max * this.barStep + this.margin.top + this.margin.bottom;
    })();

    this.x = scaleLinear().domain([0, this.root.value]);

    this.xAxis = axisTop(this.x);

    this.texture = textures
      .lines()
      .size(8)
      .strokeWidth(1)
      .stroke(theme.palette.primary.main)
      .background(theme.palette.primary.light);

    this.container = select(this.el)
      .append("div")
      .attr("class", "hierarchical-bar");
    this.svg = this.container.append("svg").call(this.texture);
    this.g = this.svg.append("g");
    this.backgroundRect = this.g
      .append("rect")
      .attr("class", "background-rect")
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .attr("height", this.height)
      .on("click", (event, d) => this.up(d));
    this.xAxisG = this.svg
      .append("g")
      .attr("class", "axis-g axis-g--x")
      .attr("transform", `translate(0,${this.margin.top})`);
    this.xAxisTitle = this.svg
      .append("text")
      .attr("class", "axis-title axis-title--x")
      .attr("text-anchor", "end")
      .attr("dy", "0.71em")
      .attr("y", 4)
      .text("Minutes Played");

    this.resizeObserver = new ResizeObserver(this.resized);
    this.resizeObserver.observe(this.el);
  }

  processData(data, topN) {
    const accessor = {
      layer1: (d) => d.artistName,
      layer2: (d) => d.trackName,
      value: (d) => d.hoursPlayed,
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
    root.sum((d) => d.value).sort((a, b) => b.value - a.value);
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
    root.eachAfter(
      (d) =>
        (d.index = d.parent ? (d.parent.index = d.parent.index + 1 || 0) : 0)
    );
    return root;
  }

  stack(i) {
    let value = 0;
    return (d) => {
      const t = `translate(${this.x(value) - this.x(0)},${this.barStep * i})`;
      value += d.value;
      return t;
    };
  }

  stagger() {
    let value = 0;
    return (d, i) => {
      const t = `translate(${this.x(value) - this.x(0)},${this.barStep * i})`;
      value += d.value;
      return t;
    };
  }

  resized() {
    if (this.width === this.el.clientWidth) return;

    this.width = this.el.clientWidth;

    this.x.range([this.margin.left, this.width - this.margin.right]);

    this.xAxis.ticks((this.width - this.margin.left - this.margin.right) / 100);

    this.svg.attr("viewBox", [0, 0, this.width, this.height]);
    this.backgroundRect.attr("width", this.width);
    this.xAxisTitle.attr("x", this.width - this.margin.right);

    if (!this.initialized) {
      this.initialized = true;
      this.down(this.root);
    } else {
      this.bar(this.dActive);
      this.xAxisG.call(this.xAxis);
    }
  }

  bar(d, selector) {
    if (active(this.svg.node())) return;
    let g = this.g.select(".is-entering");
    if (g.size() === 0) {
      g = this.g
        .insert("g", selector)
        .attr("class", "is-entering")
        .attr(
          "transform",
          `translate(0,${
            this.margin.top + (this.barStep * this.barPadding) / 2
          })`
        );
    }

    const bar = g
      .selectAll("g")
      .data(d.children)
      .join((enter) =>
        enter
          .append("g")
          .attr("cursor", (d) => (!d.children ? null : "pointer"))
          .on("click", (event, d) => this.down(d))
          .call((bar) =>
            bar
              .append("text")
              .attr("x", this.margin.left)
              .attr("y", this.barTextHeight)
              .text((d) => d.data.name)
          )
          .call((bar) =>
            bar
              .append("rect")
              .attr("fill", this.texture.url())
              .attr("rx", 4)
              .attr("x", this.x(0))
              .attr("y", this.barTextHeight + this.barTextRectGap)
              .attr("height", this.barRectHeight)
          )
      )
      .call((bar) =>
        bar.select("rect").attr("width", (d) => this.x(d.value) - this.x(0))
      );

    return g;
  }

  down(d) {
    if (!d.children || active(this.svg.node())) return;
    this.dActive = d;

    this.g
      .select(".background-rect")
      .attr("cursor", d.parent ? "pointer" : null)
      .datum(d);

    const transition1 = this.svg.transition().duration(this.duration);
    const transition2 = transition1.transition();

    const exit = this.g.selectAll(".is-entering").attr("class", "is-exiting");

    exit.selectAll("rect").attr("fill-opacity", (p) => (p === d ? 0 : null));

    exit.transition(transition1).attr("fill-opacity", 0).remove();

    const enter = this.bar(d, ".axis-g").attr("fill-opacity", 0);

    enter.transition(transition1).attr("fill-opacity", 1);

    enter
      .selectAll("g")
      .attr("transform", this.stack(d.index))
      .transition(transition1)
      .attr("transform", this.stagger());

    this.x.domain([0, max(d.children, (d) => d.value)]);

    this.xAxisG.transition(transition2).call(this.xAxis);
    this.xAxisG.select(".tick:first-of-type").style("display", "none");

    enter
      .selectAll("g")
      .transition(transition2)
      .attr("transform", (d, i) => `translate(0,${this.barStep * i})`);

    enter
      .selectAll("rect")
      .attr("fill-opacity", 1)
      .transition(transition2)
      .attr("width", (d) => this.x(d.value) - this.x(0));
  }

  up(d) {
    if (!d.parent || !this.svg.selectAll(".exit").empty()) return;

    this.dActive = d.parent;

    this.g
      .select(".background-rect")
      .attr("cursor", d.parent.parent ? "pointer" : null)
      .datum(d.parent);

    const transition1 = this.svg.transition().duration(this.duration);
    const transition2 = transition1.transition();

    const exit = this.g.selectAll(".is-entering").attr("class", "is-existing");

    this.x.domain([0, max(d.parent.children, (d) => d.value)]);

    this.xAxisG.transition(transition1).call(this.xAxis);

    exit
      .selectAll("g")
      .transition(transition1)
      .attr("transform", this.stagger());

    exit
      .selectAll("g")
      .transition(transition2)
      .attr("transform", this.stack(d.index));

    exit
      .selectAll("rect")
      .transition(transition1)
      .attr("width", (d) => this.x(d.value) - this.x(0));

    exit.transition(transition2).attr("fill-opacity", 0).remove();

    const enter = this.bar(d.parent, ".is-exiting").attr("fill-opacity", 0);

    enter
      .selectAll("g")
      .attr("transform", (d, i) => `translate(0,${this.barStep * i})`);

    enter.transition(transition2).attr("fill-opacity", 1);

    enter
      .selectAll("rect")
      .attr("fill-opacity", (p) => (p === d ? 0 : null))
      .transition(transition2)
      .attr("width", (d) => this.x(d.value) - this.x(0))
      .on("end", function () {
        select(this).attr("fill-opacity", 1);
      });
  }

  unmount() {
    this.svg.interrupt().selectAll("*").interrupt();
    this.resizeObserver.disconnect();
    this.resizeObserver = null;
    select(this.el).selectAll("*").remove();
  }
}
