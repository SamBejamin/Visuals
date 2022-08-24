import {
  ascending,
  axisTop,
  descending,
  easeLinear,
  groups,
  pairs,
  range,
  rollup,
  scaleBand,
  scaleLinear,
  select,
  timeFormat,
  timeMonth,
} from "d3";
import textures from "textures";
import theme from "../theme";

// https://observablehq.com/@d3/bar-chart-race
export default class VisBarChartRace {
  constructor({ el, data }) {
    this.el = el;
    this.data = data;
    this.resized = this.resized.bind(this);
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
    this.height =
      this.barStep * this.topN + this.margin.top + this.margin.bottom;
    this.duration = 1000;

    this.formatDate = timeFormat("%B %Y");

    [this.keyframes, this.prev, this.next] = this.processData(
      this.data,
      this.topN
    );

    this.x = scaleLinear();
    this.y = scaleBand()
      .domain(range(this.topN + 1))
      .range([
        this.margin.top,
        this.margin.top + this.barStep * (this.topN + 1),
      ])
      .paddingInner(this.barPadding)
      .paddingOuter(this.barPadding / 2);

    this.xAxis = axisTop(this.x);

    this.texture = textures
      .lines()
      .size(8)
      .strokeWidth(1)
      .stroke(theme.palette.primary.main)
      .background(theme.palette.primary.light);

    this.container = select(this.el)
      .append("div")
      .attr("class", "bar-chart-race");
    this.svg = this.container.append("svg").call(this.texture);
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
      .text("Hours Played");
    this.bar = this.svg.append("g").selectAll("rect");
    this.label = this.svg.append("g").selectAll("text");
    this.ticker = this.svg
      .append("text")
      .attr("class", "ticker-text")
      .attr("text-anchor", "end")
      .attr(
        "y",
        this.y(this.topN - 1) +
          this.barTextHeight +
          this.barTextRectGap +
          this.barRectHeight
      )
      .text(this.formatDate(this.keyframes[0][0]));

    this.resizeObserver = new ResizeObserver(this.resized);
    this.resizeObserver.observe(this.el);
  }

  processData(data, topN) {
    const accessors = {
      date: (d) => +timeMonth.floor(d.date),
      name: (d) => d.trackName,
      value: (d) => d.hoursPlayed,
    };

    const dateValues = Array.from(
      rollup(data, ([d]) => accessors.value(d), accessors.date, accessors.name)
    )
      .map(([date, data]) => [new Date(date), data])
      .sort(([a], [b]) => ascending(a, b));

    const names = new Set(data.map(accessors.name));

    const rank = (value) => {
      const data = Array.from(names, (name) => ({ name, value: value(name) }));
      data.sort((a, b) => descending(a.value, b.value));
      for (let i = 0; i < data.length; i++) data[i].rank = Math.min(topN, i);
      return data;
    };

    const k = 10;
    const keyframes = [];
    let ka, a, kb, b;
    for ([[ka, a], [kb, b]] of pairs(dateValues)) {
      for (let i = 0; i < k; ++i) {
        const t = i / k;
        keyframes.push([
          new Date(ka * (1 - t) + kb * t),
          rank((name) => (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t),
        ]);
      }
    }
    keyframes.push([new Date(kb), rank((name) => b.get(name) || 0)]);

    const nameFrames = groups(
      keyframes.flatMap(([, data]) => data),
      (d) => d.name
    );

    const prev = new Map(
      nameFrames.flatMap(([, data]) => pairs(data, (a, b) => [b, a]))
    );

    const next = new Map(nameFrames.flatMap(([, data]) => pairs(data)));

    return [keyframes, prev, next];
  }

  resized() {
    if (this.width === this.el.clientWidth) return;

    this.width = this.el.clientWidth;

    this.x.range([this.margin.left, this.width - this.margin.right]);

    this.xAxis.ticks((this.width - this.margin.left - this.margin.right) / 160);

    this.svg.attr("viewBox", [0, 0, this.width, this.height]);
    this.xAxisTitle.attr("x", this.width - this.margin.right);
    this.ticker.attr("x", this.width - this.margin.right);

    if (!this.initialized) {
      this.initialized = true;
      this.play();
    } else {
      if (!this.finished) return;
      this.render();
    }
  }

  async play() {
    for (const keyframe of this.keyframes) {
      this.x.domain([0, keyframe[1][0].value]);
      this.activeKeyframe = keyframe;
      await this.render();
    }
    this.finished = true;
  }

  async render() {
    const [date, data] = this.activeKeyframe;
    const duration = this.finished ? 0 : this.duration;
    const transition = this.svg
      .transition()
      .duration(duration)
      .ease(easeLinear);

    this.xAxisG.transition(transition).call(this.xAxis);
    this.xAxisG.select(".tick:first-of-type").style("display", "none");

    this.bar = this.bar
      .data(data.slice(0, this.topN), (d) => d.name)
      .join(
        (enter) =>
          enter
            .append("rect")
            .attr("fill", this.texture.url())
            .attr("height", this.barRectHeight)
            .attr("x", this.x(0))
            .attr(
              "y",
              (d) =>
                this.y((this.prev.get(d) || d).rank) +
                this.barTextHeight +
                this.barTextRectGap
            )
            .attr(
              "width",
              (d) => this.x((this.prev.get(d) || d).value) - this.x(0)
            ),
        (update) => update,
        (exit) =>
          exit
            .transition(transition)
            .remove()
            .attr(
              "y",
              (d) =>
                this.y((this.next.get(d) || d).rank) +
                this.barTextHeight +
                this.barTextRectGap
            )
            .attr(
              "width",
              (d) => this.x((this.next.get(d) || d).value) - this.x(0)
            )
      )
      .call((bar) =>
        bar
          .transition(transition)
          .attr(
            "y",
            (d) => this.y(d.rank) + this.barTextHeight + this.barTextRectGap
          )
          .attr("width", (d) => this.x(d.value) - this.x(0))
      );

    this.label = this.label
      .data(data.slice(0, this.topN), (d) => d.name)
      .join(
        (enter) =>
          enter
            .append("text")
            .attr(
              "transform",
              (d) => `translate(0,${this.y((this.prev.get(d) || d).rank)})`
            )
            .attr("y", this.barTextHeight)
            .text((d) => d.name),
        (update) => update,
        (exit) =>
          exit
            .transition(transition)
            .remove()
            .attr(
              "transform",
              (d) => `translate(0,${this.y((this.next.get(d) || d).rank)})`
            )
      )
      .call((label) =>
        label
          .transition(transition)
          .attr("transform", (d) => `translate(0,${this.y(d.rank)})`)
      );

    await transition.end().then(() => this.ticker.text(this.formatDate(date)));
  }

  unmount() {
    this.svg.interrupt().selectAll("*").interrupt();
    this.resizeObserver.disconnect();
    this.resizeObserver = null;
    select(this.el).selectAll("*").remove();
  }
}
