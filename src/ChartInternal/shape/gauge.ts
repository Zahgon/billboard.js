/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {select as d3Select} from "d3-selection";
import {$ARC, $COMMON, $GAUGE} from "../../config/classes";
import {isFunction} from "../../module/util";

export default {
	initGauge(): void {
        throw new Error("STUB");
    },

	updateGaugeMax(): void {
		const $$ = this;
		const {config, state} = $$;
		const hasMultiGauge = $$.hasMultiArcGauge();

		// to prevent excluding total data sum during the init(when data.hide option is used), use $$.rendered state value
		const max = hasMultiGauge ?
			$$.getMinMaxData().max[0].value :
			$$.getTotalDataSum(state.rendered);

		// if gauge_max less than max, make max to max value
		if (
			!config.gauge_enforceMinMax && (
				max + config.gauge_min * (config.gauge_min > 0 ? -1 : 1) > config.gauge_max
			)
		) {
			config.gauge_max = max - config.gauge_min;
		}
	},

	redrawArcGaugeLine(): void {
		const $$ = this;
		const {config, state, $el} = $$;
		const {hiddenTargetIds} = $$.state;

		const arcLabelLines = $el.main.selectAll(`.${$ARC.arcs}`)
			.selectAll(`.${$ARC.arcLabelLine}`)
			.data($$.arcData.bind($$));

		const mainArcLabelLine = arcLabelLines.enter()
			.append("rect")
			.attr("class",
				d => { throw new Error("STUB"); })
			.merge(arcLabelLines);

		mainArcLabelLine
			.style("fill",
				d => { throw new Error("STUB"); })
			.style("display", config.gauge_label_show ? null : "none")
			.each(function(d) {
                throw new Error("STUB");
            });
	},

	textForGaugeMinMax(value: number, isMax?: boolean): number | string {
		const $$ = this;
		const {config} = $$;
		const format = config.gauge_label_extents;

		return isFunction(format) ? format.bind($$.api)(value, isMax) : value;
	},

	getGaugeLabelHeight(): 20 | 0 {
		const {config} = this;

		return this.config.gauge_label_show && !config.gauge_fullCircle ? 20 : 0;
	},

	getPaddingBottomForGauge() {
		return this.getGaugeLabelHeight() * 2;
	}
};
