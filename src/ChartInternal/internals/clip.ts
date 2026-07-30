/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */

export default {
	initClip(): void {
		const $$ = this;
		const {clip, datetimeId} = $$.state;

		// MEMO: clipId needs to be unique because it conflicts when multiple charts exist
		clip.id = `${datetimeId}-clip`;

		clip.idXAxis = `${clip.id}-xaxis`;
		clip.idYAxis = `${clip.id}-yaxis`;
		clip.idGrid = `${clip.id}-grid`;

		// Define 'clip-path' attribute values
		clip.path = $$.getClipPath(clip.id);
		clip.pathXAxis = $$.getClipPath(clip.idXAxis);
		clip.pathYAxis = $$.getClipPath(clip.idYAxis);
		clip.pathGrid = $$.getClipPath(clip.idGrid);
	},

	getClipPath(id: string): string | null {
		const $$ = this;
		const {config} = $$;

		if (
			(!config.clipPath && /-clip$/.test(id)) ||
			(!config.axis_x_clipPath && /-clip-xaxis$/.test(id)) ||
			(!config.axis_y_clipPath && /-clip-yaxis$/.test(id))
		) {
			return null;
		}

		return `url(#${id})`;
	},

	appendClip(parent, id: string): void {
		id && parent.append("clipPath")
			.attr("id", id)
			.append("rect");
	},

	/**
	 * Set x Axis clipPath dimension
	 * @param {d3Selecton} node clipPath <rect> selection
	 * @private
	 */
	setXAxisClipPath(node): void {
        throw new Error("STUB");
    },

	/**
	 * Set y Axis clipPath dimension
	 * @param {d3Selection} node clipPath <rect> selection
	 * @private
	 */
	setYAxisClipPath(node): void {
        throw new Error("STUB");
    },

	updateXAxisTickClip(): void {
		const $$ = this;
		const {config, state: {clip, xAxisHeight}, $el: {defs}} = $$;
		const newXAxisHeight = $$.getHorizontalAxisHeight("x");

		if (defs && !clip.idXAxisTickTexts) {
			const clipId = `${clip.id}-xaxisticktexts`;

			$$.appendClip(defs, clipId);
			clip.idXAxisTickTexts = clipId;
			clip.pathXAxisTickTexts = $$.getClipPath(clip.idXAxisTickTexts);
		}

		if (
			!config.axis_x_tick_multiline &&
			$$.getAxisTickRotate("x") &&
			newXAxisHeight !== xAxisHeight
		) {
			$$.setXAxisTickClipWidth();
			$$.setXAxisTickTextClipPathWidth();
		}

		$$.state.xAxisHeight = newXAxisHeight;
	},

	setXAxisTickClipWidth(): void {
		const $$ = this;
		const {config, state: {current: {maxTickSize}}} = $$;

		const xAxisTickRotate = $$.getAxisTickRotate("x");

		if (!config.axis_x_tick_multiline && xAxisTickRotate) {
			const sinRotation = Math.sin(Math.PI / 180 * Math.abs(xAxisTickRotate));

			maxTickSize.x.clipPath = ($$.getHorizontalAxisHeight("x") - 20) / sinRotation;
		} else {
			maxTickSize.x.clipPath = null;
		}
	},

	setXAxisTickTextClipPathWidth(): void {
		const $$ = this;
		const {state: {clip, current}, $el: {svg}} = $$;

		if (svg) {
			svg.select(`#${clip.idXAxisTickTexts} rect`)
				.attr("width", current.maxTickSize.x.clipPath)
				.attr("height", 30);
		}
	}
};
