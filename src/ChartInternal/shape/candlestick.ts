/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {select as d3Select} from "d3-selection";
import {$CANDLESTICK} from "../../config/classes";
import {getRandom, isObject} from "../../module/util";
import shapeCandlestickCommon from "./core/candlestick";
import {initShapeElement, updateTargetsForShape} from "./shape";

export default {
	...shapeCandlestickCommon,

	initCandlestick(): void {
        throw new Error("STUB");
    },

	/**
	 * Update targets by its data
	 * called from: ChartInternal.updateTargets()
	 * @param {Array} targets Filtered target by type
	 * @private
	 */
	updateTargetsForCandlestick(targets): void {
        throw new Error("STUB");
    },

	/**
	 * Generate/Update elements
	 * @param {boolean} withTransition Transition for exit elements
	 * @param {boolean} isSub Subchart draw
	 * @private
	 */
	updateCandlestick(withTransition: boolean, isSub = false): void {
        throw new Error("STUB");
    },

	/**
	 * Get draw function
	 * @param {object} indices Indice data
	 * @param {boolean} isSub Subchart draw
	 * @returns {function}
	 * @private
	 */
	generateDrawCandlestick(indices, isSub) {
        throw new Error("STUB");
    },

	/**
	 * Redraw function
	 * @param {function} drawFn Retuned functino from .generateDrawCandlestick()
	 * @param {boolean} withTransition With or without transition
	 * @param {boolean} isSub Subchart draw
	 * @returns {Array}
	 */
	redrawCandlestick(drawFn, withTransition?: boolean, isSub = false) {
        throw new Error("STUB");
    }
};
