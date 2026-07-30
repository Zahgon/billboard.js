/**
 * Copyright (c) 2021 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import type {IData} from "../../ChartInternal/data/IData";
import {$COMMON} from "../../config/classes";
import {getBoundingRect} from "../../module/util";
import Plugin from "../Plugin";
import Options from "./Options";

/**
 * Sparkline plugin.<br>
 * Generates sparkline charts
 * - **NOTE:**
 *   - Plugins aren't built-in. Need to be loaded or imported to be used.
 *   - Non required modules from billboard.js core, need to be installed separately.
 *
 * - **Bear in mind:**
 * - Use this plugin to visualize multiple tiny chart only and chart APIs won't work properly.
 * - Sparkline chart size will be based on the main chart element size. To control spakrline charts, is highly recommended to set `size` option.
 * - Bubble, scatter and Arc(pie, donut, ratdar) types aren't supported.
 * - Some options will be stricted to be:
 *   - `resize.auto = false`
 *   - `axis.x.show = false`
 *   - `axis.y.show = false`
 *   - `axis.y.padding = 10`
 *   - `legend.show = false`
 *
 * @class plugin-sparkline
 * @param {object} options sparkline plugin options
 * @augments Plugin
 * @returns {Sparkline}
 * @example
 * // Plugin must be loaded before the use.
 * <script src="$YOUR_PATH/plugin/billboardjs-plugin-sparkline.js"></script>
 *
 *  var chart = bb.generate({
 *     ...
 *     plugins: [
 *        	new bb.plugin.sparkline({
 *        	  selector: ".sparkline"
 *        	}),
 *     ]
 *  });
 * @example
 * import {bb} from "billboard.js";
 * import Sparkline from "billboard.js/dist/billboardjs-plugin-sparkline";
 *
 * bb.generate({
 *     ...
 *     plugins: [
 *        new Sparkline({ ... })
 *     ]
 * })
 */
export default class Sparkline extends Plugin {
	static version = `0.0.1`;
	private element;

	constructor(options) {
        throw new Error("STUB");
    }

	$beforeInit(): void {
        throw new Error("STUB");
    }

	validate(): void {
        throw new Error("STUB");
    }

	overrideInternals(): void {
        throw new Error("STUB");
    }

	overrideOptions(): void {
        throw new Error("STUB");
    }

	$init(): void {
        throw new Error("STUB");
    }

	$afterInit(): void {
        throw new Error("STUB");
    }

	/**
	 * Bind tooltip event handlers for each sparkline elements.
	 * @param {boolean} bind or unbind
	 * @private
	 */
	bindEvents(bind = true): void {
        throw new Error("STUB");
    }

	overHandler(e): void {
        throw new Error("STUB");
    }

	moveHandler(e): void {
        throw new Error("STUB");
    }

	outHandler(e): void {
        throw new Error("STUB");
    }

	$redraw(): void {
        throw new Error("STUB");
    }

	$willDestroy(): void {
        throw new Error("STUB");
    }
}
