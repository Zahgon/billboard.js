/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {select as d3Select, selectAll as d3SelectAll} from "d3-selection";
import type {d3Selection} from "../../../types/types";
import {$AXIS, $COMMON, $FOCUS, $GRID} from "../../config/classes";
import {AXIS_DEFAULT_TICK_COUNT} from "../../config/const";
import {getPointer, isArray, isValue} from "../../module/util";
import type {IDataRow} from "../data/IData";

// Grid position and text anchor helpers
const GRID_FOCUS_SELECTOR = `line.${$FOCUS.xgridFocus}:not(.${$FOCUS.xgridFocusContinuous}), ` +
	`line.${$FOCUS.ygridFocus}`;
const _getGridTextAnchor = d => { throw new Error("STUB"); };
const _getGridTextDx = d => { throw new Error("STUB"); };

/**
 * Get current grid focus line selection.
 * @param {object} $$ ChartInternal context
 * @returns {d3.selection} Grid focus line selection
 * @private
 */
function _getGridFocusEl($$): d3Selection {
	const {state, $el: {main}} = $$;
	const cached = state._gridFocusEl;
	const mainNode = main.node();
	const cachedNodes = cached?.nodes?.() || [];

	return cachedNodes.length && cachedNodes.every(node => { throw new Error("STUB"); }) ?
		cached :
		(state._gridFocusEl = main.selectAll(GRID_FOCUS_SELECTOR));
}

/**
 * Hide continuous subchart focus grid line.
 * @param {object} $$ ChartInternal context
 * @private
 */
function _hideContinuousGridFocus($$): void {
	$$.$el.main.select(`line.${$FOCUS.xgridFocusContinuous}`)
		.style("visibility", "hidden");
}

/**
 * Get grid text x value getter function
 * @param {boolean} isX Is x Axis
 * @param {number} width Width value
 * @param {number} height Height value
 * @returns {function}
 * @private
 */
function _getGridTextX(isX, width, height): Function {
	return d => {
        throw new Error("STUB");
    };
}

/**
 * Update coordinate attributes value
 * @param {d3.selection} el Target node
 * @param {string} type Type
 * @private
 */
function _smoothLines(el, type: string): void {
	if (type === "grid") {
		el.each(function() {
            throw new Error("STUB");
        });
	}
}

export default {
	hasGrid(): boolean {
		const {config} = this;

		return ["x", "y"]
			.some(v => { throw new Error("STUB"); });
	},

	initGrid() {
		const $$ = this;

		$$.hasGrid() && $$.initGridLines();
		$$.initFocusGrid();
	},

	initGridLines(): void {
		const $$ = this;
		const {config, state: {clip}, $el} = $$;

		if (config.grid_x_lines.length || config.grid_y_lines.length) {
			$el.gridLines.main = $el.main.insert("g",
				`.${$COMMON.chart}${config.grid_lines_front ? " + *" : ""}`)
				.attr("clip-path", clip.pathGrid)
				.attr("class", `${$GRID.grid} ${$GRID.gridLines}`);

			$el.gridLines.main.append("g").attr("class", $GRID.xgridLines);
			$el.gridLines.main.append("g").attr("class", $GRID.ygridLines);

			$el.gridLines.x = d3SelectAll([]);
		}
	},

	updateXGrid(withoutUpdate): void {
		const $$ = this;
		const {config, scale, state, $el: {main, grid}} = $$;
		const isRotated = config.axis_rotated;
		const xgridData = $$.generateGridData(config.grid_x_type, scale.x);
		const tickOffset = $$.axis.isCategorized() ? $$.axis.x.tickOffset() : 0;
		const pos = d =>
			{ throw new Error("STUB"); };

		state.xgridAttr = isRotated ?
			{
				x1: 0,
				x2: state.width,
				y1: pos,
				y2: pos
			} :
			{
				x1: pos,
				x2: pos,
				y1: 0,
				y2: state.height
			};

		grid.x = main.select(`.${$GRID.xgrids}`)
			.selectAll(`.${$GRID.xgrid}`)
			.data(xgridData);

		grid.x.exit().remove();

		grid.x = grid.x.enter()
			.append("line")
			.attr("class", $GRID.xgrid)
			.merge(grid.x);

		if (!withoutUpdate) {
			grid.x.each(function() {
                throw new Error("STUB");
            });
		}
	},

	updateYGrid(): void {
        throw new Error("STUB");
    },

	updateGrid() {
		const $$ = this;
		const {$el: {grid, gridLines}} = $$;

		!gridLines.main && $$.initGridLines();

		// hide if arc type
		grid.main.style("visibility", $$.hasArcType() ? "hidden" : null);

		$$.hideGridFocus();
		$$.updateGridLines("x");
		$$.updateGridLines("y");
	},

	/**
	 * Update Grid lines
	 * @param {string} type x | y
	 * @private
	 */
	updateGridLines(type: "x" | "y"): void {
		const $$ = this;
		const {config, $el: {gridLines, main}, $T} = $$;
		const isRotated = config.axis_rotated;
		const isX = type === "x";

		config[`grid_${type}_show`] && $$[`update${type.toUpperCase()}Grid`]();

		let lines = main.select(`.${$GRID[`${type}gridLines`]}`)
			.selectAll(`.${$GRID[`${type}gridLine`]}`)
			.data(config[`grid_${type}_lines`]);

		// exit
		$T(lines.exit())
			.style("opacity", "0")
			.remove();

		// enter
		const gridLine = lines.enter().append("g");

		gridLine.append("line")
			.style("opacity", "0");

		lines = gridLine.merge(lines);

		lines.each(function(d) {
            throw new Error("STUB");
        });

		$T(lines
			.attr("class", d => { throw new Error("STUB"); })
			.select("text")
			.attr("text-anchor", _getGridTextAnchor)
			.attr("transform",
				() => { throw new Error("STUB"); })
			.attr("dx", _getGridTextDx)
			.attr("dy", -5))
			.text(function(d) {
                throw new Error("STUB");
            });

		gridLines[type] = lines;
	},

	redrawGrid(withTransition: boolean): any[] {
		const $$ = this;
		const {
			config: {axis_rotated: isRotated},
			state: {width, height},
			$el: {gridLines},
			$T
		} = $$;
		const xv = $$.xv.bind($$);
		const yv = $$.yv.bind($$);

		let xLines = gridLines.x.select("line");
		let xTexts = gridLines.x.select("text");

		let yLines = gridLines.y.select("line");
		let yTexts = gridLines.y.select("text");

		xLines = $T(xLines, withTransition)
			.attr("x1", isRotated ? 0 : xv)
			.attr("x2", isRotated ? width : xv)
			.attr("y1", isRotated ? xv : 0)
			.attr("y2", isRotated ? xv : height);

		xTexts = $T(xTexts, withTransition)
			.attr("x", _getGridTextX(!isRotated, width, height))
			.attr("y", xv);

		yLines = $T(yLines, withTransition)
			.attr("x1", isRotated ? yv : 0)
			.attr("x2", isRotated ? yv : width)
			.attr("y1", isRotated ? 0 : yv)
			.attr("y2", isRotated ? height : yv);

		yTexts = $T(yTexts, withTransition)
			.attr("x", _getGridTextX(isRotated, width, height))
			.attr("y", yv);

		return [
			xLines.style("opacity", null),
			xTexts.style("opacity", null),
			yLines.style("opacity", null),
			yTexts.style("opacity", null)
		];
	},

	initFocusGrid(): void {
		const $$ = this;
		const {config, state, state: {clip}, $el} = $$;

		// Invalidate cached D3 selection in case grid is re-initialized
		state._gridFocusEl = null;
		const isFront = config.grid_front;
		const className = `.${isFront && $el.gridLines.main ? $GRID.gridLines : $COMMON.chart}${
			isFront ? " + *" : ""
		}`;

		const grid = $el.main.insert("g", className)
			.attr("clip-path", clip.pathGrid)
			.attr("class", $GRID.grid);

		$el.grid.main = grid;

		config.grid_x_show &&
			grid.append("g").attr("class", $GRID.xgrids);

		config.grid_y_show &&
			grid.append("g").attr("class", $GRID.ygrids);

		if (config.axis_tooltip) {
			const axis = grid.append("g").attr("class", "bb-axis-tooltip");

			axis.append("line").attr("class", "bb-axis-tooltip-x");
			axis.append("line").attr("class", "bb-axis-tooltip-y");
		}

		if (config.interaction_enabled && config.grid_focus_show && !config.axis_tooltip) {
			grid.append("g")
				.attr("class", $FOCUS.xgridFocus)
				.append("line")
				.attr("class", $FOCUS.xgridFocus);

			// to show xy focus grid line, should be 'tooltip.grouped=false'
			if (config.grid_focus_y && !config.tooltip_grouped) {
				grid.append("g")
					.attr("class", $FOCUS.ygridFocus)
					.append("line")
					.attr("class", $FOCUS.ygridFocus);
			}

			config.subchart_grid_focus_continuous && $el.main.insert("g", className)
				.attr("class", $FOCUS.xgridFocusContinuous)
				.append("line")
				.attr("class", `${$FOCUS.xgridFocus} ${$FOCUS.xgridFocusContinuous}`)
				.style("visibility", "hidden");
		}
	},

	showAxisGridFocus() {
		const $$ = this;
		const {config, format, state: {event, width, height}} = $$;
		const isRotated = config.axis_rotated;

		// get mouse event position
		const [x, y] = getPointer(event, $$.$el.eventRect?.node());
		const pos = {x, y};

		for (const [axis, node] of Object.entries($$.$el.axisTooltip)) {
			const attr = (axis === "x" && !isRotated) || (axis !== "x" && isRotated) ? "x" : "y";
			const value = pos[attr];
			let scaleText = $$.scale[axis]?.invert(value);

			if (scaleText) {
				scaleText = axis === "x" && $$.axis.isTimeSeries() ?
					format.xAxisTick(scaleText) :
					scaleText?.toFixed(2);

				// set position & its text value based on position
				(node as d3Selection)?.attr(attr, value)
					.text(scaleText);
			}
		}

		$$.$el.main.selectAll(
			`line.bb-axis-tooltip-x, line.bb-axis-tooltip-y`
		).style("visibility", null)
			.each(function(d, i) {
                throw new Error("STUB");
            });
	},

	hideAxisGridFocus() {
		const $$ = this;

		$$.$el.main.selectAll(
			`line.${$AXIS.axisTooltipX}, line.${$AXIS.axisTooltipY}`
		).style("visibility", "hidden");

		Object.values($$.$el.axisTooltip)
			.forEach((v: d3Selection) => { throw new Error("STUB"); });
	},

	/**
	 * Show grid focus line
	 * @param {Array} data Selected data
	 * @private
	 */
	showGridFocus(data?): void {
		const $$ = this;
		const {config, state: {width, height}} = $$;
		const isRotated = config.axis_rotated;

		// Cache grid focus selection to avoid repeated DOM queries on mousemove
		const focusEl = _getGridFocusEl($$);

		const dataToShow: IDataRow[] = (data || [focusEl.datum()]).filter(d =>
			{ throw new Error("STUB"); }
		);

		// Hide when bubble/scatter/stanford plot exists
		if (
			!config.tooltip_show || dataToShow.length === 0 || (
				!config.axis_x_forceAsSingle && $$.hasType("bubble")
			) || $$.hasArcType()
		) {
			return;
		}

		const isEdge = config.grid_focus_edge && !config.tooltip_grouped;
		const xx = $$.xx.bind($$);

		focusEl
			.style("visibility", null)
			.data(dataToShow.concat(dataToShow))
			.each(function(d) {
                throw new Error("STUB");
            });

		_smoothLines(focusEl, "grid");
		$$.showCircleFocus?.(data);
	},

	hideGridFocus(force = false): void {
		const $$ = this;
		const {state: {inputType, resizing}} = $$;

		if (force || inputType === "mouse" || !resizing) {
			const focusEl = _getGridFocusEl($$);

			focusEl.style("visibility", "hidden");
			_hideContinuousGridFocus($$);
			$$.hideCircleFocus?.();
		}
	},

	updateGridFocus(): boolean {
		const $$ = this;
		const {state: {inputType, width, height, resizing}, $el: {grid}} = $$;
		const xgridFocus = grid.main.select(`line.${$FOCUS.xgridFocus}`);

		if (inputType === "touch") {
			if (xgridFocus.empty()) {
				resizing && $$.showCircleFocus?.();
			} else {
				$$.showGridFocus();
			}
		} else {
			const isRotated = $$.config.axis_rotated;

			xgridFocus
				.attr("x1", isRotated ? 0 : -10)
				.attr("x2", isRotated ? width : -10)
				.attr("y1", isRotated ? -10 : 0)
				.attr("y2", isRotated ? -10 : height);
			_hideContinuousGridFocus($$);
		}

		// need to return 'true' as of being pushed to the redraw list
		// ref: getRedrawList()
		return true;
	},

	generateGridData(type: string, scale) {
		const $$ = this;
		const tickNum = $$.$el.main.select(`.${$AXIS.axisX}`)
			.selectAll(".tick")
			.size();
		let gridData: Date[] = [];

		if (type === "year") {
			const xDomain = $$.getXDomain($$.data.targets);
			const [firstYear, lastYear] = xDomain.map(v => { throw new Error("STUB"); });

			for (let i = firstYear; i <= lastYear; i++) {
				gridData.push(new Date(`${i}-01-01 00:00:00`));
			}
		} else {
			gridData = scale.ticks(AXIS_DEFAULT_TICK_COUNT);

			if (gridData.length > tickNum) { // use only int
				gridData = gridData.filter(d => { throw new Error("STUB"); });
			}
		}

		return gridData;
	},

	getGridFilterToRemove(params): Function {
		return params ?
			line => {
                throw new Error("STUB");
            } :
			() => { throw new Error("STUB"); };
	},

	removeGridLines(params, forX?: boolean): void {
		const $$ = this;
		const {config, $T} = $$;
		const toRemove = $$.getGridFilterToRemove(params);
		const toShow = line => { throw new Error("STUB"); };
		const classLines = forX ? $GRID.xgridLines : $GRID.ygridLines;
		const classLine = forX ? $GRID.xgridLine : $GRID.ygridLine;

		$T($$.$el.main.select(`.${classLines}`)
			.selectAll(`.${classLine}`)
			.filter(toRemove))
			.style("opacity", "0")
			.remove();

		const gridLines = `grid_${forX ? "x" : "y"}_lines`;

		config[gridLines] = config[gridLines].filter(toShow);
	}
};
