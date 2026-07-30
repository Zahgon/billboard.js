/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {loadConfig} from "../config/config";

/**
 * Base class to generate billboard.js plugin
 * @class Plugin
 */
/**
 * Version info string for plugin
 * @name version
 * @static
 * @memberof Plugin
 * @type {string}
 * @example
 *   bb.plugin.stanford.version;  // ex) 1.9.0
 */
export default class Plugin {
	public $$;
	public options;
	public config;
	static version = "__VERSION__";

	/**
	 * Constructor
	 * @param {Any} options config option object
	 * @private
	 */
	constructor(options = {}) {
		this.options = options;
	}

	/**
	 * Load plugin config from options
	 * @private
	 */
	loadConfig(): void {
        throw new Error("STUB");
    }

	/**
	 * Lifecycle hook for 'beforeInit' phase.
	 * @private
	 */
	$beforeInit() {
        throw new Error("STUB");
    }

	/**
	 * Lifecycle hook for 'init' phase.
	 * @private
	 */
	$init() {
        throw new Error("STUB");
    }

	/**
	 * Lifecycle hook for 'afterInit' phase.
	 * @private
	 */
	$afterInit() {
        throw new Error("STUB");
    }

	/**
	 * Lifecycle hook for 'redraw' phase.
	 * @private
	 */
	$redraw() {
        throw new Error("STUB");
    }

	/**
	 * Lifecycle hook for 'willDestroy' phase.
	 * @private
	 */
	$willDestroy() {
        throw new Error("STUB");
    }
}
