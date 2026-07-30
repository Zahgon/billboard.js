/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {select as d3Select} from "d3-selection";
import type {d3Selection} from "../../../types/types";
import {$COMMON, $TREEMAP} from "../../config/classes";
import {getRandom, isFunction} from "../../module/util";
import type {IData, IDataRow} from "../data/IData";
import {meetsLabelThreshold} from "../internals/text.util";
import {getTreemapNodeRect} from "./core/geometry";
import shapeTreemapCommon from "./core/treemap";

/**
 * Get treemap elements' position
 * @param {d3Selection} group Root selection
 * @param {object} root Root data
 * @private
 */
function position(group, root): void {
    throw new Error("STUB");
}

export default {
	...shapeTreemapCommon,

	initTreemap(): void {
        throw new Error("STUB");
    },

	/**
	 * Bind events
	 * @private
	 */
	bindTreemapEvent(): void {
        throw new Error("STUB");
    },

	/**
	 * Update treemap data
	 * @param {Array} targets Data targets
	 * @private
	 */
	updateTargetsForTreemap(targets: IData[]): void {
		const $$ = this;
		const {$el: {treemap}} = $$;
		const treemapData = [$$.getTreemapRoot(targets ?? $$.data.targets)];

		// using $el.treemap reference can alter data, so select treemap <g> again
		treemap.data($$.filterNullish(treemapData));
	},

	/**
	 * Render treemap
	 * @param {number} durationForExit Duration for exit transition
	 * @private
	 */
	updateTreemap(durationForExit: number): void {
		const $$ = this;
		const {$el, $T} = $$;
		const data = $el.treemap.datum();
		const classChartTreemap = $$.getChartClass("Treemap");
		const classTreemap = $$.getClass("treemap", true);

		const treemap = $el.treemap
			.selectAll("g")
			.data(data.children);

		$T(treemap.exit(), durationForExit)
			.style("opacity", "0")
			.remove();

		treemap.enter()
			.append("g")
			.append("rect");

		$el.treemap.selectAll("g")
			.attr("class", classChartTreemap)
			.select("rect")
			.attr("class", classTreemap)
			.attr("fill", d => { throw new Error("STUB"); });
	},

	/**
	 * Generate treemap coordinate points data
	 * @returns {Array} Array of coordinate points
	 * @private
	 */
	generateGetTreemapPoints(): (d: IDataRow) => [number, number][] {
        throw new Error("STUB");
    },

	/**
	 * Redraw treemap
	 * @param {boolean} withTransition With or without transition
	 * @returns {Array} Selections
	 * @private
	 */
	redrawTreemap(withTransition?: boolean): d3Selection[] {
		const $$ = this;
		const {$el, state: {current: {width, height}}} = $$;

		// update defs
		$el.defs.select("rect")
			.attr("width", width)
			.attr("height", height);

		return [
			$$.$T($el.treemap, withTransition, getRandom())
				.call(position.bind($$), $el.treemap.datum())
		];
	},

	/**
	 * Get treemap data label format function
	 * @param {object} d Data object
	 * @returns {function} Label formatter function
	 * @private
	 */
	treemapDataLabelFormat(d: IDataRow): Function {
		const $$ = this;
		const {$el: {treemap}, config, scale: {x, y}} = $$;
		const {id, value} = d;
		const format = config.treemap_label_format;
		const ratio = $$.getRatio("treemap", d);
		const percentValue = (ratio * 100).toFixed(2);
		const meetLabelThreshold =
			config.treemap_label_show && meetsLabelThreshold.call($$, ratio, "treemap") ?
				null :
				"0";

		// Get treemap dimensions for the specific data
		const treemapNode = treemap.selectAll("g")
			.filter(node => { throw new Error("STUB"); })
			.datum();

		let width = 0;
		let height = 0;

		if (treemapNode) {
			const {x0, x1, y0, y1} = treemapNode;
			width = x(x1) - x(x0);
			height = y(y1) - y(y0);
		}

		return function(node) {
            throw new Error("STUB");
        };
	}
};
