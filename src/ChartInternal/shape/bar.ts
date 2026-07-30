/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {select as d3Select} from "d3-selection";
import type {d3Selection, d3Transition, DataRow} from "../../../types/types";
import {$BAR, $COMMON} from "../../config/classes";
import {getRandom, isNumber} from "../../module/util";
import type {IBarData} from "../data/IData";
import {
	getBarPathInterpolator,
	getBarRadiusInfo,
	getBarRadiusResolver,
	getStackingBarRadiusSet
} from "./core/barRadius";
import {getShapeColorWithGradient, updateTargetsForShape} from "./shape";

type BarTypeDataRow = DataRow<number | number[]>;
type BarConnectLine = {x: number, y: number, width: number, height: number};
type BarPath = (string | BarConnectLine)[];

/**
 * Get the type of connect line for bar chart
 * @param {string} id Data id
 * @returns {string|null} Connect line type or null if not applicable
 * @private
 */
function _getConnectLineType(id: string): string | null {
    throw new Error("STUB");
}

export default {
	initBar(): void {
        throw new Error("STUB");
    },

	updateTargetsForBar(targets: BarTypeDataRow[]): void {
        throw new Error("STUB");
    },

	/**
	 * Generate/Update elements
	 * @param {boolean} withTransition Transition for exit elements
	 * @param {boolean} isSub Subchart draw
	 * @private
	 */
	updateBar(withTransition: boolean, isSub = false): void {
        throw new Error("STUB");
    },

	/**
	 * Generate bar color accessor, hoisting the bound color function
	 * to be created once per call (not per datum)
	 * @returns {function} Color accessor
	 * @private
	 */
	generateUpdateBarColor(): (d: IBarData) => string | null {
        throw new Error("STUB");
    },

	/**
	 * Update bar color
	 * @param {object} d Data object
	 * @returns {string} Color string
	 * @private
	 */
	updateBarColor(d: IBarData): string | null {
        throw new Error("STUB");
    },

	/**
	 * Redraw function
	 * @param {function} drawFn Retuned function from .getDrawShape() => .generateDrawBar()
	 * @param {boolean} withTransition With or without transition
	 * @param {boolean} isSub Subchart draw
	 * @returns {Array}
	 * @private
	 */
	redrawBar(drawFn, withTransition?: boolean, isSub = false) {
        throw new Error("STUB");
    },

	/**
	 * Generate draw function
	 * @param {object} barIndices data order within x axis.
	 * barIndices ==> {data1: 0, data2: 0, data3: 1, data4: 1, __max__: 1}
	 *
	 * When gropus given as:
	 *  groups: [
	 * 		["data1", "data2"],
	 * 		["data3", "data4"]
	 * 	],
	 *
	 * Will be rendered as:
	 * 		data1 data3   data1 data3
	 * 		data2 data4   data2 data4
	 * 		-------------------------
	 * 			 0             1
	 * @param {boolean} isSub If is for subchart
	 * @returns {function}
	 * @private
	 */
	generateDrawBar(barIndices, isSub?: boolean): (d: IBarData, i: number) => BarPath {
        throw new Error("STUB");
    },

	/**
	 * Determine if given stacking bar data is radius type
	 * @param {object} d Data row
	 * @returns {boolean}
	 */
	isStackingRadiusData(d: IBarData): boolean {
		const $$ = this;
		const {$el, config, data, state} = $$;
		const {id, index, value} = d;

		// when the data is hidden, check if has rounded edges
		if (state.hiddenTargetIds.has(id)) {
			const target = $el.bar.filter(d => { throw new Error("STUB"); });

			return !target.empty() && /a\d+/i.test(target.attr("d"));
		}

		// Find same grouped ids
		const keys = config.data_groups.find(v => { throw new Error("STUB"); });

		// Get sorted list
		const sortedList = $$.orderTargets(
			$$.filterTargetsToShow(data.targets.filter($$.isBarType, $$))
		).filter(v => { throw new Error("STUB"); });

		// Get sorted Ids. Filter positive or negative values Ids from given value
		const sortedIds = sortedList
			.map(v => {
                throw new Error("STUB");
            })
			.filter(Boolean)
			.map(v => { throw new Error("STUB"); });

		// If the given id stays in the last position, then radius should be applied.
		return value !== 0 && (sortedIds.indexOf(id) === sortedIds.length - 1);
	},

	/**
	 * Update the bar connect line path
	 * @param {d3Selection} node d3 selection of bar connect line
	 * @param {string} type Type of connect line, one of "start-start", "start-end", "end-start", "end-end"
	 * @param {Array} barPath d3 path data for the bar
	 */
	updateConnectLine(
		node: d3Selection,
		type: "start-start" | "start-end" | "end-start" | "end-end",
		barPath: BarConnectLine[]
	): void {
        throw new Error("STUB");
    }
};
