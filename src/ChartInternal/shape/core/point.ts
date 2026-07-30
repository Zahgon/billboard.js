/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {namespaces as d3Namespaces, select as d3Select} from "d3-selection";
import {document} from "../../../module/browser";
import {isFunction, isObjectType, notEmpty, sanitize, toArray} from "../../../module/util";

/**
 * Check if point draw methods are valid
 * @param {string} point point type
 * @returns {boolean}
 * @private
 */
function _hasValidPointDrawMethods(point: string): boolean {
	return isObjectType(point) &&
		isFunction(point.create) && isFunction(point.update);
}

/**
 * Insert point info defs element
 * @param {string} point Point element
 * @param {string} id Point id
 * @private
 */
function _insertPointInfoDefs(point: string, id: string): void {
    throw new Error("STUB");
}

export default {
	/**
	 * Check if point type option is valid
	 * @param {string} type point type
	 * @returns {boolean}
	 * @private
	 */
	hasValidPointType(type?: string): boolean {
		// For point.pattern, allow additional SVG shape tags (polygon, ellipse, use)
		// These will be sanitized before use
		return /^(circle|rect(angle)?|polygon|ellipse|use)$/i.test(type || this.config.point_type);
	},

	/**
	 * Check if pattern point is set to be used on legend
	 * @returns {boolean}
	 * @private
	 */
	hasLegendDefsPoint(): boolean {
		const {config} = this;

		return config.legend_show && config.point_pattern?.length && config.legend_usePoint;
	},

	getDefsPointId(id: string): string {
		const {state: {datetimeId}} = this;

		return `${datetimeId}-point${id}`;
	},

	/**
	 * Get validated point pattern array
	 * @returns {Array} Array of point types
	 * @private
	 */
	getValidPointPattern(): string[] {
		const {config} = this;

		// Ensure point_type is restricted to 'circle' or 'rectangle' only
		const validPointType = /^(circle|rect(angle)?)$/i.test(config.point_type) ?
			config.point_type :
			"circle";

		return notEmpty(config.point_pattern) ? config.point_pattern : [validPointType];
	},

	/**
	 * Get generate point function
	 * @returns {function}
	 * @private
	 */
	generatePoint(): Function {
		const $$ = this;
		const {$el, config} = $$;
		const ids: string[] = [];
		const pattern = $$.getValidPointPattern();

		return function(method, context, ...args) {
            throw new Error("STUB");
        };
	}
};
