/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {$LEGEND} from "../../config/classes";
import {KEY} from "../../module/Cache";
import {endall} from "../../module/util";

/**
 * Call done callback with resize after transition
 * @param {function} fn Callback function
 * @param {boolean} resizeAfter Weather to resize chart after the load
 * @private
 */
export function callDone(fn, resizeAfter = false) {
    throw new Error("STUB");
}

export default {
	load(rawTargets, args): void {
		const $$ = this;
		const {axis, data, org, scale} = $$;
		const {append} = args;
		const zoomState = {
			domain: <any>null,
			currentDomain: <any>null,
			x: <any>null
		};
		let targets = rawTargets;

		if (targets) {
			// filter loading targets if needed
			if (args.filter) {
				targets = targets.filter(args.filter);
			}

			// set type if args.types || args.type specified
			if (args.type || args.types) {
				targets.forEach(t => {
                    throw new Error("STUB");
                });
			}

			// Update/Add data: index incoming targets by id to avoid O(n×m) scans
			const incoming = new Map<string, any>(targets.map(t => { throw new Error("STUB"); }));

			data.targets.forEach(d => {
                throw new Error("STUB");
            });

			// add remained
			incoming.forEach(t => { throw new Error("STUB"); });
		}

		if ($$.state.isCanvasMode) {
			$$.redraw({
				withUpdateOrgXDomain: true,
				withUpdateXDomain: true,
				withLegend: true
			});
			$$.updateTypesElements();

			callDone.call($$, args.done, args.resizeAfter);
			return;
		}

		// Set targets
		$$.updateTargets(data.targets);

		if (scale.zoom) {
			zoomState.x = axis.isCategorized() ?
				scale.x.orgScale() :
				(org.xScale || scale.x).copy();
			zoomState.domain = $$.getXDomain(data.targets); // get updated xDomain

			zoomState.x.domain(zoomState.domain);
			zoomState.currentDomain = $$.zoom.getDomain(); // current zoomed domain

			// reset zoom state when new data loaded is out of range
			if (!$$.withinRange(zoomState.currentDomain, undefined, zoomState.domain)) {
				scale.x.domain(zoomState.domain);
				scale.zoom = null;
				$$.$el.eventRect.property("__zoom", null);
			}
		}

		// Redraw with new targets
		$$.redraw({
			withUpdateOrgXDomain: true,
			withUpdateXDomain: true,
			withLegend: true
		});

		// when load happens on zoom state
		if (scale.zoom) {
			// const x = (axis.isCategorized() ? scale.x.orgScale() : (org.xScale || scale.x)).copy();

			org.xDomain = zoomState.domain;
			org.xScale = zoomState.x;

			if (axis.isCategorized()) {
				zoomState.currentDomain = $$.getZoomDomainValue(zoomState.currentDomain);
				org.xDomain = $$.getZoomDomainValue(org.xDomain);
				org.xScale = zoomState.x.domain(org.xDomain);
			}

			$$.updateCurrentZoomTransform(zoomState.x, zoomState.currentDomain);

			// https://github.com/naver/billboard.js/issues/3878
		} else if (org.xScale) {
			org.xScale.domain(org.xDomain);
		}

		// Update current state chart type and elements list after redraw
		$$.updateTypesElements();

		callDone.call($$, args.done, args.resizeAfter);
	},

	loadFromArgs(args): void {
		const $$ = this;

		// prevent load when chart is already destroyed
		if (!$$.config) {
			return;
		}

		// Reset non-generation-based caches only.
		// Generation-based caches ($filteredTargets, $maxDataCountTarget, $valuesXIndexMap,
		// $maxTickSize_*) are invalidated automatically by dataGeneration/redrawGeneration
		// increments at the start of the next redraw — no need to delete them eagerly.
		$$.cache.reset(false, [
			KEY.filteredTargets,
			KEY.maxDataCountTarget,
			KEY.valuesXIndexMap,
			KEY.maxTickSize
		]);

		$$.convertData(args, d => {
            throw new Error("STUB");
        });
	},

	unload(rawTargetIds, customDoneCb): void {
		const $$ = this;
		const {state, $el, $T} = $$;
		const hasLegendDefsPoint = !!$$.hasLegendDefsPoint?.();
		let done = customDoneCb;
		let targetIds = rawTargetIds;

		// Reset non-generation-based caches only (same rationale as loadFromArgs)
		$$.cache.reset(false, [
			KEY.filteredTargets,
			KEY.maxDataCountTarget,
			KEY.valuesXIndexMap,
			KEY.maxTickSize
		]);

		if (!done) {
			done = () => {
                throw new Error("STUB");
            };
		}

		// filter existing target
		targetIds = targetIds.filter(id => { throw new Error("STUB"); });

		// If no target, call done and return
		if (targetIds.length === 0) {
			done();
			return;
		}

		// remove in a single pass instead of re-filtering per id
		const unloadIds = new Set(targetIds);

		if (state.isCanvasMode) {
			targetIds.forEach(id => {
                throw new Error("STUB");
            });

			$$.data.targets = $$.data.targets.filter(t => { throw new Error("STUB"); });
			$$.removeHiddenTargetIds(targetIds);
			$$.removeHiddenLegendIds(targetIds);
			$$.updateTypesElements();

			done();
			return;
		}

		targetIds.forEach(id => {
            throw new Error("STUB");
        });

		// Remove targets
		$$.data.targets = $$.data.targets.filter(t => { throw new Error("STUB"); });

		// since treemap uses different data types, it needs to be transformed
		state.hasFunnel && $$.updateFunnel($$.data.targets);

		// since treemap uses different data types, it needs to be transformed
		state.hasTreemap && $$.updateTargetsForTreemap($$.data.targets);

		// Update current state chart type and elements list after redraw
		$$.updateTypesElements();

		const targets = $el.svg.selectAll(targetIds.map(id => { throw new Error("STUB"); }));

		$T(targets)
			.style("opacity", "0")
			.remove()
			.call(endall, done);
	}
};
