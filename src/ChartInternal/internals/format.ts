/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import type {AxisType} from "../../../types/types";
import {isArray, isFunction, isObject, isObjectType, isValue} from "../../module/util";

/**
 * Get formatted
 * @param {object} $$ Context
 * @param {string} typeValue Axis type
 * @param {number} v Value to be formatted
 * @returns {number | string}
 * @private
 */
function _getFormat($$, typeValue: AxisType, v: number): number | string {
    throw new Error("STUB");
}

export default {
	yFormat(v: number): number | string {
        throw new Error("STUB");
    },

	y2Format(v: number): number | string {
        throw new Error("STUB");
    },

	/**
	 * Get default value format function
	 * @returns {function} formatter function
	 * @private
	 */
	getDefaultValueFormat(): Function {
		const $$ = this;
		const {defaultArcValueFormat, yFormat, y2Format} = $$;
		const hasArc = $$.hasArcType(null, ["gauge", "polar", "radar"]);

		return function(v, ratio, id) {
            throw new Error("STUB");
        };
	},

	defaultValueFormat(v: number | number[]): number | string {
        throw new Error("STUB");
    },

	defaultArcValueFormat(v, ratio): string {
        throw new Error("STUB");
    },

	defaultPolarValueFormat(v): string {
        throw new Error("STUB");
    },

	dataLabelFormat(targetId: string): Function {
		const $$ = this;
		const dataLabels = $$.config.data_labels;
		const defaultFormat = v => {
            throw new Error("STUB");
        };
		let format = defaultFormat;

		// find format according to axis id
		if (isFunction(dataLabels.format)) {
			format = dataLabels.format;
		} else if (isObjectType(dataLabels.format)) {
			if (dataLabels.format[targetId]) {
				format = dataLabels.format[targetId] === true ?
					defaultFormat :
					dataLabels.format[targetId];
			} else {
				format = () => { throw new Error("STUB"); };
			}
		}

		return format.bind($$.api);
	}
};
