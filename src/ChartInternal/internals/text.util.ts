/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {select as d3Select} from "d3-selection";
import {$TEXT} from "../../config/classes";
import {
	getBBox,
	getBoundingRect,
	isFunction,
	isNumber,
	parseShorthand,
	toMap,
	tplProcess
} from "../../module/util";
import type {IArcData, IData, IDataRow} from "../data/IData";

type TCoord = {x: number, y: number};
type TAnchor = "start" | "middle" | "end";
type TImage = {url: string, width: number, height: number, pos: {x: number, y: number}} | null;
type TLabelThresholdType = "bar" | "donut" | "gauge" | "pie" | "polar" | "treemap";

/**
 * Get text-anchor according text.labels.rotate angle
 * @param {number} angle Angle value
 * @returns {string} Anchor string value
 * @private
 */
function getRotateAnchor(angle: number): TAnchor {
	let anchor: TAnchor = "middle";

	if (angle > 0 && angle <= 170) {
		anchor = "end";
	} else if (angle > 190 && angle <= 360) {
		anchor = "start";
	}

	return anchor;
}

/**
 * Set rotated position coordinate according text.labels.rotate angle
 * @param {object} d Data object
 * @param {object} pos Position object
 * @param {object} pos.x x coordinate
 * @param {object} pos.y y coordinate
 * @param {string} anchor string value
 * @param {boolean} isRotated If axis is rotated
 * @param {boolean} isInverted If axis is inverted
 * @returns {object} x, y coordinate
 * @private
 */
function setRotatePos(
	d: IDataRow,
	pos: TCoord,
	anchor: TAnchor,
	isRotated: boolean,
	isInverted: boolean
): TCoord {
	const $$ = this;
	const {value} = d;
	const isCandlestickType = $$.isCandlestickType(d);
	const isNegative = (isNumber(value) && value < 0) || (
		isCandlestickType && !$$.getCandlestickData(d)?._isUp
	);

	let {x, y} = pos;
	const gap = 4;
	const doubleGap = gap * 2;

	if (isRotated) {
		if (anchor === "start") {
			x += isNegative ? 0 : doubleGap;
			y += gap;
		} else if (anchor === "middle") {
			x += doubleGap;
			y -= doubleGap;
		} else if (anchor === "end") {
			isNegative && (x -= doubleGap);
			y += gap;
		}
	} else {
		if (anchor === "start") {
			x += gap;
			isNegative && (y += doubleGap * 2);
		} else if (anchor === "middle") {
			y -= doubleGap;
		} else if (anchor === "end") {
			x -= gap;
			isNegative && (y += doubleGap * 2);
		}

		if (isInverted) {
			y += isNegative ? -17 : (isCandlestickType ? 13 : 7);
		}
	}

	return {x, y};
}

/**
 * Get data.labels.position value
 * @param {object} d Data object
 * @param {string} type x | y
 * @returns {number} Position value
 * @private
 */
function getTextPos(d: IDataRow, type: string): number {
	const position = this.config.data_labels_position;
	const {id, index, value} = d;

	return (
		isFunction(position) ?
			position.bind(this.api)(type, value, id, index, this.$el.text) :
			(id in position ? position[id] : position)[type]
	) ?? 0;
}

/**
 * Update text border
 * @param {SVGTextElement} text Text element
 * @param {Coord} pos Position object
 * @param {string} rectClass Class name
 * @private
 */
function updateTextBorder(text: SVGTextElement, pos: TCoord, rectClass: string): void {
	const $$ = this;
	const {config, $T} = $$;
	const isRotated = config.axis_rotated;
	const {
		border: {
			padding = "3 5",
			radius = 10,
			stroke = "#000",
			strokeWidth = 1,
			fill = "none"
		}
	} = config.data_labels;

	const borderPadding = parseShorthand(padding);
	const applyStyle = config.data_labels.border !== true;
	const textRect = getBBox(text);
	let borderRect = d3Select(text.previousElementSibling) as any;

	if (
		borderRect.empty() ||
		borderRect.node()?.tagName !== "rect" ||
		!borderRect.attr("class")?.includes(rectClass)
	) {
		borderRect = d3Select(text.parentNode as Element)
			.insert("rect", () => { throw new Error("STUB"); })
			.attr("class", `${$TEXT.textBorderRect} ${rectClass}`)
			.attr("width",
				textRect.width + (applyStyle ? borderPadding.left + borderPadding.right : 0))
			.attr("height",
				textRect.height + (applyStyle ? borderPadding.top + borderPadding.bottom : 0));

		if (applyStyle) {
			borderRect
				.style("fill", fill)
				.style("stroke", stroke)
				.style("stroke-width", `${strokeWidth}px`)
				.attr("rx", radius)
				.attr("ry", radius);
		}
	}

	$T(borderRect)
		.attr("x",
			pos.x - (applyStyle ? borderPadding.left : 0) - (isRotated ? 0 : textRect.width / 2))
		.attr("y", pos.y - (applyStyle ? borderPadding.top : 0) - (textRect.height / 4 * 3.2));
}

/**
 * Check if meets the ratio to show data label text
 * @param {number} ratio ratio to meet
 * @param {string} type chart type
 * @returns {boolean}
 * @private
 */
function meetsLabelThreshold(ratio: number = 0, type: TLabelThresholdType): boolean {
	const $$ = this;
	const {config} = $$;
	const threshold = config[`${type}_label_threshold`] || 0;

	return ratio >= threshold;
}

/**
 * Update text image
 * @private
 */
function updateTextImage(): void {
	const $$ = this;
	const {$el: {text}, config} = $$;
	const isArc = $$.state.arcWidth;

	if (isArc ? $$.getArcLabelConfig("image") : config.data_labels.image) {
		text.filter(function() {
            throw new Error("STUB");
        }).each(function(d) {
            throw new Error("STUB");
        });
	}
}

/**
 * Get image URL for data label
 * @param {object} d Data object
 * @returns {string|null} Image URL
 * @private
 */
function getDataLabelImgUrl(
	d: IDataRow
): TImage | null {
    throw new Error("STUB");
}

/**
 * Update text image position
 * @param {SVGTextElement} textNode Text element
 * @param {object} pos Position object
 * @param {number} pos.x X coordinate
 * @param {number} pos.y Y coordinate
 * @param {DOMRect|SVGRect} textRect Optional cached text dimensions
 * @private
 */
function updateTextImagePos(
	textNode: SVGTextElement,
	pos: {x: number, y: number},
	textRect?: DOMRect | SVGRect
): void {
	const $$ = this;
	const {config, state: {arcWidth, hasTreemap}} = $$;
	const isRotated = config.axis_rotated;
	const image = d3Select(textNode.previousElementSibling);
	const isShown = textNode => {
		const isShown = textNode.style.opacity !== "0" && textNode.style.fillOpacity !== "0";

		return (arcWidth ? textNode.textContent : isShown) &&
			this.previousElementSibling?.tagName !== "image";
	};

	if (!image.empty() && image.node()?.tagName === "image") {
		const textDimension = textRect || getBoundingRect(textNode);
		const w = +image.attr("width") / 2;
		const h = +image.attr("height") / 2;
		let x = pos.x - w;
		let y = pos.y - h - textDimension.height / 2;

		if (isRotated) {
			pos.x += w;
		} else {
			if (hasTreemap) {
				x = -w;
				y = -(h * 2 + textDimension.height);
			}

			// exclude pie & polar type
			if (!($$.hasType("pie") || $$.hasType("polar"))) {
				pos.y += h;
			}
		}

		$$.$T(image)
			.style("opacity", isShown(textNode) ? null : "0")
			.attr("x", x)
			.attr("y", y);
	}
}

/**
 * Batch getBBox() calls to avoid layout thrashing
 * Collects all bbox calculations in a single read phase
 * @param {SVGTextElement[]} elements Array of text elements
 * @returns {Map<SVGTextElement, DOMRect>} Map of element to bbox
 * @private
 */
function batchGetBBox(elements: SVGTextElement[]): Map<SVGTextElement, DOMRect> {
	// Single read phase - batch all getBBox calls together
	// This prevents layout thrashing by avoiding interleaved reads/writes
	return toMap(
		elements,
		element => { throw new Error("STUB"); },
		element => { throw new Error("STUB"); }
	);
}

export {
	batchGetBBox,
	getRotateAnchor,
	getTextPos,
	meetsLabelThreshold,
	setRotatePos,
	updateTextBorder,
	updateTextImage,
	updateTextImagePos
};
