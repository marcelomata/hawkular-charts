import { ChartOptions } from './chart-options'
import { IChartType } from './chart-type'
import { NumericBucketPoint } from './types'
import { calcBarXPos, calcBarWidthAdjusted } from '../util/utility'

declare const d3: any;

export abstract class AbstractHistogramChart implements IChartType {

  public name = 'histogram';

  public drawChart(chartOptions: ChartOptions, stacked = false) {

    const barClass = stacked ? 'leaderBar' : 'histogram';

    const rectHistogram = chartOptions.svg.selectAll('rect.' + barClass).data(chartOptions.data);

    function buildBars(selection: any/*d3.Selection<any>*/) {
      selection
        .attr('class', barClass)
        .on('mouseover', (d: NumericBucketPoint, i: number) => {
          chartOptions.tip.show(d, i);
        }).on('mouseout', () => {
          chartOptions.tip.hide();
        })
        .transition()
        .attr('x', (d: NumericBucketPoint, i: number) => calcBarXPos(d, i, chartOptions.layout.width,
            chartOptions.axis.timeScale, chartOptions.data.length))
        .attr('width', (d: NumericBucketPoint, i: number) => calcBarWidthAdjusted(i, chartOptions.layout.width, chartOptions.data.length))
        .attr('y', (d: NumericBucketPoint) => d.isEmpty() ? 0 : chartOptions.axis.yScale(d.avg!))
        .attr('height', (d: NumericBucketPoint) => chartOptions.layout.modifiedInnerChartHeight - chartOptions.axis.yScale(d.isEmpty() ?
            chartOptions.axis.yScale(chartOptions.axis.chartRange.high) : d.avg!))
        .attr('opacity', stacked ? '.6' : '1')
        .attr('fill', (d: NumericBucketPoint) => d.isEmpty() ? 'url(#noDataStripes)' : (stacked ? '#D3D3D6' : '#C0C0C0'))
        .attr('stroke', '#777')
        .attr('stroke-width', '0')
        .attr('data-hawkular-value', (d: NumericBucketPoint) => d.avg || 0);
    }

    function buildHighBar(selection: any/*d3.Selection<any>*/) {
      selection
        .attr('class', (d: NumericBucketPoint) => d.min === d.max ? 'singleValue' : 'high')
        .attr('x', (d: NumericBucketPoint, i: number) => calcBarXPos(d, i, chartOptions.layout.width, chartOptions.axis.timeScale,
            chartOptions.data.length))
        .attr('y', (d: NumericBucketPoint) => isNaN(d.max || NaN) ? chartOptions.axis.yScale(chartOptions.axis.chartRange.high)
          : chartOptions.axis.yScale(d.max!))
        .attr('height', (d: NumericBucketPoint) => d.isEmpty() ? 0 : (chartOptions.axis.yScale(d.avg!)
          - chartOptions.axis.yScale(d.max!) || 2))
        .attr('width', (d: NumericBucketPoint, i: number) => calcBarWidthAdjusted(i, chartOptions.layout.width, chartOptions.data.length))
        .attr('opacity', 0.9)
        .on('mouseover', (d: NumericBucketPoint, i: number) => chartOptions.tip.show(d, i))
        .on('mouseout', () => chartOptions.tip.hide());
    }

    function buildLowerBar(selection: any/*d3.Selection<any>*/) {
      selection
        .attr('class', 'low')
        .attr('x', (d: NumericBucketPoint, i: number) => calcBarXPos(d, i, chartOptions.layout.width, chartOptions.axis.timeScale,
            chartOptions.data.length))
        .attr('y', (d: NumericBucketPoint) => isNaN(d.avg || NaN) ? chartOptions.layout.height : chartOptions.axis.yScale(d.avg!))
        .attr('height', (d: NumericBucketPoint) => d.isEmpty() ? 0 : (chartOptions.axis.yScale(d.min!) - chartOptions.axis.yScale(d.avg!)))
        .attr('width', (d: NumericBucketPoint, i: number) => calcBarWidthAdjusted(i, chartOptions.layout.width, chartOptions.data.length))
        .attr('opacity', 0.9)
        .on('mouseover', (d: NumericBucketPoint, i: number) => chartOptions.tip.show(d, i))
        .on('mouseout', () => chartOptions.tip.hide());
    }

    function buildTopStem(selection: any/*d3.Selection<any>*/) {
      selection
        .attr('class', 'histogramTopStem')
        .filter((d: NumericBucketPoint) => !d.isEmpty())
        .attr('x1', (d: NumericBucketPoint) => chartOptions.axis.timeScale(d.timestampSupplier()))
        .attr('x2', (d: NumericBucketPoint) => chartOptions.axis.timeScale(d.timestampSupplier()))
        .attr('y1', (d: NumericBucketPoint) => chartOptions.axis.yScale(d.max!))
        .attr('y2', (d: NumericBucketPoint) => chartOptions.axis.yScale(d.avg!))
        .attr('stroke', 'red')
        .attr('stroke-opacity', 0.6);
    }

    function buildLowStem(selection: any/*d3.Selection<any>*/) {
      selection
        .filter((d: NumericBucketPoint) => !d.isEmpty())
        .attr('class', 'histogramBottomStem')
        .attr('x1', (d: NumericBucketPoint) => chartOptions.axis.timeScale(d.timestampSupplier()))
        .attr('x2', (d: NumericBucketPoint) => chartOptions.axis.timeScale(d.timestampSupplier()))
        .attr('y1', (d: NumericBucketPoint) => chartOptions.axis.yScale(d.avg!))
        .attr('y2', (d: NumericBucketPoint) => chartOptions.axis.yScale(d.min!))
        .attr('stroke', 'red')
        .attr('stroke-opacity', 0.6);
    }

    function buildTopCross(selection: any/*d3.Selection<any>*/) {
      selection
        .filter((d: NumericBucketPoint) => !d.isEmpty())
        .attr('class', 'histogramTopCross')
        .attr('x1', (d: NumericBucketPoint) => chartOptions.axis.timeScale(d.timestampSupplier()) - 3)
        .attr('x2', (d: NumericBucketPoint) => chartOptions.axis.timeScale(d.timestampSupplier()) + 3)
        .attr('y1', (d: NumericBucketPoint) => chartOptions.axis.yScale(d.max!))
        .attr('y2', (d: NumericBucketPoint) => chartOptions.axis.yScale(d.max!))
        .attr('stroke', 'red')
        .attr('stroke-width', '0.5')
        .attr('stroke-opacity', 0.6);
    }

    function buildBottomCross(selection: any/*d3.Selection<any>*/) {
      selection
        .filter((d: NumericBucketPoint) => !d.isEmpty())
        .attr('class', 'histogramBottomCross')
        .attr('x1', (d: NumericBucketPoint) => chartOptions.axis.timeScale(d.timestampSupplier()) - 3)
        .attr('x2', (d: NumericBucketPoint) => chartOptions.axis.timeScale(d.timestampSupplier()) + 3)
        .attr('y1', (d: NumericBucketPoint) => chartOptions.axis.yScale(d.min!))
        .attr('y2', (d: NumericBucketPoint) => chartOptions.axis.yScale(d.min!))
        .attr('stroke', 'red')
        .attr('stroke-width', '0.5')
        .attr('stroke-opacity', 0.6);
    }

    function createStackedHistogramHighLowValues(svg: any) {
      // upper portion representing avg to high
      const rectHigh = svg.selectAll('rect.high, rect.singleValue').data(chartOptions.data);

      // update existing
      rectHigh.call(buildHighBar);

      // add new ones
      rectHigh
        .enter()
        .append('rect')
        .call(buildHighBar);

      // remove old ones
      rectHigh.exit().remove();

      // lower portion representing avg to low
      const rectLow = svg.selectAll('rect.low').data(chartOptions.data);

      // update existing
      rectLow.call(buildLowerBar);

      // add new ones
      rectLow
        .enter()
        .append('rect')
        .call(buildLowerBar);

      // remove old ones
      rectLow.exit().remove();
    }

    function createUnstackedHistogramHighLowValues(svg: any) {
      const lineHistoHighStem = svg.selectAll('.histogramTopStem').data(chartOptions.data);

      // update existing
      lineHistoHighStem.call(buildTopStem);

      // add new ones
      lineHistoHighStem
        .enter()
        .append('line')
        .call(buildTopStem);

      // remove old ones
      lineHistoHighStem.exit().remove();

      const lineHistoLowStem = svg.selectAll('.histogramBottomStem').data(chartOptions.data);

      // update existing
      lineHistoLowStem.call(buildLowStem);

      // add new ones
      lineHistoLowStem
        .enter()
        .append('line')
        .call(buildLowStem);

      // remove old ones
      lineHistoLowStem.exit().remove();

      const lineHistoTopCross = svg.selectAll('.histogramTopCross').data(chartOptions.data);

      // update existing
      lineHistoTopCross.call(buildTopCross);

      // add new ones
      lineHistoTopCross
        .enter()
        .append('line')
        .call(buildTopCross);

      // remove old ones
      lineHistoTopCross.exit().remove();

      const lineHistoBottomCross = svg.selectAll('.histogramBottomCross').data(chartOptions.data);
      // update existing
      lineHistoBottomCross.call(buildBottomCross);

      // add new ones
      lineHistoBottomCross
        .enter()
        .append('line')
        .call(buildBottomCross);

      // remove old ones
      lineHistoBottomCross.exit().remove();
    }

    // update existing
    rectHistogram.call(buildBars);

    // add new ones
    rectHistogram.enter()
      .append('rect')
      .call(buildBars);

    // remove old ones
    rectHistogram.exit().remove();

    if (!chartOptions.hideHighLowValues) {
      if (stacked) {
        createStackedHistogramHighLowValues(chartOptions.svg);
      } else {
        createUnstackedHistogramHighLowValues(chartOptions.svg);
      }
    } else {
      // we should hide high-low values.. or remove if existing
      chartOptions.svg
        .selectAll('.histogramTopStem, .histogramBottomStem, .histogramTopCross, .histogramBottomCross').remove();
    }

  }
}
