/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {drag as d3Drag} from "d3-drag";
import {
	zoom as d3Zoom,
	zoomIdentity as d3ZoomIdentity,
	zoomTransform as d3ZoomTransform
} from "d3-zoom";
import {$COMMON, $ZOOM} from "../../config/classes";
import {window} from "../../module/browser";
import {callFn, diffDomain, getPointer, isFunction, scheduleRAFUpdate} from "../../module/util";

/**
 * Get the element that owns zoom interaction state.
 * @param {object} $$ ChartInternal instance
 * @returns {object} d3 selection
 * @private
 */
function getZoomTarget($$) {
	return $$.state.isCanvasMode ? $$.$el.canvas : $$.$el.eventRect;
}

/**
 * Convert a canvas-space transform to plot-space transform.
 * @param {object} $$ ChartInternal instance
 * @param {object} transform d3 zoom transform
 * @returns {object} Plot-space transform
 * @private
 */
function toPlotZoomTransform($$, transform) {
	if (!$$.state.isCanvasMode) {
		return transform;
	}

	const {margin} = $$.state;

	return d3ZoomIdentity
		.translate(
			transform.x + (transform.k - 1) * margin.left,
			transform.y + (transform.k - 1) * margin.top
		)
		.scale(transform.k);
}

/**
 * Convert a plot-space transform to canvas-space transform.
 * @param {object} $$ ChartInternal instance
 * @param {object} transform d3 zoom transform
 * @returns {object} Canvas-space transform
 * @private
 */
function toCanvasZoomTransform($$, transform) {
	if (!$$.state.isCanvasMode) {
		return transform;
	}

	const {margin} = $$.state;

	return d3ZoomIdentity
		.translate(
			transform.x - (transform.k - 1) * margin.left,
			transform.y - (transform.k - 1) * margin.top
		)
		.scale(transform.k);
}

/**
 * Get plot-local pointer coordinates for zoom drag.
 * @param {object} $$ ChartInternal instance
 * @param {object} event Event object
 * @param {HTMLElement|SVGElement} element Event element
 * @returns {Array} Plot-local pointer
 * @private
 */
function getZoomDragPointer($$, event, element): number[] {
	const pointer = getPointer(event, element);

	if ($$.state.isCanvasMode) {
		const {margin} = $$.state;

		pointer[0] -= margin.left;
		pointer[1] -= margin.top;
	}

	return pointer;
}

export default {
	/**
	 * Initialize zoom.
	 * @private
	 */
	initZoom(): void {
		const $$ = this;

		$$.scale.zoom = null;

		$$.generateZoom();

		$$.config.zoom_type === "drag" &&
			$$.initZoomBehaviour();
	},

	/**
	 * Bind zoom event
	 * @param {boolean} bind Weather bind or unbound
	 * @private
	 */
	bindZoomEvent(bind = true): void {
		const $$ = this;
		const {config} = $$;
		const zoomEnabled = config.zoom_enabled;

		if (zoomEnabled && bind) {
			// Do not bind zoom event when subchart is shown
			!config.subchart_show &&
				$$.bindZoomOnEventRect();
		} else if (bind === false) {
			$$.api.unzoom();
			$$.unbindZoomEvent();
		}
	},

	/**
	 * Generate zoom
	 * @private
	 */
	generateZoom(): void {
		const $$ = this;
		const {config, org, scale} = $$;

		const zoom = d3Zoom().duration(0)
			.on("start", $$.onZoomStart.bind($$))
			.on("zoom", $$.onZoom.bind($$))
			.on("end", $$.onZoomEnd.bind($$));

		// get zoom extent
		// @ts-ignore
		zoom.orgScaleExtent = (): [number, number] => {
            throw new Error("STUB");
        };

		// @ts-ignore
		zoom.updateScaleExtent = function() {
            throw new Error("STUB");
        };

		/**
		 * Update scale according zoom transform value
		 * @param {object} transform transform object
		 * @param {boolean} correctTransform if the d3 transform should be updated after rescaling
		 * @private
		 */
		// @ts-ignore
		zoom.updateTransformScale = (transform: d3ZoomTransform,
			correctTransform: boolean): void => {
            throw new Error("STUB");
        };

		/**
		 * Get zoom domain
		 * @returns {Array} zoom domain
		 * @private
		 */
		// @ts-ignore
		zoom.getDomain = (): (number | Date)[] => {
            throw new Error("STUB");
        };

		$$.zoom = zoom;
	},

	/**
	 * 'start' event listener
	 * @param {object} event Event object
	 * @private
	 */
	onZoomStart(event): void {
		const $$ = this;
		const {sourceEvent} = event;

		if (sourceEvent) {
			$$.zoom.startEvent = sourceEvent;
			$$.state.zooming = true;
			callFn($$.config.zoom_onzoomstart, $$.api, event);
		}
	},

	/**
	 * 'zoom' event listener
	 * @param {object} event Event object
	 * @private
	 */
	onZoom(event): void {
        throw new Error("STUB");
    },

	/**
	 * 'end' event listener
	 * @param {object} event Event object
	 * @private
	 */
	onZoomEnd(event): void {
        throw new Error("STUB");
    },

	/**
	 * Update zoom
	 * @param {boolean} force Force unzoom
	 * @private
	 */
	updateZoom(force: boolean): void {
		const $$ = this;
		const {subX, x, zoom} = $$.scale;

		if (zoom) {
			const zoomDomain = zoom.domain();
			const xDomain = subX.domain();
			const delta = 0.015; // arbitrary value

			const isfullyShown = $$.config.axis_x_inverted ?
				(
					zoomDomain[0] >= xDomain[0] || (zoomDomain[0] + delta) >= xDomain[0]
				) && (
					xDomain[1] >= zoomDomain[1] || xDomain[1] >= (zoomDomain[1] + delta)
				) :
				(
					zoomDomain[0] <= xDomain[0] || (zoomDomain[0] - delta) <= xDomain[0]
				) && (
					xDomain[1] <= zoomDomain[1] || xDomain[1] <= (zoomDomain[1] - delta)
				);

			// check if the zoomed chart is fully shown, then reset scale when zoom is out as initial
			if (force || isfullyShown) {
				$$.axis.x.scale(subX);
				x.domain(subX.orgDomain());
				$$.scale.zoom = null;
			}
		}
	},

	/**
	 * Set zoom transform to event rect
	 * @param {function} x x Axis scale function
	 * @param {Array} domain Domain value to be set
	 * @private
	 */
	updateCurrentZoomTransform(x, domain: [number, number]): void {
		const $$ = this;
		const {config} = $$;
		const isRotated = config.axis_rotated;

		// Get transform from given domain value
		// https://github.com/d3/d3-zoom/issues/57#issuecomment-246434951
		const translate = [-x(domain[0]), 0];
		const transform = d3ZoomIdentity
			.scale(x.range()[1] / (
				x(domain[1]) - x(domain[0])
			))
			.translate(
				...(isRotated ? translate.reverse() : translate) as [number, number]
			);

		getZoomTarget($$)?.call($$.zoom.transform, toCanvasZoomTransform($$, transform));
	},

	/**
	 * Attach zoom event on <rect>
	 * @private
	 */
	bindZoomOnEventRect(): void {
		const $$ = this;
		const {config, $el: {svg}} = $$;
		const target = getZoomTarget($$);
		const behaviour = config.zoom_type === "drag" ? $$.zoomBehaviour : $$.zoom;

		$$.state.isCanvasMode &&
			behaviour?.touchable?.(() => { throw new Error("STUB"); });

		// On Safari, event can't be built inside the svg content
		// for workaround, register wheel event on <svg> element first
		// https://bugs.webkit.org/show_bug.cgi?id=226683#c3
		// https://stackoverflow.com/questions/67836886/wheel-event-is-not-fired-on-a-svg-group-element-in-safari
		if (
			!$$.state.isCanvasMode &&
			window.GestureEvent &&
			/^((?!chrome|android|mobile).)*safari/i.test(window.navigator?.userAgent)
		) {
			svg.on("wheel", () => {
                throw new Error("STUB");
            });
		}

		target?.call(behaviour)
			.on("dblclick.zoom", null);
	},

	/**
	 * Initialize the drag behaviour used for zooming.
	 * @private
	 */
	initZoomBehaviour(): void {
		const $$ = this;
		const {config, state} = $$;
		const isRotated = config.axis_rotated;
		let start = 0;
		let end = 0;
		let zoomRect;
		let extent;

		const prop = {
			axis: isRotated ? "y" : "x",
			attr: isRotated ? "height" : "width",
			index: isRotated ? 1 : 0
		};

		// Clamp pointer position to a valid range. When axis.x.extent is
		// configured it takes precedence; otherwise fall back to chart bounds
		// so that releasing outside the chart (issue #4131) still produces a
		// usable end value instead of being silently dropped by withinRange().
		const clampPointer = (v: number): number => {
			const [lo, hi] = extent ?? [0, isRotated ? state.height : state.width];

			return Math.min(Math.max(v, lo), hi);
		};

		$$.zoomBehaviour = d3Drag()
			.touchable(() => { throw new Error("STUB"); })
			.clickDistance(4)
			.on("start", function(event) {
                throw new Error("STUB");
            })
			.on("drag", function(event) {
                throw new Error("STUB");
            })
			.on("end", event => {
                throw new Error("STUB");
            });
	},

	setZoomResetButton(): void {
		const $$ = this;
		const {config, $el} = $$;
		const resetButton = config.zoom_resetButton;

		if (resetButton && config.zoom_type === "drag") {
			if (!$el.zoomResetBtn) {
				$el.zoomResetBtn = $$.$el.chart.append("div")
					.classed($COMMON.button, true)
					.append("span")
					.on("click", function() {
                        throw new Error("STUB");
                    })
					.classed($ZOOM.buttonZoomReset, true)
					.text(resetButton.text || "Reset Zoom");
			} else {
				$el.zoomResetBtn.style("display", null);
			}
		}
	},

	getZoomTransform() {
		const $$ = this;
		const target = getZoomTarget($$);
		const node = target?.node();

		return node ? toPlotZoomTransform($$, d3ZoomTransform(node)) : {k: 1};
	}
};
