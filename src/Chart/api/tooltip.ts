/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {$SHAPE} from "../../config/classes";
import {isDefined} from "../../module/util";

/**
 * Define tooltip
 * @ignore
 */
const tooltip = {
	/**
	 * Show tooltip
	 * @function tooltip․show
	 * @instance
	 * @memberof Chart
	 * @param {object} args The object can consist with following members:<br>
	 *
	 *    | Key | Type | Description |
	 *    | --- | --- | --- |
	 *    | index | Number | Determine focus by index |
	 *    | x | Number &vert; Date | Determine focus by x Axis index |
	 *    | mouse | Array | Determine x and y coordinate value relative the targeted '.bb-event-rect' x Axis.<br>It should be used along with `data`, `index` or `x` value. The default value is set as `[0,0]` |
	 *    | data | Object | When [data.xs](Options.html#.data%25E2%2580%25A4xs) option is used or [tooltip.grouped](Options.html#.tooltip) set to 'false', `should be used giving this param`.<br><br>**Key:**<br>- x {number &verbar; Date}: x Axis value<br>- index {number}: x Axis index (useless for data.xs)<br>- id {string}: data id<br>- value {number}: The corresponding value for tooltip. |
	 *
	 * @example
	 *  // show the 2nd x Axis coordinate tooltip
	 *  // for Arc(gauge, donut & pie) and radar type, approach showing tooltip by using "index" number.
	 *  chart.tooltip.show({
	 *    index: 1
	 *  });
	 *
	 *  // show tooltip for the 3rd x Axis in x:50 and y:100 coordinate of '.bb-event-rect' of the x Axis.
	 *  chart.tooltip.show({
	 *    x: 2,
	 *    mouse: [50, 100]
	 *  });
	 *
	 *  // show tooltip for timeseries x axis
	 *  chart.tooltip.show({
	 *    x: new Date("2018-01-02 00:00")
	 *  });
	 *
	 *  // treemap type can be shown by using "id" only.
	 *  chart.tooltip.show({
	 *    data: {
	 *        id: "data1"  // data id
	 *    }
	 *  });
	 *
	 *  // for Arc types, specify 'id' or 'index'
	 *  chart.tooltip.show({ data: { id: "data2" }});
	 *  chart.tooltip.show({ data: { index: 2 }});
	 *
	 *  // when data.xs is used
	 *  chart.tooltip.show({
	 *    data: {
	 *        x: 3,  // x Axis value
	 *        id: "data1",  // data id
	 *        value: 500  // data value
	 *    }
	 *  });
	 *
	 *  // when data.xs isn't used, but tooltip.grouped=false is set
	 *  chart.tooltip.show({
	 *    data: {
	 *        index: 3,  // or 'x' key value
	 *        id: "data1",  // data id
	 *        value: 500  // data value
	 *    }
	 *  });
	 */
	show: function(args): void {
        throw new Error("STUB");
    },

	/**
	 * Hide tooltip
	 * @function tooltip․hide
	 * @instance
	 * @memberof Chart
	 */
	hide: function(): void {
        throw new Error("STUB");
    }
};

export default {tooltip};
