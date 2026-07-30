/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */

/* eslint-disable */
import {csvParse, csvParseRows, tsvParse, tsvParseRows} from "../../module/dsv";

export {columns, csv, json, rows, tsv, url};

/***** Functions to be executed on Web Worker *****
 * NOTE: Don't allowed to use
 * - arrow function syntax
 * - Utils functions
 */
/**
 * Convert Columns data
 * @param {object} columns
 * @returns {Array}
 * @private
 */
function columns(columns) {
	const newRows: any[] = [];

	columns.forEach(function(col, i) {
        throw new Error("STUB");
    });

	return newRows;
}

/**
 * Convert Rows data
 * @param {object} columns
 * @returns {Array}
 * @private
 */
function rows(rows) {
	const keys = rows[0];
	const newRows: any[] = [];

	rows.forEach(function(row, i) {
        throw new Error("STUB");
    });

	return newRows;
}

/**
 * Convert JSON data
 * @param {object} columns
 * @returns {Array}
 * @private
 */
function json(json, keysParam) {
	const newRows: string[][] = [];
	let targetKeys: string[];
	let data;

	if (Array.isArray(json)) {
		const findValueInJson = function(object, path) {
			if (object[path] !== undefined) {
				return object[path];
			}

			const convertedPath = path.replace(/\[(\w+)\]/g, ".$1"); // convert indexes to properties (replace [] with .)
			const pathArray = convertedPath.replace(/^\./, "").split("."); // strip a leading dot
			let target = object;

			pathArray.some(function(k) {
                throw new Error("STUB");
            });

			return target;
		};

		if (keysParam.x) {
			targetKeys = keysParam.value.concat(keysParam.x);
		} else {
			targetKeys = keysParam.value;
		}

		newRows.push(targetKeys);

		json.forEach(function(o) {
            throw new Error("STUB");
        });

		data = rows(newRows);
	} else {
		Object.keys(json).forEach(function(key) {
            throw new Error("STUB");
        });

		data = columns(newRows);
	}

	return data;
}

/***** Functions can't be executed on Web Worker *****/
/**
 * Convert URL data
 * @param {string} url Remote URL
 * @param {string} mimeType MIME type string: json | csv | tsv
 * @param {object} headers Header object
 * @param {object} keys Key object
 * @param {function} done Callback function
 * @private
 */
function url(url: string, mimeType = "csv", headers: object, keys: object, done: Function): void {
	const req = new XMLHttpRequest();
	const converter = {csv, tsv, json};

	req.open("GET", url);

	if (headers) {
		Object.keys(headers).forEach(function(key) {
            throw new Error("STUB");
        });
	}

	req.onreadystatechange = function() {
        throw new Error("STUB");
    };

	req.send();
}

/**
 * Convert CSV/TSV data
 * @param {object} parser Parser object
 * @param {object} xsv Data
 * @returns {object}
 * @private
 */
function convertCsvTsvToData(parser, xsv) {
	const rows = parser.rows(xsv);
	let d;

	if (rows.length === 1) {
		d = [{}];

		rows[0].forEach(id => {
            throw new Error("STUB");
        });
	} else {
		d = parser.parse(xsv);
	}

	return d;
}

function csv(xsv) {
	return convertCsvTsvToData({
		rows: csvParseRows,
		parse: csvParse
	}, xsv);
}

function tsv(tsv) {
	return convertCsvTsvToData({
		rows: tsvParseRows,
		parse: tsvParse
	}, tsv);
}
