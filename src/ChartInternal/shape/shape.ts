/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {select as d3Select} from "d3-selection";
import {
	curveBasis as d3CurveBasis,
	curveBasisClosed as d3CurveBasisClosed,
	curveBasisOpen as d3CurveBasisOpen,
	curveBundle as d3CurveBundle,
	curveCardinal as d3CurveCardinal,
	curveCardinalClosed as d3CurveCardinalClosed,
	curveCardinalOpen as d3CurveCardinalOpen,
	curveCatmullRom as d3CurveCatmullRom,
	curveCatmullRomClosed as d3CurveCatmullRomClosed,
	curveCatmullRomOpen as d3CurveCatmullRomOpen,
	curveLinear as d3CurveLinear,
	curveLinearClosed as d3CurveLinearClosed,
	curveMonotoneX as d3CurveMonotoneX,
	curveMonotoneY as d3CurveMonotoneY,
	curveNatural as d3CurveNatural,
	curveStep as d3CurveStep,
	curveStepAfter as d3CurveStepAfter,
	curveStepBefore as d3CurveStepBefore
} from "d3-shape";
import type {d3Selection} from "../../../types/types";
import CLASS from "../../config/classes";
import {TYPE} from "../../config/const";
import {KEY} from "../../module/Cache";
import {
	capitalize,
	getPointer,
	getRectSegList,
	getUnique,
	isFunction,
	isNumber,
	isObjectType,
	isUndefined,
	isValue,
	notEmpty,
	parseDate
} from "../../module/util";
import type {IDataIndice, IDataRow, TIndices} from "../data/IData";
import type {IOffset, ShapeElementConfig, UpdateTargetsConfig} from "./IShape";

// Module-level constant: avoids re-creating the lookup object on every getInterpolate() call
const CURVE_MAP: Record<string, unknown> = {
	basis: d3CurveBasis,
	"basis-closed": d3CurveBasisClosed,
	"basis-open": d3CurveBasisOpen,
	bundle: d3CurveBundle,
	cardinal: d3CurveCardinal,
	"cardinal-closed": d3CurveCardinalClosed,
	"cardinal-open": d3CurveCardinalOpen,
	"catmull-rom": d3CurveCatmullRom,
	"catmull-rom-closed": d3CurveCatmullRomClosed,
	"catmull-rom-open": d3CurveCatmullRomOpen,
	"monotone-x": d3CurveMonotoneX,
	"monotone-y": d3CurveMonotoneY,
	natural: d3CurveNatural,
	"linear-closed": d3CurveLinearClosed,
	linear: d3CurveLinear,
	step: d3CurveStep,
	"step-after": d3CurveStepAfter,
	"step-before": d3CurveStepBefore
};

// Re-export types for backward compatibility
export type {
	IOffset,
	LinearGradientOption,
	ShapeElementConfig,
	UpdateTargetsConfig
} from "./IShape";

/**
 * Check if a target can use line-like grouped point offsets.
 * @param {object} $$ ChartInternal instance
 * @param {object|string} d Data value, target or id
 * @returns {boolean} Whether target uses point-like y coordinates
 * @private
 */
function isLinePointGroupType($$, d): boolean {
	return $$.isLineType(d) || $$.isScatterType?.(d) || $$.isBubbleType?.(d);
}

/**
 * Get type filter for grouped line-like point offsets.
 * @param {object} $$ ChartInternal instance
 * @returns {function} Type filter
 * @private
 */
function getLinePointGroupTypeFilter($$): Function {
	return d => { throw new Error("STUB"); };
}

/**
 * Get numeric value used for stacked offset calculation.
 * @param {object} $$ ChartInternal instance
 * @param {object} d Data row
 * @param {boolean} isSub Whether coordinates are for the subchart
 * @returns {number|Array|object|null} Offset value
 * @private
 */
function getShapeOffsetValue($$, d, isSub?: boolean) {
	const subchartCandlestickValue = getSubchartCandlestickShapeValue($$, d, isSub);

	if (isNumber(subchartCandlestickValue)) {
		return subchartCandlestickValue;
	}

	if ($$.isCandlestickType?.(d)) {
		return $$.getCandlestickData?.(d)?.close;
	}

	return $$.getBaseValue(d);
}

/**
 * Get candlestick data projected for alternate subchart shapes.
 * @param {object} $$ ChartInternal instance
 * @param {object} d Data row
 * @param {boolean} isSub Whether coordinates are for the subchart
 * @returns {number|undefined} Projected value
 * @private
 */
function getSubchartCandlestickShapeValue($$, d, isSub?: boolean) {
	if (
		!isSub ||
		$$.isCandlestickType?.(d) ||
		!$$.isSubchartSourceTypeOf?.(d, TYPE.CANDLESTICK)
	) {
		return undefined;
	}

	const value = $$.getCandlestickData?.(d);

	if (!value) {
		return undefined;
	}

	if ($$.isBarType(d)) {
		return isNumber(value.open) && isNumber(value.close) ?
			value._isUp ? value.close : value.open :
			undefined;
	}

	return isNumber(value.close) ? value.close : undefined;
}

/**
 * Check whether candlestick data can be projected as a subchart bar value.
 * @param {object} $$ ChartInternal instance
 * @param {object} d Data row
 * @param {boolean} isSub Whether coordinates are for the subchart
 * @returns {boolean}
 * @private
 */
function isSubchartCandlestickBarValue($$, d, isSub?: boolean): boolean {
	const value = getSubchartCandlestickShapeValue($$, d, isSub);

	return isNumber(value) && $$.isBarType(d);
}

/**
 * Get subchart bar color projected from candlestick up/down state.
 * @param {object} $$ ChartInternal instance
 * @param {object} d Data row
 * @param {boolean} isSub Whether coordinates are for the subchart
 * @returns {string|null} Bar color
 * @private
 */
function getSubchartCandlestickBarColor($$, d, isSub?: boolean): string | null {
	if (!isSubchartCandlestickBarValue($$, d, isSub)) {
		return null;
	}

	const value = $$.getCandlestickData?.(d);

	if (value?._isUp) {
		return $$.color(d);
	}

	const downColor = $$.config.candlestick_color_down;
	const color = downColor && typeof downColor === "object" ? downColor[d.id] : downColor;

	return color || $$.color(d);
}

/**
 * Get grouped data point function for y coordinate
 * @param {object} d data vlaue
 * @returns {function|undefined}
 * @private
 */
function _getGroupedDataPointsFn(d) {
    throw new Error("STUB");
}

/**
 * Get shape color with gradient support
 * @param {object} d Data object
 * @param {string} configKey Configuration key for linearGradient (e.g., 'bar_linearGradient', 'area_linearGradient')
 * @param {(d: IDataRow) => string | null} colorFn Fallback color function when gradient is not enabled
 * @returns {string | null} Color string or gradient URL
 * @private
 */
export function getShapeColorWithGradient(
	this: any,
	d: IDataRow,
	configKey: string,
	colorFn: (d: IDataRow) => string | null
): string | null {
    throw new Error("STUB");
}

/**
 * Initialize a shape element container
 * @param {ShapeElementConfig} config Configuration object
 * @private
 */
export function initShapeElement(this: any, config: ShapeElementConfig): void {
    throw new Error("STUB");
}

/**
 * Common update targets pattern for shapes
 * @param {Array} targets Target data
 * @param {UpdateTargetsConfig} config Configuration object
 * @returns {d3Selection} Enter selection for additional setup
 * @private
 */
export function updateTargetsForShape(
	this: any,
	targets: any[],
	config: UpdateTargetsConfig
): d3Selection {
    throw new Error("STUB");
}

export default {
	/**
	 * Get the shape draw function
	 * @returns {object}
	 * @private
	 */
	getDrawShape() {
		type TShape = {area?: any, bar?: any, line?: any};

		const $$ = this;
		const isRotated = $$.config.axis_rotated;
		const {hasRadar, hasTreemap} = $$.state;
		const shape = {type: <TShape>{}, indices: <TShape>{}, pos: {}};

		!hasTreemap && ["bar", "candlestick", "line", "area"].forEach(v => {
            throw new Error("STUB");
        });

		if (!$$.hasArcType() || hasRadar || hasTreemap) {
			let cx;
			let cy;
			let xForText;
			let yForText;

			// generate circle x/y functions depending on updated params
			if (!hasTreemap) {
				cx = hasRadar ? $$.radarCircleX : (isRotated ? $$.circleY : $$.circleX);
				cy = hasRadar ? $$.radarCircleY : (isRotated ? $$.circleX : $$.circleY);
			}

			if (hasTreemap && $$.state.isCanvasMode) {
				xForText = yForText = function() {
                    throw new Error("STUB");
                };
			} else {
				xForText = $$.generateXYForText(shape.indices, true);
				yForText = $$.generateXYForText(shape.indices, false);
			}

			shape.pos = {
				xForText,
				yForText,
				cx: (cx || function() {
                    throw new Error("STUB");
                }).bind($$),
				cy: (cy || function() {
                    throw new Error("STUB");
                }).bind($$)
			};
		}

		return shape;
	},

	/**
	 * Get shape's indices according it's position within each axis tick.
	 *
	 * From the below example, indices will be:
	 * ==> {data1: 0, data2: 0, data3: 1, data4: 1, __max__: 1}
	 *
	 * 	data1 data3   data1 data3
	 * 	data2 data4   data2 data4
	 * 	-------------------------
	 * 		 0             1
	 * @param {function} typeFilter Chart type filter function
	 * @returns {object} Indices object with its position
	 */
	getShapeIndices(typeFilter): TIndices {
		const $$ = this;
		const {config} = $$;
		const xs = config.data_xs;
		const hasXs = notEmpty(xs);
		const indices: TIndices = {};
		let i: any = hasXs ? {} : 0;

		if (hasXs) {
			getUnique(Object.keys(xs).map(v => { throw new Error("STUB"); }))
				.forEach(v => {
                    throw new Error("STUB");
                });
		}

		$$.filterTargetsToShow($$.data.targets.filter(typeFilter, $$))
			.forEach(d => {
                throw new Error("STUB");
            });

		return indices;
	},

	/**
	 * Get indices value based on data ID value
	 * @param {object} indices Indices object
	 * @param {object} d Data row
	 * @param {string} caller Caller function name (Used only for 'sparkline' plugin)
	 * @returns {object} Indices object
	 * @private
	 */
	getIndices(indices: TIndices, d: IDataRow, caller?: string): IDataIndice { // eslint-disable-line
		const $$ = this;
		const {data_xs: xs, bar_indices_removeNull: removeNull} = $$.config;
		const {id, index} = d;

		if ($$.isBarType(id) && removeNull) {
			const ind = {} as IDataIndice;

			// redefine bar indices order
			$$.getAllValuesOnIndex(index, true)
				.forEach((v, i) => {
                    throw new Error("STUB");
                });

			return ind;
		}

		return notEmpty(xs) ? indices[xs[id]] : indices as IDataIndice;
	},

	/**
	 * Get indices max number
	 * @param {object} indices Indices object
	 * @returns {number} Max number
	 * @private
	 */
	getIndicesMax(indices: TIndices | IDataIndice): number {
		if (!notEmpty(this.config.data_xs)) {
			return (indices as IDataIndice).__max__;
		}

		// if is multiple xs, return total sum of xs' __max__ value
		let total = 0;

		for (const key in indices) {
			total += indices[key].__max__ || 0;
		}

		return total;
	},

	getShapeX(offset: IOffset, indices, isSub?: boolean): (d) => number {
		const $$ = this;
		const {config, scale} = $$;
		const currScale = isSub ? scale.subX : (scale.zoom || scale.x);
		const barOverlap = config.bar_overlap;
		const barPadding = config.bar_padding;
		const sum = (p, c) => p + c;

		// total shapes half width
		const halfWidth = isObjectType(offset) && (
			offset._$total.length ? offset._$total.reduce(sum) / 2 : 0
		);

		// Pre-compute prefix sums to avoid O(n) slice+reduce on every bar datum
		const prefixSums: number[] = [];

		if (halfWidth && isObjectType(offset) && offset._$total.length) {
			let acc = 0;

			for (const v of offset._$total) {
				acc += v;
				prefixSums.push(acc);
			}
		}

		return d => {
            throw new Error("STUB");
        };
	},

	getShapeY(isSub?: boolean): Function {
		const $$ = this;
		const isStackNormalized = $$.isStackNormalized();

		return d => {
            throw new Error("STUB");
        };
	},

	/**
	 * Get shape based y Axis min value
	 * @param {string} id Data id
	 * @param {boolean} isSub Whether to use subchart scale
	 * @returns {number}
	 * @private
	 */
	getShapeYMin(id: string, isSub = false): number {
		const $$ = this;
		const axisId = $$.axis.getId(id);
		const scale = $$.getYScaleById(id, isSub);
		const [yMin] = scale.domain();
		const inverted = $$.config[`axis_${axisId}_inverted`];

		return !$$.isGrouped(id) && !inverted && yMin > 0 ? yMin : 0;
	},

	/**
	 * Get Shape's offset data
	 * @param {function} typeFilter Type filter function
	 * @param {boolean} isSub Whether coordinates are for the subchart
	 * @returns {object}
	 * @private
	 */
	getShapeOffsetData(typeFilter, isSub?: boolean) {
		const $$ = this;
		const targets = $$.orderTargets(
			$$.filterTargetsToShow($$.data.targets.filter(typeFilter, $$))
		);

		// Same IDs can receive new values through load()/flow(), so ID-only
		// caching can leave stacked offsets pointing at stale row maps.
		const dataGeneration = $$.state.dataGeneration;
		const targetIds = targets.map(t => { throw new Error("STUB"); }).join("_");
		const cacheKey = `${KEY.shapeOffset}_${isSub ? "sub" : "main"}_${targetIds}`;

		// Check if result is already cached
		const cachedData = $$.cache.get(cacheKey);

		if (cachedData?.generation === dataGeneration) {
			return cachedData;
		}

		const isStackNormalized = $$.isStackNormalized();

		const shapeOffsetTargets = targets.map(target => {
            throw new Error("STUB");
        });
		const indexMapByTargetId = targets.reduce((out, {id}, index) => {
            throw new Error("STUB");
        }, {});

		const result = {generation: dataGeneration, indexMapByTargetId, shapeOffsetTargets};

		// Cache the result
		$$.cache.add(cacheKey, result);

		return result;
	},

	getShapeOffset(typeFilter, indices, isSub?: boolean): Function {
		const $$ = this;
		const {shapeOffsetTargets, indexMapByTargetId} = $$.getShapeOffsetData(
			typeFilter,
			isSub
		);
		const groupsZeroAs = $$.config.data_groupsZeroAs;

		// Pre-build per-series same-stacking-group lookup to avoid .filter() on every datum.
		// bar_indices_removeNull recomputes group membership per-datum index, so fall back there.
		let sameGroupByTargetId: Map<string, typeof shapeOffsetTargets> | null = null;

		if (!$$.config.bar_indices_removeNull) {
			sameGroupByTargetId = new Map();

			for (const target of shapeOffsetTargets) {
				const ind = $$.getIndices(indices, {id: target.id, index: 0} as IDataRow);

				sameGroupByTargetId.set(
					target.id,
					shapeOffsetTargets.filter(
						t => { throw new Error("STUB"); }
					)
				);
			}
		}

		return (d, idx) => {
            throw new Error("STUB");
        };
	},

	/**
	 * Generate line coordinate points from shared geometry.
	 * @param {object} lineIndices Data order within x axis
	 * @param {boolean} isSub Whether the coordinates are for subchart
	 * @param {function} typeFilter Type filter for offset targets
	 * @returns {function} Line point generator
	 * @private
	 */
	generateGetLinePoints(lineIndices, isSub?: boolean, typeFilter?: Function): Function {
		const $$ = this;
		const {config} = $$;
		const x = $$.getShapeX(0, lineIndices, isSub);
		const y = $$.getShapeY(isSub);
		const lineOffset = $$.getShapeOffset(typeFilter || $$.isLineType, lineIndices, isSub);
		const yScale = $$.getYScaleById.bind($$);

		return (d, i) => {
            throw new Error("STUB");
        };
	},

	/**
	 * Generate area coordinate points from shared geometry.
	 * @param {object} areaIndices Data order within x axis
	 * @param {boolean} isSub Whether the coordinates are for subchart
	 * @returns {function} Area point generator
	 * @private
	 */
	generateGetAreaPoints(
		areaIndices: TIndices,
		isSub?: boolean
	): (d: IDataRow, i: number) => [number, number][] {
		const $$ = this;
		const {config} = $$;
		const x = $$.getShapeX(0, areaIndices, isSub);
		const y = $$.getShapeY(!!isSub);
		const areaOffset = $$.getShapeOffset($$.isAreaType, areaIndices, isSub);
		const yScale = $$.getYScaleById.bind($$);

		// per-series cache: y0 depends only on the id and is stable within one draw pass
		const y0Cache = new Map<string, number>();

		return function(d, i) {
            throw new Error("STUB");
        };
	},

	/**
	 * Generate bar coordinate points from shared geometry.
	 * @param {object} barIndices Data order within x axis
	 * @param {boolean} isSub Whether the coordinates are for subchart
	 * @returns {function} Bar point generator
	 * @private
	 */
	generateGetBarPoints(
		barIndices,
		isSub?: boolean
	): (d, i: number) => [number, number][] {
		const $$ = this;
		const {config} = $$;
		const axis = isSub ? $$.axis.subX : $$.axis.x;
		const barTargetsNum = $$.getIndicesMax(barIndices) + 1;
		const barW: IOffset = $$.getBarW("bar", axis, barTargetsNum);
		const barX = $$.getShapeX(barW, barIndices, !!isSub);
		const barY = $$.getShapeY(!!isSub);
		const barOffset = $$.getShapeOffset($$.isBarType, barIndices, !!isSub);
		const yScale = $$.getYScaleById.bind($$);

		// per-series cache: y0/isInverted depend only on the id and are stable within one draw pass
		const idCache = new Map<string, {y0: number, isInverted: boolean}>();

		return (d, i) => {
            throw new Error("STUB");
        };
	},

	/**
	 * Get data's y coordinate
	 * @param {object} d Target data
	 * @param {number} i Index number
	 * @returns {number} y coordinate
	 * @private
	 */
	circleY(d: IDataRow, i: number): number {
		const $$ = this;
		const id = d.id;
		let points;

		if ($$.isGrouped(id)) {
			points = _getGroupedDataPointsFn.bind($$)(d);
		}

		return points ? points(d, i)[0][1] : $$.getYScaleById(id)($$.getBaseValue(d));
	},

	/**
	 * Get data point x coordinate.
	 * @param {object} d Data row
	 * @returns {number|null} X coordinate
	 * @private
	 */
	circleX(d): number | null {
        throw new Error("STUB");
    },

	/**
	 * Generate data point y coordinate accessor.
	 * @param {boolean} isSub Whether the coordinates are for subchart
	 * @returns {function} Y coordinate accessor
	 * @private
	 */
	updateCircleY(isSub = false): Function {
		const $$ = this;
		const typeFilter = getLinePointGroupTypeFilter($$);
		const getPoints = $$.generateGetLinePoints($$.getShapeIndices(typeFilter), isSub,
			typeFilter);
		const y = $$.getShapeY(isSub);

		return (d, i) => {
            throw new Error("STUB");
        };
	},

	/**
	 * Get candlestick data projected for alternate subchart shapes.
	 * @param {object} d Data row
	 * @param {boolean} isSub Whether coordinates are for the subchart
	 * @returns {number|undefined} Projected value
	 * @private
	 */
	getSubchartCandlestickShapeValue(d, isSub?: boolean) {
		return getSubchartCandlestickShapeValue(this, d, isSub);
	},

	/**
	 * Check whether the row should be drawn as a candlestick-derived subchart bar.
	 * @param {object} d Data row
	 * @param {boolean} isSub Whether coordinates are for the subchart
	 * @returns {boolean}
	 * @private
	 */
	isSubchartCandlestickBarValue(d, isSub?: boolean): boolean {
		return isSubchartCandlestickBarValue(this, d, isSub);
	},

	/**
	 * Get subchart bar color projected from candlestick up/down state.
	 * @param {object} d Data row
	 * @param {boolean} isSub Whether coordinates are for the subchart
	 * @returns {string|null} Bar color
	 * @private
	 */
	getSubchartCandlestickBarColor(d, isSub?: boolean): string | null {
		return getSubchartCandlestickBarColor(this, d, isSub);
	},

	/**
	 * Get point radius.
	 * @param {object} d Data row
	 * @returns {number} Point radius
	 * @private
	 */
	pointR(d): number {
		const $$ = this;
		const {config} = $$;
		const pointR = config.point_r;
		let r = pointR;

		if ($$.isBubbleType(d)) {
			r = $$.getBubbleR(d);
		} else if (isFunction(pointR)) {
			r = pointR.bind($$.api)(d);
		}

		d.r = r;

		return r;
	},

	/**
	 * Get focused point radius.
	 * @param {object} d Data row
	 * @returns {number} Focused point radius
	 * @private
	 */
	pointExpandedR(d): number {
		const $$ = this;
		const {config} = $$;
		const scale = $$.isBubbleType(d) ? 1.15 : 1.75;

		return config.point_focus_expand_enabled ?
			(config.point_focus_expand_r || $$.pointR(d) * scale) :
			$$.pointR(d);
	},

	/**
	 * Get selected point radius.
	 * @param {object} d Data row
	 * @returns {number} Selected point radius
	 * @private
	 */
	pointSelectR(d): number {
		const $$ = this;
		const selectR = $$.config.point_select_r;

		return isFunction(selectR) ? selectR(d) : (selectR || $$.pointR(d) * 4);
	},

	/**
	 * Check if point.focus.only option can be applied.
	 * @returns {boolean} Whether focus-only point rendering is active
	 * @private
	 */
	isPointFocusOnly(): boolean {
		const $$ = this;

		return $$.config.point_focus_only &&
			!$$.hasType("bubble") && !$$.hasType("scatter") && !$$.hasArcType(null, ["radar"]);
	},

	/**
	 * Get data point sensitivity radius.
	 * @param {object} d Data point
	 * @returns {number} Sensitivity radius
	 * @private
	 */
	getPointSensitivity(d) {
		const $$ = this;
		let sensitivity = $$.config.point_sensitivity;

		if (!d) {
			return sensitivity;
		} else if (isFunction(sensitivity)) {
			sensitivity = sensitivity.call($$.api, d);
		} else if (sensitivity === "radius") {
			sensitivity = d.r;
		}

		return sensitivity;
	},

	getBarW(type, axis, targetsNum: number): number | IOffset {
		const $$ = this;
		const {config, org, scale, state} = $$;
		const maxDataCount = $$.getMaxDataCount();
		const isGrouped = type === "bar" && config.data_groups?.length;
		const configName = `${type}_width`;
		const {k} = $$.getZoomTransform?.() ?? {k: 1};
		const xMinMax = [
			config.axis_x_min ?? org.xDomain[0],
			config.axis_x_max ?? org.xDomain[1]
		].map(v => { throw new Error("STUB"); }) as [
			number,
			number
		];

		let tickInterval = axis.tickInterval(maxDataCount);

		if (scale.zoom && !$$.axis.isCategorized() && k > 1) {
			const isSameMinMax = xMinMax.every((v, i) => { throw new Error("STUB"); });

			tickInterval = org.xDomain.map((v, i) => {
                throw new Error("STUB");
            }).reduce((a, c) => { throw new Error("STUB"); }) / maxDataCount;
		}

		const getWidth = (id?: string) => {
			const width = id ? config[configName][id] : config[configName];
			const ratio = id ? width.ratio : config[`${configName}_ratio`];
			const max = id ? width.max : config[`${configName}_max`];
			const w = isNumber(width) ? width : (
				isFunction(width) ?
					width.call($$, state.width, targetsNum, maxDataCount) :
					(targetsNum ? (tickInterval * ratio) / targetsNum : 0)
			);

			return max && w > max ? max : w;
		};

		let result = getWidth();

		if (!isGrouped && isObjectType(config[configName])) {
			result = {_$width: result, _$total: []};

			$$.getTargetsToShow().forEach(v => {
                throw new Error("STUB");
            });
		}

		return result;
	},

	/**
	 * Get shape element
	 * @param {string} shapeName Shape string
	 * @param {number} i Index number
	 * @param {string} id Data series id
	 * @returns {d3Selection}
	 * @private
	 */
	getShapeByIndex(shapeName: string, i: number, id?: string): d3Selection {
		const $$ = this;
		const {$el} = $$;
		const suffix = isValue(i) ? `-${i}` : ``;
		let shape = $el[shapeName];

		// filter from shape reference if has
		if (shape && !shape.empty()) {
			shape = shape
				.filter(d => { throw new Error("STUB"); })
				.filter(d => { throw new Error("STUB"); });
		} else {
			shape = (id ?
				$el.main
					.selectAll(
						`.${CLASS[`${shapeName}s`]}${$$.getTargetSelectorSuffix(id)}`
					) :
				$el.main)
				.selectAll(`.${CLASS[shapeName]}${suffix}`);
		}

		return shape;
	},

	isWithinShape(that, d): boolean {
		const $$ = this;
		const shape = d3Select(that);
		let isWithin;

		if (!$$.isTargetToShow(d.id)) {
			isWithin = false;
		} else if ($$.hasValidPointType?.(that.nodeName)) {
			isWithin = $$.isStepType(d) ?
				$$.isWithinStep(that, $$.getYScaleById(d.id)($$.getBaseValue(d))) :
				$$.isWithinCircle(
					that,
					$$.isBubbleType(d) ? $$.pointSelectR(d) * 1.5 : 0
				);
		} else if (that.nodeName === "path") {
			isWithin = shape.classed(CLASS.bar) ? $$.isWithinBar(that) : true;
		}

		return isWithin;
	},

	getInterpolate(d) {
		const $$ = this;
		const interpolation = $$.getInterpolateType(d);

		return CURVE_MAP[interpolation];
	},

	/**
	 * Get curve generator for line-like shapes.
	 * @param {object} d Data target
	 * @returns {function} Curve generator
	 * @private
	 */
	getCurve(d): Function {
		const $$ = this;
		const isRotatedStepType = $$.config.axis_rotated && $$.isStepType(d);

		// when is step & rotated, should be computed in different way
		// https://github.com/naver/billboard.js/issues/471
		return isRotatedStepType ?
			context => {
                throw new Error("STUB");
            } :
			$$.getInterpolate(d);
	},

	getInterpolateType(d) {
		const $$ = this;
		const {config} = $$;
		const type = config.spline_interpolation_type;
		const interpolation = $$.isInterpolationType(type) ? type : "cardinal";

		return $$.isSplineType(d) ? interpolation : (
			$$.isStepType(d) ? config.line_step_type : "linear"
		);
	},

	isWithinBar(that): boolean {
		const mouse = getPointer(this.state.event, that);
		const list = getRectSegList(that);
		const [seg0, seg1, seg2] = list;
		const x = Math.min(seg0.x, seg1.x);
		const y = Math.min(seg0.y, seg1.y);
		const offset = this.config.bar_sensitivity;
		const width = Math.abs(seg2.x - seg1.x);
		const height = Math.abs(seg0.y - seg1.y);
		const sx = x - offset;
		const ex = x + width + offset;
		const sy = y + height + offset;
		const ey = y - offset;

		const isWithin = sx < mouse[0] &&
			mouse[0] < ex &&
			ey < mouse[1] &&
			mouse[1] < sy;

		return isWithin;
	}
};
