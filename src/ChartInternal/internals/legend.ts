/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {namespaces as d3Namespaces, select as d3Select} from "d3-selection";
import {$FOCUS, $GAUGE, $LEGEND} from "../../config/classes";
import {document} from "../../module/browser";
import {KEY} from "../../module/Cache";
import {
	callFn,
	getOption,
	isBoolean,
	isDefined,
	isEmpty,
	isFunction,
	sanitize,
	toMap,
	tplProcess
} from "../../module/util";

const LEGEND_TOUCH_TAP_THRESHOLD = 10;
const LEGEND_TOUCH_CLICK_TIMEOUT = 750;

/**
 * Get color string for given data id
 * Internal helper used only within this file
 * @param {string} id Data id
 * @returns {string} Color string
 * @private
 */
function _getLegendColor(id: string): string {
    throw new Error("STUB");
}

/**
 * Get formatted text value
 * Internal helper used only within this file
 * @param {string} id Legend text id
 * @param {boolean} formatted Whether or not to format the text
 * @returns {string} Formatted legend text
 * @private
 */
function _getFormattedText<T = string>(id: T, formatted = true): T {
    throw new Error("STUB");
}

/**
 * Build a Map of legend items for fast O(1) lookup by ID
 * Internal helper used only within this file
 * @param {object} $$ ChartInternal context
 * @param {d3.selection} legendItems D3 selection of legend items
 * @private
 */
function _buildLegendItemMap($$, legendItems): void {
	if (!legendItems || legendItems.empty()) {
		return;
	}

	// rebuild from all rendered items, not the passed (possibly enter-only) selection,
	// so existing items aren't dropped from the map when new series are loaded
	const allItems = $$.$el.legend?.selectAll(`.${$LEGEND.legendItem}`);

	if (allItems && !allItems.empty()) {
		legendItems = allItems;
	}

	// Convert D3 selection to array of [id, node] pairs
	const items: Array<{id: string, node: HTMLElement}> = [];

	legendItems.each(function(id) {
        throw new Error("STUB");
    });

	// Create Map for O(1) lookups using toMap utility
	const itemMap = toMap(
		items,
		item => { throw new Error("STUB"); },
		item => { throw new Error("STUB"); }
	);

	// Cache the map
	$$.cache.add(KEY.legendItemMap, itemMap);
}

/**
 * Get touch point from a touch event.
 * @param {TouchEvent} event Touch event
 * @returns {Touch | undefined} Touch point
 * @private
 */
function _getLegendTouchPoint(event): Touch | undefined {
	return event.changedTouches?.[0] || event.touches?.[0];
}

/**
 * Store the touch start position for legend tap detection.
 * @param {object} $$ ChartInternal context
 * @param {string} id Legend data id
 * @param {TouchEvent} event Touch event
 * @private
 */
function _setLegendTouchStart($$, id: string, event): void {
	const touch = _getLegendTouchPoint(event);

	$$.state.legendTouch = touch ?
		{
			id,
			x: touch.clientX,
			y: touch.clientY,
			moved: false
		} :
		null;
}

/**
 * Update whether the current legend touch moved beyond tap tolerance.
 * @param {object} $$ ChartInternal context
 * @param {TouchEvent} event Touch event
 * @private
 */
function _updateLegendTouchMove($$, event): void {
	const start = $$.state.legendTouch;
	const touch = start && _getLegendTouchPoint(event);

	if (touch) {
		start.moved = start.moved ||
			Math.abs(touch.clientX - start.x) > LEGEND_TOUCH_TAP_THRESHOLD ||
			Math.abs(touch.clientY - start.y) > LEGEND_TOUCH_TAP_THRESHOLD;
	}
}

/**
 * Determine whether a touch sequence is a legend tap.
 * @param {object} $$ ChartInternal context
 * @param {string} id Legend data id
 * @param {TouchEvent} event Touch event
 * @returns {boolean} Whether the touch sequence is a tap
 * @private
 */
function _isLegendTouchTap($$, id: string, event): boolean {
	_updateLegendTouchMove($$, event);

	const start = $$.state.legendTouch;

	$$.state.legendTouch = null;

	return !!start && start.id === id && !start.moved;
}

/**
 * Mark a touch legend tap so the following compatibility click can be skipped.
 * @param {object} $$ ChartInternal context
 * @param {string} id Legend data id
 * @private
 */
function _markLegendTouchClick($$, id: string): void {
	$$.state.legendLastTouchClickId = id;
	$$.state.legendLastTouchClickTime = Date.now();
}

/**
 * Check if a click duplicates a recent touch legend tap.
 * @param {object} $$ ChartInternal context
 * @param {string} id Legend data id
 * @returns {boolean} Whether the click is duplicate
 * @private
 */
function _isDuplicateLegendTouchClick($$, id: string): boolean {
	const {state} = $$;
	const duplicate = state.legendLastTouchClickId === id &&
		Date.now() - (state.legendLastTouchClickTime || 0) < LEGEND_TOUCH_CLICK_TIMEOUT;

	if (duplicate) {
		state.legendLastTouchClickId = null;
		state.legendLastTouchClickTime = 0;
	}

	return duplicate;
}

/**
 * Get touch listener passive option following interaction.inputType.touch.preventDefault.
 * @param {object} $$ ChartInternal context
 * @returns {object} Touch listener option
 * @private
 */
function _getLegendTouchOption($$): {passive: boolean} {
	const preventDefault = $$.config.interaction_inputType_touch?.preventDefault;
	const isPrevented = (isBoolean(preventDefault) && preventDefault) || false;
	const preventThreshold = (!isNaN(preventDefault) && preventDefault) || null;

	return {
		passive: !isPrevented && preventThreshold === null
	};
}

export default {
	/**
	 * Initialize the legend.
	 * @private
	 */
	initLegend(): void {
		const $$ = this;
		const {config, $el} = $$;

		$$.legendItemTextBox = {};
		$$.state.legendHasRendered = false;

		if ($$.state.isCanvasMode) {
			if (config.legend_show) {
				$$.updateHtmlLegend?.();
			} else {
				$$.state.hiddenLegendIds = new Set($$.mapToIds($$.data.targets));
			}
			return;
		}

		if (config.legend_show) {
			if (!config.legend_contents_bindto) {
				$el.legend = $$.$el.svg.append("g")
					.classed($LEGEND.legend, true)
					.attr("transform", $$.getTranslate("legend"));
			}

			// MEMO: call here to update legend box and translate for all
			// MEMO: translate will be updated by this, so transform not needed in updateLegend()
			$$.updateLegend();
		} else {
			$$.state.hiddenLegendIds = new Set($$.mapToIds($$.data.targets));
		}
	},

	/**
	 * Update legend element
	 * @param {Array} targetIds ID's of target
	 * @param {object} options withTransform : Whether to use the transform property / withTransitionForTransform: Whether transition is used when using the transform property / withTransition : whether or not to transition.
	 * @param {object} transitions Return value of the generateTransitions
	 * @private
	 */
	updateLegend(targetIds, options, transitions): void {
		const $$ = this;
		const {config, state, scale, $el} = $$;

		const optionz = options || {
			withTransform: false,
			withTransitionForTransform: false,
			withTransition: false
		};

		optionz.withTransition = getOption(optionz, "withTransition", true);
		optionz.withTransitionForTransform = getOption(optionz, "withTransitionForTransform", true);

		if (config.legend_contents_bindto && config.legend_contents_template) {
			$$.updateLegendTemplate();
		} else if (!state.hasTreemap) {
			$$.updateLegendElement(
				targetIds || $$.mapToIds($$.data.targets),
				optionz
			);
		}

		// toggle legend state
		$el.legend?.selectAll(`.${$LEGEND.legendItem}`)
			.classed($LEGEND.legendItemHidden, function(id) {
                throw new Error("STUB");
            });

		// Update size and scale
		$$.updateScales(false, !scale.zoom);
		$$.updateSvgSize();

		// Update g positions
		$$.transformAll(optionz.withTransitionForTransform, transitions);

		state.legendHasRendered = true;
	},

	/**
	 * Update legend using template option
	 * @private
	 */
	updateLegendTemplate(): void {
		const $$ = this;
		const {config, $el} = $$;
		const wrapper = d3Select(config.legend_contents_bindto);
		const template = config.legend_contents_template;

		if (!wrapper.empty()) {
			const targets = $$.mapToIds($$.data.targets);
			const ids: string[] = [];
			let html = "";

			targets.forEach(v => {
                throw new Error("STUB");
            });

			const legendItem = wrapper.html(html)
				.selectAll(function() {
                    throw new Error("STUB");
                })
				.data(ids);

			$$.setLegendItem(legendItem);

			$el.legend = wrapper;
		}
	},

	/**
	 * Update the size of the legend.
	 * @param {Obejct} size Size object
	 * @private
	 */
	updateSizeForLegend(size): void {
		const $$ = this;
		const {
			config,
			state: {
				isLegendTop,
				isLegendLeft,
				isLegendRight,
				isLegendInset,
				current
			}
		} = $$;
		const {width, height} = size;

		const insetLegendPosition = {
			top: isLegendTop ?
				$$.getCurrentPaddingByDirection("top") + config.legend_inset_y + 5.5 :
				current.height - height - $$.getCurrentPaddingByDirection("bottom") -
				config.legend_inset_y,
			left: isLegendLeft ?
				$$.getCurrentPaddingByDirection("left") + config.legend_inset_x + 0.5 :
				current.width - width - $$.getCurrentPaddingByDirection("right") -
				config.legend_inset_x + 0.5
		};

		$$.state.margin3 = {
			top: isLegendRight ?
				0 :
				isLegendInset ?
				insetLegendPosition.top :
				current.height - height,
			right: NaN,
			bottom: 0,
			left: isLegendRight ?
				current.width - width :
				isLegendInset ?
				insetLegendPosition.left :
				0
		};
	},

	/**
	 * Transform Legend
	 * @param {boolean} withTransition whether or not to transition.
	 * @private
	 */
	transformLegend(withTransition): void {
		const $$ = this;
		const {$el: {legend}, $T} = $$;

		$T(legend, withTransition)
			.attr("transform", $$.getTranslate("legend"));
	},

	/**
	 * Update legend item color
	 * @param {string} id Corresponding data ID value
	 * @param {string} color Color value
	 * @private
	 */
	updateLegendItemColor(id: string, color: string): void {
		const $$ = this;
		const {legend} = $$.$el;

		if (legend) {
			// Use cached Map lookup for O(1) performance
			const legendItem = $$.getLegendItemById(id);

			if (legendItem) {
				d3Select(legendItem).select("line")
					.style("stroke", color);
			}
		}
	},

	/**
	 * Get the width of the legend
	 * @returns {number} width
	 * @private
	 */
	getLegendWidth(): number {
		const $$ = this;
		const {current: {width}, isLegendRight, isLegendInset, legendItemWidth, legendStep} =
			$$.state;

		return $$.config.legend_show ?
			(
				isLegendRight || isLegendInset ? legendItemWidth * (legendStep + 1) : width
			) :
			0;
	},

	/**
	 * Get the height of the legend
	 * @returns {number} height
	 * @private
	 */
	getLegendHeight(): number {
		const $$ = this;
		const {current, isLegendRight, legendItemHeight, legendStep} = $$.state;
		const isFitPadding = $$.config.padding?.mode === "fit";
		const minHeight = isFitPadding ? 10 : 20;
		const height = $$.config.legend_show ?
			(
				isLegendRight ? current.height : (
					Math.max(minHeight, legendItemHeight)
				) * (legendStep + 1)
			) :
			0;

		return height;
	},

	/**
	 * Get the opacity of the legend that is unfocused
	 * @param {d3.selection} legendItem Legend item node
	 * @returns {string|null} opacity
	 * @private
	 */
	opacityForUnfocusedLegend(legendItem): string | null {
        throw new Error("STUB");
    },

	/**
	 * Toggles the focus of the legend
	 * @param {Array} targetIds ID's of target
	 * @param {boolean} focus whether or not to focus.
	 * @private
	 */
	toggleFocusLegend(targetIds: string[], focus: boolean): void {
		const $$ = this;
		const {$el: {legend}, $T} = $$;
		const targetIdz = $$.mapToTargetIds(targetIds);

		legend && $T(legend.selectAll(`.${$LEGEND.legendItem}`)
			.filter(id => { throw new Error("STUB"); })
			.classed($FOCUS.legendItemFocused, focus))
			.style("opacity", function() {
                throw new Error("STUB");
            });
	},

	/**
	 * Revert the legend to its default state
	 * @private
	 */
	revertLegend(): void {
		const $$ = this;
		const {$el: {legend}, $T} = $$;

		legend && $T(legend.selectAll(`.${$LEGEND.legendItem}`)
			.classed($FOCUS.legendItemFocused, false))
			.style("opacity", null);
	},

	/**
	 * Shows the legend
	 * @param {Array} targetIds ID's of target
	 * @private
	 */
	showLegend(targetIds: string[]): void {
		const $$ = this;
		const {config, $el, $T} = $$;

		if (!config.legend_show) {
			config.legend_show = true;

			$el.legend ? $el.legend.style("visibility", null) : $$.initLegend();

			!$$.state.legendHasRendered && $$.updateLegend();
		}

		$$.removeHiddenLegendIds(targetIds);

		$T(
			$el.legend.selectAll($$.selectorLegends(targetIds))
				.style("visibility", null)
		).style("opacity", null);
	},

	/**
	 * Hide the legend
	 * @param {Array} targetIds ID's of target
	 * @private
	 */
	hideLegend(targetIds: string[]): void {
		const $$ = this;
		const {config, $el: {legend}} = $$;

		if (config.legend_show && isEmpty(targetIds)) {
			config.legend_show = false;
			legend?.style("visibility", "hidden");
		}

		$$.addHiddenLegendIds(targetIds);

		// legend element isn't created when the chart was generated with legend.show=false
		legend?.selectAll($$.selectorLegends(targetIds))
			.style("opacity", "0")
			.style("visibility", "hidden");
	},

	/**
	 * Get legend item textbox dimension
	 * @param {string} id Data ID
	 * @param {HTMLElement|d3.selection} textElement Text node element
	 * @returns {object} Bounding rect
	 * @private
	 */
	getLegendItemTextBox(id?: string, textElement?) {
		const $$ = this;
		const {cache, state} = $$;
		let data;

		// do not prefix w/'$', to not be resetted cache in .load() call
		const cacheKey = KEY.legendItemTextBox;

		if (id) {
			data = (!state.redrawing && cache.get(cacheKey)) || {};

			if (!data[id]) {
				data[id] = $$.getTextRect(textElement, $LEGEND.legendItem);
				cache.add(cacheKey, data);
			}

			data = data[id];
		}

		return data;
	},

	/**
	 * Set legend item style & bind events
	 * @param {d3.selection} item Item node
	 * @private
	 */
	setLegendItem(item): void {
		const $$ = this;
		const {$el, api, config, state} = $$;
		const isTouch = state.inputType === "touch";
		const hasGauge = $$.hasType("gauge");
		const useCssRule = config.boost_useCssRule;
		const interaction = config.legend_item_interaction;
		const eventType = interaction.dblclick ? "dblclick" : "click";
		const hasClickInteraction = interaction || isFunction(config.legend_item_onclick);
		const touchOption = isTouch ? _getLegendTouchOption($$) : undefined;

		const handleLegendToggle = function(event, id): void {
            throw new Error("STUB");
        };

		item
			.attr("class", function(id) {
                throw new Error("STUB");
            })
			.style("visibility", id => { throw new Error("STUB"); });

		if (config.interaction_enabled) {
			if (useCssRule) {
				[
					[`.${$LEGEND.legendItem}`, "cursor:pointer"],
					[`.${$LEGEND.legendItem} text`, "pointer-events:none"],
					[`.${$LEGEND.legendItemPoint} text`, "pointer-events:none"],
					[`.${$LEGEND.legendItemTile}`, "pointer-events:none"],
					[`.${$LEGEND.legendItemEvent}`, "fill-opacity:0"]
				].forEach(v => {
                    throw new Error("STUB");
                });
			}

			item
				.on(eventType, hasClickInteraction ?
					function(event, id) {
                        throw new Error("STUB");
                    } :
					null);

			isTouch && eventType === "click" && hasClickInteraction && item
				.on("touchstart", function(event, id) {
                    throw new Error("STUB");
                }, touchOption)
				.on("touchmove", event => {
                    throw new Error("STUB");
                }, touchOption)
				.on("touchend", function(event, id) {
                    throw new Error("STUB");
                }, touchOption);

			!isTouch && item
				.on("mouseout", interaction || isFunction(config.legend_item_onout) ?
					function(event, id) {
                        throw new Error("STUB");
                    } :
					null)
				.on("mouseover", interaction || isFunction(config.legend_item_onover) ?
					function(event, id) {
                        throw new Error("STUB");
                    } :
					null);

			// set cursor when has some interaction
			!item.empty() && item.on("click mouseout mouseover") &&
				item.style("cursor", $$.getStylePropValue("pointer"));
		}

		// Build legend item map for O(1) lookup
		_buildLegendItemMap($$, item);
	},

	/**
	 * Get legend item node by ID using cached Map for O(1) lookup
	 * Falls back to D3 selection if map is not available
	 * @param {string} id Data ID
	 * @returns {HTMLElement | null} Legend item node
	 * @private
	 */
	getLegendItemById(id: string): HTMLElement | null {
		const $$ = this;
		const itemMap = $$.cache.get(KEY.legendItemMap);

		if (itemMap && itemMap instanceof Map) {
			return itemMap.get(id) || null;
		}

		// Fallback to D3 selection (slower)
		const item = $$.$el.legend?.selectAll(`.${$LEGEND.legendItem}`)
			.filter(d => { throw new Error("STUB"); });

		return item?.node() || null;
	},

	/**
	 * Update the legend
	 * @param {Array} targetIds ID's of target
	 * @param {object} options withTransform : Whether to use the transform property / withTransitionForTransform: Whether transition is used when using the transform property / withTransition : whether or not to transition.
	 * @private
	 */
	updateLegendElement(targetIds: string[], options): void {
		const $$ = this;
		const {config, state, $el: {legend}, $T} = $$;
		const legendType = config.legend_item_tile_type;
		const isRectangle = legendType !== "circle";
		const legendItemR = config.legend_item_tile_r;

		const itemTileSize = {
			width: isRectangle ? config.legend_item_tile_width : legendItemR * 2,
			height: isRectangle ? config.legend_item_tile_height : legendItemR * 2
		};

		const dimension = {
			padding: {
				top: 4,
				right: 10
			},
			max: {
				width: 0,
				height: 0
			},
			posMin: 10,
			step: 0,
			tileWidth: itemTileSize.width + 5,
			totalLength: 0
		};

		const sizes = {
			offsets: {},
			widths: {},
			heights: {},
			margins: [0],
			steps: {}
		};

		let xForLegend;
		let yForLegend;
		let background;

		// Skip elements when their name is set to null
		const targetIdz = targetIds
			.filter(id => { throw new Error("STUB"); });

		const withTransition = options.withTransition;
		const isLegendRightOrInset = state.isLegendRight || state.isLegendInset;
		const getFormattedText = _getFormattedText.bind($$);
		const updatePositions = $$.getUpdateLegendPositions(targetIdz, dimension, sizes,
			isLegendRightOrInset);

		if (state.isLegendInset) {
			dimension.step = config.legend_inset_step ? config.legend_inset_step : targetIdz.length;
			state.legendStep = dimension.step;
		}

		if (state.isLegendRight) {
			xForLegend = id => { throw new Error("STUB"); };
			yForLegend = id => { throw new Error("STUB"); };
		} else if (state.isLegendInset) {
			xForLegend = id => { throw new Error("STUB"); };
			yForLegend = id => { throw new Error("STUB"); };
		} else {
			xForLegend = id => { throw new Error("STUB"); };
			yForLegend = id => { throw new Error("STUB"); };
		}

		const posFn = {
			xText: (id, i?: number) => { throw new Error("STUB"); },
			xRect: (id, i?: number) => { throw new Error("STUB"); },
			x1Tile: (id, i?: number) => { throw new Error("STUB"); },
			x2Tile: (id, i?: number) => { throw new Error("STUB"); },
			yText: (id, i?: number) => { throw new Error("STUB"); },
			yRect: (id, i?: number) => { throw new Error("STUB"); },
			yTile: (id, i?: number) => { throw new Error("STUB"); }
		};

		$$.generateLegendItem(targetIdz, itemTileSize, updatePositions, posFn, isLegendRightOrInset,
			getFormattedText);

		// Set background for inset legend
		background = legend.select(`.${$LEGEND.legendBackground} rect`);

		if (state.isLegendInset && dimension.max.width > 0 && background.size() === 0) {
			background = legend.insert("g", `.${$LEGEND.legendItem}`)
				.attr("class", $LEGEND.legendBackground)
				.append("rect");
		}

		if (config.legend_tooltip) {
			legend.selectAll("title")
				.data(targetIdz)
				.text(id => { throw new Error("STUB"); });
		}

		const texts = legend.selectAll("text")
			.data(targetIdz)
			.text(id => { throw new Error("STUB"); }) // MEMO: needed for update
			.each(function(id, i) {
                throw new Error("STUB");
            });

		$T(texts, withTransition)
			.attr("x", posFn.xText)
			.attr("y", posFn.yText);

		const rects = legend.selectAll(`rect.${$LEGEND.legendItemEvent}`)
			.data(targetIdz);

		$T(rects, withTransition)
			.attr("width", id => { throw new Error("STUB"); })
			.attr("height", id => { throw new Error("STUB"); })
			.attr("x", posFn.xRect)
			.attr("y", posFn.yRect);

		// update legend items position
		$$.updateLegendItemPos(targetIdz, withTransition, posFn);

		if (background) {
			$T(background, withTransition)
				.attr("height", $$.getLegendHeight() - 12)
				.attr("width", dimension.max.width * (dimension.step + 1) + 10);
		}

		// Update all to reflect change of legend
		state.legendItemWidth = dimension.max.width;
		state.legendItemHeight = dimension.max.height;
		state.legendStep = dimension.step;
	},

	/**
	 * Get position update function
	 * @param {Array} targetIdz Data ids
	 * @param {object} dimension Dimension object
	 * @param {object} sizes Size object
	 * @param {boolean} isLegendRightOrInset Whether legend is right or inset
	 * @returns {function} Update position function
	 * @private
	 */
	getUpdateLegendPositions(targetIdz, dimension, sizes, isLegendRightOrInset) {
		const $$ = this;
		const {config, state} = $$;

		return function(textElement, id, index) {
            throw new Error("STUB");
        };
	},

	/**
	 * Generate legend item elements
	 * @param {Array} targetIdz Data ids
	 * @param {object} itemTileSize Item tile size {width, height}
	 * @param {function} updatePositions Update position function
	 * @param {object} posFn Position functions
	 * @param {boolean} isLegendRightOrInset Whether legend is right or inset
	 * @param {function} getFormattedText Bound text formatter function
	 * @private
	 */
	generateLegendItem(targetIdz, itemTileSize, updatePositions, posFn, isLegendRightOrInset,
		getFormattedText) {
		const $$ = this;
		const {config, state, $el: {legend}} = $$;
		const usePoint = config.legend_usePoint;
		const legendItemR = config.legend_item_tile_r;
		const legendType = config.legend_item_tile_type;
		const isRectangle = legendType !== "circle";

		const pos = -200;

		// Define g for legend area
		const l = legend.selectAll(`.${$LEGEND.legendItem}`)
			.data(targetIdz)
			.enter()
			.append("g");

		$$.setLegendItem(l);

		if (config.legend_tooltip) {
			l.append("title").text(id => { throw new Error("STUB"); });
		}

		l.append("text")
			.text(id => { throw new Error("STUB"); })
			.each(function(id, i) {
                throw new Error("STUB");
            })
			.style("pointer-events", $$.getStylePropValue("none"))
			.attr("x", isLegendRightOrInset ? posFn.xText : pos)
			.attr("y", isLegendRightOrInset ? pos : posFn.yText);

		l.append("rect")
			.attr("class", $LEGEND.legendItemEvent)
			.style("fill-opacity", $$.getStylePropValue("0"))
			.attr("x", isLegendRightOrInset ? posFn.xRect : pos)
			.attr("y", isLegendRightOrInset ? pos : posFn.yRect);

		if (usePoint) {
			const ids: string[] = [];
			const pattern = $$.getValidPointPattern();

			l.append(d => {
                throw new Error("STUB");
            })
				.attr("class", $LEGEND.legendItemPoint)
				.style("fill", _getLegendColor.bind($$))
				.style("pointer-events", $$.getStylePropValue("none"))
				.attr("href", (data, idx, selection) => {
                    throw new Error("STUB");
                });
		} else {
			l.append(isRectangle ? "line" : legendType)
				.attr("class", $LEGEND.legendItemTile)
				.style("stroke", _getLegendColor.bind($$))
				.style("pointer-events", $$.getStylePropValue("none"))
				.call(selection => {
                    throw new Error("STUB");
                });
		}
	},

	/**
	 * Update legend item position
	 * @param {Array} targetIdz Data ids
	 * @param {boolean} withTransition Whether or not to apply transition
	 * @param {object} posFn Position functions
	 * @private
	 */
	updateLegendItemPos(targetIdz: string[], withTransition: boolean, posFn): void {
		const $$ = this;
		const {config, $el: {legend}, $T} = $$;
		const usePoint = config.legend_usePoint;
		const legendType = config.legend_item_tile_type;
		const isRectangle = legendType !== "circle";

		if (usePoint) {
			const tiles = legend.selectAll(`.${$LEGEND.legendItemPoint}`)
				.data(targetIdz);
			const isRectangleTile = config.legend_item_tile_type !== "circle";
			const tileWidth = isRectangleTile ?
				config.legend_item_tile_width :
				config.legend_item_tile_r * 2;
			const tileHeight = isRectangleTile ?
				config.legend_item_tile_height :
				config.legend_item_tile_r * 2;
			const iconWidth = tileWidth * 0.75;
			const iconHeight = tileHeight * 0.75;
			const customScaleX = tileWidth / 8;
			const customScaleY = tileHeight / 8;

			$T(tiles, withTransition)
				.each(function() {
                    throw new Error("STUB");
                });
		} else {
			const tiles = legend.selectAll(`.${$LEGEND.legendItemTile}`)
				.data(targetIdz);

			$T(tiles, withTransition)
				.style("stroke", _getLegendColor.bind($$))
				.call(selection => {
                    throw new Error("STUB");
                });
		}
	}
};
