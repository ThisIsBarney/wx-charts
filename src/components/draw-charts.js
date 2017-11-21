import { drawYAxisGrid, drawCumulativeYAxisGrid, drawToolTipBridge, drawRadarDataPoints, drawCanvas, drawLegend, drawPieDataPoints, drawLineDataPoints, drawAreaDataPoints, drawColumnDataPoints, drawYAxis, drawXAxis, drawCumulativeYAxis, drawColumnLineYAxis, drawColumnLineXAxis, drawColumnLineLegend, drawCumulativeDataPoints } from './draw'
import { calYAxisData, getPieTextMaxLength, calCategoriesData, calLegendData, calCumulativeYAxisData } from './charts-data'
import { fillSeriesColor } from './charts-util';
import Animation from './animation'

export default function drawCharts (type, opts, config, context) {

    let series = opts.series;
    // Added by Tang Shujun
    let seriesColumn = opts.seriesColumn;
    let seriesLine = opts.seriesLine;
    let categories = opts.categories;
    /**
    * 在正式画图之前，需要更新以下数据：
    * series：更新颜色信息
    * seriesColumn
    * seriesLine
    * config.legendHeight
    * config.yAxisWidth
    * config.xAxisHeight
    * config._xAxisTextAngle_
    * config._pieTextMaxLength_
    */
    if(type === 'column-line') {
        // Modified by Tang Shujun
        //  column-line 混合图
        seriesColumn = fillSeriesColor(seriesColumn, config);
        seriesLine = fillSeriesColor(seriesLine, config);

        series = seriesColumn.concat(seriesLine);
        let { legendHeight } = calLegendData(series, opts, config);
        config.legendHeight = legendHeight;

        // TODO
        let leftYAxisData = calYAxisData(seriesColumn, opts, config);
        let rightYAxisData = calYAxisData(seriesLine, opts, config);
        config.columnLine.leftYAxisWidth = leftYAxisData.yAxisWidth;
        config.columnLine.rightYAxisWidth = rightYAxisData.yAxisWidth;

        if (categories && categories.length) {
            let { xAxisHeight, angle } = calCategoriesData(categories, opts, config);
            config.xAxisHeight = xAxisHeight;
            config._xAxisTextAngle_ = angle;
        }
    } else {
        // 普通图
        series = fillSeriesColor(series, config);

        let { legendHeight } = calLegendData(series, opts, config);
        config.legendHeight = legendHeight;

        let { yAxisWidth } = type === 'cumulative' ? calCumulativeYAxisData(series, opts, config) : calYAxisData(series, opts, config);
        config.yAxisWidth = yAxisWidth;
        if (categories && categories.length) {
            let { xAxisHeight, angle } = calCategoriesData(categories, opts, config);
            config.xAxisHeight = xAxisHeight;
            config._xAxisTextAngle_ = angle;
        }
        if (type === 'pie' || type === 'ring') {
            config._pieTextMaxLength_ = opts.dataLabel === false ? 0 : getPieTextMaxLength(series);
        }
    }

    let duration = opts.animation ? 1000 : 0;
    this.animationInstance && this.animationInstance.stop();

    switch (type) {
        /**
        * Add case 'column-line'、'cumulative'
        * @author {{Tang Shujun}}
        */
        case 'cumulative':
            this.animationInstance = new Animation({
                timing: 'easeIn',
                duration: duration,
                onProcess: (process) => {
                    drawCumulativeYAxisGrid(series, opts, config, context);
                    let { xAxisPoints, eachSpacing } = drawCumulativeDataPoints(series, opts, config, context, process);
                    this.chartData.xAxisPoints = xAxisPoints;
                    this.chartData.eachSpacing = eachSpacing;
                    drawXAxis(categories, opts, config, context);
                    drawLegend(opts.series, opts, config, context);                    
                    drawCumulativeYAxis(series, opts, config, context);
                    drawCanvas(opts, context, false);
                },
                onAnimationFinish: () => {
                    this.event.trigger('renderComplete');
                }
            });
            break;
        case 'column-line':
            drawColumnLineYAxis(seriesColumn, seriesLine, opts, config, context);
            drawColumnLineXAxis(categories, opts, config, context);
            // 先画柱状图
            drawColumnDataPoints(seriesColumn, opts, config, context);
            drawCanvas(opts, context, false);
            // 再画折线图
            let { xAxisPoints, calPoints } = drawLineDataPoints(seriesLine, opts, config, context);
            this.chartData.xAxisPoints = xAxisPoints;
            this.chartData.calPoints = calPoints;
            drawColumnLineLegend(seriesColumn, seriesLine, opts, config, context);
            drawCanvas(opts, context, true);
            break;
        case 'line':
            this.animationInstance = new Animation({
                timing: 'easeIn',
                duration: duration,
                onProcess: (process) => {
                    drawYAxisGrid(opts, config, context);
                    let { xAxisPoints, calPoints, eachSpacing } = drawLineDataPoints(series, opts, config, context, process);
                    this.chartData.xAxisPoints = xAxisPoints;
                    this.chartData.calPoints = calPoints;
                    this.chartData.eachSpacing = eachSpacing;                    
                    drawXAxis(categories, opts, config, context);
                    drawLegend(opts.series, opts, config, context);
                    drawYAxis(series, opts, config, context);
                    drawToolTipBridge(opts, config, context, process);                    
                    drawCanvas(opts, context, false);
                },
                onAnimationFinish: () => {
                    this.event.trigger('renderComplete');
                }
            });
            break;
        case 'column':
            this.animationInstance = new Animation({
                timing: 'easeIn',
                duration: duration,
                onProcess: (process) => {
                    drawYAxisGrid(opts, config, context);                    
                    let { xAxisPoints, eachSpacing } = drawColumnDataPoints(series, opts, config, context, process);
                    this.chartData.xAxisPoints = xAxisPoints;
                    this.chartData.eachSpacing = eachSpacing;
                    drawXAxis(categories, opts, config, context);
                    drawLegend(opts.series, opts, config, context);                    
                    drawYAxis(series, opts, config, context);
                    drawCanvas(opts, context, false);
                },
                onAnimationFinish: () => {
                    this.event.trigger('renderComplete');
                }
            });
            break;
        case 'area':
            this.animationInstance = new Animation({
                timing: 'easeIn',
                duration: duration,
                onProcess: (process) => {
                    drawYAxisGrid(opts, config, context);                    
                    let { xAxisPoints, calPoints, eachSpacing } = drawAreaDataPoints(series, opts, config, context, process);
                    this.chartData.xAxisPoints = xAxisPoints;
                    this.chartData.calPoints = calPoints;
                    this.chartData.eachSpacing = eachSpacing;
                    drawXAxis(categories, opts, config, context);
                    drawLegend(opts.series, opts, config, context);
                    drawYAxis(series, opts, config, context);
                    drawToolTipBridge(opts, config, context, process);
                    drawCanvas(opts, context, false);
                },
                onAnimationFinish: () => {
                    this.event.trigger('renderComplete');
                }
            });
            break;
        case 'ring':
        case 'pie':
            this.animationInstance = new Animation({
                timing: 'easeInOut',
                duration: duration,
                onProcess: (process) => {
                    this.chartData.pieData = drawPieDataPoints(series, opts, config, context, process);
                    drawLegend(opts.series, opts, config, context);
                    drawCanvas(opts, context, false);
                },
                onAnimationFinish: () => {
                    this.event.trigger('renderComplete');
                }
            });
            break;
        case 'radar':
            this.animationInstance = new Animation({
                timing: 'easeInOut',
                duration: duration,
                onProcess: (process) => {
                    this.chartData.radarData = drawRadarDataPoints(series, opts, config, context, process);
                    drawLegend(opts.series, opts, config, context);
                    drawCanvas(opts, context, false);
                },
                onAnimationFinish: () => {
                    this.event.trigger('renderComplete');
                }
            });
            break;
    }
}