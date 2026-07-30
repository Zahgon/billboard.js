/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {select as d3Select} from "d3-selection";
import type {d3Selection} from "../../../types/types";
import {$BAR, $CIRCLE, $COMMON, $DRAG, $SELECT, $SHAPE} from "../../config/classes";
import {getPathBox, scheduleRAFUpdate} from "../../module/util";

/**
 * Module used for data.selection.draggable option
 */
export default {
	/**
	 * Called when dragging.
	 * Data points can be selected.
	 * @private
	 * @param {object} mouse Object
	 */
	drag(mouse): void {
		const $$ = this;
		const {config, state, $el: {main}} = $$;
		const isSelectionGrouped = config.data_selection_grouped;
		const isSelectable = config.interaction_enabled && config.data_selection_isselectable;

		if (
			$$.hasArcType() ||
			!config.data_selection_enabled || // do nothing if not selectable
			(config.zoom_enabled && !$$.zoom.altDomain) || // skip if zoomable because of conflict drag behavior
			!config.data_selection_multiple // skip when single selection because drag is used for multiple selection
		) {
			return;
		}

		const [sx, sy] = state.dragStart || [0, 0];
		const [mx, my] = mouse;

		const minX = Math.min(sx, mx);
		const maxX = Math.max(sx, mx);
		const minY = isSelectionGrouped ? state.margin.top : Math.min(sy, my);
		const maxY = isSelectionGrouped ? state.height : Math.max(sy, my);

		// Use RAF batching to smooth out rapid drag events
		const executeDrag = () => {
            throw new Error("STUB");
        };

		scheduleRAFUpdate($$.state, executeDrag);
	},

	/**
	 * Called when the drag starts.
	 * Adds and Shows the drag area.
	 * @private
	 * @param {object} mouse Object
	 */
	dragstart(mouse): void {
		const $$ = this;
		const {config, state, $el: {main}} = $$;

		if ($$.hasArcType() || !config.data_selection_enabled) {
			return;
		}

		state.dragStart = mouse;

		main.select(`.${$COMMON.chart}`)
			.append("rect")
			.attr("class", $DRAG.dragarea)
			.style("opacity", "0.1");

		$$.setDragStatus(true);
	},

	/**
	 * Called when the drag finishes.
	 * Removes the drag area.
	 * @private
	 */
	dragend(): void {
		const $$ = this;
		const {config, $el: {main}, $T} = $$;

		if ($$.hasArcType() || !config.data_selection_enabled) { // do nothing if not selectable
			return;
		}

		$T(main.select(`.${$DRAG.dragarea}`))
			.style("opacity", "0")
			.remove();

		main.selectAll(`.${$SHAPE.shape}`)
			.classed($DRAG.INCLUDED, false);

		$$.setDragStatus(false);
	}
};
