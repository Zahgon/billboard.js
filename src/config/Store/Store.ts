/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import Element from "./Element";
import State from "./State";

// mapping
const classes = {
	element: Element,
	state: State
};

/**
 * Internal store class.
 * @class Store
 * @ignore
 * @private
 */
export default class Store {
	constructor() {
        throw new Error("STUB");
    }

	getStore(name: string): Element | State {
        throw new Error("STUB");
    }
}
