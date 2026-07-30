/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */

import {
	axisBottom as d3AxisBottom,
	axisLeft as d3AxisLeft,
	axisRight as d3AxisRight,
	axisTop as d3AxisTop
} from "d3-axis";
import type {AxisType} from "../../../types/types";
import {$AXIS, $COMMON} from "../../config/classes";
import {AXIS_TICK_LINE_OVERLAP_PADDING, AXIS_TICK_SIZE} from "../../config/const";
import {KEY} from "../../module/Cache";
import {
	capitalize,
	getBoundingRect,
	isArray,
	isEmpty,
	isFunction,
	isNumber,
	isObjectType,
	isString,
	isValue,
	mergeObj,
	notEmpty,
	parseDate,
	sortValue
} from "../../module/util";
import {getScale} from "../internals/scale";
import AxisRenderer from "./AxisRenderer";

/**
 * Get the corresponding main axis id for subchart axis ids.
 * @param {string} id Axis id
 * @returns {string} Base axis id
 * @private
 */
function getBaseAxisId(id: string): string {
	return id === "subX" ? "x" : (
		id === "subY" ? "y" : (
			id === "subY2" ? "y2" : id
		)
	);
}

/**
 * Check whether the axis id belongs to subchart.
 * @param {string} id Axis id
 * @returns {boolean} Whether id is a subchart axis
 * @private
 */
function isSubAxis(id: string): boolean {
	return /^sub/.test(id);
}

/**
 * Get tick option value for main/subchart axis.
 * @param {object} config Chart config
 * @param {string} id Axis id
 * @param {string} key Tick option key
 * @returns {boolean|number|string|Array|object|function|null|undefined} Tick option value
 * @private
 */
function getAxisTickOption(config, id: string, key: string) {
	const type = getBaseAxisId(id);
	const subValue = config[`subchart_axis_${type}_tick_${key}`];

	return isSubAxis(id) && subValue !== undefined ? subValue : config[`axis_${type}_tick_${key}`];
}

/**
 * Sample representative tick nodes to avoid N forced reflows in getMaxTickSize
 * @param {SVGTextElement[]} nodes All tick text nodes
 * @returns {SVGTextElement[]} Sampled subset: first, last, longest, and middle nodes
 * @private
 */
function _sampleTickNodes(nodes: SVGTextElement[]): SVGTextElement[] {
	const sampled = [nodes[0], nodes[nodes.length - 1]];

	// Find the node with the longest text content (likely widest)
	let maxLen = 0;
	let longestNode: SVGTextElement | null = null;

	for (const node of nodes) {
		const len = node.textContent?.length ?? 0;

		if (len > maxLen) {
			maxLen = len;
			longestNode = node;
		}
	}

	if (longestNode && !sampled.includes(longestNode)) {
		sampled.push(longestNode);
	}

	// Add a middle sample
	const mid = nodes[Math.floor(nodes.length / 2)];

	if (!sampled.includes(mid)) {
		sampled.push(mid);
	}

	return sampled;
}

const MAX_TICK_MEASURE_VALUES = 50;
const TICK_WIDTH_FALLBACK = Symbol("tickWidthFallback");
type TickWidthArray = (number | string)[] & {[TICK_WIDTH_FALLBACK]?: number};

/**
 * Get SVG tick line stroke width.
 * @param {object} tickNodes Tick node selection
 * @returns {number} Tick line stroke width
 * @private
 */
function _getTickLineWidth(tickNodes): number {
	const line = tickNodes.select("line").node();
	const strokeWidth = line?.ownerDocument?.defaultView?.getComputedStyle ?
		parseFloat(line.ownerDocument.defaultView.getComputedStyle(line).strokeWidth) :
		parseFloat(line?.getAttribute?.("stroke-width"));

	return Number.isFinite(strokeWidth) && strokeWidth > 0 ? strokeWidth : 1;
}

/**
 * Check whether adjacent tick line intervals overlap on the rendered axis.
 * @param {object} axis Axis renderer
 * @param {Array} tickValues Sorted tick values
 * @param {number} tickLineWidth Tick line stroke width
 * @returns {boolean} Whether tick lines should be culled with tick text
 * @private
 */
function _hasOverlappedTickLineIntervals(
	axis: AxisRenderer | undefined,
	tickValues,
	tickLineWidth: number
): boolean {
	const scale = axis?.scale?.() as any;

	if (!scale || tickValues.length < 2) {
		return false;
	}

	const halfWidth = Math.max(1, tickLineWidth) / 2;
	const positions = tickValues
		.map(value => { throw new Error("STUB"); })
		.filter(Number.isFinite)
		.sort((a, b) => { throw new Error("STUB"); });

	if (positions.length < 2) {
		return false;
	}

	let previousEnd = positions[0] + halfWidth;

	for (let i = 1; i < positions.length; i++) {
		const start = positions[i] - halfWidth;
		const end = positions[i] + halfWidth;

		if (start <= previousEnd + AXIS_TICK_LINE_OVERLAP_PADDING) {
			return true;
		}

		previousEnd = Math.max(previousEnd, end);
	}

	return false;
}

/**
 * Sample representative tick values before creating dummy tick DOM nodes.
 * @param {Array} values All tick values
 * @param {function} format Tick format function
 * @returns {Array} Sampled tick values
 * @private
 */
function _sampleTickValues<T>(values: T[], format?: (value: T) => unknown): T[] {
	if (values.length <= MAX_TICK_MEASURE_VALUES) {
		return values;
	}

	const sampled = new Map<number, T>();
	const add = (index: number): void => {
		if (index >= 0 && index < values.length) {
			sampled.set(index, values[index]);
		}
	};

	add(0);
	add(values.length - 1);
	add(Math.floor(values.length / 2));

	const step = Math.max(1, Math.floor(values.length / (MAX_TICK_MEASURE_VALUES - 3)));
	let maxLength = -1;
	let maxIndex = 0;

	for (let i = 0; i < values.length; i += step) {
		add(i);

		const value = values[i];
		const text = format ? format(value) : value;
		const length = Array.isArray(text) ? text.join("").length : String(text ?? "").length;

		if (length > maxLength) {
			maxLength = length;
			maxIndex = i;
		}
	}

	add(maxIndex);

	return Array.from(sampled.keys())
		.sort((a, b) => { throw new Error("STUB"); })
		.map(index => { throw new Error("STUB"); });
}

/**
 * Get compact tick values for cache fingerprinting.
 * @param {Array|function} values Tick values
 * @returns {Array|object|string} Cache fingerprint value
 * @private
 */
function _getTickValuesCacheValue(values) {
	if (isFunction(values)) {
		return _getCacheReferenceId(values);
	}

	if (!Array.isArray(values) || values.length <= MAX_TICK_MEASURE_VALUES) {
		return values;
	}

	return {
		length: values.length,
		first: values[0],
		middle: values[Math.floor(values.length / 2)],
		last: values[values.length - 1]
	};
}

/**
 * Get compact tick width fallback.
 * @param {Array} ticks Tick width array
 * @returns {number|undefined} Fallback width
 * @private
 */
function _getTickWidthFallback(ticks): number | undefined {
	return (ticks as TickWidthArray)[TICK_WIDTH_FALLBACK];
}

/**
 * Set compact tick width fallback.
 * @param {Array} ticks Tick width array
 * @param {number} width Fallback width
 * @private
 */
function _setTickWidthFallback(ticks, width?: number): void {
	if (isNumber(width)) {
		Object.defineProperty(ticks, TICK_WIDTH_FALLBACK, {
			configurable: true,
			value: width,
			writable: true
		});
	} else {
		delete (ticks as TickWidthArray)[TICK_WIDTH_FALLBACK];
	}
}

/**
 * Reset tick widths and compact metadata.
 * @param {Array} ticks Tick width array
 * @private
 */
function _clearTickWidths(ticks): void {
	ticks.length = 0;
	_setTickWidthFallback(ticks);
}

/**
 * Store large uniform tick widths without filling the array.
 * @param {Array} ticks Tick width array
 * @param {number} length Tick count
 * @param {number} width Uniform fallback width
 * @private
 */
function _compactTickWidths(ticks, length: number, width: number): void {
	_clearTickWidths(ticks);
	ticks.length = length;
	_setTickWidthFallback(ticks, width);
}

/**
 * Clone tick widths while preserving sparse compact storage.
 * @param {Array} ticks Tick width array
 * @returns {Array} Cloned tick width array
 * @private
 */
function _cloneTickWidths(ticks): TickWidthArray {
	const clone: TickWidthArray = [];

	clone.length = ticks.length;
	Object.keys(ticks).forEach(key => {
        throw new Error("STUB");
    });
	_setTickWidthFallback(clone, _getTickWidthFallback(ticks));

	return clone;
}

/**
 * Restore cached tick widths into current mutable state.
 * @param {Array} target Current tick width array
 * @param {Array} source Cached tick width array
 * @private
 */
function _restoreTickWidths(target, source): void {
	_clearTickWidths(target);
	target.length = source.length;
	Object.keys(source).forEach(key => {
        throw new Error("STUB");
    });
	_setTickWidthFallback(target, _getTickWidthFallback(source));
}

/**
 * Get a tick width from dense or compact storage.
 * @param {Array} ticks Tick width array
 * @param {number} index Tick index
 * @param {number} fallback Fallback width
 * @returns {number} Tick width
 * @private
 */
function _getTickWidth(ticks, index: number, fallback: number): number {
	const value = ticks[index];

	if (isNumber(value)) {
		return value;
	}

	const numericValue = Number(value);

	return Number.isFinite(numericValue) ? numericValue : fallback;
}

const cacheReferenceIds = new WeakMap<object, number>();
let cacheReferenceUid = 0;

/**
 * Get stable identity for non-serializable cache inputs.
 * @param {function|object|string|number|boolean|null|undefined} value Value to identify
 * @returns {string} Stable reference id
 * @private
 */
function _getCacheReferenceId(value): string {
	if (!value || !/^(function|object)$/.test(typeof value)) {
		return `${typeof value}:${String(value)}`;
	}

	let id = cacheReferenceIds.get(value);

	if (!id) {
		id = ++cacheReferenceUid;
		cacheReferenceIds.set(value, id);
	}

	return `${typeof value}:${id}`;
}

/**
 * Stringify axis measurement inputs for cache matching.
 * @param {Date|Array|function|object|string|number|boolean|null|undefined} value Value to stringify
 * @returns {string} Stringified value
 * @private
 */
function _stringifyCacheValue(value): string {
	if (value instanceof Date) {
		return `date:${+value}`;
	} else if (Array.isArray(value)) {
		return `[${value.map(v => { throw new Error("STUB"); }).join(",")}]`;
	} else if (value && typeof value === "object") {
		return `{${
			Object.keys(value).sort().map(key => { throw new Error("STUB"); }).join(
				","
			)
		}}`;
	} else if (typeof value === "function") {
		return _getCacheReferenceId(value);
	}

	return `${typeof value}:${String(value)}`;
}

/**
 * Clone array/date cache values before storing state snapshots.
 * @param {Date|Array|object|string|number|boolean|null|undefined} value Value to clone
 * @returns {Date|Array|object|string|number|boolean|null|undefined} Cloned value
 * @private
 */
function _cloneCacheValue(value) {
	return value instanceof Date ? new Date(+value) : (
		Array.isArray(value) ? value.map(v => { throw new Error("STUB"); }) : value
	);
}

/**
 * Clone tick measurement state without mutable array side effects.
 * @param {object} tickSize Tick measurement state
 * @returns {object} Cloned measurement state
 * @private
 */
function _cloneMaxTickSize(tickSize) {
	return {
		width: tickSize.width,
		height: tickSize.height,
		ticks: tickSize.ticks && _cloneTickWidths(tickSize.ticks),
		clipPath: tickSize.clipPath,
		domain: _cloneCacheValue(tickSize.domain)
	};
}

/**
 * Restore cached tick measurement into current mutable state.
 * @param {object} target Current tick measurement state
 * @param {object} source Cached tick measurement state
 * @returns {object} Current tick measurement state
 * @private
 */
function _restoreMaxTickSize(target, source) {
	target.width = source.width;
	target.height = source.height;
	target.clipPath = source.clipPath;
	target.domain = _cloneCacheValue(source.domain);

	if (target.ticks && source.ticks) {
		_restoreTickWidths(target.ticks, source.ticks);
	}

	return target;
}

export default {
	getAxisInstance: function() {
        throw new Error("STUB");
    }
};

class Axis {
	public owner;

	public x;
	public subX;
	public subY;
	public subY2;
	public y;
	public y2;

	private axesList = {};
	public tick = {
		x: null,
		y: null,
		y2: null
	};
	public xs = [];
	private orient = {
		x: "bottom",
		y: "left",
		y2: "right",
		subX: "bottom",
		subY: "left",
		subY2: "right"
	};

	constructor(owner) {
        throw new Error("STUB");
    }

	private getAxisClassName(id) {
		return `${$AXIS.axis} ${$AXIS[`axis${capitalize(id)}`]}`;
	}

	private isHorizontal($$, forHorizontal) {
		const isRotated = $$.config.axis_rotated;

		return forHorizontal ? isRotated : !isRotated;
	}

	public isCategorized() {
		const {config, state} = this.owner;

		return config.axis_x_type.indexOf("category") >= 0 || state.hasRadar;
	}

	public isCustomX() {
		const {config} = this.owner;

		return !this.isTimeSeries() && (config.data_x || notEmpty(config.data_xs));
	}

	public isTimeSeries(id = "x") {
		return this.owner.config[`axis_${id}_type`] === "timeseries";
	}

	public isLog(id = "x") {
		return this.owner.config[`axis_${id}_type`] === "log";
	}

	public isTimeSeriesY() {
		return this.isTimeSeries("y");
	}

	public getAxisType(id = "x"): string {
		let type = "linear";

		if (this.isTimeSeries(id)) {
			type = this.owner.config.axis_x_localtime ? "time" : "utc";
		} else if (this.isLog(id)) {
			type = "log";
		}

		return type;
	}

	/**
	 * Get extent value
	 * @returns {Array} default extent
	 * @private
	 */
	public getExtent(): number[] {
		const $$ = this.owner;
		const {config, scale} = $$;
		let extent = config.axis_x_extent;

		if (extent) {
			if (isFunction(extent)) {
				extent = extent.bind($$.api)($$.getXDomain($$.data.targets), scale.subX);
			} else if (this.isTimeSeries() && extent.every(isNaN)) {
				const fn = parseDate.bind($$);

				extent = extent.map(v => { throw new Error("STUB"); });
			}
		}

		return extent;
	}

	init() {
		const $$ = this.owner;
		const {config, $el: {main, axis}, state: {clip}} = $$;
		const target = ["x", "y"];

		config.axis_y2_show && target.push("y2");

		target.forEach(v => {
            throw new Error("STUB");
        });
	}

	/**
	 * Set axis orient according option value
	 * @private
	 */
	setOrient() {
		const $$ = this.owner;
		const {
			axis_rotated: isRotated,
			axis_y_inner: yInner,
			axis_y2_inner: y2Inner
		} = $$.config;

		this.orient = {
			x: isRotated ? "left" : "bottom",
			y: isRotated ? (yInner ? "top" : "bottom") : (yInner ? "right" : "left"),
			y2: isRotated ? (y2Inner ? "bottom" : "top") : (y2Inner ? "left" : "right"),
			subX: isRotated ? "left" : "bottom",
			subY: isRotated ? (yInner ? "top" : "bottom") : (yInner ? "right" : "left"),
			subY2: isRotated ? (y2Inner ? "bottom" : "top") : (y2Inner ? "left" : "right")
		};
	}

	/**
	 * Generate axes
	 * It's used when axis' axes option is set
	 * @param {string} id Axis id
	 * @private
	 */
	generateAxes(id: string) {
		const $$ = this.owner;
		const {config} = $$;
		const axes: any[] = [];
		const axesConfig = config[`axis_${id}_axes`];
		const isRotated = config.axis_rotated;
		let d3Axis;

		if (id === "x") {
			d3Axis = isRotated ? d3AxisLeft : d3AxisBottom;
		} else if (id === "y") {
			d3Axis = isRotated ? d3AxisBottom : d3AxisLeft;
		} else if (id === "y2") {
			d3Axis = isRotated ? d3AxisTop : d3AxisRight;
		}

		if (axesConfig.length) {
			axesConfig.forEach(v => {
                throw new Error("STUB");
            });
		}

		this.axesList[id] = axes;
	}

	/**
	 * Update axes nodes
	 * @private
	 */
	updateAxes() {
		const $$ = this.owner;
		const {config, $el: {main}, $T} = $$;

		Object.keys(this.axesList).forEach(id => {
            throw new Error("STUB");
        });
	}

	/**
	 * Set Axis & tick values
	 * called from: updateScales()
	 * @param {string} id Axis id string
	 * @param {d3Scale} scale Scale
	 * @param {boolean} outerTick If show outer tick
	 * @param {boolean} noTransition If with no transition
	 * @private
	 */
	setAxis(id, scale, outerTick, noTransition): void {
		const $$ = this.owner;
		const type = getBaseAxisId(id);

		if (!isSubAxis(id)) {
			this.tick[type] = this.getTickValues(type);
		}

		// @ts-ignore
		this[id] = this.getAxis(
			id,
			scale,
			outerTick,
			// do not transit x Axis on zoom and resizing
			// https://github.com/naver/billboard.js/issues/1949
			id === "x" && ($$.scale.zoom || $$.config.subchart_show || $$.state.resizing) ?
				true :
				noTransition
		);
	}

	// called from : getMaxTickSize()
	getAxis(id, scale, outerTick, noTransition, noTickTextRotate): AxisRenderer {
		const $$ = this.owner;
		const {config} = $$;
		const isX = /^(x|subX)$/.test(id);
		const type = getBaseAxisId(id);
		const isCategory = isX && this.isCategorized();
		const orient = this.orient[id];
		const tickTextRotate = noTickTextRotate ? 0 : $$.getAxisTickRotate(type);
		let tickFormat;

		if (isX) {
			tickFormat = (id === "subX") ? $$.format.subXAxisTick : $$.format.xAxisTick;
		} else {
			const fn = isSubAxis(id) ?
				config[`subchart_axis_${type}_tick_format`] || config[`axis_${type}_tick_format`] :
				config[`axis_${type}_tick_format`];

			if (isFunction(fn)) {
				tickFormat = fn.bind($$.api);
			}
		}

		let tickValues = isSubAxis(id) ? this.getTickValues(type, true) : this.tick[type];

		const axisParams = mergeObj({
			outerTick,
			noTransition,
			config,
			id,
			tickTextRotate,
			owner: $$
		}, isX && {
			isCategory,
			isInverted: config.axis_x_inverted,
			tickMultiline: config.axis_x_tick_multiline,
			tickWidth: config.axis_x_tick_width,
			tickTitle: isCategory && config.axis_x_tick_tooltip && $$.api.categories(),
			orgXScale: $$.scale.x
		});

		if (!isX) {
			axisParams.tickStepSize = config[`axis_${type}_tick_stepSize`];
		}

		const axis = new AxisRenderer(axisParams)
			.scale((isX && $$.scale.zoom) || scale)
			.orient(orient);

		if (isX && this.isTimeSeries() && tickValues && !isFunction(tickValues)) {
			const fn = parseDate.bind($$);

			tickValues = tickValues.map(v => { throw new Error("STUB"); });
		} else if (!isX && this.isTimeSeriesY()) {
			// https://github.com/d3/d3/blob/master/CHANGES.md#time-intervals-d3-time
			axis.ticks(config.axis_y_tick_time_value);
			tickValues = null;
		}

		tickValues && axis.tickValues(tickValues);

		// Set tick
		axis.tickFormat(
			tickFormat || (
				!isX && ($$.isStackNormalized() && $$.hasAxisGroupedData(type) &&
					(x => { throw new Error("STUB"); }))
			)
		);

		if (isCategory) {
			axis.tickCentered(config.axis_x_tick_centered);

			if (isEmpty(config.axis_x_tick_culling)) {
				config.axis_x_tick_culling = false;
			}
		}

		const tickCount = getAxisTickOption(config, id, "count");

		tickCount && axis.ticks(tickCount);

		return axis;
	}

	updateXAxisTickValues(targets, axis?): string[] {
		const $$ = this.owner;
		const {config} = $$;
		const fit = config.axis_x_tick_fit;
		const generateValues = (countOption = config.axis_x_tick_count) => {
			let count = countOption;
			let values;

			if (fit) {
				values = $$.mapTargetsToUniqueXs(targets);

				// if given count is greater than the value length, then limit the count.
				if (this.isCategorized() && count > values.length) {
					count = values.length;
				}

				values = this.generateTickValues(
					values,
					count,
					this.isTimeSeries()
				);
			}

			return values;
		};
		const values = generateValues();

		if (axis) {
			axis.tickValues(values);
		} else if (this.x) {
			const subTickValues = this.getTickValues("x", true);
			const subTickCount = getAxisTickOption(config, "subX", "count");
			const subValues = subTickValues ?? (
				subTickCount !== config.axis_x_tick_count ? generateValues(subTickCount) : values
			);

			this.x.tickValues(values);
			this.subX?.tickValues(subValues);
		}

		return values;
	}

	getId(id: string): string {
		const {config, scale} = this.owner;
		let axis = config.data_axes[id];

		// when data.axes option has 'y2', but 'axis.y2.show=true' isn't set will return 'y'
		if (!axis || !scale[axis]) {
			axis = "y";
		}

		return axis;
	}

	getXAxisTickFormat(forSubchart?: boolean): Function {
		const $$ = this.owner;
		const {config, format} = $$;
		// enable different tick format for x and subX - subX format defaults to x format if not defined
		const tickFormat = forSubchart ?
			config.subchart_axis_x_tick_format || config.axis_x_tick_format :
			config.axis_x_tick_format;
		const isTimeSeries = this.isTimeSeries();
		const isCategorized = this.isCategorized();
		let currFormat;

		if (tickFormat) {
			if (isFunction(tickFormat)) {
				currFormat = tickFormat.bind($$.api);
			} else if (isTimeSeries) {
				currFormat = date => { throw new Error("STUB"); };
			}
		} else {
			currFormat = isTimeSeries ? format.defaultAxisTime : (
				isCategorized ? $$.categoryName : v => { throw new Error("STUB"); }
			);
		}

		return isFunction(currFormat) ?
			v => { throw new Error("STUB"); } :
			currFormat;
	}

	getTickValues(id: string, isSub = false) {
		const $$ = this.owner;
		const tickValues = isSub ?
			getAxisTickOption($$.config, `sub${capitalize(id)}`, "values") :
			$$.config[`axis_${id}_tick_values`];
		const values = isFunction(tickValues) ? tickValues.call($$.api) : tickValues;
		const axis = $$[`${id}Axis`];

		return isSub ? values ?? undefined : values || (axis ? axis.tickValues() : undefined);
	}

	getLabelOptionByAxisId(id: string) {
		return this.owner.config[`axis_${id}_label`];
	}

	getLabelText(id: string) {
		const option = this.getLabelOptionByAxisId(id);

		return isString(option) ? option : (
			option ? option.text : null
		);
	}

	setLabelText(id: string, text: string) {
		const $$ = this.owner;
		const {config} = $$;
		const option = this.getLabelOptionByAxisId(id);

		if (isString(option)) {
			config[`axis_${id}_label`] = text;
		} else if (option) {
			option.text = text;
		}
	}

	getLabelPosition(id: string, defaultPosition) {
		const isRotated = this.owner.config.axis_rotated;
		const option = this.getLabelOptionByAxisId(id);
		const position = (isObjectType(option) && option.position) ?
			option.position :
			defaultPosition[+!isRotated];

		const has = v => !!~position.indexOf(v);

		return {
			isInner: has("inner"),
			isOuter: has("outer"),
			isLeft: has("left"),
			isCenter: has("center"),
			isRight: has("right"),
			isTop: has("top"),
			isMiddle: has("middle"),
			isBottom: has("bottom")
		};
	}

	getAxisLabelPosition(id: string) {
		return this.getLabelPosition(id,
			id === "x" ? ["inner-top", "inner-right"] : ["inner-right", "inner-top"]);
	}

	xForAxisLabel(id: string) {
		const $$ = this.owner;
		const {state: {width, height}} = $$;
		const position = this.getAxisLabelPosition(id);
		let x = position.isMiddle ? -height / 2 : 0;

		if (this.isHorizontal($$, id !== "x")) {
			x = position.isLeft ? 0 : (
				position.isCenter ? width / 2 : width
			);
		} else if (position.isBottom) {
			x = -height;
		}

		return x;
	}

	textAnchorForAxisLabel(id: string) {
		const $$ = this.owner;
		const position = this.getAxisLabelPosition(id);
		let anchor = position.isMiddle ? "middle" : "end";

		if (this.isHorizontal($$, id !== "x")) {
			anchor = position.isLeft ? "start" : (
				position.isCenter ? "middle" : "end"
			);
		} else if (position.isBottom) {
			anchor = "start";
		}

		return anchor;
	}

	dxForAxisLabel(id: string) {
		const $$ = this.owner;
		const position = this.getAxisLabelPosition(id);
		let dx = position.isBottom ? "0.5em" : "0";

		if (this.isHorizontal($$, id !== "x")) {
			dx = position.isLeft ? "0.5em" : (
				position.isRight ? "-0.5em" : "0"
			);
		} else if (position.isTop) {
			dx = "-0.5em";
		}

		return dx;
	}

	dyForAxisLabel(id: AxisType) {
		const $$ = this.owner;
		const {config} = $$;
		const isRotated = config.axis_rotated;
		const isInner = this.getAxisLabelPosition(id).isInner;
		const tickRotate = config[`axis_${id}_tick_rotate`] ? $$.getHorizontalAxisHeight(id) : 0;
		const {width: maxTickWidth} = this.getMaxTickSize(id);
		let dy;

		if (id === "x") {
			const xHeight = config.axis_x_height;

			if (isRotated) {
				dy = isInner ? "1.2em" : -25 - maxTickWidth;
			} else if (isInner) {
				dy = "-0.5em";
			} else if (xHeight) {
				dy = xHeight - 10;
			} else if (tickRotate) {
				dy = tickRotate - 10;
			} else {
				dy = "3em";
			}
		} else {
			dy = {
				y: ["-0.5em", 10, "3em", "1.2em", 10],
				y2: ["1.2em", -20, "-2.2em", "-0.5em", 15]
			}[id];

			if (isRotated) {
				if (isInner) {
					dy = dy[0];
				} else if (tickRotate) {
					dy = tickRotate * (id === "y2" ? -1 : 1) - dy[1];
				} else {
					dy = dy[2];
				}
			} else {
				dy = isInner ? dy[3] : (
					dy[4] + (
						config[`axis_${id}_inner`] ? 0 : (maxTickWidth + dy[4])
					)
				) * (id === "y" ? -1 : 1);
			}
		}

		return dy;
	}

	private getTickFormatCacheValue(id: AxisType) {
		const $$ = this.owner;
		const {config} = $$;
		const isX = id === "x";

		return isX ?
			{
				format: config.axis_x_tick_format,
				type: config.axis_x_type,
				localtime: config.axis_x_localtime,
				categories: config.axis_x_categories
			} :
			{
				format: config[`axis_${id}_tick_format`],
				normalized: $$.isStackNormalized(),
				grouped: $$.hasAxisGroupedData(id),
				type: config[`axis_${id}_type`]
			};
	}

	private getMaxTickSizeFingerprint(
		id: AxisType,
		scale,
		domain,
		axis: AxisRenderer,
		tickRotate,
		withoutRecompute?: boolean
	): string {
		const $$ = this.owner;
		const {config, state} = $$;
		const isX = id === "x";
		const configPrefix = isX ? "axis_x" : `axis_${id}`;
		const tickValues = axis.tickValues();

		return _stringifyCacheValue({
			id,
			withoutRecompute: !!withoutRecompute,
			dataGeneration: state.dataGeneration,
			size: [state.current.width, state.current.height],
			range: scale.range?.(),
			domain,
			type: scale.type,
			orient: this.orient[id],
			axisRotated: config.axis_rotated,
			evalTextSize: config.axis_evalTextSize,
			format: this.getTickFormatCacheValue(id),
			ticks: {
				values: _getTickValuesCacheValue(tickValues),
				rawValues: config[`${configPrefix}_tick_values`],
				arguments: axis.ticks(),
				count: config[`${configPrefix}_tick_count`],
				rotate: tickRotate,
				show: config[`${configPrefix}_tick_show`],
				textShow: config[`${configPrefix}_tick_text_show`],
				textPosition: config[`${configPrefix}_tick_text_position`],
				inner: config[`${configPrefix}_tick_inner`],
				culling: config[`${configPrefix}_tick_culling`],
				cullingMax: config[`${configPrefix}_tick_culling_max`],
				cullingLines: config[`${configPrefix}_tick_culling_lines`],
				cullingReverse: config[`${configPrefix}_tick_culling_reverse`],
				stepSize: !isX && config[`${configPrefix}_tick_stepSize`],
				timeValue: !isX && config[`${configPrefix}_tick_time_value`],
				fit: isX && config.axis_x_tick_fit,
				autorotate: isX && config.axis_x_tick_autorotate,
				centered: isX && config.axis_x_tick_centered,
				inverted: isX && config.axis_x_inverted,
				multiline: isX && config.axis_x_tick_multiline,
				width: isX && config.axis_x_tick_width
			}
		});
	}

	/**
	 * Get max tick size
	 * @param {string} id axis id string
	 * @param {boolean} withoutRecompute wheather or not to recompute
	 * @returns {object} {width, height}
	 * @private
	 */
	getMaxTickSize(id: AxisType, withoutRecompute?: boolean): {width: number, height: number} {
		const $$ = this.owner;
		const {config, state, $el: {svg, chart}} = $$;
		const {current, resizing} = state;
		const currentTickMax = current.maxTickSize[id];

		// First keep the existing per-redraw fast path, then use the fingerprint below
		// to avoid rebuilding dummy axes across redraws when axis inputs are stable.
		const cacheKey = `${KEY.maxTickSize}_${id}_${!!withoutRecompute}`;
		const cached = $$.cache.get(cacheKey);

		if (cached && cached.generation === state.redrawGeneration) {
			return currentTickMax;
		}

		const configPrefix = `axis_${id}`;
		const max = {
			width: 0,
			height: 0
		};
		let fingerprint;

		if (
			resizing || withoutRecompute || !config[`${configPrefix}_show`] || (
				currentTickMax.width > 0 && $$.filterTargetsToShow().length === 0
			)
		) {
			return currentTickMax;
		}

		if ((svg || config.render_mode === "canvas") && $$.scale[id]?.copy) {
			const isYAxis = /^y2?$/.test(id);
			const targetsToShow = $$.getTargetsToShow();
			const scale = $$.scale[id].copy().domain(
				$$[`get${isYAxis ? "Y" : "X"}Domain`](targetsToShow, id)
			);
			const domain = scale.domain();

			const isDomainSame = domain[0] === domain[1] && domain.every(v => { throw new Error("STUB"); });
			const isCurrentMaxTickDomainSame = isArray(currentTickMax.domain) &&
				currentTickMax.domain[0] === currentTickMax.domain[1] &&
				currentTickMax.domain.every(v => { throw new Error("STUB"); });

			// do not compute if domain or currentMaxTickDomain is same
			if (isDomainSame || isCurrentMaxTickDomainSame) {
				return currentTickMax;
			} else {
				currentTickMax.domain = domain;
			}

			// reset old max state value to prevent from new data loading
			if (!isYAxis) {
				_clearTickWidths(currentTickMax.ticks);
			}

			const axis = this.getAxis(id, scale, false, false, true);
			const tickRotate = config[`${configPrefix}_tick_rotate`];
			const tickCount = config[`${configPrefix}_tick_count`];
			const tickValues = config[`${configPrefix}_tick_values`];

			// Make to generate the final tick text to be rendered
			// https://github.com/naver/billboard.js/issues/920
			// Do not generate if 'tick values' option is given
			// https://github.com/naver/billboard.js/issues/1251
			if (!tickValues && tickCount) {
				axis.tickValues(
					this.generateTickValues(
						domain,
						tickCount,
						isYAxis ? this.isTimeSeriesY() : this.isTimeSeries()
					)
				);
			}

			!isYAxis && this.updateXAxisTickValues(targetsToShow, axis);

			fingerprint = this.getMaxTickSizeFingerprint(
				id,
				scale,
				domain,
				axis,
				tickRotate,
				withoutRecompute
			);

			if (cached?.fingerprint === fingerprint) {
				$$.cache.add(cacheKey, {
					...cached,
					generation: state.redrawGeneration
				});

				return _restoreMaxTickSize(currentTickMax, cached.value);
			}

			const originalTickValues = axis.tickValues();
			const hasLargeTickValues = !isYAxis &&
				Array.isArray(originalTickValues) &&
				originalTickValues.length > MAX_TICK_MEASURE_VALUES;

			hasLargeTickValues && axis.tickValues(
				_sampleTickValues(originalTickValues, (axis as any).tickFormat())
			);

			const dummy = chart.append("svg")
				.style("visibility", "hidden")
				.style("position", "fixed")
				.style("top", "0")
				.style("left", "0");

			const g = dummy
				.append("g")
				.attr("class", `${$AXIS[`axis${capitalize(id)}`]} ${$COMMON.dummy}`);

			axis.create(g);

			// when evalTextSize is set as function, sizeFor1Char is set to the dummy element
			const {sizeFor1Char} = g.node();

			const textSelection = dummy.selectAll("text")
				.attr("transform", isNumber(tickRotate) ? `rotate(${tickRotate})` : null);
			const measuredTickCount = hasLargeTickValues ?
				originalTickValues.length :
				textSelection.size();

			// Batch processing to minimize layout thrashing
			if (sizeFor1Char) {
				// Use pre-calculated character size (no reflow needed)
				textSelection.each(function(d, i) {
                    throw new Error("STUB");
                });
			} else {
				const textNodes: SVGTextElement[] = [];

				textSelection.each(function() {
                    throw new Error("STUB");
                });

				// Sample a representative subset to avoid N forced reflows on large tick sets
				const nodesToMeasure = textNodes.length <= 5 ?
					textNodes :
					_sampleTickNodes(textNodes);

				nodesToMeasure.map(node => { throw new Error("STUB"); }).forEach(dim => {
                    throw new Error("STUB");
                });

				// Estimate per-tick width from measured max for culling calculations
				if (!isYAxis) {
					for (let i = 0; i < textNodes.length; i++) {
						currentTickMax.ticks[i] = max.width;
					}
				}
			}

			if (!isYAxis && hasLargeTickValues) {
				_compactTickWidths(currentTickMax.ticks, measuredTickCount, max.width);
			}

			dummy.remove();
		}

		Object.keys(max).forEach(key => {
            throw new Error("STUB");
        });

		$$.cache.add(cacheKey, {
			fingerprint,
			generation: state.redrawGeneration,
			value: _cloneMaxTickSize(currentTickMax)
		});

		return currentTickMax;
	}

	getXAxisTickTextY2Overflow(defaultPadding) {
		const $$ = this.owner;
		const {axis, config, state: {current, isLegendRight, legendItemWidth}} = $$;
		const xAxisTickRotate = $$.getAxisTickRotate("x");
		const positiveRotation = xAxisTickRotate > 0 && xAxisTickRotate < 90;

		if (
			(axis.isCategorized() || axis.isTimeSeries()) &&
			config.axis_x_tick_fit &&
			(!config.axis_x_tick_culling || isEmpty(config.axis_x_tick_culling)) &&
			!config.axis_x_tick_multiline &&
			positiveRotation
		) {
			const y2AxisWidth = (config.axis_y2_show && current.maxTickSize.y2.width) || 0;
			const legendWidth = (isLegendRight && legendItemWidth) || 0;
			const widthWithoutCurrentPaddingLeft = current.width -
				$$.getCurrentPaddingByDirection("left");
			const maxOverflow = this.getXAxisTickMaxOverflow(
				xAxisTickRotate,
				widthWithoutCurrentPaddingLeft - defaultPadding
			) - y2AxisWidth - legendWidth;
			const xAxisTickTextY2Overflow = Math.max(0, maxOverflow) +
				defaultPadding; // for display inconsistencies between browsers

			return Math.min(xAxisTickTextY2Overflow, widthWithoutCurrentPaddingLeft / 2);
		}

		return 0;
	}

	getXAxisTickMaxOverflow(xAxisTickRotate, widthWithoutCurrentPaddingLeft) {
		const $$ = this.owner;
		const {axis, config, state} = $$;
		const isTimeSeries = axis.isTimeSeries();

		const tickTextWidths = state.current.maxTickSize.x.ticks;
		const tickCount = tickTextWidths.length;
		const fallbackTickTextWidth = _getTickWidthFallback(tickTextWidths) ??
			state.current.maxTickSize.x.width;
		const {left, right} = state.axis.x.padding;
		let maxOverflow = 0;

		const remaining = tickCount - (isTimeSeries && config.axis_x_tick_fit ? 0.5 : 0);

		for (let i = 0; i < tickCount; i++) {
			const tickIndex = i + 1;
			const rotatedTickTextWidth = Math.cos(Math.PI * xAxisTickRotate / 180) *
				_getTickWidth(tickTextWidths, i, fallbackTickTextWidth);
			const ticksBeforeTickText = tickIndex - (isTimeSeries ? 1 : 0.5) + left;

			// Skip ticks if there are no ticks before them
			if (ticksBeforeTickText <= 0) {
				continue;
			}

			const xAxisLengthWithoutTickTextWidth = widthWithoutCurrentPaddingLeft -
				rotatedTickTextWidth;
			const tickLength = xAxisLengthWithoutTickTextWidth / ticksBeforeTickText;
			const remainingTicks = remaining - tickIndex;

			const paddingRightLength = right * tickLength;
			const remainingTickWidth = (remainingTicks * tickLength) + paddingRightLength;
			const overflow = rotatedTickTextWidth - (tickLength / 2) - remainingTickWidth;

			maxOverflow = Math.max(maxOverflow, overflow);
		}

		const filteredTargets = $$.getTargetsToShow();
		let tickOffset = 0;

		if (
			!isTimeSeries &&
			config.axis_x_tick_count <= filteredTargets.length && filteredTargets[0].values.length
		) {
			const scale = getScale($$.axis.getAxisType("x"), 0,
				widthWithoutCurrentPaddingLeft - maxOverflow)
				.domain([
					left * -1,
					$$.getXDomainMax($$.data.targets) + 1 + right
				]);

			tickOffset = (scale(1) - scale(0)) / 2;
		}

		return maxOverflow + tickOffset;
	}

	/**
	 * Update axis label text
	 * @param {boolean} withTransition Weather update with transition
	 * @private
	 */
	updateLabels(withTransition: boolean): void {
		const $$ = this.owner;
		const {config, $el: {main}, $T} = $$;
		const isRotated = config.axis_rotated;

		["x", "y", "y2"].forEach((id: AxisType) => {
            throw new Error("STUB");
        });
	}

	/**
	 * Get axis padding value
	 * @param {number|object} padding Padding object
	 * @param {string} key Key string of padding
	 * @param {Date|number} defaultValue Default value
	 * @param {number} domainLength Domain length
	 * @returns {number} Padding value in scale
	 * @private
	 */
	getPadding(padding: number | Record<string, number>, key: string, defaultValue: number,
		domainLength: number): number {
		const p = isNumber(padding) ? padding : padding[key];

		if (!isValue(p)) {
			return defaultValue;
		}

		return this.owner.convertPixelToScale(
			/(bottom|top)/.test(key) ? "y" : "x",
			p,
			domainLength
		);
	}

	generateTickValues(values, tickCount, forTimeSeries) {
		let tickValues = values;

		if (tickCount) {
			const targetCount = isFunction(tickCount) ? tickCount() : tickCount;

			// compute ticks according to tickCount
			if (targetCount === 1) {
				tickValues = [values[0]];
			} else if (targetCount === 2) {
				tickValues = [values[0], values[values.length - 1]];
			} else if (targetCount > 2) {
				const isCategorized = this.isCategorized();

				const count = targetCount - 2;
				const start = values[0];
				const end = values[values.length - 1];
				const interval = (end - start) / (count + 1);
				let tickValue;

				// re-construct unique values
				tickValues = [start];

				for (let i = 0; i < count; i++) {
					tickValue = +start + interval * (i + 1);
					tickValues.push(
						forTimeSeries ? new Date(tickValue) : (
							isCategorized ? Math.round(tickValue) : tickValue
						)
					);
				}

				tickValues.push(end);
			}
		}

		if (!forTimeSeries) {
			tickValues = tickValues.sort((a, b) => { throw new Error("STUB"); });
		}

		return tickValues;
	}

	generateTransitions(withTransition) {
		const $$ = this.owner;
		const {$el: {axis}, $T} = $$;

		const [axisX, axisY, axisY2, axisSubX, axisSubY, axisSubY2] = [
			"x",
			"y",
			"y2",
			"subX",
			"subY",
			"subY2"
		]
			.map(v => { throw new Error("STUB"); });

		return {axisX, axisY, axisY2, axisSubX, axisSubY, axisSubY2};
	}

	redraw(transitions, isHidden, isInit) {
		const $$ = this.owner;
		const {config, state, $el} = $$;
		const opacity = isHidden ? "0" : null;

		["x", "y", "y2", "subX", "subY", "subY2"].forEach(id => {
            throw new Error("STUB");
        });

		this.updateAxes();
		!state.rendered && config.axis_tooltip && this.setAxisTooltip();
	}

	/**
	 * Synchronize axis domains and tick values.
	 * @param {Array} targetsToShow targets data to be shown
	 * @param {object} wth option object
	 * @param {object} flow flow object
	 * @private
	 */
	syncAxisDomains(targetsToShow, wth, flow): void {
		const $$ = this.owner;
		const {config, scale, $el} = $$;
		const hasZoom = !!scale.zoom;
		let xDomainForZoom;

		if (!hasZoom && this.isCategorized() && targetsToShow.length === 0 && $el.axis.x) {
			scale.x.domain([0, $el.axis.x.selectAll(".tick").size()]);
		}

		if (scale.x && targetsToShow.length) {
			!hasZoom &&
				$$.updateXDomain(targetsToShow, wth.UpdateXDomain, wth.UpdateOrgXDomain,
					wth.TrimXDomain);

			if (!config.axis_x_tick_values) {
				this.updateXAxisTickValues(targetsToShow);
			}
		} else if (this.x) {
			this.x.tickValues([]);
			this.subX?.tickValues([]);
		}

		if (config.zoom_rescale && !flow) {
			xDomainForZoom = scale.x.orgDomain();
		}

		["y", "y2"].forEach(key => {
            throw new Error("STUB");
        });

		// Update sub domain
		if (wth.Y) {
			const updateSubDomain = () => {
				scale.subY?.domain($$.getYDomain(targetsToShow, "y"));
				scale.subY2?.domain($$.getYDomain(targetsToShow, "y2"));

				(["y", "y2"] as const).forEach(key => {
                    throw new Error("STUB");
                });
			};

			config.subchart_show ? $$.withSubchartTypeContext(updateSubDomain) : updateSubDomain();
		}
	}

	/**
	 * Redraw axis
	 * @param {Array} targetsToShow targets data to be shown
	 * @param {object} wth option object
	 * @param {d3.Transition} transitions Transition object
	 * @param {object} flow flow object
	 * @param {boolean} isInit called from initialization
	 * @private
	 */
	redrawAxis(targetsToShow, wth, transitions, flow, isInit: boolean): void {
		const $$ = this.owner;

		this.syncAxisDomains(targetsToShow, wth, flow);

		// axes
		this.redraw(transitions, $$.hasArcType(), isInit);

		// Update axis label
		this.updateLabels(wth.Transition);

		// show/hide if manual culling needed
		if ((wth.UpdateXDomain || wth.UpdateXAxis || wth.Y) && targetsToShow.length) {
			this.setCulling();
		}
	}

	/**
	 * Set manual culling
	 * @private
	 */
	setCulling() {
		const $$ = this.owner;
		const {config, state: {clip, current}, $el} = $$;

		["subX", "x", "y", "y2", "subY", "subY2"].forEach(type => {
            throw new Error("STUB");
        });
	}

	/**
	 * Set axis tooltip
	 * @private
	 */
	setAxisTooltip(): void {
		const $$ = this.owner;
		const {config: {axis_rotated: isRotated, axis_tooltip}, $el: {axis, axisTooltip}} = $$;
		const bgColor = axis_tooltip.backgroundColor ?? "black";

		$$.generateTextBGColorFilter(
			bgColor,
			{
				x: -0.15,
				y: -0.2,
				width: 1.3,
				height: 1.3
			}
		);

		["x", "y", "y2"].forEach(v => {
            throw new Error("STUB");
        });
	}
}
