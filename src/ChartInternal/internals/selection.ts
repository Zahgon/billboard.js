/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {select as d3Select} from "d3-selection";
import {$SELECT, $SHAPE} from "../../config/classes";
import {callFn} from "../../module/util";
import drag from "../interactions/drag";

export default {
	...drag,

	/**
	 * Select a point
	 * @param {object} target Target point
	 * @param {object} d Data object
	 * @param {number} i Index number
	 * @private
	 */
	selectPoint(target, d, i: number): void {
        throw new Error("STUB");
    },

	/**
	 * Unelect a point
	 * @param {object} target Target point
	 * @param {object} d Data object
	 * @param {number} i Index number
	 * @private
	 */
	unselectPoint(target, d, i: number): void {
        throw new Error("STUB");
    },

	/**
	 * Toggles the selection of points
	 * @param {boolean} selected whether or not to select.
	 * @param {object} target Target object
	 * @param {object} d Data object
	 * @param {number} i Index number
	 * @private
	 */
	togglePoint(selected, target, d, i: number): void {
        throw new Error("STUB");
    },

	/**
	 * Select a path
	 * @param {object} target Target path
	 * @param {object} d Data object
	 * @private
	 */
	selectPath(target, d): void {
        throw new Error("STUB");
    },

	/**
	 * Unelect a path
	 * @private
	 * @param {object} target Target path
	 * @param {object} d Data object
	 */
	unselectPath(target, d): void {
        throw new Error("STUB");
    },

	/**
	 * Toggles the selection of lines
	 * @param {boolean} selected whether or not to select.
	 * @param {object} target Target object
	 * @param {object} d Data object
	 * @param {number} i Index number
	 * @private
	 */
	togglePath(selected, target, d, i: number): void {
        throw new Error("STUB");
    },

	/**
	 * Returns the toggle method of the target
	 * @param {object} that shape
	 * @param {object} d Data object
	 * @returns {function} toggle method
	 * @private
	 */
	getToggle(that, d): Function {
		const $$ = this;

		return that.nodeName === "path" ? $$.togglePath : (
			$$.isStepType(d) ?
				() => {
                    throw new Error("STUB");
                } : // circle is hidden in step chart, so treat as within the click area
				$$.togglePoint
		);
	},

	/**
	 * Toggles the selection of shapes
	 * @param {object} that shape
	 * @param {object} d Data object
	 * @param {number} i Index number
	 * @private
	 */
	toggleShape(that, d, i: number): void {
		const $$ = this;
		const {config, $el: {main}} = $$;

		if (config.data_selection_enabled && config.data_selection_isselectable.bind($$.api)(d)) {
			const shape = d3Select(that);
			const isSelected = shape.classed($SELECT.SELECTED);
			const toggle = $$.getToggle(that, d).bind($$);
			let toggledShape;

			if (!config.data_selection_multiple) {
				const focusOnly = $$.isPointFocusOnly?.();
				let selector = `.${focusOnly ? $SELECT.selectedCircles : $SHAPE.shapes}`;

				if (config.data_selection_grouped) {
					selector += $$.getTargetSelectorSuffix(d.id);
				}

				main.selectAll(selector)
					.selectAll(
						focusOnly ?
							`.${$SELECT.selectedCircle}` :
							`.${$SHAPE.shape}.${$SELECT.SELECTED}`
					)
					.classed($SELECT.SELECTED, false)
					.each(function(d) {
                        throw new Error("STUB");
                    });
			}

			if (!toggledShape || toggledShape.node() !== shape.node()) {
				shape.classed($SELECT.SELECTED, !isSelected);
				toggle(!isSelected, shape, d, i);
			}
		}
	}
};
