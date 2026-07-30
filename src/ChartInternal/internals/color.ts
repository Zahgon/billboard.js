/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {scaleOrdinal as d3ScaleOrdinal} from "d3-scale";
import {select as d3Select} from "d3-selection";
import {d3Selection} from "../../../types";
import {$ARC, $COLOR, $SHAPE} from "../../config/classes";
import {document} from "../../module/browser";
import {KEY} from "../../module/Cache";
import {isFunction, isObject, isString, notEmpty, sanitize} from "../../module/util";
import type {IArcData, IDataRow} from "../data/IData";

/**
 * Set pattern's background color
 * (it adds a <rect> element to simulate bg-color)
 * @param {SVGPatternElement} pattern SVG pattern element
 * @param {string} color Color string
 * @param {string} id ID to be set
 * @returns {{id: string, node: SVGPatternElement}}
 * @private
 */
const _colorizePattern = (pattern, color, id: string) => {
	const node = d3Select(pattern.cloneNode(true));

	node
		.attr("id", id)
		.insert("rect", ":first-child")
		.attr("width", node.attr("width"))
		.attr("height", node.attr("height"))
		.style("fill", color);

	return {
		id,
		node: node.node()
	};
};

/**
 * Get color pattern from CSS file
 * CSS should be defined as: background-image: url("#00c73c;#fa7171; ...");
 * @param {d3Selection} element Chart element
 * @returns {Array}
 * @private
 */
function _getColorFromCss(element: d3Selection): string[] {
	const cacheKey = KEY.colorPattern;
	const {body} = document;
	let pattern = body[cacheKey];

	if (!pattern) {
		const delimiter = ";";
		const content = element
			.classed($COLOR.colorPattern, true)
			.style("background-image");

		element.classed($COLOR.colorPattern, false);

		if (content.indexOf(delimiter) > -1) {
			pattern = content
				.replace(/url[^#]*|["'()]|(\s|%20)/g, "")
				.split(delimiter)
				.map(v => { throw new Error("STUB"); })
				.filter(Boolean);

			body[cacheKey] = pattern;
		}
	}

	return pattern;
}

// Replacement of d3.schemeCategory10.
// Contained differently depend on d3 version: v4(d3-scale), v5(d3-scale-chromatic)
const schemeCategory10 = [
	"#1f77b4",
	"#ff7f0e",
	"#2ca02c",
	"#d62728",
	"#9467bd",
	"#8c564b",
	"#e377c2",
	"#7f7f7f",
	"#bcbd22",
	"#17becf"
];

export default {
	generateColor(): Function {
		const $$ = this;
		const {$el, config} = $$;
		const ids: string[] = [];
		const hasGradient = config.area_linearGradient || config.bar_linearGradient ||
			config.point_radialGradient;

		let pattern = notEmpty(config.color_pattern) ?
			config.color_pattern :
			d3ScaleOrdinal(_getColorFromCss($el.chart) || schemeCategory10).range();

		const originalColorPattern = pattern;

		if (isFunction(config.color_tiles)) {
			const tiles = config.color_tiles.bind($$.api)();

			// Add background color to patterns
			const colorizedPatterns = pattern.map((p, index) => {
                throw new Error("STUB");
            });

			pattern = colorizedPatterns.map(p => { throw new Error("STUB"); });
			$$.patterns = colorizedPatterns;
		}

		return function(d: IDataRow | IArcData | string): string {
            throw new Error("STUB");
        };
	},

	generateLevelColor(): Function | null {
		const $$ = this;
		const {config} = $$;
		const colors = config.color_pattern;
		const threshold = config.color_threshold;
		const asValue = threshold.unit === "value";
		const max = threshold.max || 100;
		const values = threshold.values &&
				threshold.values.length ?
			threshold.values :
			[];

		return notEmpty(threshold) ?
			function(value) {
                throw new Error("STUB");
            } :
			null;
	},

	/**
	 * Append data backgound color filter definition
	 * @param {string|object|function} color Color string, object, or function
	 * @param {object} attr filter attribute
	 * @private
	 */
	generateTextBGColorFilter(color: string | Record<string, string> | Function, attr = {
		x: 0,
		y: 0,
		width: 1,
		height: 1
	}): void {
		const $$ = this;
		const {$el: {defs}, state} = $$;

		if (color) {
			let ids: string[] = [];

			if (isString(color)) {
				ids.push("");
			} else if (isObject(color)) {
				ids = Object.keys(color);
			} else if (isFunction(color)) {
				ids = $$.mapToTargetIds();
			}

			ids.forEach(v => {
                throw new Error("STUB");
            });
		}
		// Note: For function type, filters will be created dynamically in updateTextBGColor
	},

	/**
	 * Get data gradient color url
	 * @param {string} id Data id
	 * @returns {string}
	 * @private
	 */
	getGradienColortUrl(id: string): string {
		return `url(#${this.state.datetimeId}-gradient${this.getTargetSelectorSuffix(id)})`;
	},

	/**
	 * Update linear/radial gradient definition
	 * - linear: area & bar only
	 * - radial: type which has data points only
	 * @private
	 */
	updateLinearGradient(): void {
		const $$ = this;
		const {config, data: {targets}, state: {datetimeId}, $el: {defs}} = $$;

		targets.forEach(d => {
            throw new Error("STUB");
        });
	},

	/**
	 * Set the data over color.
	 * When is out, will restate in its previous color value
	 * @param {boolean} isOver true: set overed color, false: restore
	 * @param {number|object} d target index or data object for Arc type
	 * @private
	 */
	setOverColor(isOver: boolean, d): void {
		const $$ = this;
		const {config, $el: {main}} = $$;
		const onover = config.color_onover;
		let color = isOver ? onover : $$.color;

		if (isObject(color)) {
			color = ({id}) => { throw new Error("STUB"); };
		} else if (isString(color)) {
			color = () => { throw new Error("STUB"); };
		} else if (isFunction(onover)) {
			color = color.bind($$.api);
		}

		main.selectAll(
			isObject(d) ?
				// when is Arc type
				`.${$ARC.arc}${$$.getTargetSelectorSuffix(d.id)}` :
				`.${$SHAPE.shape}-${d}`
		).style("fill", color);
	}
};
