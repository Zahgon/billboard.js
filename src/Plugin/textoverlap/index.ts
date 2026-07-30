/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {Delaunay as d3Delaunay} from "d3-delaunay";
import type {d3Selection} from "../../../types/types";
import {polygonArea, polygonCentroid} from "../../module/polygon";
import Plugin from "../Plugin";
import Options from "./Options";

/**
 * TextOverlap plugin<br>
 * Prevents label overlap using [Voronoi layout](https://en.wikipedia.org/wiki/Voronoi_diagram).
 * - **NOTE:**
 *   - Plugins aren't built-in. Need to be loaded or imported to be used.
 *   - Non required modules from billboard.js core, need to be installed separately.
 *   - Appropriate and works for axis based chart.
 * - **Required modules:**
 *   - [d3-delaunay](https://github.com/d3/d3-delaunay)
 * @class plugin-textoverlap
 * @requires d3-delaunay
 * @param {object} options TextOverlap plugin options
 * @augments Plugin
 * @returns {TextOverlap}
 * @example
 * // Plugin must be loaded before the use.
 * <script src="$YOUR_PATH/plugin/billboardjs-plugin-textoverlap.js"></script>
 *
 *  var chart = bb.generate({
 *     data: {
 *     	  columns: [ ... ]
 *     },
 *     ...
 *     plugins: [
 *        new bb.plugin.textoverlap({
 *          selector: ".bb-texts text",
 *          extent: 8,
 *          area: 3
 *        })
 *     ]
 *  });
 * @example
 * 	import {bb} from "billboard.js";
 * import TextOverlap from "billboard.js/dist/billboardjs-plugin-textoverlap";
 *
 * bb.generate({
 *     plugins: [
 *        new TextOverlap({ ... })
 *     ]
 * })
 */
export default class TextOverlap extends Plugin {
	constructor(options?: Options) {
        throw new Error("STUB");
    }

	$init(): void {
        throw new Error("STUB");
    }

	$redraw(): void {
        throw new Error("STUB");
    }

	/**
	 * Generates the voronoi layout for data labels
	 * @param {Array} points Indices values
	 * @returns {object} Voronoi layout points and corresponding Data points
	 * @private
	 */
	generateVoronoi(points: [number, number][]) {
        throw new Error("STUB");
    }

	/**
	 * Set text label's position to preventg overlap.
	 * @param {d3Selection} text target text selection
	 * @private
	 */
	preventLabelOverlap(text: d3Selection): void {
        throw new Error("STUB");
    }
}
