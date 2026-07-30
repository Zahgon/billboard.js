/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {isArray, isNumber, isObject} from "../../../module/util";
import type {IOffset} from "../IShape";

/**
 * Parsed candlestick OHLC data.
 * @private
 */
interface ICandlestickData {
	open: number;
	high: number;
	low: number;
	close: number;
	volume?: number;
	_isUp?: boolean;
}

export default {
	/**
	 * Generate shape drawing points
	 * @param {object} indices Indice data
	 * @param {boolean} isSub Subchart draw
	 * @returns {function}
	 */
	generateGetCandlestickPoints(indices, isSub = false): (d, i) => number[][] {
		const $$ = this;
		const axis = isSub ? $$.axis.subX : $$.axis.x;
		const targetsNum = $$.getIndicesMax(indices) + 1;
		const barW: IOffset = $$.getBarW("candlestick", axis, targetsNum);
		const x = $$.getShapeX(barW, indices, !!isSub);
		const y = $$.getShapeY(!!isSub);
		const shapeOffset = $$.getShapeOffset($$.isCandlestickType, indices, !!isSub);
		const yScale = $$.getYScaleById.bind($$);

		return (d, i) => {
            throw new Error("STUB");
        };
	},

	/**
	 * Get candlestick data as object
	 * @param {object} param Data object
	 * @param {Array|object} param.value Data value
	 * @returns {object|null} Converted data object
	 * @private
	 */
	getCandlestickData({value}): ICandlestickData | null {
		let d;

		if (isArray(value)) {
			const [open, high, low, close, volume = false] = value;

			d = {open, high, low, close};

			if (volume !== false) {
				d.volume = volume;
			}
		} else if (isObject(value)) {
			d = {...value};
		}

		if (d) {
			d._isUp = d.close >= d.open;
		}

		return d || null;
	}
};
