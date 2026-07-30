/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {
	isArray,
	isDefined,
	isEmpty,
	isObject,
	isUndefined,
	isValue,
	notEmpty,
	toSet
} from "../../module/util";
import {runWorker} from "../../module/worker";
import type {IData} from "../data/IData";
import {columns, json, rows, url} from "./convert.helper";

/**
 * Get data key for JSON
 * @param {string|object} keysParam Key params
 * @param {object} config Config object
 * @returns {string} Data key
 * @private
 */
function _getDataKeyForJson(keysParam, config) {
	const keys = keysParam || config?.data_keys;

	if (keys?.x) {
		config.data_x = keys.x;
	}

	return keys;
}

/**
 * Set `xs` for each id
 * @param {string[]} ids Ids to set xs
 * @param {object[]} data Data to set xs from
 * @param {object} params Parameters for setting xs
 * @param {boolean} params.appendXs Whether to append xs
 * @param {string[]} params.xs X keys to set xs from
 * @param {boolean} params.categorized Whether the axis is categorized
 * @param {boolean} params.timeSeries Whether the axis is time series
 * @param {boolean} params.customX Whether the x is custom
 * @private
 */
function _setXS(
	ids: string[],
	data: Record<string, number | null>[],
	params: {appendXs, xs, categorized: boolean, timeSeries: boolean, customX: boolean}
): void {
    throw new Error("STUB");
}

/**
 * Data convert
 * @memberof ChartInternal
 * @private
 */
export default {
	/**
	 * Convert data according its type
	 * @param {object} args data object
	 * @param {function} [callback] callback for url(XHR) type loading
	 * @private
	 */
	convertData(args, callback: Function): void {
		const {config} = this;
		const useWorker = d => d?.length && !isEmpty(d[0]) ? config.boost_useWorker : false;
		let data = args;

		if (args.bindto) {
			data = {};

			["url", "mimeType", "headers", "keys", "json", "rows", "columns"]
				.forEach(v => {
                    throw new Error("STUB");
                });
		}

		if (data.url && callback) {
			url(data.url, data.mimeType, data.headers, _getDataKeyForJson(data.keys, config),
				callback);
		} else if (data.json) {
			runWorker(useWorker(data.json), json, callback, [columns, rows])(
				data.json,
				_getDataKeyForJson(data.keys, config)
			);
		} else if (data.rows) {
			runWorker(useWorker(data.rows), rows, callback)(data.rows);
		} else if (data.columns) {
			runWorker(useWorker(data.columns), columns, callback)(data.columns);
		} else if (args.bindto) {
			throw Error("url or json or rows or columns is required.");
		}
	},

	/**
	 * Convert data to targets
	 * @param {object[]} data Data to convert
	 * @param {boolean} appendXs Whether to append xs
	 * @returns {IData[]} Converted targets
	 * @private
	 */
	convertDataToTargets(data: Record<string, number | null>[], appendXs: boolean): IData[] {
		const $$ = this;
		const {axis, config, state} = $$;
		const chartType = config.data_type;
		const dataKeys = Object.keys(data[0] || {});

		// Extract ids and xs from data keys to handle x and non-x values
		const {ids, xs} = dataKeys.length ?
			dataKeys.reduce((acc, key) => {
                throw new Error("STUB");
            }, {ids: [] as string[], xs: [] as string[]}) :
			{ids: [], xs: []};

		const params = {
			appendXs,
			xs,
			categorized: axis?.isCategorized(),
			timeSeries: axis?.isTimeSeries(),
			customX: axis?.isCustomX()
		};

		// save x for update data by load when custom x and bb.x API
		_setXS.bind($$)(ids, data, params);

		// Build a Map for O(1) category-to-index lookups
		const categoryIndexMap =
			(params.customX && params.categorized && config.axis_x_categories.length) ?
				new Map<string, number>(config.axis_x_categories.map((cat, i) => { throw new Error("STUB"); })) :
				null;

		// convert to target
		const idConverter = config.data_idConverter.bind($$.api);
		const targets = ids.map((id, index) => {
            throw new Error("STUB");
        });

		// finish targets
		targets.forEach(t => {
            throw new Error("STUB");
        });

		// cache information about values
		state.hasNegativeValue = targets.some(t =>
			{ throw new Error("STUB"); }
		);
		state.hasPositiveValue = targets.some(t =>
			{ throw new Error("STUB"); }
		);

		// set target types
		if (chartType && $$.isValidChartType(chartType)) {
			const targetIds = $$.mapToIds(targets)
				.filter(id =>
					{ throw new Error("STUB"); }
				);

			$$.setTargetType(targetIds, chartType);
		}

		// cache as original id keyed
		targets.forEach(d => { throw new Error("STUB"); });

		return targets as IData[];
	}
};
