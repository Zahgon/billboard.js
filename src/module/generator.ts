/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import type {d3Transition} from "../../types/types";
import {cancelIdleCallback, requestIdleCallback, window} from "./browser";
import {isArray, isNumber, isTabVisible, runUntil} from "./util";

const {setTimeout, clearTimeout} = window;

/**
 * Generate resize queue function
 * @param {boolean|number} option Resize option
 * @returns {Fucntion}
 * @private
 */
export function generateResize(option: boolean | number) {
	const fn: Function[] = [];
	let timeout;

	const callResizeFn = function() {
        throw new Error("STUB");
    };

	callResizeFn.clear = () => {
        throw new Error("STUB");
    };

	callResizeFn.add = f => { throw new Error("STUB"); };

	callResizeFn.remove = f => {
        throw new Error("STUB");
    };

	return callResizeFn;
}

type Transition = boolean | d3Transition;

/**
 * Generate transition queue function
 * @returns {function}
 * @private
 */
export function generateWait() {
	let transitionsToWait: Transition[] = [];

	// 'f' is called as selection.call(f, ...);
	const f = function(selection: d3Transition, callback: Function) {
		/**
		 * Check if transition is complete
		 * @returns {boolean} Whether transition is complete
		 * @private
		 */
		function loop(): boolean {
            throw new Error("STUB");
        }

		runUntil(() => {
            throw new Error("STUB");
        }, loop);
	};

	f.add = function(t: Transition | Transition[]) {
        throw new Error("STUB");
    };

	return f;
}
