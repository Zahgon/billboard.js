/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import type {AxisTickFormat, AxisTickValue} from "../../types/axis";
import type {GridLineOptions, RegionOptions} from "../../types/options";
import type {AxisType} from "../../types/types";
import {AXIS_TICK_PADDING, AXIS_TICK_SIZE} from "../config/const";
import {
	getAdditionalAxisScale,
	getAdditionalAxisTickFormat,
	getAdditionalAxisTickValues,
	getSubXTickLineValues,
	getSubXTickValues,
	getXScale,
	getXTickLinePosition,
	getXTickLineValues,
	getXTickValues,
	getYGridTickValues,
	getYTickValues,
	isSameTickValue,
	normalizeXValue,
	normalizeYValue,
	type YAxisId
} from "./axisTicks";
import CanvasEngine from "./CanvasEngine";
import CanvasPainter, {CanvasRect, type CanvasStyle} from "./CanvasPainter";
import CanvasTheme, {type CanvasGridLineThemeStyle} from "./CanvasTheme";
import {getFontSize} from "./util";

type GridLine = Partial<GridLineOptions>;
type GridAxis = "x" | "y";
type AdditionalAxisOptions = {
	scale: any,
	ticks: AxisTickValue[],
	format: AxisTickFormat,
	index: number,
	outerTick: boolean,
	margin?: {left: number, top: number},
	width?: number,
	height?: number,
	prefix?: string,
	tickShow?: boolean,
	tickTextShow?: boolean,
	tickTextPosition?: {x: number, y: number}
};

const X_AXIS_TICK_TEXT_HORIZONTAL_CLIP_PADDING = 20;
const X_AXIS_TICK_TEXT_VERTICAL_CLIP_PADDING = 15;

/**
 * Get x tick text direction. Text labels stay outside the chart even when tick lines are inner.
 * @param {boolean} isRotated Whether axis is rotated
 * @returns {number} Text direction multiplier
 * @private
 */
function getXTickTextDirection(isRotated: boolean): number {
	return isRotated ? -1 : 1;
}

/**
 * Get y/y2 tick text direction. Text labels stay outside the chart even when tick lines are inner.
 * @param {boolean} isRotated Whether axis is rotated
 * @param {boolean} isY2 Whether axis is y2
 * @returns {number} Text direction multiplier
 * @private
 */
function getYTickTextDirection(isRotated: boolean, isY2: boolean): number {
	return isRotated ? (isY2 ? -1 : 1) : (isY2 ? 1 : -1);
}

/**
 * Get tick formatter for the canvas subchart y/y2 axis.
 * @param {object} $$ ChartInternal context
 * @param {string} id Axis id
 * @returns {function} Tick formatter
 * @private
 */
function getSubYTickFormat($$, id: YAxisId): AxisTickFormat {
	const subAxisId = id === "y2" ? "subY2" : "subY";
	const axisFormat = $$.axis?.[subAxisId]?.tickFormat?.();
	const configFormat = $$.config[`subchart_axis_${id}_tick_format`] ||
		$$.config[`axis_${id}_tick_format`];

	if (axisFormat) {
		return axisFormat;
	}

	return typeof configFormat === "function" ? configFormat.bind($$.api) : (v => { throw new Error("STUB"); });
}

/**
 * Convert resolved grid line style to painter line style.
 * @param {object} style Grid line style
 * @returns {object|undefined} Canvas line style
 * @private
 */
function getGridLineCanvasStyle(style?: CanvasGridLineThemeStyle): CanvasStyle | undefined {
	return style ?
		{
			stroke: style.lineColor,
			lineWidth: style.lineWidth,
			lineDash: style.dashArray
		} :
		undefined;
}

/**
 * Convert resolved grid text style to painter text style.
 * @param {object} style Grid text style
 * @returns {object|undefined} Canvas text style
 * @private
 */
function getGridTextCanvasStyle(style?: CanvasGridLineThemeStyle): CanvasStyle | undefined {
	return style ?
		{
			fill: style.labelColor,
			font: style.labelFont
		} :
		undefined;
}

/**
 * Get horizontal x-axis clip rect with small text overflow tolerance.
 * @param {object} margin Chart margin
 * @param {number} width Plot width
 * @param {number} height Clip height
 * @returns {object} Clip rectangle
 * @private
 */
function getHorizontalXAxisClipRect(margin, width: number, height: number): CanvasRect {
	return {
		x: margin.left - X_AXIS_TICK_TEXT_HORIZONTAL_CLIP_PADDING,
		y: 0,
		w: width + (X_AXIS_TICK_TEXT_HORIZONTAL_CLIP_PADDING * 2),
		h: height
	};
}

/**
 * Get rotated x-axis clip rect with small text overflow tolerance.
 * @param {object} margin Chart margin
 * @param {number} width Clip width
 * @param {number} height Plot height
 * @returns {object} Clip rectangle
 * @private
 */
function getRotatedXAxisClipRect(margin, width: number, height: number): CanvasRect {
	return {
		x: 0,
		y: margin.top - X_AXIS_TICK_TEXT_VERTICAL_CLIP_PADDING,
		w: width,
		h: height + (X_AXIS_TICK_TEXT_VERTICAL_CLIP_PADDING * 2)
	};
}

/**
 * Get configured axis tooltip background color.
 * @param {object} $$ ChartInternal context
 * @param {string} id Axis id
 * @returns {string|null} Background color
 * @private
 */
function getAxisTooltipBackgroundColor($$, id: AxisType): string | null {
	const bgColor = $$.config.axis_tooltip?.backgroundColor ?? "black";

	return typeof bgColor === "string" ? bgColor : (bgColor?.[id] || null);
}

/**
 * Format canvas axis tooltip scale value.
 * @param {object} $$ ChartInternal context
 * @param {string} id Axis id
 * @param {number} value Scale coordinate
 * @returns {string|null} Formatted scale text
 * @private
 */
function formatAxisTooltipValue($$, id: AxisType, value: number): string | null {
	const scale = $$.scale[id];

	if (!scale?.invert) {
		return null;
	}

	const scaleValue = scale.invert(value);

	if (scaleValue === null || scaleValue === undefined) {
		return null;
	}

	if (id === "x" && $$.axis?.isTimeSeries?.()) {
		return $$.format.xAxisTick(scaleValue);
	}

	const numeric = Number(scaleValue);

	return Number.isFinite(numeric) ? numeric.toFixed(2) : `${scaleValue}`;
}

/**
 * Get the axis group origin in canvas coordinates.
 * @param {object} $$ ChartInternal context
 * @param {string} id Axis id
 * @returns {object} Axis group origin
 * @private
 */
function getAxisLabelBasePosition($$, id: AxisType): {x: number, y: number} {
	const {config, state: {height, margin, width}} = $$;
	const isRotated = config.axis_rotated;
	const base = {
		x: margin.left,
		y: margin.top
	};

	if (id === "x") {
		!isRotated && (base.y += height);
	} else if (id === "y") {
		isRotated && (base.y += height);
	} else if (isRotated) {
		base.y -= 1;
	} else {
		base.x += width;
	}

	return base;
}

/**
 * Convert SVG axis label local coordinates to canvas coordinates.
 * @param {object} base Axis group origin
 * @param {number} base.x Axis group origin x
 * @param {number} base.y Axis group origin y
 * @param {number} localX SVG local x coordinate
 * @param {number} localY SVG local y coordinate
 * @param {boolean} isRotated Whether SVG label has rotate(-90)
 * @returns {object} Canvas coordinates
 * @private
 */
function getAxisLabelCanvasPosition(
	base: {x: number, y: number},
	localX: number,
	localY: number,
	isRotated: boolean
): {x: number, y: number} {
	return isRotated ?
		{
			x: base.x + localY,
			y: base.y - localX
		} :
		{
			x: base.x + localX,
			y: base.y + localY
		};
}

/**
 * Format tick value.
 * @param {function} format Format function
 * @param {number|Date|string} tick Tick value
 * @returns {string} Formatted tick
 * @private
 */
function formatTick(format: AxisTickFormat, tick: AxisTickValue): string {
	const value = format ? format(tick) : tick;

	return value == null ? "" : String(value);
}

/**
 * Get axis tick text font for a specific axis.
 * @param {object} axisStyle Canvas axis style
 * @param {string} id Axis id
 * @returns {string} Canvas font shorthand
 * @private
 */
function getAxisTickFont(axisStyle, id: AxisType): string {
	return axisStyle[`${id}TickFont`] || axisStyle.labelFont;
}

/**
 * Get SVG-like multiline x tick text line height.
 * @param {object} painter Canvas painter
 * @param {number} fontSize Current font size
 * @returns {number} Line height
 * @private
 */
function getXTickTextLineHeight(painter: CanvasPainter, fontSize: number): number {
	const metrics = painter.measureText("0");
	const fontBoxHeight = (metrics.fontBoundingBoxAscent || 0) +
		(metrics.fontBoundingBoxDescent || 0);
	const actualBoxHeight = (metrics.actualBoundingBoxAscent || 0) +
		(metrics.actualBoundingBoxDescent || 0);
	const svgFallbackHeight = (fontSize || 10) * (11.5 / 10);

	return Math.max(fontSize, fontBoxHeight, actualBoxHeight, svgFallbackHeight);
}

/**
 * Get SVG-compatible y position for rotated bottom x-axis tick text.
 * @param {number} rotate Tick text rotation
 * @returns {number} Local SVG text y coordinate
 * @private
 */
function getRotatedXTickTextY(rotate: number): number {
	const r2 = rotate / 15;

	return 11.5 - 2.5 * r2 * (rotate > 0 ? 1 : -1);
}

/**
 * Get SVG-compatible tspan dx for rotated bottom x-axis tick text.
 * @param {number} rotate Tick text rotation
 * @returns {number} Local tspan dx
 * @private
 */
function getRotatedXTickTextDx(rotate: number): number {
	return 8 * Math.sin(Math.PI * (rotate / 180));
}

/**
 * Resolve SVG-like dx/dy values for canvas text.
 * @param {number|string} value Offset value
 * @param {number} fontSize Current font size
 * @returns {number} Pixel offset
 * @private
 */
function resolveTextOffset(value: number | string | null | undefined, fontSize: number): number {
	if (typeof value === "number") {
		return value;
	}

	if (typeof value === "string") {
		const parsed = parseFloat(value);

		if (!Number.isFinite(parsed)) {
			return 0;
		}

		return /em$/.test(value.trim()) ? parsed * fontSize : parsed;
	}

	return 0;
}

/**
 * Split tick text by configured width.
 * @param {string} text Tick text
 * @param {number} width Max width
 * @param {object} painter Canvas painter
 * @returns {Array} Text lines
 * @private
 */
function splitTickTextByWidth(text: string, width: number, painter: CanvasPainter): string[] {
	if (!width) {
		return [text];
	}

	const charWidth = painter.measureText("0").width || 5.5;

	/**
	 * Split a text fragment recursively.
	 * @param {Array} lines Accumulated text lines
	 * @param {string} value Remaining text fragment
	 * @returns {Array} Text lines
	 * @private
	 */
	function split(lines: string[], value: string): string[] {
		let spaceIndex: number | undefined;

		for (let i = 1; i < value.length; i++) {
			if (value.charAt(i) === " ") {
				spaceIndex = i;
			}

			if (width < charWidth * (i + 1)) {
				const splitIndex = spaceIndex || i;

				return split(
					lines.concat(value.slice(0, splitIndex)),
					value.slice(spaceIndex ? spaceIndex + 1 : i)
				);
			}
		}

		return lines.concat(value);
	}

	return split([], text);
}

/**
 * Get max width for splitting canvas x axis tick text.
 * @param {object} $$ ChartInternal context
 * @param {Array} ticks X-axis tick values
 * @param {boolean} isRotated Whether axis is rotated
 * @param {function} targetScale X scale
 * @returns {number} Max tick text width
 * @private
 */
function getXTickTextWidth($$, ticks: AxisTickValue[], isRotated: boolean, targetScale): number {
	const configured = $$.config.axis_x_tick_width;

	if (configured && configured > 0) {
		return configured;
	}

	if (isRotated) {
		return 95;
	}

	if ($$.axis?.isCategorized?.() && ticks.length > 1) {
		const start = targetScale(normalizeXValue($$, ticks[0]));
		const end = targetScale(normalizeXValue($$, ticks[1]));

		return Math.max(0, Math.abs(end - start) - 12);
	}

	return 110;
}

/**
 * Get rendered x-axis tick text lines.
 * @param {object} $$ ChartInternal context
 * @param {object} painter Canvas painter
 * @param {function} format Tick formatter
 * @param {number|Date|string} tick Tick value
 * @param {Array} ticks X-axis tick values
 * @param {boolean} isRotated Whether axis is rotated
 * @param {function} targetScale X scale
 * @param {number} [maxWidth] Pre-computed max tick text width (invariant per draw pass)
 * @returns {Array} Tick text lines
 * @private
 */
function getXTickTextLines($$, painter: CanvasPainter, format: AxisTickFormat, tick: AxisTickValue,
	ticks: AxisTickValue[] = [], isRotated = false, targetScale = getXScale($$),
	maxWidth?: number): string[] {
	const value = format ? format(tick) : tick;

	if (value == null) {
		return [""];
	}

	if (Array.isArray(value)) {
		return value.map(v => { throw new Error("STUB"); });
	}

	const text = String(value);

	if (text.indexOf("\n") > -1) {
		return text.split("\n");
	}

	return $$.config.axis_x_tick_multiline ?
		splitTickTextByWidth(
			text,
			maxWidth ?? getXTickTextWidth($$, ticks, isRotated, targetScale),
			painter
		) :
		[text];
}

/**
 * Get canvas text alignment for x-axis tick text.
 * @param {object} $$ ChartInternal context
 * @param {object} options X-axis drawing options
 * @returns {string} Canvas text alignment
 * @private
 */
function getXTickTextAlign($$, options): CanvasTextAlign {
	const {
		isRotated,
		tickCount,
		tickIndex,
		tickRotate,
		tickTextDirection
	} = options;
	const inner = $$.config.axis_x_tick_text_inner;
	let align: CanvasTextAlign = isRotated ?
		(tickTextDirection > 0 ? "left" : "right") :
		(tickRotate ? (tickRotate > 0 ? "left" : "right") : "center");

	if (!isRotated && tickIndex === 0 && (inner === true || inner?.first)) {
		align = "left";
	} else if (
		!isRotated &&
		tickIndex === tickCount - 1 &&
		(inner === true || inner?.last)
	) {
		align = "right";
	}

	return align;
}

/**
 * Get title x position and text alignment.
 * @param {string} position Title position option
 * @param {number} width Chart width
 * @returns {object} Position and alignment
 * @private
 */
function getTitleTextPosition(position: string | undefined,
	width: number): {x: number, align: CanvasTextAlign} {
	if ((position?.indexOf("center") ?? -1) > -1) {
		return {x: width / 2, align: "center"};
	}

	if ((position?.indexOf("right") ?? -1) > -1) {
		return {x: width, align: "right"};
	}

	return {x: 0, align: "left"};
}

/**
 * Check if position can be drawn.
 * @param {number} value Coordinate value
 * @returns {boolean} Whether coordinate is finite
 * @private
 */
function isDrawable(value: number): boolean {
	return Number.isFinite(value);
}

/**
 * Check if position is within an axis drawing range.
 * @param {number} value Coordinate value
 * @param {number} start Range start
 * @param {number} end Range end
 * @returns {boolean} Whether coordinate is finite and in range
 * @private
 */
function isInAxisRange(value: number, start: number, end: number): boolean {
	return isDrawable(value) &&
		value >= Math.min(start, end) &&
		value <= Math.max(start, end);
}

/**
 * Get outer x tick direction following SVG axis orientation.
 * @param {boolean} isRotated Whether axis is rotated
 * @returns {number} Outer tick direction
 * @private
 */
function getXOuterTickDirection(isRotated: boolean): number {
	return isRotated ? -1 : 1;
}

/**
 * Get outer y/y2 tick direction following SVG axis orientation.
 * @param {object} config Chart config
 * @param {boolean} isRotated Whether axis is rotated
 * @param {boolean} isY2 Whether axis is y2
 * @returns {number} Outer tick direction
 * @private
 */
function getYOuterTickDirection(config, isRotated: boolean, isY2: boolean): number {
	if (isRotated) {
		return isY2 ? (config.axis_y2_inner ? 1 : -1) : (config.axis_y_inner ? -1 : 1);
	}

	return isY2 ? (config.axis_y2_inner ? -1 : 1) : (config.axis_y_inner ? 1 : -1);
}

/**
 * Resolve x coordinate from an x/category value.
 * @param {object} $$ ChartInternal context
 * @param {number|Date|string} value X value
 * @param {function} targetScale X scale
 * @returns {number} Pixel coordinate relative to plot area
 * @private
 */
function getXPosition($$, value: AxisTickValue, targetScale = getXScale($$)): number {
	return targetScale(normalizeXValue($$, value));
}

/**
 * Resolve x region boundary value, matching SVG region category semantics.
 * @param {object} $$ ChartInternal context
 * @param {number|Date|string} value X boundary value
 * @returns {number|Date|string} Scale-compatible value
 * @private
 */
function normalizeXRegionBoundaryValue($$, value: AxisTickValue): AxisTickValue {
	if ($$.axis?.isCategorized?.() && typeof value === "string" && Number.isNaN(Number(value))) {
		return $$.config.axis_x_categories.indexOf(value);
	}

	return normalizeXValue($$, value);
}

/**
 * Resolve whether category region boundary needs tick offset.
 * @param {object} $$ ChartInternal context
 * @param {number|Date|string} value X boundary value
 * @returns {boolean}
 * @private
 */
function hasCategoryRegionBoundaryOffset($$, value: AxisTickValue): boolean {
	return Boolean($$.axis?.isCategorized?.() && Number.isNaN(Number(value)));
}

/**
 * Resolve x boundary coordinate for category-aware regions.
 * @param {object} $$ ChartInternal context
 * @param {number|Date|string|undefined} value X value
 * @param {number} fallback Fallback coordinate
 * @param {string} key Region boundary key
 * @returns {number} Pixel coordinate relative to plot area
 * @private
 */
function getXBoundary($$, value: AxisTickValue | undefined, fallback: number,
	key: "start" | "end"): number {
	if (value === undefined) {
		return fallback;
	}

	let pos = getXScale($$)(normalizeXRegionBoundaryValue($$, value));

	if (hasCategoryRegionBoundaryOffset($$, value)) {
		const xScale = getXScale($$);
		const tickOffset = $$.axis.x?.tickOffset?.() || ((xScale(1) - xScale(0)) / 2);

		pos += tickOffset * (key === "start" ? -1 : 1);
	}

	return pos;
}

/**
 * Resolve y coordinate from y/y2 value.
 * @param {object} $$ ChartInternal context
 * @param {number|Date|string} value Y value
 * @param {string} axis Axis id
 * @returns {number} Pixel coordinate relative to plot area
 * @private
 */
function getYPosition($$, value: AxisTickValue, axis: YAxisId = "y"): number {
	return $$.scale[axis || "y"](normalizeYValue($$, value, axis));
}

/**
 * Get a text position along a grid line.
 * @param {string} position Grid label position
 * @param {number} start Start coordinate
 * @param {number} end End coordinate
 * @returns {number} Label coordinate
 * @private
 */
function getLineTextPosition(position: string | undefined, start: number, end: number): number {
	if (position === "start") {
		return start + 4;
	}

	if (position === "middle") {
		return (start + end) / 2;
	}

	return end - 4;
}

/**
 * Get a text position for labels drawn with SVG-compatible rotate(-90).
 * @param {string} position Grid label position
 * @param {number} start Start coordinate
 * @param {number} end End coordinate
 * @returns {number} Label coordinate
 * @private
 */
function getRotatedLineTextPosition(position: string | undefined, start: number,
	end: number): number {
	if (position === "start") {
		return end - 4;
	}

	if (position === "middle") {
		return (start + end) / 2;
	}

	return start + 4;
}

/**
 * Get global region rectangle.
 * @param {object} $$ ChartInternal context
 * @param {object} region Region option
 * @returns {object|null} Region rectangle relative to plot area
 * @private
 */
function getRegionRect($$, region: RegionOptions): CanvasRect | null {
	const {config, scale, state: {width, height}} = $$;
	const axis = region.axis || "x";
	const isRotated = config.axis_rotated;

	if (axis === "x") {
		const start = getXBoundary($$, region.start, 0, "start");
		const end = getXBoundary($$, region.end, isRotated ? height : width, "end");
		const min = Math.min(start, end);
		const size = Math.abs(end - start);

		return isRotated ? {x: 0, y: min, w: width, h: size} : {x: min, y: 0, w: size, h: height};
	}

	if (!scale[axis]) {
		return null;
	}

	const start = region.start === undefined ?
		(isRotated ? 0 : height) :
		getYPosition($$, region.start, axis);
	const end = region.end === undefined ?
		(isRotated ? width : 0) :
		getYPosition($$, region.end, axis);
	const min = Math.min(start, end);
	const size = Math.abs(end - start);

	return isRotated ? {x: min, y: 0, w: size, h: height} : {x: 0, y: min, w: width, h: size};
}

/**
 * Draw axes and grid lines on canvas.
 * @private
 */
export default class CanvasAxisRenderer {
	private painter: CanvasPainter;

	/**
	 * Constructor.
	 * @param {CanvasEngine} engine Canvas drawing engine
	 * @param {CanvasTheme} theme Canvas theme resolver
	 * @private
	 */
	constructor(
		private engine: CanvasEngine,
		private theme: CanvasTheme
	) {
		this.painter = new CanvasPainter(engine.ctx);
	}

	/**
	 * Get the drawing context for the main canvas.
	 * @returns {CanvasRenderingContext2D} Canvas drawing context
	 * @private
	 */
	get ctx(): CanvasRenderingContext2D {
        throw new Error("STUB");
    }

	/**
	 * Run axis renderer draw calls on another canvas context.
	 * @param {CanvasRenderingContext2D} ctx Canvas drawing context
	 * @param {function} draw Draw callback
	 * @private
	 */
	withContext(ctx: CanvasRenderingContext2D, draw: () => void): void {
		this.painter.withContext(ctx, draw);
	}

	/**
	 * Draw grid and axis layers.
	 * @param {object} $$ ChartInternal instance
	 * @private
	 */
	draw($$): void {
		this.drawRegions($$);
		this.drawGrid($$);
		this.drawAxis($$);
	}

	/**
	 * Draw visible axes.
	 * @param {object} $$ ChartInternal instance
	 * @private
	 */
	drawAxis($$): void {
		const {config} = $$;

		config.axis_x_show && this.drawXAxis($$);
		config.axis_y_show && this.drawYAxis($$);
		config.axis_y2_show && $$.scale.y2 && this.drawYAxis($$, "y2");
		this.drawAdditionalAxes($$);
		this.drawAxisLabels($$);
	}

	/**
	 * Draw the canvas subchart x axis.
	 * @param {object} $$ ChartInternal instance
	 * @private
	 */
	drawSubXAxis($$): void {
		const {ctx, painter, theme: {style: {axis}}} = this;
		const {
			config,
			format,
			scale,
			state: {current, margin2, width2, height2}
		} = $$;

		if (
			!config.subchart_show ||
			!config.subchart_axis_x_show ||
			!scale.subX ||
			width2 <= 0 ||
			height2 <= 0
		) {
			return;
		}

		const isRotated = config.axis_rotated;
		const x = painter.crisp(margin2.left, axis.lineWidth);
		const y = painter.crisp(margin2.top + height2, axis.lineWidth);
		const x1 = margin2.left;
		const x2 = margin2.left + width2;
		const y1 = margin2.top;
		const y2 = margin2.top + height2;
		const rangeStart = isRotated ? y1 : x1;
		const rangeEnd = isRotated ? y2 : x2;
		const ticks = getSubXTickValues($$);
		const lineTicks = getSubXTickLineValues($$, ticks, axis.tickWidth);
		const outerTick = config.subchart_axis_x_tick_outer ?? config.axis_x_tick_outer;
		const tickDirection = isRotated ?
			(config.axis_x_tick_inner ? 1 : -1) :
			(config.axis_x_tick_inner ? -1 : 1);
		const outerTickDirection = getXOuterTickDirection(isRotated);
		const tickTextDirection = getXTickTextDirection(isRotated);
		const tickTextPosition = config.axis_x_tick_text_position;
		const tickRotate = !isRotated ? ($$.getAxisTickRotate?.("x") || 0) : 0;
		const tickFormat = format.subXAxisTick || $$.axis?.getXAxisTickFormat?.(true);

		painter.clipRect(
			isRotated ? getRotatedXAxisClipRect(margin2, current.width, height2) : {
				...getHorizontalXAxisClipRect(
					margin2,
					width2,
					current.height - margin2.top
				),
				y: margin2.top
			},
			() => {
                throw new Error("STUB");
            }
		);
	}

	/**
	 * Draw the canvas subchart y/y2 axes.
	 * @param {object} $$ ChartInternal instance
	 * @private
	 */
	drawSubYAxes($$): void {
		const {
			config,
			scale,
			state: {margin2, width2, height2}
		} = $$;

		if (!config.subchart_show || width2 <= 0 || height2 <= 0) {
			return;
		}

		(["y", "y2"] as YAxisId[]).forEach(id => {
            throw new Error("STUB");
        });
	}

	/**
	 * Draw chart title.
	 * @param {object} $$ ChartInternal instance
	 * @private
	 */
	drawTitle($$): void {
		const {ctx, painter, theme: {style: {title}}} = this;
		const {config, state: {current}} = $$;

		if (!config.title_text) {
			return;
		}

		const lines = String(config.title_text).split("\n");
		const fontSize = getFontSize(title.font);
		const lineHeight = fontSize * 1.5;
		const {x, align} = getTitleTextPosition(config.title_position, current.width);
		const titleHeight = $$.getCanvasTitleHeight?.() ?? fontSize;
		const y = (config.title_padding.top || 0) + titleHeight;

		painter.withState(() => {
            throw new Error("STUB");
        });
	}

	/**
	 * Draw axis labels.
	 * @param {object} $$ ChartInternal instance
	 * @private
	 */
	private drawAxisLabels($$): void {
		const {ctx, painter, theme: {style: {axis: style}}} = this;
		const {axis, config} = $$;
		const fontSize = getFontSize(style.labelFont);
		const ids: AxisType[] = ["x", "y", "y2"];
		const labelColorById: Record<AxisType, string> = {
			x: style.xLabelColor,
			y: style.yLabelColor,
			y2: style.y2LabelColor
		};
		const alignMap = {
			start: "left",
			middle: "center",
			end: "right"
		} as Record<string, CanvasTextAlign>;

		if (!axis) {
			return;
		}

		painter.withState(() => {
            throw new Error("STUB");
        });
	}

	/**
	 * Draw visible grid lines.
	 * @param {object} $$ ChartInternal instance
	 * @private
	 */
	drawGrid($$): void {
		const {ctx, painter, theme: {style: {grid}}} = this;
		const {config, scale, state: {height, margin, width}} = $$;

		if (!grid.lineColor) {
			return;
		}

		const isRotated = config.axis_rotated;
		const x1 = margin.left;
		const x2 = margin.left + width;
		const y1 = margin.top;
		const y2 = margin.top + height;

		painter.withState(() => {
            throw new Error("STUB");
        });
	}

	/**
	 * Draw configured global regions.
	 * @param {object} $$ ChartInternal instance
	 * @private
	 */
	private drawRegions($$): void {
		const {ctx, painter, theme: {style: {region: style}}} = this;
		const {config, state: {height, margin, width}} = $$;
		const regions: RegionOptions[] = config.regions || [];

		if (!regions.length) {
			return;
		}

		painter.clipRect({x: margin.left, y: margin.top, w: width, h: height}, () => {
            throw new Error("STUB");
        });
	}

	/**
	 * Draw configured x/y grid lines and labels.
	 * @param {object} $$ ChartInternal instance
	 * @private
	 */
	drawGridLines($$): void {
		const {ctx, painter, theme: {style: {axis, grid}}} = this;
		const {config, scale, state: {height, margin, width}} = $$;
		const isRotated = config.axis_rotated;
		const x1 = margin.left;
		const x2 = margin.left + width;
		const y1 = margin.top;
		const y2 = margin.top + height;

		if (!grid.lineColor) {
			return;
		}

		painter.withState(() => {
            throw new Error("STUB");
        });
	}

	/**
	 * Draw axes configured with axis.x/y/y2.axes.
	 * @param {object} $$ ChartInternal instance
	 * @private
	 */
	private drawAdditionalAxes($$): void {
		(["x", "y", "y2"] as AxisType[]).forEach(id => {
            throw new Error("STUB");
        });
	}

	/**
	 * Draw the x axis.
	 * @param {object} $$ ChartInternal instance
	 * @param {object} axisOptions Additional axis options
	 * @private
	 */
	private drawXAxis($$, axisOptions?: AdditionalAxisOptions): void {
		const {ctx, painter, theme: {style: {axis}}} = this;
		const {axis: axisInstance, config, state: {current, margin, width, height}} = $$;
		const isRotated = config.axis_rotated;
		const axisOffset = axisOptions?.index ? $$.getAxisSize("x") * axisOptions.index : 0;
		const targetScale = axisOptions?.scale || getXScale($$);
		const x = painter.crisp(margin.left - (isRotated ? axisOffset : 0), axis.lineWidth);
		const y = painter.crisp(
			margin.top + height + (isRotated ? 0 : axisOffset),
			axis.lineWidth
		);
		const x1 = margin.left;
		const x2 = margin.left + width;
		const y1 = margin.top;
		const y2 = margin.top + height;
		const rangeStart = isRotated ? y1 : x1;
		const rangeEnd = isRotated ? y2 : x2;
		const ticks = axisOptions?.ticks || getXTickValues($$);
		const lineTicks = axisOptions?.ticks ||
			getXTickLineValues($$, ticks, axis.tickWidth);
		const format = axisOptions?.format || axisInstance.getXAxisTickFormat();
		const outerTick = axisOptions ? axisOptions.outerTick : config.axis_x_tick_outer;
		const tickDirection = isRotated ?
			(config.axis_x_tick_inner ? 1 : -1) :
			(config.axis_x_tick_inner ? -1 : 1);
		const outerTickDirection = getXOuterTickDirection(isRotated);
		const tickTextDirection = getXTickTextDirection(isRotated);
		const tickTextPosition = config.axis_x_tick_text_position;
		const tickRotate = !isRotated ? ($$.getAxisTickRotate?.("x") || 0) : 0;

		painter.clipRect(
			isRotated ?
				getRotatedXAxisClipRect(margin, current.width, height) :
				getHorizontalXAxisClipRect(margin, width, current.height),
			() => {
                throw new Error("STUB");
            }
		);
	}

	/**
	 * Draw the focused x-axis tick text with the SVG active tick color.
	 * @param {object} $$ ChartInternal instance
	 * @param {Array} focusData Focused data rows
	 * @private
	 */
	drawFocusedXAxisTick($$, focusData): void {
		const {painter, theme: {style: {axis}}} = this;
		const {axis: axisInstance, config, state: {current, margin, width, height}} = $$;
		const focusX = focusData?.[0]?.x;

		if (
			focusX === undefined ||
			!axisInstance ||
			!config.axis_x_show ||
			!config.axis_x_tick_text_show ||
			!axis.activeLabelColor ||
			axis.activeLabelColor === axis.labelColor
		) {
			return;
		}

		const ticks = getXTickValues($$);
		const tickIndex = ticks.findIndex(value => { throw new Error("STUB"); });
		const tick = ticks[tickIndex];

		if (tick === undefined) {
			return;
		}

		const isRotated = config.axis_rotated;
		const x = painter.crisp(margin.left, axis.lineWidth);
		const y = painter.crisp(margin.top + height, axis.lineWidth);
		const rangeStart = isRotated ? margin.top : margin.left;
		const rangeEnd = isRotated ? margin.top + height : margin.left + width;
		const format = axisInstance.getXAxisTickFormat();
		const tickTextDirection = getXTickTextDirection(isRotated);

		painter.clipRect(
			isRotated ?
				getRotatedXAxisClipRect(margin, current.width, height) :
				getHorizontalXAxisClipRect(margin, width, current.height),
			() => {
                throw new Error("STUB");
            }
		);
	}

	/**
	 * Draw axis tooltip guide lines and scale labels on canvas overlay.
	 * @param {object} $$ ChartInternal instance
	 * @param {Array} point Canvas-local pointer coordinate
	 * @private
	 */
	drawAxisTooltip($$, point: number[]): void {
		const {ctx, painter, theme: {style: {axis, grid}}} = this;
		const {config, state: {margin, width, height}} = $$;

		if (!config.axis_tooltip || !point) {
			return;
		}

		const isRotated = config.axis_rotated;
		const localX = point[0] - margin.left;
		const localY = point[1] - margin.top;
		const isInXRange = localX >= 0 && localX <= width;
		const isInYRange = localY >= 0 && localY <= height;

		if (!isInXRange && !isInYRange) {
			return;
		}

		const absX = margin.left + localX;
		const absY = margin.top + localY;
		const fontSize = getFontSize(axis.labelFont);
		const lineHeight = fontSize || 10;
		const drawLabel = (
			id: AxisType,
			scaleValue: number,
			x: number,
			y: number,
			textAlign: CanvasTextAlign
		): void => {
			const bg = getAxisTooltipBackgroundColor($$, id);
			const text = bg && formatAxisTooltipValue($$, id, scaleValue);

			if (!text) {
				return;
			}

			ctx.font = axis.labelFont;
			ctx.textAlign = textAlign;
			ctx.textBaseline = "alphabetic";

			const metrics = ctx.measureText(text);
			const textWidth = metrics.width;
			const ascent = metrics.actualBoundingBoxAscent || lineHeight * 0.8;
			const descent = metrics.actualBoundingBoxDescent || lineHeight * 0.2;
			const paddingX = Math.max(2, textWidth * 0.15);
			const paddingY = Math.max(3, lineHeight * 0.25);
			const textLeft = textAlign === "right" ?
				x - textWidth :
				textAlign === "center" ?
				x - textWidth / 2 :
				x;
			const textTop = y - ascent;

			ctx.fillStyle = bg;
			ctx.fillRect(
				textLeft - paddingX,
				textTop - paddingY,
				textWidth + paddingX * 2,
				ascent + descent + paddingY * 2
			);
			ctx.fillStyle = "#fff";
			ctx.fillText(text, x, y);
		};

		painter.withState(() => {
            throw new Error("STUB");
        });
	}

	/**
	 * Draw one x-axis tick text using the same layout as SVG axis ticks.
	 * @param {object} $$ ChartInternal instance
	 * @param {number|string|Date} tick Tick value
	 * @param {function} format Tick formatter
	 * @param {string} fill Text fill color
	 * @param {object} options X-axis drawing options
	 * @private
	 */
	private drawXAxisTickText($$, tick: AxisTickValue, format: AxisTickFormat, fill: string,
		options): void {
		const {ctx, painter, theme: {style: {axis}}} = this;
		const {state: {margin}} = $$;
		const {
			isRotated,
			rangeEnd,
			rangeStart,
			tickTextDirection,
			tickRotate,
			tickTextPosition,
			targetScale,
			ticks,
			x,
			y
		} = options;
		const tickPos = getXPosition($$, tick, targetScale);
		const tx = margin.left + tickPos;
		const ty = margin.top + tickPos;
		const pos = isRotated ? ty : tx;

		if (!isInAxisRange(pos, rangeStart, rangeEnd)) {
			return;
		}

		const tickFont = options.tickFont ?? getAxisTickFont(axis, "x");

		ctx.font = tickFont;
		ctx.fillStyle = fill;

		const lines = getXTickTextLines(
			$$,
			painter,
			format,
			tick,
			ticks,
			isRotated,
			targetScale,
			options.tickTextWidth
		);
		const lineHeight = options.tickLineHeight ??
			getXTickTextLineHeight(painter, getFontSize(tickFont));
		let textX;
		let textY;

		if (isRotated) {
			textX = x + ((AXIS_TICK_SIZE + AXIS_TICK_PADDING) * tickTextDirection) +
				(tickTextPosition.x || 0);
			textY = ty + (tickTextPosition.y || 0);
			ctx.textAlign = getXTickTextAlign($$, options);
			ctx.textBaseline = "middle";
		} else if (tickRotate) {
			const fontSize = getFontSize(tickFont);
			const firstDy = tickTextPosition.y ?
				resolveTextOffset(tickTextPosition.y, fontSize) :
				0.71 * fontSize;
			const textDx = getRotatedXTickTextDx(tickRotate) +
				(tickTextPosition.x || 0);
			const textY = getRotatedXTickTextY(tickRotate) + firstDy;

			ctx.textAlign = getXTickTextAlign($$, options);
			ctx.textBaseline = "alphabetic";
			painter.withState(textCtx => {
                throw new Error("STUB");
            });

			return;
		} else {
			textX = tx + (tickTextPosition.x || 0);
			textY = y + ((AXIS_TICK_SIZE + AXIS_TICK_PADDING) * tickTextDirection) +
				(tickTextPosition.y || 0);
			ctx.textAlign = getXTickTextAlign($$, options);
			ctx.textBaseline = tickTextDirection > 0 ? "top" : "bottom";
		}

		painter.withState(textCtx => {
            throw new Error("STUB");
        });
	}

	/**
	 * Draw the y axis.
	 * @param {object} $$ ChartInternal instance
	 * @param {string} id Axis id
	 * @param {object} axisOptions Additional axis options
	 * @private
	 */
	private drawYAxis($$, id: YAxisId = "y", axisOptions?: AdditionalAxisOptions): void {
		const {ctx, painter, theme: {style: {axis}}} = this;
		const {config, scale, state} = $$;
		const {margin, width, height} = state;
		const plotMargin = axisOptions?.margin || margin;
		const plotWidth = axisOptions?.width ?? width;
		const plotHeight = axisOptions?.height ?? height;
		const prefix = axisOptions?.prefix || `axis_${id}`;
		const targetScale = axisOptions?.scale || scale[id];
		const isY2 = id === "y2";
		const isRotated = config.axis_rotated;
		const axisOffset = axisOptions?.index ? $$.getAxisSize(id) * axisOptions.index : 0;
		const x = painter.crisp(
			plotMargin.left + (isY2 ? plotWidth + (isRotated ? 0 : axisOffset) : -axisOffset),
			axis.lineWidth
		);
		const y = painter.crisp(plotMargin.top + (
			isRotated ? (isY2 ? -axisOffset - 1 : plotHeight + axisOffset) : 0
		), axis.lineWidth);
		const x1 = plotMargin.left;
		const x2 = plotMargin.left + plotWidth;
		const y1 = plotMargin.top;
		const y2 = plotMargin.top + plotHeight;
		const ticks = axisOptions?.ticks || getYTickValues($$, id);
		const lineTicks = axisOptions?.ticks || (
			config[`${prefix}_tick_culling`] && config[`${prefix}_tick_culling_lines`] !== false ?
				getYTickValues($$, id, undefined, false) :
				ticks
		);
		const format = axisOptions?.format || $$.axis?.[id]?.tickFormat?.() ||
			config[`${prefix}_tick_format`]?.bind($$.api) ||
			(v => { throw new Error("STUB"); });
		const outerTick = axisOptions ? axisOptions.outerTick : config[`${prefix}_tick_outer`];
		const tickDirection = isRotated ?
			(isY2 ? (config.axis_y2_tick_inner ? 1 : -1) : (config.axis_y_tick_inner ? -1 : 1)) :
			(isY2 ? (config.axis_y2_tick_inner ? -1 : 1) : (config.axis_y_tick_inner ? 1 : -1));
		const outerTickDirection = getYOuterTickDirection(config, isRotated, isY2);
		const tickTextDirection = getYTickTextDirection(isRotated, isY2);
		const tickTextPosition = axisOptions?.tickTextPosition ||
			config[`${prefix}_tick_text_position`] ||
			config[`axis_${id}_tick_text_position`];
		const tickShow = axisOptions?.tickShow ??
			(axisOptions ? true : config[`${prefix}_tick_show`]);
		const tickTextShow = axisOptions?.tickTextShow ??
			(axisOptions ? true : config[`${prefix}_tick_text_show`]);

		painter.withState(() => {
            throw new Error("STUB");
        });
	}
}
