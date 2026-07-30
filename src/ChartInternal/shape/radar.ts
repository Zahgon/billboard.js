/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {select as d3Select} from "d3-selection";
import {$AXIS, $COMMON, $LEVEL, $RADAR, $SHAPE, $TEXT} from "../../config/classes";
import {KEY} from "../../module/Cache";
import {
	getBoundingRect,
	getMinMax,
	getPathBox,
	getRange,
	isDefined,
	isEmpty,
	isNumber,
	isUndefined,
	setTextValue,
	toArray
} from "../../module/util";

/**
 * Get the position value
 * @param {boolean} isClockwise If the direction is clockwise
 * @param {string} type Coordinate type 'x' or 'y'
 * @param {number} edge Number of edge
 * @param {number} pos The indexed position
 * @param {number} range Range value
 * @param {number} ratio Ratio value
 * @returns {number}
 * @private
 */
function _getPosition(isClockwise: boolean, type: "x" | "y", edge: number, pos: number,
	range: number, ratio: number): number {
	const index = isClockwise && pos > 0 ? edge - pos : pos;
	const r = 2 * Math.PI;
	const func = type === "x" ? Math.sin : Math.cos;

	return range * (1 - ratio * func(index * r / edge));
}

// cache key
const cacheKeyPoints = KEY.radarPoints;
const cacheKeyTextWidth = KEY.radarTextWidth;

export default {
	initRadar(): void {
        throw new Error("STUB");
    },

	getRadarSize(): [number, number] {
		const $$ = this;
		const {config, state: {arcWidth, arcHeight}} = $$;
		const padding = config.axis_x_categories.length < 4 ? -20 : 10;
		const size = (Math.min(arcWidth, arcHeight) - padding) / 2;

		return [size, size];
	},

	updateTargetsForRadar(targets): void {
        throw new Error("STUB");
    },

	getRadarPosition(type, index: number, range, ratio: number): number {
		const $$ = this;
		const {config} = $$;
		const [width, height] = $$.getRadarSize();
		const edge = config.axis_x_categories.length;
		const isClockwise = config.radar_direction_clockwise;

		const pos = toArray(type).map(v =>
			{ throw new Error("STUB"); }
		);

		return pos.length === 1 ? pos[0] : pos;
	},

	/**
	 * Generate data points
	 * @private
	 */
	generateRadarPoints(): void {
		const $$ = this;
		const targets = $$.data.targets;

		const [width, height] = $$.getRadarSize();
		const points = $$.cache.get(cacheKeyPoints) || {};
		const size = points._size;

		// recalculate position only when the previous dimension has been changed
		if (!size || (size.width !== width && size.height !== height)) {
			targets.forEach(d => {
                throw new Error("STUB");
            });

			points._size = {width, height};
			$$.cache.add(cacheKeyPoints, points);
		}
	},

	redrawRadar(): void {
		const $$ = this;
		const {radar, main} = $$.$el;
		const translate = $$.getTranslate("radar");

		// Adjust radar, circles and texts' position
		if (translate) {
			radar.attr("transform", translate);
			main.select(`.${$TEXT.chartTexts}`).attr("transform", translate);

			$$.generateRadarPoints();
			$$.updateRadarLevel();
			$$.updateRadarAxes();
			$$.updateRadarShape();
		}
	},

	generateGetRadarPoints(): Function {
        throw new Error("STUB");
    },

	updateRadarLevel(): void {
		const $$ = this;
		const {config, state, $el: {radar}} = $$;
		const [width, height] = $$.getRadarSize();
		const depth = config.radar_level_depth;
		const edge = config.axis_x_categories.length;
		const showText = config.radar_level_text_show;

		const radarLevels = radar.levels;
		const levelData = getRange(0, depth);

		const radius = config.radar_size_ratio * Math.min(width, height);
		const levelRatio = levelData.map(l => { throw new Error("STUB"); });
		const levelTextFormat = (config.radar_level_text_format || function() {
            throw new Error("STUB");
        }).bind($$.api);

		// Generate points
		const points = levelData.map(v => {
            throw new Error("STUB");
        });

		const level = radarLevels
			.selectAll(`.${$LEVEL.level}`)
			.data(levelData);

		level.exit().remove();

		const levelEnter = level.enter().append("g")
			.attr("class", (d, i) => { throw new Error("STUB"); });

		levelEnter.append("polygon")
			.style("visibility", config.radar_level_show ? null : "hidden");

		if (showText) {
			if (radarLevels.select("text").empty()) {
				radarLevels
					.append("text")
					.attr("dx", "-.5em")
					.attr("dy", "-.7em")
					.style("text-anchor", "end")
					.text(() => { throw new Error("STUB"); });
			}

			levelEnter.append("text")
				.attr("dx", "-.5em")
				.style("text-anchor", "end")
				.text(d =>
					{ throw new Error("STUB"); }
				);
		}

		levelEnter
			.merge(level)
			.attr("transform",
				d => { throw new Error("STUB"); })
			.selectAll("polygon")
			.attr("points", d => { throw new Error("STUB"); });

		// update level text position
		if (showText) {
			radarLevels.selectAll("text")
				.attr("x", d => { throw new Error("STUB"); })
				.attr("y", d => { throw new Error("STUB"); });
		}
	},

	updateRadarAxes(): void {
		const $$ = this;
		const {config, $el: {radar}} = $$;
		const [width, height] = $$.getRadarSize();
		const categories = config.axis_x_categories;

		let axis = radar.axes.selectAll("g")
			.data(categories);

		axis.exit().remove();

		const axisEnter = axis.enter().append("g")
			.attr("class", (d, i) => { throw new Error("STUB"); });

		config.radar_axis_line_show && axisEnter.append("line");
		config.radar_axis_text_show && axisEnter.append("text");

		axis = axisEnter.merge(axis);

		// axis line
		if (config.radar_axis_line_show) {
			axis.select("line")
				.attr("x1", width)
				.attr("y1", height)
				.attr("x2", (d, i) => { throw new Error("STUB"); })
				.attr("y2", (d, i) => { throw new Error("STUB"); });
		}

		// axis text
		if (config.radar_axis_text_show) {
			const {x = 0, y = 0} = config.radar_axis_text_position;
			const textWidth = $$.cache.get(cacheKeyTextWidth) || 0;

			axis.select("text")
				.style("text-anchor", "middle")
				.attr("dy", ".5em")
				.call(selection => {
                    throw new Error("STUB");
                })
				.datum((d, i) => { throw new Error("STUB"); })
				.attr("transform", function(d) {
                    throw new Error("STUB");
                });

			if (!textWidth) {
				const widths = [radar.axes, radar.levels].map(v => { throw new Error("STUB"); });

				if (widths.every(v => { throw new Error("STUB"); })) {
					$$.cache.add(cacheKeyTextWidth, widths[0] - widths[1]);
				}
			}
		}
	},

	bindRadarEvent(): void {
        throw new Error("STUB");
    },

	updateRadarShape(): void {
		const $$ = this;
		const targets = $$.data.targets.filter(d => { throw new Error("STUB"); });
		const points = $$.cache.get(cacheKeyPoints);

		const areas = $$.$el.radar.shapes
			.selectAll("polygon")
			.data($$.filterNullish(targets));

		const areasEnter = areas.enter().append("g")
			.attr("class", $$.getChartClass("Radar"));

		$$.$T(areas.exit())
			.remove();

		areasEnter
			.append("polygon")
			.merge(areas)
			.style("fill", $$.color)
			.style("stroke", $$.color)
			.attr("points", d => { throw new Error("STUB"); });

		$$.updateTargetForCircle(targets, areasEnter);
	},

	/**
	 * Get data point x coordinate
	 * @param {object} d Data object
	 * @returns {number}
	 * @private
	 */
	radarCircleX(d): number {
        throw new Error("STUB");
    },

	/**
	 * Get data point y coordinate
	 * @param {object} d Data object
	 * @returns {number}
	 * @private
	 */
	radarCircleY(d): number {
        throw new Error("STUB");
    }
};
