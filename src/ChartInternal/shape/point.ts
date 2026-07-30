/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {select as d3Select} from "d3-selection";
import type {d3Selection} from "../../../types/types";
import {$CIRCLE, $COMMON, $SELECT} from "../../config/classes";
import {
	getBBox,
	getBoundingRect,
	getPointer,
	getRandom,
	isObject,
	isUndefined,
	isValue
} from "../../module/util";
import type {IDataRow} from "../data/IData";

const getTransitionName = () => getRandom();
const pointBBoxCache = new WeakMap<
	SVGElement,
	{
		attrHeight: string | null,
		attrWidth: string | null,
		height: number,
		href: string | null,
		width: number
	}
>();

/**
 * Get cached dimensions for non-circle point elements.
 * @param {SVGElement} node Point element
 * @returns {object} Width/height pair
 * @private
 */
function getPointBBox(node: SVGElement): {width: number, height: number} {
	const attrHeight = node.getAttribute("height");
	const attrWidth = node.getAttribute("width");
	const href = node.getAttribute("href") || node.getAttribute("xlink:href");
	const cached = pointBBoxCache.get(node);

	if (
		cached &&
		cached.attrHeight === attrHeight &&
		cached.attrWidth === attrWidth &&
		cached.href === href
	) {
		return cached;
	}

	const {width, height} = getBBox(node);
	const bbox = {attrHeight, attrWidth, height, href, width};

	pointBBoxCache.set(node, bbox);

	return bbox;
}

export default {
	initialOpacityForCircle(d): string | number | null {
        throw new Error("STUB");
    },

	opacityForCircle(d): string | number | null {
        throw new Error("STUB");
    },

	initCircle(): void {
		const $$ = this;
		const {$el: {main}} = $$;

		!$$.point && ($$.point = $$.generatePoint());

		if (
			($$.hasType("bubble") || $$.hasType("scatter")) &&
			main.select(`.${$COMMON.chart} > .${$CIRCLE.chartCircles}`).empty()
		) {
			main.select(`.${$COMMON.chart}`)
				.append("g")
				.attr("class", $CIRCLE.chartCircles);
		}
	},

	updateTargetForCircle(targetsValue, enterNodeValue): void {
		const $$ = this;
		const {config, data, $el} = $$;
		const selectionEnabled = config.interaction_enabled && config.data_selection_enabled;
		const isSelectable = selectionEnabled && config.data_selection_isselectable;
		const classCircles = $$.getClass("circles", true);

		if (!config.point_show) {
			return;
		}

		$$.initCircle();

		let targets = targetsValue;
		let enterNode = enterNodeValue;

		// only for scatter & bubble type should generate seprate <g> node
		if (!targets) {
			targets = $$.filterNullish(data.targets)
				.filter(d => { throw new Error("STUB"); });

			const mainCircle = $el.main.select(`.${$CIRCLE.chartCircles}`)
				.style("pointer-events", "none")
				.selectAll(`.${$CIRCLE.circles}`)
				.data(targets);

			mainCircle.exit().remove();
			enterNode = mainCircle.enter();
		}

		// Circles for each data point on lines
		selectionEnabled && enterNode.append("g")
			.attr("class", d => { throw new Error("STUB"); });

		enterNode.append("g")
			.attr("class", classCircles)
			.call(selection => {
                throw new Error("STUB");
            })
			.style("opacity", function() {
                throw new Error("STUB");
            });

		// Update date for selected circles
		selectionEnabled && targets.forEach(t => {
            throw new Error("STUB");
        });
	},

	updateCircle(isSub = false): void {
		const $$ = this;
		const {config, state, $el} = $$;
		const focusOnly = $$.isPointFocusOnly();
		const $root = isSub ? $el.subchart : $el;

		if (config.point_show && !state.toggling) {
			config.point_radialGradient && $$.updateLinearGradient();

			const circles = $root.main.selectAll(`.${$CIRCLE.circles}`)
				.selectAll(`.${$CIRCLE.circle}`)
				.data(d => {
                    throw new Error("STUB");
                });

			circles.exit().remove();

			const pointR = $$.pointR.bind($$);
			const updateCircleColor = $$.generateUpdateCircleColor();
			const initialOpacityForCircle = $$.initialOpacityForCircle.bind($$);

			circles.enter()
				.filter(Boolean)
				.append($$.point("create", this, pointR, updateCircleColor));

			$root.circle = $root.main.selectAll(`.${$CIRCLE.circles} .${$CIRCLE.circle}`)
				.style("stroke", $$.getStylePropValue($$.color))
				.style("opacity", initialOpacityForCircle);
		}
	},

	/**
	 * Generate circle color accessor, hoisting the bound color function
	 * to be created once per call (not per datum)
	 * @returns {function} Color accessor
	 * @private
	 */
	generateUpdateCircleColor(): (d: IDataRow) => string | null {
		const $$ = this;
		const fn = $$.getStylePropValue($$.color);

		return (d: IDataRow) => { throw new Error("STUB"); };
	},

	/**
	 * Update circle color
	 * @param {object} d Data object
	 * @returns {string} Color string
	 * @private
	 */
	updateCircleColor(d: IDataRow): string | null {
        throw new Error("STUB");
    },

	redrawCircle(cx: Function, cy: Function, withTransition: boolean, flow, isSub = false) {
		const $$ = this;
		const {state: {rendered}, $el, $T} = $$;
		const $root = isSub ? $el.subchart : $el;
		const selectedCircles = $root.main.selectAll(`.${$SELECT.selectedCircle}`);

		if (!$$.config.point_show) {
			return [];
		}

		const posAttr = $$.isCirclePoint() ? "c" : "";
		const t = getRandom();
		const opacityStyleFn = $$.opacityForCircle.bind($$);
		const updateCircleColor = $$.generateUpdateCircleColor();

		// For standard circle type, batch the update across all circles in one pass
		if ($$.isCirclePoint()) {
			const sel = $root.circle;

			if ($$.hasType("bubble")) {
				sel.attr("r", $$.pointR.bind($$));
			}

			if (withTransition) {
				flow && sel.attr("cx", cx);

				// Only animate circles that already have a position; new circles jump directly
				// to avoid them sliding in from the origin (cx=0).
				// Use a distinct transition name from the opacity transition below —
				// reusing the same name would interrupt the cx/cy transition before
				// it can commit, leaving circles stranded at their old scale positions.
				$T(sel.filter(function() {
                    throw new Error("STUB");
                }), true, `${t}-pos`)
					.attr("cx", cx).attr("cy", cy).style("fill", updateCircleColor);

				sel.filter(function() {
                    throw new Error("STUB");
                })
					.attr("cx", cx).attr("cy", cy).style("fill", updateCircleColor);
			} else {
				sel.attr("cx", cx).attr("cy", cy).style("fill", updateCircleColor);
			}

			const result = $T(sel, withTransition || !rendered, t)
				.style("opacity", opacityStyleFn);

			return [
				[result],
				$T(selectedCircles, withTransition).attr("cx", cx).attr("cy", cy)
			];
		}

		const fn = $$.point("update", $$, cx, cy, updateCircleColor, withTransition,
			flow, selectedCircles);
		const mainCircles: any[] = [];

		$root.circle.each(function(d) {
            throw new Error("STUB");
        });

		return [
			mainCircles,
			$T(selectedCircles, withTransition)
				.attr(`${posAttr}x`, cx)
				.attr(`${posAttr}y`, cy)
		];
	},

	/**
	 * Show focused data point circle
	 * @param {object} d Selected data
	 * @private
	 */
	showCircleFocus(d?: IDataRow[]): void {
		const $$ = this;
		const {state: {hasRadar, resizing, toggling, transiting}, $el} = $$;
		let {circle} = $el;

		if (transiting === false && circle && $$.isPointFocusOnly()) {
			const cx = (hasRadar ? $$.radarCircleX : $$.circleX).bind($$);
			const cy = (hasRadar ? $$.radarCircleY : $$.circleY).bind($$);
			const withTransition = toggling || isUndefined(d);
			const fn = $$.point("update", $$, cx, cy, $$.getStylePropValue($$.color),
				resizing ? false : withTransition);

			if (d) {
				circle = circle
					.filter(function(t) {
                        throw new Error("STUB");
                    });
			}

			circle
				.attr("class", this.updatePointClass.bind(this))
				.style("opacity", null)
				.each(function(d) {
                    throw new Error("STUB");
                });
		}
	},

	/**
	 * Hide focused data point circle
	 * @private
	 */
	hideCircleFocus(): void {
		const $$ = this;
		const {$el: {circle}} = $$;

		if ($$.isPointFocusOnly() && circle) {
			$$.unexpandCircles();
			circle.style("visibility", "hidden");
		}
	},

	expandCircles(i: number, id: string, reset?: boolean): void {
		const $$ = this;
		const r = $$.pointExpandedR.bind($$);

		reset && $$.unexpandCircles();

		const circles = $$.getShapeByIndex("circle", i, id).classed($COMMON.EXPANDED, true);
		const scale = r(circles) / $$.config.point_r;
		const ratio = 1 - scale;

		if ($$.isCirclePoint()) {
			circles.attr("r", r);
		} else {
			// transform must be applied to each node individually
			circles.each(function() {
                throw new Error("STUB");
            });
		}
	},

	unexpandCircles(i): void {
		const $$ = this;
		const r = $$.pointR.bind($$);

		const circles = $$.getShapeByIndex("circle", i)
			.filter(function() {
                throw new Error("STUB");
            })
			.classed($COMMON.EXPANDED, false);

		circles.attr("r", r);

		if (!$$.isCirclePoint()) {
			const scale = r(circles) / $$.config.point_r;

			circles.attr("transform", scale !== 1 ? `scale(${scale})` : null);
		}
	},

	isWithinCircle(node: SVGElement, r?: number): boolean {
		const {state} = this;
		const mouse = getPointer(state.event, node);
		const element = d3Select(node);
		const prefix = this.isCirclePoint(node) ? "c" : "";
		const pointSensitivity = this.getPointSensitivity(element?.datum());

		let cx = +element.attr(`${prefix}x`);
		let cy = +element.attr(`${prefix}y`);

		// if node don't have cx/y or x/y attribute value
		if (!(cx || cy) && node.nodeType === 1) {
			const {x, y} = getBoundingRect(node);

			cx = x;
			cy = y;
		}

		const dx = cx - mouse[0];
		const dy = cy - mouse[1];

		return Math.sqrt(dx * dx + dy * dy) < (r || pointSensitivity);
	},

	updatePointClass(d) {
		const $$ = this;
		const {circle} = $$.$el;
		let pointClass = false;

		if (isObject(d) || circle) {
			pointClass = d === true ?
				circle.each(function(d) {
                    throw new Error("STUB");
                }) :
				$$.getClass("circle", true)(d);
		}

		return pointClass;
	},

	custom: {
		create(element, id, fillStyleFn) {
			return element.append("use")
				.attr("xlink:href", `#${id}`)
				.attr("class", this.updatePointClass.bind(this))
				.style("fill", fillStyleFn)
				.node();
		},

		update(element, xPosFn, yPosFn, fillStyleFn, withTransition, flow, selectedCircles) {
			const $$ = this;
			const {width, height} = getPointBBox(element.node());

			const xPosFn2 = d => { throw new Error("STUB"); };
			const yPosFn2 = d => { throw new Error("STUB"); };
			let mainCircles = element;

			if (withTransition) {
				flow && mainCircles.attr("x", xPosFn2);

				mainCircles = $$.$T(mainCircles, withTransition, getTransitionName());
				selectedCircles && $$.$T(selectedCircles, withTransition, getTransitionName());
			}

			return mainCircles
				.attr("x", xPosFn2)
				.attr("y", yPosFn2)
				.style("fill", fillStyleFn);
		}
	},

	// 'circle' data point
	circle: {
		create(element, sizeFn, fillStyleFn) {
			return element.append("circle")
				.attr("class", this.updatePointClass.bind(this))
				.attr("r", sizeFn)
				.style("fill", fillStyleFn)
				.node();
		},

		update(element, xPosFn, yPosFn, fillStyleFn, withTransition, flow, selectedCircles) {
			const $$ = this;
			let mainCircles = element;

			// when '.load()' called, bubble size should be updated
			if ($$.hasType("bubble")) {
				mainCircles.attr("r", $$.pointR.bind($$));
			}

			if (withTransition) {
				flow && mainCircles.attr("cx", xPosFn);

				if (mainCircles.attr("cx")) {
					mainCircles = $$.$T(mainCircles, withTransition, getTransitionName());
				}

				selectedCircles && $$.$T(selectedCircles, withTransition, getTransitionName());
			}

			return mainCircles
				.attr("cx", xPosFn)
				.attr("cy", yPosFn)
				.style("fill", fillStyleFn);
		}
	},

	// 'rectangle' data point
	rectangle: {
		create(element, sizeFn, fillStyleFn) {
			const rectSizeFn = d => { throw new Error("STUB"); };

			return element.append("rect")
				.attr("class", this.updatePointClass.bind(this))
				.attr("width", rectSizeFn)
				.attr("height", rectSizeFn)
				.style("fill", fillStyleFn)
				.node();
		},

		update(element, xPosFn, yPosFn, fillStyleFn, withTransition, flow, selectedCircles) {
			const $$ = this;
			const r = $$.config.point_r;
			const rectXPosFn = d => { throw new Error("STUB"); };
			const rectYPosFn = d => { throw new Error("STUB"); };

			let mainCircles = element;

			if (withTransition) {
				flow && mainCircles.attr("x", rectXPosFn);

				mainCircles = $$.$T(mainCircles, withTransition, getTransitionName());
				selectedCircles && $$.$T(selectedCircles, withTransition, getTransitionName());
			}

			return mainCircles
				.attr("x", rectXPosFn)
				.attr("y", rectYPosFn)
				.style("fill", fillStyleFn);
		}
	}
};
