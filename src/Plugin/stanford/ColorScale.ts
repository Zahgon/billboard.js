/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {axisRight as d3AxisRight} from "d3-axis";
import {scaleSequential as d3ScaleSequential, scaleSymlog as d3ScaleSymlog} from "d3-scale";
import CLASS from "./classes";
import {getBBox, getRange, isFunction} from "./util";

/**
 * Simple number formatter.
 * Supports "d" specifier (decimal notation, rounded to integer).
 * @param {string} specifier Format specifier
 * @returns {function} Formatter function
 */
function format(specifier: string): (n: number) => string {
	if (specifier === "d") {
		return (n: number): string => { throw new Error("STUB"); };
	}

	// Default: return as-is
	return (n: number): string => { throw new Error("STUB"); };
}

/**
 * Stanford diagram plugin color scale class
 * @class ColorScale
 * @param {Stanford} owner Stanford instance
 * @private
 */
export default class ColorScale {
	private owner;
	private colorScale;

	constructor(owner) {
		this.owner = owner;
	}

	drawColorScale(): void {
        throw new Error("STUB");
    }

	xForColorScale(): number {
        throw new Error("STUB");
    }

	getColorScalePadding(): number {
        throw new Error("STUB");
    }
}
