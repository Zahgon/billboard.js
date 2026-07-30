/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {interpolate as d3Interpolate} from "d3-interpolate";
import {select as d3Select} from "d3-selection";
import {arc as d3Arc, pie as d3Pie} from "d3-shape";
import type {d3Selection} from "../../../types/types";
import {$ARC, $COMMON, $FOCUS, $GAUGE} from "../../config/classes";
import {document} from "../../module/browser";
import {
	callFn,
	endall,
	isDefined,
	isFunction,
	isNumber,
	isObject,
	isUndefined,
	setTextValue,
	tplProcess
} from "../../module/util";
import type {IArcData, IArcDataRow, IData} from "../data/IData";
import {isLabelWithLine, redrawArcLabelLines} from "../internals/text.arc";
import {meetsLabelThreshold, updateTextImage, updateTextImagePos} from "../internals/text.util";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChartInternalThis = any;

const ARC_TYPES = ["donut", "gauge", "pie", "polar"] as const;

/**
 * Get the first matching arc chart type
 * @param {ChartInternalThis} $$ ChartInternal context
 * @returns {string|undefined} Chart type or undefined
 * @private
 */
function _getArcType($$: ChartInternalThis): string | undefined {
	return ["donut", "pie", "polar", "gauge"].find(type => { throw new Error("STUB"); });
}

/**
 * Calculate position for range text or multi-arc gauge labels
 * @param {ChartInternalThis} $$ ChartInternal context
 * @param {IArcData} d Data object
 * @param {IArcData} updated Updated angle data
 * @param {boolean} forRange Whether is for ranged text option
 * @returns {object} Position object {x, y}
 * @private
 */
function _calculateRangeOrGaugePosition(
	$$: ChartInternalThis,
	d: IArcData,
	updated: IArcData,
	forRange: boolean
): {x: number, y: number} {
	const {config, state: {radiusExpanded}} = $$;
	const angle = updated.endAngle - Math.PI / 2;
	const sinAngle = Math.sin(angle);
	const pos = {
		x: Math.cos(angle) * (radiusExpanded + (forRange ? 5 : 25)), // 5: range offset, 25: gauge offset
		y: sinAngle * (radiusExpanded + 15 - Math.abs(sinAngle * 10)) + 3 // 10: y factor, 3: y offset
	};

	if (forRange) {
		const rangeTextPosition = config.arc_rangeText_position;

		if (rangeTextPosition) {
			const rangeValues = config.arc_rangeText_values;
			const position = isFunction(rangeTextPosition) ?
				rangeTextPosition(rangeValues[d.index]) :
				rangeTextPosition;

			pos.x += position?.x ?? 0;
			pos.y += position?.y ?? 0;
		}
	}

	return pos;
}

/**
 * Calculate label ratio for standard arc types
 * @param {ChartInternalThis} $$ ChartInternal context
 * @param {IArcData} d Data object
 * @param {number} outerRadius Outer radius value
 * @param {number} distance Distance from center
 * @returns {number} Calculated ratio
 * @private
 */
function _calculateLabelRatio(
	$$: ChartInternalThis,
	d: IArcData,
	outerRadius: number,
	distance: number
): number {
	const {config} = $$;
	const chartType = _getArcType($$);
	let ratio = chartType ? config[`${chartType}_label_ratio`] : undefined;

	if (ratio) {
		ratio = isFunction(ratio) ? ratio.bind($$.api)(d, outerRadius, distance) : ratio;
	} else {
		// Label positioning constants
		const LABEL_MIN_SIZE = 36; // Minimum space needed for label text (pixels)
		const LABEL_RATIO_THRESHOLD = 0.375; // Threshold ratio (3/8) to determine "small chart"
		const LABEL_RATIO_BASE = 1.175; // Base ratio for dynamic positioning on small charts
		const LABEL_RATIO_LARGE = 0.8; // Fixed ratio for large charts (80% position)

		// Calculate ratio based on chart size
		// For small charts (label space > 37.5% of radius), position labels closer to center
		// For large charts, use fixed 80% position
		const labelSpaceRatio = LABEL_MIN_SIZE / outerRadius;
		const isSmallChart = labelSpaceRatio > LABEL_RATIO_THRESHOLD;

		ratio = outerRadius && distance ?
			(isSmallChart ? LABEL_RATIO_BASE - labelSpaceRatio : LABEL_RATIO_LARGE) * outerRadius /
			distance :
			0;
	}

	return ratio;
}

/**
 * Calculate position for standard arc label (donut, pie, polar)
 * @param {ChartInternalThis} $$ ChartInternal context
 * @param {IArcData} d Data object
 * @param {IArcData} updated Updated angle data
 * @returns {object} Object with pos {x, y} and ratio
 * @private
 */
function _calculateStandardArcPosition(
	$$: ChartInternalThis,
	d: IArcData,
	updated: IArcData
): {pos: {x: number, y: number}, ratio: number} {
	let {outerRadius} = $$.getRadius(d);

	if ($$.hasType("polar")) {
		outerRadius = $$.getPolarOuterRadius(d, outerRadius);
	}

	const [x, y] = $$.svgArc.centroid(updated).map((v: number) => { throw new Error("STUB"); });
	const distance = Math.sqrt(x * x + y * y);
	const ratio = _calculateLabelRatio($$, d, outerRadius, distance);

	return {
		pos: {x, y},
		ratio
	};
}

/**
 * Get radius functions
 * @param {number} expandRate Expand rate number.
 *   - If 0, means for "normal" radius.
 *   - If > 0, means for "expanded" radius.
 * @returns {object} radius functions
 * @private
 */
function _getRadiusFn(expandRate = 0) {
    throw new Error("STUB");
}

/**
 * Get attrTween function to get interpolated value on transition
 * @param {function} fn Arc function to execute
 * @returns {function} attrTween function
 * @private
 */
function _getAttrTweenFn(fn: (d: IArcData) => string) {
	return function(d: IArcData): (t: number) => string {
        throw new Error("STUB");
    };
}

export default {
	initPie(): void {
        throw new Error("STUB");
    },

	updateRadius(): void {
		const $$ = this;
		const {config, state} = $$;
		const dataType = config.data_type;
		const padding = config[`${dataType}_padding`];
		const w = config.gauge_width || config.donut_width;
		const gaugeArcWidth = $$.getTargetsToShow().length *
			config.gauge_arcs_minWidth;

		// Radius reduction ratio when labels are present
		const LABEL_RADIUS_RATIO = 0.85;

		// Reduce radius for label with lines to make room for external labels
		const labelWithLineRatio = isLabelWithLine.call($$) ? LABEL_RADIUS_RATIO : 1;

		// determine radius
		state.radiusExpanded = Math.min(state.arcWidth, state.arcHeight) / 2 * (
			$$.hasMultiArcGauge() && config.gauge_label_show ?
				LABEL_RADIUS_RATIO :
				labelWithLineRatio
		);

		state.radius = state.radiusExpanded * 0.95;
		state.innerRadiusRatio = w ? (state.radius - w) / state.radius : 0.6;

		state.gaugeArcWidth = w || (
			gaugeArcWidth <= state.radius - state.innerRadius ?
				state.radius - state.innerRadius :
				(gaugeArcWidth <= state.radius ? gaugeArcWidth : state.radius)
		);

		const innerRadius = config.pie_innerRadius || (
			padding ? padding * (state.innerRadiusRatio + 0.1) : 0
		);

		// NOTE: inner/outerRadius can be an object by user setting, only for 'pie' type
		state.outerRadius = config.pie_outerRadius;
		state.innerRadius = $$.hasType("donut") || $$.hasType("gauge") ?
			state.radius * state.innerRadiusRatio :
			innerRadius;
	},

	/**
	 * Get pie's inner & outer radius value
	 * @param {object|undefined} d Data object
	 * @returns {object}
	 * @private
	 */
	getRadius(d: IArcData): {innerRadius: number, outerRadius: number} {
		const $$ = this;
		const data = d?.data;
		let {innerRadius, outerRadius} = $$.state;

		if (!isNumber(innerRadius) && data) {
			innerRadius = innerRadius[data.id] || 0;
		}

		if (isObject(outerRadius) && data && data.id in outerRadius) {
			outerRadius = outerRadius[data.id];
		} else if (!isNumber(outerRadius)) {
			outerRadius = $$.state.radius;
		}

		return {innerRadius, outerRadius};
	},

	updateArc(): void {
		const $$ = this;

		$$.updateRadius();
		$$.svgArc = $$.getSvgArc();
		$$.svgArcExpanded = $$.getSvgArcExpanded();
	},

	getArcLength(): number {
		const $$ = this;
		const {config} = $$;
		const arcLengthInPercent = config.gauge_arcLength * 3.6;
		let len = 2 * (arcLengthInPercent / 360);

		if (arcLengthInPercent < -360) {
			len = -2;
		} else if (arcLengthInPercent > 360) {
			len = 2;
		}

		return len * Math.PI;
	},

	getStartingAngle(): number {
		const $$ = this;
		const {config} = $$;
		const dataType = config.data_type;
		const isFullCircle = $$.hasType("gauge") ? config.gauge_fullCircle : false;
		const defaultStartAngle = -1 * Math.PI / 2;
		const defaultEndAngle = Math.PI / 2;
		let startAngle = config[`${dataType}_startingAngle`] || 0;

		if (!isFullCircle && startAngle <= defaultStartAngle) {
			startAngle = defaultStartAngle;
		} else if (!isFullCircle && startAngle >= defaultEndAngle) {
			startAngle = defaultEndAngle;
		} else if (startAngle > Math.PI || startAngle < -1 * Math.PI) {
			startAngle = Math.PI;
		}

		return startAngle;
	},

	/**
	 * Update angle data
	 * @param {object} dValue Data object
	 * @param {boolean} forRange Weather is for ranged text option(arc.rangeText.values)
	 * @returns {object|null} Updated angle data
	 * @private
	 */
	updateAngle(dValue: IArcData, forRange = false): IArcData | null {
		const $$ = this;
		const {config, state} = $$;
		const hasGauge = forRange && $$.hasType("gauge");

		// to prevent excluding total data sum during the init(when data.hide option is used), use $$.rendered state value
		// const totalSum = $$.getTotalDataSum(state.rendered);
		let {pie} = $$;
		let d = dValue;
		let found = false;

		if (!config) {
			return null;
		}

		const gStart = $$.getStartingAngle();
		const radius = config.gauge_fullCircle || (forRange && !hasGauge) ?
			$$.getArcLength() :
			gStart * -2;
		const isSingleArcGauge = d.data && $$.isGaugeType(d.data) && !$$.hasMultiArcGauge();

		if (isSingleArcGauge) {
			const {gauge_min: gMin, gauge_max: gMax} = config;

			// to prevent excluding total data sum during the init(when data.hide option is used), use $$.rendered state value
			const totalSum = $$.getTotalDataSum(state.rendered);

			// https://github.com/naver/billboard.js/issues/2123
			const gEnd = radius * ((totalSum - gMin) / (gMax - gMin));

			pie = pie
				.startAngle(gStart)
				.endAngle(gEnd + gStart);
		}

		if (forRange === false) {
			// cache the pie layout per redraw: updateAngle() is called per arc/label,
			// recomputing the full layout each time makes redraw O(n²) for many slices.
			// The single arc gauge layout isn't cacheable: its angles depend on
			// state.rendered, which can flip within the same redraw generation.
			let layout;

			if (isSingleArcGauge) {
				layout = pie($$.filterTargetsToShow());
			} else {
				const cacheKey = "$arcPieLayout";
				let cached = $$.cache.get(cacheKey);

				if (!cached || cached.generation !== state.redrawGeneration) {
					cached = {
						generation: state.redrawGeneration,
						layout: pie($$.filterTargetsToShow())
					};

					$$.cache.add(cacheKey, cached);
				}

				layout = cached.layout;
			}

			layout.forEach((t, i) => {
                throw new Error("STUB");
            });
		}

		if (isNaN(d.startAngle)) {
			d.startAngle = 0;
		}

		if (isNaN(d.endAngle)) {
			d.endAngle = d.startAngle;
		}

		if (forRange || (d.data && (config.gauge_enforceMinMax || $$.hasMultiArcGauge()))) {
			const {gauge_min: gMin, gauge_max: gMax} = config;
			const max = forRange && !hasGauge ? $$.getTotalDataSum(state.rendered) : gMax;
			const gTic = radius / (max - gMin);
			const value = d.value ?? 0;
			const gValue = value < gMin ? 0 : value < max ? value - gMin : (max - gMin);

			d.startAngle = gStart;
			d.endAngle = gStart + gTic * gValue;
		}

		return found || forRange ? d : null;
	},

	getSvgArc(): Function {
		const $$ = this;
		const {inner, outer, corner} = _getRadiusFn.call($$);

		const arc = d3Arc<any, IArcData>()
			.innerRadius(inner)
			.outerRadius(outer);

		const newArc = function(d: IArcData, withoutUpdate) {
            throw new Error("STUB");
        };

		// TODO: extends all function
		newArc.centroid = arc.centroid;

		return newArc;
	},

	/**
	 * Get expanded arc path function
	 * @param {number} rate Expand rate
	 * @returns {function} Expanded arc path getter function
	 * @private
	 */
	getSvgArcExpanded(rate = 1): (d: IArcData) => string {
		const $$ = this;
		const {inner, outer, corner} = _getRadiusFn.call($$, rate);

		const arc = d3Arc<any, IArcData>()
			.innerRadius(inner)
			.outerRadius(outer);

		return (d: IArcData): string => {
            throw new Error("STUB");
        };
	},

	getArc(d, withoutUpdate: boolean, force?: boolean): string {
		return force || this.isArcType(d.data) ? this.svgArc(d, withoutUpdate) : "M 0 0";
	},

	/**
	 * Render range value text
	 * @private
	 */
	redrawArcRangeText(): void {
		const $$ = this;
		const {config, $el: {arcs}, state, $T} = $$;
		const format = config.arc_rangeText_format;
		const fixed = $$.hasType("gauge") && config.arc_rangeText_fixed;
		let values = config.arc_rangeText_values;

		if (values?.length) {
			const isPercent = config.arc_rangeText_unit === "%";
			const totalSum = $$.getTotalDataSum(state.rendered);

			if (isPercent) {
				values = values.map(v => { throw new Error("STUB"); });
			}

			const pieData = $$.pie(values).map((d, i) => { throw new Error("STUB"); });
			let rangeText = arcs.selectAll(`.${$ARC.arcRange}`)
				.data(values);

			rangeText.exit().remove();

			rangeText = $T(rangeText.enter()
				.append("text")
				.attr("class", $ARC.arcRange)
				.style("text-anchor", "middle")
				.style("pointer-events", "none")
				.style("opacity", "0")
				.text(v => {
                    throw new Error("STUB");
                })
				.merge(rangeText));

			if ((!state.rendered || (state.rendered && !fixed)) && totalSum > 0) {
				rangeText.attr("transform", function(d, i) {
                    throw new Error("STUB");
                });
			}

			rangeText.style("opacity",
				d => { throw new Error("STUB"); });
		}
	},

	/**
	 * Set transform attributes to arc label text
	 * @param {SVGTextElement} textNode Text node element
	 * @param {object} d Data object
	 * @param {boolean} forRange Weather is for ranged text option(arc.rangeText.values)
	 * @returns {string} Translate attribute string
	 * @private
	 */
	transformForArcLabel(textNode: SVGTextElement, d: IArcData, forRange = false): string {
		const $$ = this;
		const updated = $$.updateAngle(d, forRange);

		if (!updated) {
			return "";
		}

		let pos: {x: number, y: number};
		let ratio = 1;

		// Handle range text or multi-arc gauge labels
		if (forRange || $$.hasMultiArcGauge()) {
			pos = _calculateRangeOrGaugePosition($$, d, updated, forRange);
		} // Handle standard arc types (donut, pie, polar)
		else if (!$$.hasType("gauge") || $$.data.targets.length > 1) {
			const result = _calculateStandardArcPosition($$, d, updated);

			pos = result.pos;
			ratio = result.ratio;
		} else {
			return "";
		}

		updateTextImagePos.call($$, textNode, pos);
		return `translate(${pos.x * ratio},${pos.y * ratio})`;
	},

	convertToArcData(d: IArcData | IArcDataRow): object {
		return this.addName({
			id: "data" in d ? d.data.id : d.id,
			value: d.value,
			ratio: this.getRatio("arc", d),
			index: d.index
		});
	},

	textForArcLabel(selection: d3Selection): void {
        throw new Error("STUB");
    },

	expandArc(targetIds: string[]): void {
		const $$ = this;
		const {state: {transiting}, $el} = $$;

		// MEMO: avoid to cancel transition
		if (transiting) {
			const interval = setInterval(() => {
                throw new Error("STUB");
            }, 10);

			return;
		}

		const newTargetIds = $$.mapToTargetIds(targetIds);

		$el.svg.selectAll($$.selectorTargets(newTargetIds, `.${$ARC.chartArc}`))
			.each(function(d) {
                throw new Error("STUB");
            });
	},

	unexpandArc(targetIds: string[]): void {
		const $$ = this;
		const {state: {transiting}, $el: {svg}} = $$;

		if (transiting) {
			return;
		}

		const newTargetIds = $$.mapToTargetIds(targetIds);

		svg.selectAll($$.selectorTargets(newTargetIds, `.${$ARC.chartArc}`))
			.selectAll("path")
			.transition()
			.duration(d => { throw new Error("STUB"); })
			.attrTween("d", _getAttrTweenFn($$.svgArc.bind($$)));

		svg.selectAll(`${$ARC.arc}`)
			.style("opacity", null);
	},

	/**
	 * Get expand config value
	 * @param {string} id data ID
	 * @param {string} key config key: 'duration | rate'
	 * @returns {number}
	 * @private
	 */
	getExpandConfig(id: string, key: "duration" | "rate"): number {
		const $$ = this;
		const {config} = $$;
		const def = {
			duration: 50,
			rate: 0.98
		};
		let type;

		if ($$.isDonutType(id)) {
			type = "donut";
		} else if ($$.isGaugeType(id)) {
			type = "gauge";
		} else if ($$.isPieType(id)) {
			type = "pie";
		}

		return type ? config[`${type}_expand_${key}`] : def[key];
	},

	shouldExpand(id: string): boolean {
		const $$ = this;
		const {config} = $$;
		const type = $$.isDonutType(id) ?
			"donut" :
			$$.isGaugeType(id) ?
			"gauge" :
			$$.isPieType(id) ?
			"pie" :
			null;

		return type ? !!config[`${type}_expand`] : false;
	},

	shouldShowArcLabel(): boolean {
        throw new Error("STUB");
    },

	getArcLabelConfig(name = "format"): number | string | Function | object {
		const $$ = this;
		const {config} = $$;
		let fn = v => v;

		ARC_TYPES
			.filter($$.hasType.bind($$))
			.forEach(v => {
                throw new Error("STUB");
            });

		if (name === "format") {
			return isFunction(fn) ? fn.bind($$.api) : fn;
		} else {
			return fn;
		}
	},

	updateTargetsForArc(targets: IData): void {
        throw new Error("STUB");
    },

	initArc(): void {
        throw new Error("STUB");
    },

	/**
	 * Set arc title text
	 * @param {string} str Title text
	 * @private
	 */
	setArcTitle(str?: string) {
		const $$ = this;
		const title = str || $$.getArcTitle();
		const hasGauge = $$.hasType("gauge");

		if (title) {
			const className = hasGauge ? $GAUGE.chartArcsGaugeTitle : $ARC.chartArcsTitle;
			let text = $$.$el.arcs.select(`.${className}`);

			if (text.empty()) {
				text = $$.$el.arcs.append("text")
					.attr("class", className)
					.style("text-anchor", "middle");
			}

			hasGauge && text.attr("dy", "-0.3em");

			setTextValue(text, title, hasGauge ? undefined : [-0.6, 1.35], true);
		}
	},

	/**
	 * Return arc title text
	 * @returns {string} Arc title text
	 * @private
	 */
	getArcTitle(): string {
		const $$ = this;
		const type = ($$.hasType("donut") && "donut") || ($$.hasType("gauge") && "gauge");

		return type ? $$.config[`${type}_title`] : "";
	},

	/**
	 * Get arc title text with needle value
	 * @returns {string|boolean} When title contains needle template string will return processed string, otherwise false
	 * @private
	 */
	getArcTitleWithNeedleValue(): string | false {
		const $$ = this;
		const {config, state} = $$;
		const title = $$.getArcTitle();

		if (title && $$.config.arc_needle_show && /{=[A-Z_]+}/.test(title)) {
			let value = state.current.needle;

			if (!isNumber(value)) {
				value = config.arc_needle_value;
			}

			return tplProcess(title, {
				NEEDLE_VALUE: ~~value
			});
		}

		return false;
	},

	redrawArc(duration: number, durationForExit: number, withTransform?: boolean): void {
		const $$ = this;
		const {config, state, $el: {main}} = $$;
		const hasInteraction = config.interaction_enabled;
		const isSelectable = hasInteraction && config.data_selection_isselectable;

		let mainArc = main.selectAll(`.${$ARC.arcs}`)
			.selectAll(`.${$ARC.arc}`)
			.data($$.arcData.bind($$));

		mainArc.exit()
			.transition()
			.duration(durationForExit)
			.style("opacity", "0")
			.remove();

		mainArc = mainArc.enter()
			.append("path")
			.attr("class", $$.getClass("arc", true))
			.style("fill", d => { throw new Error("STUB"); })
			.style("cursor", d => { throw new Error("STUB"); })
			.style("opacity", "0")
			.each(function(d) {
                throw new Error("STUB");
            })
			.merge(mainArc);

		if ($$.hasType("gauge")) {
			$$.updateGaugeMax();
			$$.hasMultiArcGauge() && $$.redrawArcGaugeLine();
		}

		mainArc
			.attr("transform", d => { throw new Error("STUB"); })
			.style("opacity", function(d) {
                throw new Error("STUB");
            })
			.each(() => {
                throw new Error("STUB");
            })
			.transition()
			.duration(duration)
			.attrTween("d", function(d) {
                throw new Error("STUB");
            })
			.attr("transform", withTransform ? "scale(1)" : "")
			.style("fill", d => {
                throw new Error("STUB");
            })
			// Where gauge reading color would receive customization.
			.style("opacity", null)
			.call(endall, function() {
                throw new Error("STUB");
            });

		// bind arc events
		hasInteraction && $$.bindArcEvent(mainArc);

		$$.hasType("polar") && $$.redrawPolar();
		$$.hasType("gauge") && $$.redrawBackgroundArcs();

		config.arc_needle_show && $$.redrawNeedle();

		$$.redrawArcText(duration);
		$$.redrawArcRangeText();
	},

	/**
	 * Update needle element
	 * @private
	 */
	redrawNeedle(): void {
		const $$ = this;
		const {$el, config, state: {hiddenTargetIds, radius}} = $$;
		const length = (radius - 1) / 100 * config.arc_needle_length;
		const hasDataToShow = hiddenTargetIds.size !== $$.data.targets.length;
		let needle = $$.$el.arcs.select(`.${$ARC.needle}`);

		// needle options
		const pathFn = config.arc_needle_path;
		const baseWidth = config.arc_needle_bottom_width / 2;
		const topWidth = config.arc_needle_top_width / 2;
		const topRx = config.arc_needle_top_rx;
		const topRy = config.arc_needle_top_ry;
		const bottomLen = config.arc_needle_bottom_len;
		const bottomRx = config.arc_needle_bottom_rx;
		const bottomRy = config.arc_needle_bottom_ry;
		const needleAngle = $$.getNeedleAngle();

		const updateNeedleValue = () => {
			const title = $$.getArcTitleWithNeedleValue();

			title && $$.setArcTitle(title);
		};

		updateNeedleValue();

		if (needle.empty()) {
			needle = $el.arcs
				.append("path")
				.classed($ARC.needle, true);

			$el.needle = needle;

			/**
			 * Function to be exposed as public to facilitate updating needle
			 * @param {number} v Value to be updated
			 * @param {boolean} updateConfig Weather update config's value
			 * @private
			 */
			$el.needle.updateHelper = (v: number, updateConfig = false): void => {
                throw new Error("STUB");
            };
		}

		if (hasDataToShow) {
			const path = isFunction(pathFn) ?
				pathFn.call($$, length) :
				`M-${baseWidth} ${bottomLen} A${bottomRx} ${bottomRy} 0 0 0 ${baseWidth} ${bottomLen} L${topWidth} -${length} A${topRx} ${topRy} 0 0 0 -${topWidth} -${length} L-${baseWidth} ${bottomLen} Z`;

			$$.$T(needle)
				.attr("d", path)
				.style("fill", config.arc_needle_color)
				.style("display", null)
				.style("transform", `rotate(${needleAngle}deg)`);
		} else {
			needle.style("display", "none");
		}
	},

	/**
	 * Get needle angle value relative given value
	 * @param {number} v Value to be calculated angle
	 * @returns {number} angle value
	 * @private
	 */
	getNeedleAngle(v?: number): number {
		const $$ = this;
		const {config, state} = $$;
		const arcLength = $$.getArcLength();
		const hasGauge = $$.hasType("gauge");
		const total = $$.getTotalDataSum(true);
		let value = isDefined(v) ? v : config.arc_needle_value;
		let startingAngle = config[`${config.data_type}_startingAngle`] || 0;
		let radian;

		if (!isNumber(value)) {
			value = hasGauge && $$.data.targets.length === 1 ? total : 0;
		}

		state.current.needle = value;

		if (hasGauge) {
			startingAngle = $$.getStartingAngle();

			const radius = config.gauge_fullCircle ? arcLength : startingAngle * -2;
			const {gauge_min: min, gauge_max: max} = config;

			radian = radius * ((value - min) / (max - min));
		} else {
			// guard against 0/0 = NaN when all data is zero or hidden
			radian = total ? arcLength * (value / total) : 0;
		}

		return (startingAngle + radian) * (180 / Math.PI);
	},

	redrawBackgroundArcs() {
		const $$ = this;
		const {config, state} = $$;
		const hasMultiArcGauge = $$.hasMultiArcGauge();
		const isFullCircle = config.gauge_fullCircle;
		const showEmptyTextLabel = $$.getTargetsToShow().length === 0 &&
			!!config.data_empty_label_text;

		const startAngle = $$.getStartingAngle();
		const endAngle = isFullCircle ? startAngle + $$.getArcLength() : startAngle * -1;

		let backgroundArc = $$.$el.arcs.select(
			`${hasMultiArcGauge ? "g" : ""}.${$ARC.chartArcsBackground}`
		);

		if (hasMultiArcGauge) {
			let index = 0;

			backgroundArc = backgroundArc
				.selectAll(`path.${$ARC.chartArcsBackground}`)
				.data($$.data.targets);

			backgroundArc.enter()
				.append("path")
				.attr("class", (d, i) =>
					{ throw new Error("STUB"); })
				.merge(backgroundArc)
				.style("fill", (config.gauge_background) || null)
				.attr("d", ({id}) => {
                    throw new Error("STUB");
                });

			backgroundArc.exit().remove();
		} else {
			backgroundArc.attr("d", showEmptyTextLabel ? "M 0 0" : () => {
                throw new Error("STUB");
            });
		}
	},

	bindArcEvent(arc): void {
		const $$ = this;
		const {config, state} = $$;
		const isTouch = state.inputType === "touch";
		const isMouse = state.inputType === "mouse";
		const _getArcData = d => {
			const updated = $$.updateAngle(d);
			return updated ? $$.convertToArcData(updated) : null;
		};

		// eslint-disable-next-line
		function selectArc(_this, arcData, id) {
			// transitions
			$$.expandArc(id);
			$$.api.focus(id);
			$$.toggleFocusLegend(id, true);
			$$.showTooltip([arcData], _this);
		}

		// eslint-disable-next-line
		function unselectArc(arcData?) {
			const id = arcData?.id || undefined;

			$$.unexpandArc(id);
			$$.api.revert();
			$$.revertLegend();
			$$.hideTooltip();
		}

		arc
			.on("click", function(event, d, i) {
                throw new Error("STUB");
            });

		// mouse events
		if (isMouse) {
			arc
				.on("mouseover", function(event, d) {
                    throw new Error("STUB");
                })
				.on("mouseout", (event, d) => {
                    throw new Error("STUB");
                })
				.on("mousemove", function(event, d) {
                    throw new Error("STUB");
                });
		}

		// touch events
		if (isTouch && $$.hasArcType() && !$$.radars) {
			const getEventArc = event => {
				const {clientX, clientY} = event.changedTouches?.[0] ?? {clientX: 0, clientY: 0};
				const eventArc = d3Select(document.elementFromPoint(clientX, clientY));

				return eventArc;
			};

			$$.$el.svg
				.on("touchstart touchmove", function(event) {
                    throw new Error("STUB");
                }, {passive: true});
		}
	},

	redrawArcText(duration: number): void {
		const $$ = this;
		const {config, state, $el: {main, arcs}} = $$;
		const hasGauge = $$.hasType("gauge");
		const hasMultiArcGauge = $$.hasMultiArcGauge();
		let text;

		// for gauge type, update text when has no title & multi data
		if (!(hasGauge && $$.data.targets.length === 1 && config.gauge_title)) {
			text = main.selectAll(`.${$ARC.chartArc}`)
				.select("text")
				.style("opacity", "0")
				.attr("class", d => { throw new Error("STUB"); })
				.call($$.textForArcLabel.bind($$))
				.style("font-size", d => { throw new Error("STUB"); });

			updateTextImage.call($$);

			text
				.attr("transform", function(d) {
                    throw new Error("STUB");
                })
				.transition()
				.duration(duration)
				.style("opacity",
					d => { throw new Error("STUB"); });

			hasMultiArcGauge && text.attr("dy", "-.1em");
		}

		main.select(`.${$ARC.chartArcsTitle}`)
			.style("opacity", $$.hasType("donut") || hasGauge ? null : "0");

		if (hasGauge) {
			const isFullCircle = config.gauge_fullCircle;

			isFullCircle &&
				text?.attr("dy", `${hasMultiArcGauge ? 0 : Math.round(state.radius / 14)}`);

			if (config.gauge_label_show) {
				arcs.select(`.${$GAUGE.chartArcsGaugeUnit}`)
					.attr("dy", `${isFullCircle ? 1.5 : 0.75}em`)
					.text(config.gauge_units);

				arcs.select(`.${$GAUGE.chartArcsGaugeMin}`)
					.attr("dx", `${
						-1 *
						(state.innerRadius +
							((state.radius - state.innerRadius) / (isFullCircle ? 1 : 2)))
					}px`)
					.attr("dy", "1.2em")
					.text($$.textForGaugeMinMax(config.gauge_min, false));

				// show max text when isn't fullCircle
				!isFullCircle && arcs.select(`.${$GAUGE.chartArcsGaugeMax}`)
					.attr("dx", `${state.innerRadius + ((state.radius - state.innerRadius) / 2)}px`)
					.attr("dy", "1.2em")
					.text($$.textForGaugeMinMax(config.gauge_max, true));
			}
		}

		// Render connector lines for label with lines
		isLabelWithLine.call($$) && redrawArcLabelLines.call($$, duration);
	},

	/**
	 * Get Arc element by id or index
	 * @param {string|number} value id or index of Arc
	 * @returns {d3Selection} Arc path element
	 * @private
	 */
	getArcElementByIdOrIndex(value: string | number): d3Selection {
		const $$ = this;
		const {$el: {arcs}} = $$;
		const filterFn = isNumber(value) ? d => { throw new Error("STUB"); } : d => { throw new Error("STUB"); };

		return arcs?.selectAll(`.${$COMMON.target} path`)
			.filter(filterFn);
	}
};
