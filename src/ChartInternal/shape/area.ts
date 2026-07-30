/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {select as d3Select} from "d3-selection";
import {d3Selection} from "../../../types";
import {$AREA, $CIRCLE, $LINE} from "../../config/classes";
import {getRandom} from "../../module/util";
import type {IDataRow} from "../data/IData";
import {generateDrawAreaPath} from "./core/path";
import {getShapeColorWithGradient} from "./shape";

export default {
	initArea(mainLine: d3Selection): void {
        throw new Error("STUB");
    },

	/**
	 * Update area color
	 * @param {object} d Data object
	 * @returns {string} Color string
	 * @private
	 */
	updateAreaColor(d: IDataRow): string {
        throw new Error("STUB");
    },

	/**
	 * Generate/Update elements
	 * @param {boolean} withTransition Transition for exit elements
	 * @param {boolean} isSub Subchart draw
	 * @private
	 */
	updateArea(withTransition: boolean, isSub = false): void {
        throw new Error("STUB");
    },

	/**
	 * Redraw function
	 * @param {function} drawFn Retuned functino from .generateDrawCandlestick()
	 * @param {boolean} withTransition With or without transition
	 * @param {boolean} isSub Subchart draw
	 * @returns {Array}
	 */
	redrawArea(drawFn: Function, withTransition?: boolean, isSub = false): d3Selection[] {
        throw new Error("STUB");
    },

	/**
	 * Generate area path data
	 * @param {object} areaIndices Indices
	 * @param {boolean} isSub Weather is sub axis
	 * @returns {function}
	 * @private
	 */
	generateDrawArea(areaIndices, isSub?: boolean): (d) => string {
        throw new Error("STUB");
    }
};
