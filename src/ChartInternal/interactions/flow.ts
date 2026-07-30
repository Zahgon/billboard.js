/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import CLASS from "../../config/classes";
import {generateWait} from "../../module/generator";
import {diffDomain} from "../../module/util";

export default {
	/**
	 * Generate flow
	 * @param {object} args option object
	 * @returns {function}
	 * @private
	 */
	generateFlow(args): Function {
		const $$ = this;
		const {data, state, $el} = $$;

		return function() {
            throw new Error("STUB");
        };
	},

	/**
	 * Set flow list
	 * @param {object} elements Target elements
	 * @param {object} args option object
	 * @private
	 */
	setFlowList(elements, args): void {
		const $$ = this;
		const {flow, targets} = args;
		const {
			duration = args.duration,
			index: flowIndex,
			length: flowLength,
			orgDataCount
		} = flow;

		const transform = $$.getFlowTransform(targets, orgDataCount, flowIndex, flowLength);
		const wait = generateWait();
		let n;

		wait.add(Object.keys(elements).map(v => {
            throw new Error("STUB");
        }));

		n.call(wait, () => {
            throw new Error("STUB");
        });
	},

	/**
	 * Clean up flow
	 * @param {object} elements Target elements
	 * @param {object} args option object
	 * @private
	 */
	cleanUpFlow(elements, args): void {
		const $$ = this;
		const {config, state, $el: {svg}} = $$;
		const isRotated = config.axis_rotated;

		const {flow, shape, xv} = args;
		const {cx, cy, xForText, yForText} = shape.pos;
		const {
			done = () => {
                throw new Error("STUB");
            },
			length: flowLength
		} = flow;

		// Remove flowed elements
		if (flowLength) {
			["circle", "text", "shape", "eventRect"].forEach(v => {
                throw new Error("STUB");
            });

			svg.select(`.${CLASS.xgrid}`)
				.remove();
		}

		// draw again for removing flowed elements and reverting attr
		Object.keys(elements).forEach(v => {
            throw new Error("STUB");
        });

		config.interaction_enabled && $$.redrawEventRect();

		// callback for end of flow
		done.call($$.api);

		state.flowing = false;
	},

	/**
	 * Get flow transform value
	 * @param {object} targets target
	 * @param {number} orgDataCount original data count
	 * @param {number} flowIndex flow index
	 * @param {number} flowLength flow length
	 * @returns {string}
	 * @private
	 */
	getFlowTransform(targets, orgDataCount, flowIndex, flowLength): string {
		const $$ = this;
		const {data, scale: {x}} = $$;
		const dataValues = data.targets[0].values;

		let flowStart = $$.getValueOnIndex(dataValues, flowIndex);
		let flowEnd = $$.getValueOnIndex(dataValues, flowIndex + flowLength);
		let translateX;

		// update x domain to generate axis elements for flow
		const orgDomain = x.domain();
		const domain = $$.updateXDomain(targets, true, true);

		// generate transform to flow
		if (!orgDataCount) { // if empty
			if (dataValues.length !== 1) {
				translateX = x(orgDomain[0]) - x(domain[0]);
			} else {
				if ($$.axis.isTimeSeries()) {
					flowStart = $$.getValueOnIndex(dataValues, 0);
					flowEnd = $$.getValueOnIndex(dataValues, dataValues.length - 1);
					translateX = x(flowStart.x) - x(flowEnd.x);
				} else {
					translateX = diffDomain(domain) / 2;
				}
			}
		} else if (orgDataCount === 1 || flowStart?.x === flowEnd?.x) {
			translateX = x(orgDomain[0]) - x(domain[0]);
		} else {
			translateX = $$.axis.isTimeSeries() ?
				x(orgDomain[0]) - x(domain[0]) :
				x(flowStart?.x || 0) - x(flowEnd.x);
		}

		const scaleX = diffDomain(orgDomain) / diffDomain(domain);

		return `translate(${translateX},0) scale(${scaleX},1)`;
	}
};
