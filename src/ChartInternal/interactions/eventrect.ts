/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import type {d3Selection} from "../../../types";
import {$COMMON, $EVENT, $SHAPE} from "../../config/classes";
import {
	getBoundingRect,
	getPointer,
	getScrollPosition,
	isBoolean,
	isFunction
} from "../../module/util";

export default {
	/**
	 * Initialize the area that detects the event.
	 * Add a container for the zone that detects the event.
	 * @private
	 */
	initEventRect(): void {
		const $$ = this;

		$$.$el.main.select(`.${$COMMON.chart}`)
			.append("g")
			.attr("class", $EVENT.eventRects)
			.style("fill-opacity", "0");
	},

	/**
	 * Redraws the area that detects the event.
	 * @private
	 */
	redrawEventRect(): void {
		const $$ = this;
		const {config, state, $el} = $$;
		const isMultipleX = $$.isMultipleX();
		const isInverted = config.axis_x_inverted;

		if ($el.eventRect) {
			$$.updateEventRect($el.eventRect, true);

			// do not initialize eventRect when data is empty
		} else if ($$.data.targets.length) {
			const eventRects = $$.$el.main.select(`.${$EVENT.eventRects}`)
				.style("cursor", config.zoom_enabled && config.zoom_type !== "drag" ?
					(
						config.axis_rotated ? "ns-resize" : "ew-resize"
					) :
					null)
				.classed($EVENT.eventRectsMultiple, isMultipleX)
				.classed($EVENT.eventRectsSingle, !isMultipleX);

			// append event <rect>
			const eventRectUpdate = eventRects.selectAll(`.${$EVENT.eventRect}`)
				.data([0])
				.enter()
				.append("rect");

			$$.updateEventRect(eventRectUpdate);

			// bind event to <rect> element
			$$.updateEventType(eventRectUpdate);

			// bind draggable selection
			eventRectUpdate.call($$.getDraggableSelection());

			$el.eventRect = eventRectUpdate;

			if (
				$$.state.inputType === "touch" && !$el.svg.on("touchstart.eventRect") &&
				!$$.hasArcType()
			) {
				$$.bindTouchOnEventRect();
			}

			// when initilazed with empty data and data loaded later, need to update eventRect
			state.rendered && $$.updateEventRect($el.eventRect, true);
		}

		if (!isMultipleX) {
			// Set data and update eventReceiver.data
			const xAxisTickValues = $$.getMaxDataCountTarget();

			if (!config.data_xSort || isInverted) {
				xAxisTickValues.sort((a, b) => { throw new Error("STUB"); });
			}

			// update data's index value to be alinged with the x Axis
			$$.updateDataIndexByX(xAxisTickValues);
			$$.updateXs(xAxisTickValues);
			$$.updatePointClass?.(true);

			state.eventReceiver.data = xAxisTickValues;
		}

		$$.updateEventRectData();
	},

	bindTouchOnEventRect(): void {
		const $$ = this;
		const {config, state, $el: {eventRect, svg}} = $$;

		const selectRect = context => {
			if ($$.isMultipleX()) {
				$$.selectRectForMultipleXs(context);
			} else {
				const index = $$.getDataIndexFromEvent(state.event);

				$$.callOverOutForTouch(index);

				index === -1 ? $$.unselectRect() : $$.selectRectForSingle(context, index);
			}
		};

		const unselectRect = () => {
			$$.unselectRect();
			$$.callOverOutForTouch();
		};

		// call event.preventDefault()
		// according 'interaction.inputType.touch.preventDefault' option
		const preventDefault = config.interaction_inputType_touch.preventDefault;
		const isPrevented = (isBoolean(preventDefault) && preventDefault) || false;
		const preventThreshold = (!isNaN(preventDefault) && preventDefault) || null;
		let startPx;

		// Determine passive option based on preventDefault setting
		// If preventDefault is needed, passive must be false
		const passiveOption = !isPrevented && preventThreshold === null;

		const preventEvent = event => {
			const eventType = event.type;
			const touch = event.changedTouches[0];
			const currentXY = touch[`client${config.axis_rotated ? "Y" : "X"}`];

			// prevent document scrolling
			if (eventType === "touchstart") {
				if (isPrevented) {
					event.preventDefault();
				} else if (preventThreshold !== null) {
					startPx = currentXY;
				}
			} else if (eventType === "touchmove") {
				if (
					isPrevented || startPx === true || (
						preventThreshold !== null &&
						Math.abs(startPx - currentXY) >= preventThreshold
					)
				) {
					// once prevented, keep prevented during whole 'touchmove' context
					startPx = true;
					event.preventDefault();
				}
			}
		};

		// bind touch events
		eventRect
			.on("touchstart", event => {
                throw new Error("STUB");
            }, {passive: passiveOption})
			.on("touchstart.eventRect touchmove.eventRect", event => {
                throw new Error("STUB");
            }, {passive: passiveOption})
			.on("touchend.eventRect", event => {
                throw new Error("STUB");
            }, {passive: passiveOption});

		svg.on("touchstart", event => {
            throw new Error("STUB");
        }, {passive: passiveOption});
	},

	/**
	 * Update event rect size
	 * @param {d3Selection} eventRect Event <rect> element
	 * @param {boolean} force Force to update
	 * @private
	 */
	updateEventRect(eventRect?, force = false): void {
		const $$ = this;
		const {state, $el} = $$;
		const {eventReceiver, width, height, rendered, resizing} = state;
		const rectElement = eventRect || $el.eventRect;

		const updateClientRect = (): void => {
			if (eventReceiver) {
				const scrollPos = getScrollPosition($el.chart.node());

				eventReceiver.rect = getBoundingRect(rectElement.node(), true)
					.toJSON();

				eventReceiver.rect.top += scrollPos.y;
				eventReceiver.rect.left += scrollPos.x;
			}
		};

		if (!rendered || resizing || force) {
			rectElement
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", width)
				.attr("height", height);

			// only for init
			if (!rendered || force) {
				rectElement.classed($EVENT.eventRect, true);
			}
		}

		updateClientRect();
	},

	/**
	 * Update event type (single or multiple x)
	 * @param {d3Selection | boolean} target Target element or boolean to rebind event
	 */
	updateEventType(target: d3Selection | boolean): void {
		const $$ = this;
		const isRebindCall = isBoolean(target);
		const eventRect = isRebindCall ? $$.$el.eventRect : target;
		const unbindEvent = isRebindCall ? target !== eventRect?.datum().multipleX : false;

		if (eventRect) {
			// release previous event listeners
			unbindEvent && eventRect?.on("mouseover mousemove mouseout click", null);

			$$.isMultipleX() ?
				$$.generateEventRectsForMultipleXs(eventRect) :
				$$.generateEventRectsForSingleX(eventRect);
		}
	},

	/**
	 * Updates the location and size of the eventRect.
	 * @private
	 */
	updateEventRectData(): void {
		const $$ = this;
		const {config, scale, state} = $$;
		const xScale = scale.zoom || scale.x;
		const isRotated = config.axis_rotated;
		const isMultipleX = $$.isMultipleX();

		// Skip recalculation if scale domain, plot size or visibility hasn't changed.
		// width/height must be part of the key: resize keeps the domain but moves coords.
		const xDomain = xScale?.domain();
		const fingerprint = xDomain ?
			`${xDomain[0]}_${
				xDomain[1]
			}_${state.width}_${state.height}_${$$.data.targets.length}_${state.dataGeneration}_${
				[...state.hiddenTargetIds].join(",")
			}` :
			null;

		if (fingerprint && fingerprint === state._eventRectFingerprint) {
			return;
		}

		state._eventRectFingerprint = fingerprint;
		let x;
		let y;
		let w;
		let h;

		$$.updateEventType(isMultipleX);

		if (isMultipleX) {
			// TODO: rotated not supported yet
			x = 0;
			y = 0;
			w = state.width;
			h = state.height;
		} else {
			let rectW;
			let rectX;

			if ($$.axis.isCategorized()) {
				rectW = $$.getEventRectWidth();
				rectX = d => { throw new Error("STUB"); };
			} else {
				const getPrevNextX = ({index}) => ({
					prev: $$.getPrevX(index),
					next: $$.getNextX(index)
				});

				rectW = (d): number => {
                    throw new Error("STUB");
                };

				rectX = (d): number => {
                    throw new Error("STUB");
                };
			}

			x = isRotated ? 0 : rectX;
			y = isRotated ? rectX : 0;
			w = isRotated ? state.width : rectW;
			h = isRotated ? rectW : state.height;
		}

		const {eventReceiver} = state;
		const call: any = (fn, v) => (isFunction(fn) ? fn(v) : fn);

		// reset for possible remains coords data before the data loading
		eventReceiver.coords.splice(eventReceiver.data.length);

		eventReceiver.data.forEach((d, i) => {
            throw new Error("STUB");
        });
	},

	/**
	 * Seletct rect for single x value
	 * @param {d3Selection} context Event rect element
	 * @param {number} index x Axis index
	 * @private
	 */
	selectRectForSingle(context: SVGRectElement, index: number): void {
		const $$ = this;
		const {config, state, $el: {main, circle}} = $$;
		const isSelectionEnabled = config.data_selection_enabled;
		const isSelectionGrouped = config.data_selection_grouped;
		const isSelectable = config.data_selection_isselectable;
		const isTooltipGrouped = config.tooltip_grouped;
		const selectedData = $$.getAllValuesOnIndex(index);

		if (isTooltipGrouped) {
			$$.showTooltip(selectedData, context);
			$$.showGridFocus?.(selectedData);
			$$.showSubchartGridFocus?.(selectedData);

			if (!isSelectionEnabled || isSelectionGrouped) {
				return;
			}
		}

		// remove possible previous focused state
		!circle &&
			main.selectAll(`.${$COMMON.EXPANDED}:not(.${$SHAPE.shape}-${index})`).classed(
				$COMMON.EXPANDED,
				false
			);

		const shapeAtIndex = main.selectAll(`.${$SHAPE.shape}-${index}`)
			.classed($COMMON.EXPANDED, true)
			.style("cursor", isSelectable ? "pointer" : null)
			.filter(function(d) {
                throw new Error("STUB");
            });

		shapeAtIndex
			.call(selected => {
                throw new Error("STUB");
            });

		if (!isTooltipGrouped && shapeAtIndex.empty()) {
			// `point.focus.only` can render focus points away from the hovered data point.
			// Fall back to data distance so ungrouped tooltips can still focus the intended point.
			const mouse = getPointer(state.event, context);
			const closestData = selectedData.filter(d => {
                throw new Error("STUB");
            });

			if (closestData.length > 0) {
				let closest = closestData[0];
				let minDist = $$.dist(closest, mouse);

				for (let i = 1; i < closestData.length; i++) {
					const d = closestData[i];
					const dist = $$.dist(d, mouse);

					if (dist < minDist) {
						minDist = dist;
						closest = d;
					}
				}

				$$.showTooltip([closest], context);
				$$.showGridFocus?.([closest]);
				$$.showSubchartGridFocus?.([closest]);
				$$.unexpandCircles?.();

				$$.setExpand(index, closest.id, true);

				if (
					isSelectionEnabled &&
					(isSelectionGrouped || isSelectable?.bind($$.api)(closest))
				) {
					context.style.cursor = "pointer";
				}
			} else if (config.interaction_onout) {
				$$.hideGridFocus?.();
				$$.hideSubchartGridFocus?.();
				$$.hideTooltip();

				!isSelectionGrouped && $$.setExpand(index);
			}
		}
	},

	/**
	 * Select rect for multiple x values
	 * @param {d3Selection} context Event rect element
	 * @param {boolean} [triggerEvent=true] Whether trigger event or not
	 * @private
	 */
	selectRectForMultipleXs(context: SVGRectElement, triggerEvent = true): void {
		const $$ = this;
		const {config, state} = $$;
		const targetsToShow = $$.getTargetsToShow();

		// do nothing when dragging
		if (state.dragging || $$.hasArcType(targetsToShow)) {
			return;
		}

		const mouse = getPointer(state.event, context);
		const closest = $$.findClosestFromTargets(targetsToShow, mouse);

		if (triggerEvent && state.mouseover && (!closest || closest.id !== state.mouseover.id)) {
			config.data_onout.call($$.api, state.mouseover);
			state.mouseover = undefined;
		}

		if (!closest) {
			$$.unselectRect();
			return;
		}

		const sameXData = (
				$$.isBubbleType(closest) || $$.isScatterType(closest) || !config.tooltip_grouped
			) ?
			[closest] :
			$$.filterByX(targetsToShow, closest.x);

		// show tooltip when cursor is close to some point
		const selectedData = sameXData.map(d => { throw new Error("STUB"); });

		$$.showTooltip(selectedData, context);

		// expand points
		$$.setExpand(closest.index, closest.id, true);

		// Show xgrid focus line (optional module — grid resolver)
		$$.showGridFocus?.(selectedData);
		$$.showSubchartGridFocus?.(selectedData);

		const dist = $$.dist(closest, mouse);

		// Show cursor as pointer if point is close to mouse position
		if ($$.isBarType(closest.id) || dist < $$.getPointSensitivity(closest)) {
			$$.$el.eventRect.style("cursor", "pointer");

			if (
				triggerEvent && (
					!state.mouseover ||
					state.mouseover.x !== closest.x ||
					state.mouseover.id !== closest.id
				)
			) {
				config.data_onover.call($$.api, closest);
				state.mouseover = closest;
			}
		}
	},

	/**
	 * Unselect EventRect.
	 * @private
	 */
	unselectRect(): void {
		const $$ = this;
		const {state, $el: {circle, tooltip}} = $$;

		state._lastTooltipMouse = null;

		if (state.isCanvasMode) {
			$$.clearCanvasFocus?.();
			tooltip && $$.hideTooltip();
			return;
		}

		$$.$el.eventRect?.style("cursor", null);
		$$.hideGridFocus?.();
		$$.hideSubchartGridFocus?.();

		if (tooltip) {
			$$.hideTooltip();
			$$._handleLinkedCharts(false);
		}

		circle && !$$.isPointFocusOnly() && $$.unexpandCircles();
		$$.expandBarTypeShapes(false);
	},

	/**
	 * Create eventRect for each data on the x-axis.
	 * Register touch and drag events.
	 * @param {object} eventRectEnter d3.select($EVENT.eventRects) object.
	 * @returns {object} d3.select($EVENT.eventRects) object.
	 * @private
	 */
	generateEventRectsForSingleX(eventRectEnter) {
		const $$ = this;
		const {config, state} = $$;
		const {eventReceiver} = state;

		const rect = eventRectEnter
			.style("cursor",
				config.data_selection_enabled && config.data_selection_grouped ? "pointer" : null)
			.on("click", function(event) {
                throw new Error("STUB");
            })
			.datum({multipleX: false});

		if (state.inputType === "mouse") {
			const getData = event => {
				const index = event ? $$.getDataIndexFromEvent(event) : eventReceiver.currentIdx;

				return index > -1 ? eventReceiver.data[index] : null;
			};

			rect
				.on("mouseover", event => {
                    throw new Error("STUB");
                })
				.on("mousemove", function(event) {
                    throw new Error("STUB");
                })
				.on("mouseout", event => {
                    throw new Error("STUB");
                });
		}

		return rect;
	},

	clickHandlerForSingleX(d, ctx): void {
        throw new Error("STUB");
    },

	/**
	 * Create an eventRect,
	 * Register touch and drag events.
	 * @param {object} eventRectEnter d3.select($EVENT.eventRects) object.
	 * @private
	 */
	generateEventRectsForMultipleXs(eventRectEnter): void {
		const $$ = this;
		const {config, state} = $$;

		eventRectEnter
			.on("click", function(event) {
                throw new Error("STUB");
            })
			.datum({multipleX: true});

		if (state.inputType === "mouse") {
			eventRectEnter
				.on("mouseover mousemove", function(event) {
                    throw new Error("STUB");
                })
				.on("mouseout", event => {
                    throw new Error("STUB");
                });
		}
	},

	clickHandlerForMultipleXS(ctx): void {
        throw new Error("STUB");
    }
};
