/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {select as d3Select} from "d3-selection"; // selection
import type {RegionOptions} from "../../../types/options";
import type {AxisType} from "../../../types/types";
import {$REGION} from "../../config/classes";
import {getBoundingRect, isString, isValue, parseDate} from "../../module/util";

export default {
	initRegion(): void {
		const $$ = this;
		const {$el} = $$;

		$el.region.main = $el.main
			.insert("g", ":first-child")
			.attr("clip-path", $$.state.clip.path)
			.attr("class", $REGION.regions);
	},

	updateRegion(): void {
		const $$ = this;
		const {config, $el: {region}, $T} = $$;

		if (!region.main) {
			$$.initRegion();
		}

		// hide if arc type
		region.main.style("visibility", $$.hasArcType() ? "hidden" : null);

		// select <g> element
		const regions = region.main
			.selectAll(`.${$REGION.region}`)
			.data(config.regions);

		$T(regions.exit())
			.style("opacity", "0")
			.remove();

		const regionsEnter = regions
			.enter()
			.append("g");

		regionsEnter
			.append("rect")
			.style("fill-opacity", "0");

		region.list = regionsEnter
			.merge(regions)
			.attr("class", $$.classRegion.bind($$));

		region.list.each(function(d) {
            throw new Error("STUB");
        });
	},

	redrawRegion(withTransition: boolean) {
		const $$ = this;
		const {$el: {region}, $T} = $$;
		const regionX = $$.regionX.bind($$);
		const regionY = $$.regionY.bind($$);
		const attr = ["width", "height"];
		let regions = region.list.select("rect");
		let label = region.list.selectAll("text");

		regions = $T(regions, withTransition)
			.attr("x", regionX)
			.attr("y", regionY)
			.attr("width", $$.regionWidth.bind($$))
			.attr("height", $$.regionHeight.bind($$));

		label = $T(label, withTransition)
			.text(d => { throw new Error("STUB"); })
			// pre-rotate so that the centering math below measures the rotated bounding box
			.attr("transform", ({label}) => { throw new Error("STUB"); })
			.attr("transform", function(d) {
                throw new Error("STUB");
            })
			.attr("text-anchor", ({label}) => { throw new Error("STUB"); })
			.attr("dy", "1em")
			.style("fill", ({label}) => { throw new Error("STUB"); });

		return [
			regions
				.style("fill-opacity", d => { throw new Error("STUB"); })
				.on("end", function() {
                    throw new Error("STUB");
                }),
			label.style("opacity", null)
		];
	},

	regionX(d: RegionOptions): number {
		return this.getRegionSize("x", d);
	},

	regionY(d: RegionOptions): number {
		return this.getRegionSize("y", d);
	},

	regionWidth(d: RegionOptions): number {
        throw new Error("STUB");
    },

	regionHeight(d: RegionOptions): number {
        throw new Error("STUB");
    },

	/**
	 * Get Region size according start/end position
	 * @param {string} type Type string
	 * @param {ojbect} d Data object
	 * @returns {number}
	 * @private
	 */
	getRegionSize(type: AxisType | "width" | "height", d: RegionOptions): number {
		const $$ = this;
		const {config, scale, state} = $$;
		const isRotated = config.axis_rotated;
		const isAxisType = /(x|y|y2)/.test(type);

		const isType = isAxisType ? type === "x" : type === "width";
		const start = !isAxisType && $$[isType ? "regionX" : "regionY"](d);
		let key = isAxisType ? "start" : "end";
		let pos = isAxisType ? 0 : state[type];
		let currScale;

		if (d.axis === "y" || d.axis === "y2") {
			if (!isAxisType && !isType) {
				key = "start";
			} else if (isAxisType && !isType) {
				key = "end";
			}

			if ((isType ? isRotated : !isRotated) && key in d) {
				currScale = scale[d.axis];
			}
		} else if ((isType ? !isRotated : isRotated) && key in d) {
			currScale = scale.zoom || scale.x;
		}

		if (currScale) {
			let offset = 0;
			pos = d[key];

			if ($$.axis.isTimeSeries(d.axis)) {
				pos = parseDate.call($$, pos);
			} else if (/(x|width)/.test(type) && $$.axis.isCategorized() && isNaN(pos)) {
				pos = config.axis_x_categories.indexOf(pos);
				offset = $$.axis.x.tickOffset() * (key === "start" ? -1 : 1);
			}

			pos = currScale(pos) + offset;
		}

		return isAxisType ? pos : pos < start ? 0 : pos - start;
	},

	isRegionOnX(d: RegionOptions): boolean {
        throw new Error("STUB");
    }
};
