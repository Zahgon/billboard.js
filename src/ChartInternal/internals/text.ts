/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {select as d3Select, selectAll as d3SelectAll} from "d3-selection";
import type {AxisType, d3Selection} from "../../../types/types";
import {$COMMON, $TEXT} from "../../config/classes";
import {KEY} from "../../module/Cache";
import {
	capitalize,
	getBBox,
	getBoundingRect,
	getElementPos,
	getRandom,
	getTranslation,
	isFunction,
	isNumber,
	isObject,
	isString,
	setTextValue
} from "../../module/util";
import type {IArcData, IDataRow} from "../data/IData";
import {
	batchGetBBox,
	getRotateAnchor,
	getTextPos,
	meetsLabelThreshold,
	setRotatePos,
	updateTextBorder,
	updateTextImage,
	updateTextImagePos
} from "./text.util";

type TTextLabelDimension = {bbox?: DOMRect | SVGRect, rect: DOMRect | SVGRect};

export default {
	opacityForText(d): null | "0" {
        throw new Error("STUB");
    },

	/**
	 * Initializes the text
	 * @private
	 */
	initText(): void {
		const {$el} = this;

		$el.main.select(`.${$COMMON.chart}`).append("g")
			.attr("class", $TEXT.chartTexts)
			.style("pointer-events", $el.funnel || $el.treemap ? "none" : null);
	},

	/**
	 * Update chartText
	 * @param {object} targets $$.data.targets
	 * @private
	 */
	updateTargetsForText(targets): void {
		const $$ = this;
		const classChartText = $$.getChartClass("Text");
		const classTexts = $$.getClass("texts", "id");

		const classFocus = $$.classFocus.bind($$);
		const mainTextUpdate = $$.$el.main.select(`.${$TEXT.chartTexts}`)
			.selectAll(`.${$TEXT.chartText}`)
			.data($$.filterNullish(targets))
			.attr("class", d => { throw new Error("STUB"); });

		const mainTextEnter = mainTextUpdate.enter().append("g")
			.style("opacity", "0")
			.attr("class", classChartText)
			.call(
				$$.setCssRule(true, ` .${$TEXT.text}`, ["fill", "pointer-events:none"],
					$$.updateTextColor)
			);

		mainTextEnter.append("g")
			.attr("class", classTexts);
	},

	/**
	 * Update text
	 * @private
	 */
	updateText(): void {
		const $$ = this;
		const {$el, $T, config, axis} = $$;
		const classText = $$.getClass("text", "index");
		const labelsCentered = config.data_labels.centered;

		const text = $el.main.selectAll(`.${$TEXT.texts}`)
			.selectAll(`.${$TEXT.text}`)
			.data($$.labelishData.bind($$));

		$T(text.exit())
			.style("fill-opacity", "0")
			.remove();

		$el.text = text.enter()
			.append("text")
			.merge(text)
			.attr("class", classText)
			.attr("text-anchor", d => {
                throw new Error("STUB");
            })
			.style("fill", $$.getStylePropValue($$.updateTextColor))
			.style("fill-opacity", "0")
			.each(function(d, i, texts) {
                throw new Error("STUB");
            });

		// Add images if imgUrl is specified
		updateTextImage.call($$);
	},

	updateTextColor(d): null | object | string {
		const $$ = this;
		const {config} = $$;
		const labelColors = config.data_labels_colors;
		const defaultColor =
			($$.isArcType(d) && !$$.isRadarType(d)) || $$.isFunnelType(d) || $$.isTreemapType(d) ?
				null :
				$$.color(d);
		let color;

		if (isString(labelColors)) {
			color = labelColors;
		} else if (isObject(labelColors)) {
			const {id} = d.data || d;

			color = labelColors[id];
		} else if (isFunction(labelColors)) {
			color = labelColors.bind($$.api)(defaultColor, d);
		}

		if ($$.isCandlestickType(d) && !isFunction(labelColors)) {
			const value = $$.getCandlestickData(d);

			if (!value?._isUp) {
				const downColor = config.candlestick_color_down;

				color = isObject(downColor) ? downColor[d.id] : downColor;
			}
		}

		return color || defaultColor;
	},

	/**
	 * Update data label text background color
	 * @param {object} d Data object
	 * @param {object|string|function} option option object
	 * @returns {string|null}
	 * @private
	 */
	updateTextBGColor(d: IDataRow | IArcData, option): string | null {
		const $$ = this;
		const {$el: {defs}} = $$;
		let color: string = "";

		if (option) {
			const id = isString(option) ?
				"" :
				$$.getTargetSelectorSuffix("id" in d ? d.id : d.data.id);
			const filter = defs.select(["filter[id*='labels-bg", "']"].join(id));

			if (filter.size()) {
				color = `url(#${filter.attr("id")})`;
			}

			if (isFunction(option)) {
				$$.generateTextBGColorFilter(option);

				// Get default color and call function
				const defaultColor = $$.color(d);
				const bgColor = option.bind($$.api)(defaultColor, d);

				if (bgColor) {
					filter.select("feFlood").attr("flood-color", bgColor);
				} else {
					color = "";
				}
			}
		}

		return color || null;
	},

	/**
	 * Redraw chartText
	 * @param {function} getX Positioning function for x
	 * @param {function} getY Positioning function for y
	 * @param {boolean} forFlow Weather is flow
	 * @param {boolean} withTransition transition is enabled
	 * @returns {Array}
	 * @private
	 */
	redrawText(getX, getY, forFlow?: boolean, withTransition?: boolean): true {
		const $$ = this;
		const {$T, axis, config, state: {hasTreemap}} = $$;
		const t = <string>getRandom(true);
		const isRotated = config.axis_rotated;
		const angle = config.data_labels.rotate;
		const anchorString = getRotateAnchor(angle);
		const rotateString = angle ? `rotate(${angle})` : "";

		const text = $$.$el.text
			.style("fill", $$.getStylePropValue($$.updateTextColor))
			.attr("filter",
				d => { throw new Error("STUB"); })
			.style("fill-opacity", forFlow ? 0 : $$.opacityForText.bind($$));

		// Phase 1: collect text dimensions before mutating label positions.
		const dimensions = new Map<SVGTextElement, TTextLabelDimension>();
		const elementsToMeasure: SVGTextElement[] = [];

		text.each(function(d) {
            throw new Error("STUB");
        });

		if (elementsToMeasure.length > 0) {
			batchGetBBox(elementsToMeasure).forEach((bbox, element) => {
                throw new Error("STUB");
            });
		}

		// Phase 2: apply cached dimensions during position calculation.
		text.each(function(d: IDataRow, i: number) {
            throw new Error("STUB");
        });

		// need to return 'true' as of being pushed to the redraw list
		// ref: getRedrawList()
		return true;
	},

	/**
	 * Gets the getBoundingClientRect value of the element
	 * @param {HTMLElement|d3.selection|Array} source Target element
	 * @param {string} className Class name
	 * @returns {object} value of element.getBoundingClientRect()
	 * @private
	 */
	getTextRect(source: d3Selection | SVGElement | number[], className: string): DOMRect[] {
		const $$ = this;
		let cacheKey;
		let base;
		let text;

		if (Array.isArray(source)) {
			cacheKey = `${KEY.textRect}-${source.join("_")}`;
		} else {
			base = (source as d3Selection).node?.() ?? source as SVGElement;

			if (!/text/i.test(base.tagName)) {
				base = base.querySelector("text");
			}

			text = base.textContent;
			cacheKey = `${KEY.textRect}-${text.replace(/\W/g, "_")}`;
		}

		const rect = $$.cache.get(cacheKey) || [];

		if (rect.length === 0) {
			($$.$el.svg || $$.$el.chart.select("svg"))
				.selectAll(`.${$COMMON.dummy}`)
				.data(text ? [text] : source)
				.enter()
				.append("text")
				.style("visibility", "hidden")
				.style("font", base ? d3Select(base).style("font") : null)
				.classed(className || $COMMON.dummy, true)
				.text(d => { throw new Error("STUB"); })
				.each(function(v, i) {
                    throw new Error("STUB");
                })
				.remove();

			$$.cache.add(cacheKey, rect);
		}

		return rect.length > 1 ? rect : rect[0];
	},

	/**
	 * Gets the x or y coordinate of the text
	 * @param {object} indices Indices values
	 * @param {boolean} forX whether or not to x
	 * @returns {function} coordinates
	 * @private
	 */
	generateXYForText(indices,
		forX?: boolean): (d, i, labelDimension?: TTextLabelDimension) => number {
		const $$ = this;
		const {state: {hasRadar, hasFunnel, hasTreemap}} = $$;
		const types = Object.keys(indices);
		const points = {};
		const getter = forX ? $$.getXForText : $$.getYForText;

		hasFunnel && types.push("funnel");
		hasRadar && types.push("radar");
		hasTreemap && types.push("treemap");

		types.forEach(v => {
            throw new Error("STUB");
        });

		return function(d, i, labelDimension?: TTextLabelDimension) {
            throw new Error("STUB");
        };
	},

	/**
	 * Get centerized text position for bar type data.label.text
	 * @param {object} d Data object
	 * @param {Array} points Data points position
	 * @param {HTMLElement} textElement Data label text element
	 * @param {string} type 'x' or 'y'
	 * @param {object} labelDimension Optional cached label dimensions
	 * @returns {number} Position value
	 * @private
	 */
	getCenteredTextPos(d, points, textElement: SVGTextElement, type: "x" | "y",
		labelDimension?: TTextLabelDimension): number {
        throw new Error("STUB");
    },

	/**
	 * Gets the x coordinate of the text
	 * @param {object} points Data points position
	 * @param {object} d Data object
	 * @param {HTMLElement} textElement Data label text element
	 * @param {object} labelDimension Optional cached label dimensions
	 * @returns {number} x coordinate
	 * @private
	 */
	getXForText(points, d: IDataRow, textElement, labelDimension?: TTextLabelDimension): number {
        throw new Error("STUB");
    },

	/**
	 * Gets the y coordinate of the text
	 * @param {object} points Data points position
	 * @param {object} d Data object
	 * @param {HTMLElement} textElement Data label text element
	 * @param {object} labelDimension Optional cached label dimensions
	 * @returns {number} y coordinate
	 * @private
	 */
	getYForText(points, d, textElement, labelDimension?: TTextLabelDimension): number {
        throw new Error("STUB");
    },

	/**
	 * Calculate if two or more text nodes are overlapping
	 * Mark overlapping text nodes with "text-overlapping" class
	 * @param {string} id Axis id
	 * @param {ChartInternal} $$ ChartInternal context
	 * @param {string} selector Selector string
	 * @private
	 */
	markOverlapped(id: AxisType, $$, selector: string): void {
		const textNodes = $$.$el.arcs.selectAll(selector);
		const filteredTextNodes = textNodes.filter(node => { throw new Error("STUB"); });
		const textNode = textNodes.filter(node => { throw new Error("STUB"); });
		const translate = getTranslation(textNode.node());

		// Calculates the length of the hypotenuse
		const calcHypo = (x, y) => Math.sqrt(x * x + y * y);

		textNode.node() && filteredTextNodes.each(function() {
            throw new Error("STUB");
        });
	},

	/**
	 * Calculate if two or more text nodes are overlapping
	 * Remove "text-overlapping" class on selected text nodes
	 * @param {ChartInternal} $$ ChartInternal context
	 * @param {string} selector Selector string
	 * @private
	 */
	undoMarkOverlapped($$, selector): void {
		$$.$el.arcs.selectAll(selector)
			.each(function() {
                throw new Error("STUB");
            });
	}
};
