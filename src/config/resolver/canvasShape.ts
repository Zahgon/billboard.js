/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import shapeBubbleCommon from "../../ChartInternal/shape/core/bubble";
import shapeCandlestickCommon from "../../ChartInternal/shape/core/candlestick";
import shapeTreemapCommon from "../../ChartInternal/shape/core/treemap";
import {TYPE} from "../const";
import optPoint from "../Options/common/point";
import optArea from "../Options/shape/area";
import optBar from "../Options/shape/bar";
import optBubble from "../Options/shape/bubble";
import optCandlestick from "../Options/shape/candlestick";
import optLine from "../Options/shape/line";
import optScatter from "../Options/shape/scatter";
import optSpline from "../Options/shape/spline";
import optTreemap from "../Options/shape/treemap";
import {extendAxisModules} from "./axis.core";

/**
 * Canvas line shape marker.
 * Installed to satisfy chart type import checks without importing SVG line renderer.
 * @private
 */
const canvasLineModule = {
	/**
	 * No-op canvas line initializer.
	 * Canvas mode creates drawing surfaces through canvas().
	 * @private
	 */
	initLine(): void {
        throw new Error("STUB");
    }
};

/**
 * Canvas area shape marker.
 * Installed to satisfy chart type import checks without importing SVG area renderer.
 * @private
 */
const canvasAreaModule = {
	/**
	 * No-op canvas area initializer.
	 * Canvas mode creates drawing surfaces through canvas().
	 * @private
	 */
	initArea(): void {
        throw new Error("STUB");
    }
};

/**
 * Canvas bar shape marker.
 * Installed to satisfy chart type import checks without importing SVG bar renderer.
 * @private
 */
const canvasBarModule = {
	/**
	 * No-op canvas bar initializer.
	 * Canvas mode creates drawing surfaces through canvas().
	 * @private
	 */
	initBar(): void {
        throw new Error("STUB");
    }
};

/**
 * Canvas point shape marker.
 * Installed to satisfy chart type import checks without importing SVG point renderer.
 * @private
 */
const canvasPointModule = {
	/**
	 * No-op canvas circle initializer.
	 * Canvas mode draws circles through CanvasRenderer.
	 * @private
	 */
	initCircle(): void {}
};

/**
 * Canvas candlestick shape marker.
 * Installed to satisfy chart type import checks without importing SVG candlestick renderer.
 * @private
 */
const canvasCandlestickModule = {
	/**
	 * No-op canvas candlestick initializer.
	 * Canvas mode draws candlesticks through CanvasRenderer.
	 * @private
	 */
	initCandlestick(): void {
        throw new Error("STUB");
    }
};

/**
 * Canvas treemap shape marker.
 * Installed to satisfy chart type import checks without importing SVG treemap renderer.
 * @private
 */
const canvasTreemapModule = {
	/**
	 * Initialize the shared treemap layout without SVG elements.
	 * @private
	 */
	initTreemap(): void {
        throw new Error("STUB");
    }
};

/**
 * Extend axis/options needed by canvas axis-based shapes without importing SVG shape modules.
 * @param {Array<object>} module Internal modules
 * @param {Array<object>} option Option modules
 * @private
 */
function extendCanvasAxisShape(module: any[] = [], option: any[] = []): void {
	extendAxisModules(module, option);
}

/**
 * Register modules and options required for canvas line charts.
 * @returns {string} Line chart type
 */
export let line = (): string => { throw new Error("STUB"); };

/**
 * Register modules and options required for canvas spline charts.
 * @returns {string} Spline chart type
 */
export let spline = (): string => { throw new Error("STUB"); };

/**
 * Register modules and options required for canvas step charts.
 * @returns {string} Step chart type
 */
export let step = (): string => { throw new Error("STUB"); };

/**
 * Register modules and options required for canvas area charts.
 * @returns {string} Area chart type
 */
export let area = (): string => { throw new Error("STUB"); };

/**
 * Register modules and options required for canvas area-line-range charts.
 * @returns {string} Area line range chart type
 */
export let areaLineRange = (): string => { throw new Error("STUB"); };

/**
 * Register modules and options required for canvas area-spline charts.
 * @returns {string} Area spline chart type
 */
export let areaSpline = (): string => { throw new Error("STUB"); };

/**
 * Register modules and options required for canvas area-spline-range charts.
 * @returns {string} Area spline range chart type
 */
export let areaSplineRange = (): string => { throw new Error("STUB"); };

/**
 * Register modules and options required for canvas area-step charts.
 * @returns {string} Area step chart type
 */
export let areaStep = (): string => { throw new Error("STUB"); };

/**
 * Register modules and options required for canvas area-step-range charts.
 * @returns {string} Area step range chart type
 */
export let areaStepRange = (): string => { throw new Error("STUB"); };

/**
 * Register modules and options required for canvas bar charts.
 * @returns {string} Bar chart type
 */
export let bar = (): string => { throw new Error("STUB"); };

/**
 * Register modules and options required for canvas scatter charts.
 * @returns {string} Scatter chart type
 */
export let scatter = (): string => { throw new Error("STUB"); };

/**
 * Register modules and options required for canvas bubble charts.
 * @returns {string} Bubble chart type
 */
export let bubble = (): string => { throw new Error("STUB"); };

/**
 * Register modules and options required for canvas candlestick charts.
 * @returns {string} Candlestick chart type
 */
export let candlestick = (): string => { throw new Error("STUB"); };

/**
 * Register modules and options required for canvas treemap charts.
 * @returns {string} Treemap chart type
 */
export let treemap = (): string => (
	extendCanvasAxisShape(
		[canvasTreemapModule, shapeTreemapCommon],
		[optTreemap]
	), (treemap = () => { throw new Error("STUB"); })()
);
