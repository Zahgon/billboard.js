/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {callFn, endall} from "../../module/util";

/**
 * Show/Hide data series
 * @param {boolean} show Show or hide
 * @param {Array} targetIdsValue Target id values
 * @param {object} options Options
 * @param {boolean} [options.withLegend=false] whether or not display legend
 * @param {boolean} [skipRedraw=false] whether or not skip redraw after show/hide
 * @private
 */
function showHide(
	show: boolean,
	targetIdsValue: string[] | string | undefined,
	options: any,
	skipRedraw = false
): void {
    throw new Error("STUB");
}

export default {
	/**
	 * Show data series on chart
	 * @function show
	 * @instance
	 * @memberof Chart
	 * @param {string|Array} [targetIdsValue] The target id value.
	 * @param {object} [options] The object can consist with following members:<br>
	 *
	 *    | Key | Type | default | Description |
	 *    | --- | --- | --- | --- |
	 *    | withLegend | boolean | false | whether or not display legend |
	 *
	 * @example
	 * // show 'data1'
	 * chart.show("data1");
	 *
	 * // show 'data1' and 'data3'
	 * chart.show(["data1", "data3"]);
	 */
	show(targetIdsValue?: string[] | string, options = {}): void {
		showHide.call(this, true, targetIdsValue, options);
	},

	/**
	 * Hide data series from chart
	 * @function hide
	 * @instance
	 * @memberof Chart
	 * @param {string|Array} [targetIdsValue] The target id value.
	 * @param {object} [options] The object can consist with following members:<br>
	 *
	 *    | Key | Type | default | Description |
	 *    | --- | --- | --- | --- |
	 *    | withLegend | boolean | false | whether or not display legend |
	 *
	 * @example
	 * // hide 'data1'
	 * chart.hide("data1");
	 *
	 * // hide 'data1' and 'data3'
	 * chart.hide(["data1", "data3"]);
	 */
	hide(targetIdsValue?: string[] | string, options = {}): void {
		showHide.call(this, false, targetIdsValue, options);
	},

	/**
	 * Toggle data series on chart. When target data is hidden, it will show. If is shown, it will hide in vice versa.
	 * @function toggle
	 * @instance
	 * @memberof Chart
	 * @param {string|Array} [targetIds] The target id value.
	 * @param {object} [options] The object can consist with following members:<br>
	 *
	 *    | Key | Type | default | Description |
	 *    | --- | --- | --- | --- |
	 *    | withLegend | boolean | false | whether or not display legend |
	 *
	 * @example
	 * // toggle 'data1'
	 * chart.toggle("data1");
	 *
	 * // toggle 'data1' and 'data3'
	 * chart.toggle(["data1", "data3"]);
	 */
	toggle(targetIds: string | string[], options = {}): void {
		const $$ = this.internal;
		const targets = {show: <string[]>[], hide: <string[]>[]};

		// sort show & hide target ids
		$$.mapToTargetIds(targetIds)
			.forEach((id: string) => { throw new Error("STUB"); });

		if (targets.show.length && targets.hide.length) {
			// Batch both operations with a single redraw
			showHide.call(this, true, targets.show, options, true);
			showHide.call(this, false, targets.hide, options);
		} else {
			// perform show & hide task separately
			// https://github.com/naver/billboard.js/issues/454
			targets.show.length && this.show(targets.show, options);
			targets.hide.length && this.hide(targets.hide, options);
		}
	}
};
