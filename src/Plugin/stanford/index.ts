/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
// @ts-nocheck
import {interpolateHslLong as d3InterpolateHslLong} from "d3-interpolate";
import {scaleSequentialLog as d3ScaleSequentialLog} from "d3-scale";
import {$TOOLTIP} from "../../config/classes";
import Plugin from "../Plugin";
import ColorScale from "./ColorScale";
import Elements from "./Elements";
import Options from "./Options";
import {compareEpochs, isEmpty, isFunction, pointInRegion} from "./util";

/**
 * HSL color object compatible with d3-interpolate
 */
interface HSLColor {
	h: number;
	s: number;
	l: number;
	opacity: number;
}

/**
 * Creates an HSL color object.
 * @param {number} h Hue (0-360)
 * @param {number} s Saturation (0-1)
 * @param {number} l Lightness (0-1)
 * @param {number} opacity Opacity (0-1), defaults to 1
 * @returns {HSLColor} HSL color object
 */
function hsl(h: number, s: number, l: number, opacity: number = 1): HSLColor {
    throw new Error("STUB");
}

/**
 * Stanford diagram plugin
 * - **NOTE:**
 *   - Plugins aren't built-in. Need to be loaded or imported to be used.
 *   - Non required modules from billboard.js core, need to be installed separately.
 *   - Is preferable use `scatter` as data.type
 * - **Required modules:**
 *   - [d3-selection](https://github.com/d3/d3-selection)
 *   - [d3-interpolate](https://github.com/d3/d3-interpolate)
 *   - [d3-scale](https://github.com/d3/d3-scale)
 *   - [d3-brush](https://github.com/d3/d3-brush)
 *   - [d3-axis](https://github.com/d3/d3-axis)
 * @class plugin-stanford
 * @requires d3-selection
 * @requires d3-interpolate
 * @requires d3-scale
 * @requires d3-brush
 * @requires d3-axis
 * @param {object} options Stanford plugin options
 * @augments Plugin
 * @returns {Stanford}
 * @example
 * // Plugin must be loaded before the use.
 * <script src="$YOUR_PATH/plugin/billboardjs-plugin-stanford.js"></script>
 *
 *  var chart = bb.generate({
 *     data: {
 *        columns: [ ... ],
 *        type: "scatter"
 *     }
 *     ...
 *     plugins: [
 *        new bb.plugin.stanford({
 *           colors: d3.interpolateHslLong(
 *              d3.hsl(250, 1, 0.5), d3.hsl(0, 1, 0.5)
 *           ),
 *           epochs: [ 1, 1, 2, 2, ... ],
 *           lines: [
 *                  { x1: 0, y1: 0, x2: 65, y2: 65, class: "line1" },
 *                  { x1: 0, x2: 65, y1: 40, y2: 40, class: "line2" }
 *           ],
 *           scale: {
 *           	max: 10000,
 *             	min: 1,
 *           	width: 500,
 *             	format: 'pow10',
 *           },
 *           padding: {
 *           	top: 15,
 *           	right: 0,
 *           	bottom: 0,
 *           	left: 0
 *           },
 *           regions: [
 *           	{
 *               	points: [ // add points counter-clockwise
 *               	    { x: 0, y: 0 },
 *               	    { x: 40, y: 40 },
 *               	    { x: 0, y: 40 }
 *               	],
 *               	text: function (value, percentage) {
 *               	    return `Normal Operations: ${value} (${percentage}%)`;
 *               	},
 *               	opacity: 0.2, // 0 to 1
 *               	class: "test-polygon1"
 *              },
 *             	...
 *           ]
 *        }
 *     ]
 *  });
 * @example
 * 	import {bb} from "billboard.js";
 * import Stanford from "billboard.js/dist/billboardjs-plugin-stanford";
 *
 * bb.generate({
 *     plugins: [
 *        new Stanford({ ... })
 *     ]
 * })
 */
export default class Stanford extends Plugin {
	private colorScale;
	private elements;

	constructor(options) {
        throw new Error("STUB");
    }

	$beforeInit(): void {
        throw new Error("STUB");
    }

	$init(): void {
        throw new Error("STUB");
    }

	$redraw(duration?: number): void {
        throw new Error("STUB");
    }

	getOptions(): Options {
        throw new Error("STUB");
    }

	convertData(): void {
		const data = this.$$.data.targets;
		const epochs = this.options.epochs;

		data.forEach(d => {
            throw new Error("STUB");
        });
	}

	initStanfordData(): void {
        throw new Error("STUB");
    }

	getStanfordPointColor(d) {
        throw new Error("STUB");
    }

	setStanfordTooltip(): string | undefined {
        throw new Error("STUB");
    }

	countEpochsInRegion(region): {value: number, percentage: number} {
        throw new Error("STUB");
    }
}
