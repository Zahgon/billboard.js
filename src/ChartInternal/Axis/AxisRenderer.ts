/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 * @ignore
 */
import {select as d3Select} from "d3-selection";
import type {d3Selection} from "../../../types/types";
import {$COMMON} from "../../config/classes";
import {AXIS_TICK_LENGTH, AXIS_TICK_PADDING, AXIS_TICK_SIZE} from "../../config/const";
import {isArray, isFunction, isNumber, isString, toArray} from "../../module/util";
import Helper from "./AxisRendererHelper";

/**
 * Get the corresponding main axis id for subchart axis ids.
 * @param {string} id Axis id
 * @returns {string} Base axis id
 * @private
 */
function getBaseAxisId(id: string): string {
	return id === "subX" ? "x" : (
		id === "subY" ? "y" : (
			id === "subY2" ? "y2" : id
		)
	);
}

/**
 * Get config option prefix for an axis id.
 * @param {string} id Axis id
 * @returns {string} Option prefix
 * @private
 */
function getAxisOptionPrefix(id: string): string {
	const type = getBaseAxisId(id);

	return /^sub/.test(id) ? `subchart_axis_${type}` : `axis_${type}`;
}

export default class AxisRenderer {
	private helper;
	private config;
	private params;
	private g;
	private generatedTicks: (Date | number)[] = [];

	private canReuseTickTextOnResize(isLeftRight: boolean): boolean {
		const {config, params} = this;
		const {config: chartConfig, id, owner} = params;
		const isX = /^(x|subX)$/.test(id);
		const type = getBaseAxisId(id);
		const customTickFormat = /^sub/.test(id) ?
			chartConfig[`subchart_axis_${type}_tick_format`] ||
			chartConfig[`axis_${type}_tick_format`] :
			chartConfig[`axis_${type}_tick_format`];
		const categoryAutoWrap = params.tickMultiline && params.isCategory && !isLeftRight &&
			!(params.tickWidth > 0);

		return !!(
			owner.state.resizing &&
			!owner.state.flowing &&
			!isFunction(chartConfig.axis_evalTextSize) &&
			!customTickFormat &&
			!params.tickTitle &&
			!(isX && chartConfig.axis_x_tick_autorotate) &&
			!categoryAutoWrap &&
			config.withoutTransition
		);
	}

	private canReuseTickNodesOnResize(tickNodes: d3Selection, ticks, isLeftRight: boolean,
		tickShow): boolean {
		if (
			tickShow.tick || !tickShow.text || !this.canReuseTickTextOnResize(isLeftRight) ||
			tickNodes.size() !== ticks.length
		) {
			return false;
		}

		const nodes = tickNodes.nodes();

		for (let i = 0; i < ticks.length; i++) {
			const current = (nodes[i] as any).__data__;
			const next = ticks[i];

			if (current instanceof Date || next instanceof Date) {
				if (+current !== +next) {
					return false;
				}
			} else if (current !== next) {
				return false;
			}
		}

		return true;
	}

	constructor(params: any = {}) {
        throw new Error("STUB");
    }

	/**
	 * Create axis element
	 * @param {d3.selection} g Axis selection
	 * @private
	 */
	create(g: d3Selection): void {
		const ctx = this;
		const {config, helper, params} = ctx;
		const {scale} = helper;
		const {orient} = config;
		const splitTickText = this.splitTickText.bind(ctx);
		const isLeftRight = /^(left|right)$/.test(orient);
		const isTopBottom = /^(top|bottom)$/.test(orient);

		// line/text enter and path update
		const tickTransform = helper.getTickTransformSetter(isTopBottom ? "x" : "y");
		const axisPx = tickTransform === helper.axisX ? "y" : "x";
		const sign = /^(top|left)$/.test(orient) ? -1 : 1;

		// tick text helpers
		const rotate = params.tickTextRotate;

		this.config.range = scale.rangeExtent ?
			scale.rangeExtent() :
			helper.scaleExtent((params.orgXScale || scale).range());

		const {innerTickSize, tickLength, range} = config;

		// // get the axis' tick position configuration
		const id = params.id;
		const type = getBaseAxisId(id);
		const tickTextPos = type && /^(x|y|y2)$/.test(type) ?
			params.config[`axis_${type}_tick_text_position`] :
			{x: 0, y: 0};

		// tick visiblity
		const prefix = getAxisOptionPrefix(id);
		const axisShow = params.config[`${prefix}_show`];
		const tickShow = {
			tick: axisShow ? params.config[`${prefix}_tick_show`] : false,
			text: axisShow ? params.config[`${prefix}_tick_text_show`] : false
		};
		const evalTextSize = params.config.axis_evalTextSize;

		let $g;

		g.each(function() {
            throw new Error("STUB");
        });

		this.g = $g;
	}

	/**
	 * Get generated ticks
	 * @param {number} count Count of ticks
	 * @returns {Array} Generated ticks
	 * @private
	 */
	getGeneratedTicks(count: number): (Date | number)[] {
		const len = this.generatedTicks?.length - 1;
		let res = this.generatedTicks;

		if (len > count) {
			const interval = Math.round((len / count) + 0.1);

			res = this.generatedTicks
				.map((v, i) => { throw new Error("STUB"); })
				.filter(v => { throw new Error("STUB"); })
				.splice(0, count) as (Date | number)[];
		}

		return res;
	}

	/**
	 * Get tick x/y coordinate
	 * @returns {{x: number, y: number}}
	 * @private
	 */
	getTickXY(): {x: number, y: number} {
		const {config} = this;
		const pos = {x: 0, y: 0};

		if (this.params.isCategory) {
			pos.x = config.tickCentered ? 0 : config.tickOffset;
			pos.y = config.tickCentered ? config.tickOffset : 0;
		}

		return pos;
	}

	/**
	 * Get tick size
	 * @param {object} d data object
	 * @returns {number}
	 * @private
	 */
	getTickSize(d): number {
        throw new Error("STUB");
    }

	/**
	 * Set tick's line & text position
	 * @param {d3.selection} lineUpdate Line selection
	 * @param {d3.selection} textUpdate Text selection
	 * @param {object} sizeFor1Char Size for 1 char
	 * @private
	 */
	setTickLineTextPosition(lineUpdate, textUpdate, sizeFor1Char): void {
		const tickPos = this.getTickXY();
		const {innerTickSize, orient, tickLength, tickOffset} = this.config;
		const axisId = this.params.id;
		const rotate = this.params.tickTextRotate;
		const baseHeight = 6;
		const charHeight = (sizeFor1Char.h / 2) - baseHeight;

		const textAnchorForText = r => {
			const value = ["start", "end"];

			orient === "top" && value.reverse();

			return !r ? "middle" : value[r > 0 ? 0 : 1];
		};
		const textTransform = r => (r ? `rotate(${r})` : null);
		const yForText = r => {
			const r2 = r / (orient === "bottom" ? 15 : 23);
			const y = r ? 11.5 - 2.5 * r2 * (r > 0 ? 1 : -1) : tickLength;

			return y;
		};

		const {
			config: {
				axis_rotated: isRotated,
				axis_x_tick_text_inner: inner
			}
		} = this.params.owner;

		const tickLineInner = this.params.config[`axis_${getBaseAxisId(axisId)}_tick_inner`];

		switch (orient) {
			case "bottom":
				lineUpdate
					.attr("x1", tickPos.x)
					.attr("x2", tickPos.x)
					.attr("y2", d => { throw new Error("STUB"); });

				textUpdate
					.attr("x", 0)
					.attr("y", yForText(rotate))
					.style("text-anchor", (d, i, {length}) => {
                        throw new Error("STUB");
                    })
					.attr("transform", textTransform(rotate));
				break;
			case "top":
				lineUpdate
					.attr("x2", 0)
					.attr("y2", tickLineInner ? innerTickSize : -innerTickSize);

				textUpdate
					.attr("x", 0)
					.attr("y", -(yForText(rotate) + charHeight + baseHeight))
					.style("text-anchor", textAnchorForText(rotate))
					.attr("transform", textTransform(rotate));
				break;
			case "left":
				lineUpdate
					.attr("x2", tickLineInner ? innerTickSize : -innerTickSize)
					.attr("y1", tickPos.y)
					.attr("y2", tickPos.y);

				textUpdate
					.attr("x", -tickLength)
					.attr("y", tickOffset + (isRotated ? charHeight / 4 : charHeight))
					.style("text-anchor", "end");
				break;
			case "right":
				lineUpdate
					.attr("x2", tickLineInner ? -innerTickSize : innerTickSize)
					.attr("y2", 0);

				textUpdate
					.attr("x", tickLength)
					.attr("y", charHeight)
					.style("text-anchor", "start");
		}
	}

	// this should be called only when category axis
	splitTickText(d, scale, ticks, isLeftRight, charWidth) {
		const {params} = this;
		const tickText = this.helper.textFormatted(d);
		const splitted = isString(tickText) && tickText.indexOf("\n") > -1 ?
			tickText.split("\n") :
			[];

		if (splitted.length) {
			return splitted;
		}

		if (isArray(tickText)) {
			return tickText;
		}

		let tickWidth = params.tickWidth;

		if (!tickWidth || tickWidth <= 0) {
			tickWidth = isLeftRight ? 95 : (
				params.isCategory ?
					(
						params.isInverted ?
							scale(ticks[0]) - scale(ticks[1]) :
							scale(ticks[1]) - scale(ticks[0])
					) - 12 :
					110
			);
		}

		// split given text by tick width size
		// eslint-disable-next-line
		function split(splitted, text) {
			let subtext;
			let spaceIndex;
			let textWidth;

			for (let i = 1; i < text.length; i++) {
				if (text.charAt(i) === " ") {
					spaceIndex = i;
				}

				subtext = text.substr(0, i + 1);
				textWidth = charWidth * subtext.length;

				// if text width gets over tick width, split by space index or current index
				if (tickWidth < textWidth) {
					return split(
						splitted.concat(text.substr(0, spaceIndex || i)),
						text.slice(spaceIndex ? spaceIndex + 1 : i)
					);
				}
			}

			return splitted.concat(text);
		}

		return split(splitted, String(tickText));
	}

	scale(x?): AxisRenderer {
		if (!arguments.length) {
			return this.helper.scale;
		}

		this.helper.scale = x;

		return this;
	}

	orient(x): AxisRenderer {
        throw new Error("STUB");
    }

	tickFormat(format): AxisRenderer {
		const {config} = this;

		if (!arguments.length) {
			return config.tickFormat;
		}

		config.tickFormat = format;

		return this;
	}

	tickCentered(isCentered: boolean): AxisRenderer {
		const {config} = this;

		if (!arguments.length) {
			return config.tickCentered;
		}

		config.tickCentered = isCentered;

		return this;
	}

	/**
	 * Return tick's offset value.
	 * The value will be set for 'category' axis type.
	 * @returns {number}
	 * @private
	 */
	tickOffset(): number {
		return this.config.tickOffset;
	}

	/**
	 * Get tick interval count
	 * @private
	 * @param {number} size Total data size
	 * @returns {number}
	 */
	tickInterval(size: number): number {
		const {outerTickSize, tickOffset, tickValues} = this.config;
		let interval;

		if (this.params.isCategory) {
			const scale = this.params.owner.scale.zoom ?? this.helper.scale;

			interval = tickOffset * 2 || Math.abs(scale(1) - scale(0));
		} else {
			const scale = this.params.owner.scale.zoom ?? this.helper.scale;
			const length = this.g ?
				this.g.select("path.domain")
					.node()
					.getTotalLength() - outerTickSize * 2 :
				Math.abs(scale.range()[1] - scale.range()[0]);

			interval = length / (size || this.g?.selectAll("line").size() || 1);

			// get the interval by its values
			if (tickValues) {
				for (let i = 0; i < tickValues.length - 1; i++) {
					const intervalByValue = scale(tickValues[i + 1]) - scale(tickValues[i]);

					if (intervalByValue && intervalByValue < interval) {
						interval = intervalByValue;
					}
				}
			}
		}

		return interval === Infinity ? 0 : interval;
	}

	ticks(...args): AxisRenderer {
		const {config} = this;

		if (!args.length) {
			return config.tickArguments;
		}

		config.tickArguments = toArray(args);

		return this;
	}

	tickCulling(culling): AxisRenderer {
        throw new Error("STUB");
    }

	tickValues(
		x?: (number | Date | string)[] | Function
	): AxisRenderer | (number | Date | string)[] {
		const {config} = this;

		if (isFunction(x)) {
			config.tickValues = () => { throw new Error("STUB"); };
		} else {
			if (!arguments.length) {
				return config.tickValues;
			}

			config.tickValues = x;
		}

		return this;
	}

	setTransition(t): AxisRenderer {
		this.config.transition = t;

		return this;
	}
}
