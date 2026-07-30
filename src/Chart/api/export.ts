/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {namespaces as d3Namespaces} from "d3-selection";
import {document, window} from "../../module/browser";
import {
	getBBox,
	getBoundingRect,
	getCssRules,
	isFunction,
	mergeObj,
	toArray
} from "../../module/util";

type TExportOption = TSize & {
	preserveAspectRatio: boolean,
	preserveFontStyle: boolean,
	mimeType: string
};

type TSize = {x?: number, y?: number, width: number, height: number};

type TTextGlyph = Record<
	string,
	TSize & {
		fill: string,
		fontFamily: string,
		fontSize: string,
		textAnchor: string,
		transform: string
	}
>;

/**
 * Encode to base64
 * @param {string} str string to be encoded
 * @returns {string}
 * @private
 * @see https://developer.mozilla.org/ko/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
 */
const b64EncodeUnicode = (str: string): string =>
	{ throw new Error("STUB"); };

/**
 * Convert svg node to data url
 * @param {HTMLElement} node target node
 * @param {object} option object containing {width, height, preserveAspectRatio}
 * @param {object} orgSize object containing {width, height}
 * @returns {string}
 * @private
 */
function nodeToSvgDataUrl(node, option: TExportOption, orgSize: TSize) {
    throw new Error("STUB");
}

/**
 * Get coordinate of the element
 * @param {SVGElement} elem Target element
 * @param {object} svgOffset SVG offset
 * @returns {object}
 * @private
 */
function getCoords(elem, svgOffset): TSize {
    throw new Error("STUB");
}

/**
 * Get text glyph
 * @param {SVGTextElement} svg Target svg node
 * @returns {Array}
 * @private
 */
function getGlyph(svg: SVGElement): TTextGlyph[] {
    throw new Error("STUB");
}

/**
 * Render text glyph
 * - NOTE: Called when the 'preserveFontStyle' option is true
 * @param {CanvasRenderingContext2D} ctx Canvas context
 * @param {Array} glyph Text glyph array
 * @private
 */
function renderText(ctx, glyph): void {
    throw new Error("STUB");
}

/**
 * Convert canvas node to data url using CSS chart size, not DPR backing store size.
 * @param {HTMLCanvasElement} source Source canvas
 * @param {object} option Export option
 * @param {object} orgSize Original CSS chart size
 * @returns {string}
 * @private
 */
function canvasToDataUrl(source: HTMLCanvasElement, option: TExportOption, orgSize: TSize): string {
    throw new Error("STUB");
}

export default {
	/**
	 * Export chart as an image.
	 * - **NOTE:**
	 *   - IE11 and below not work properly due to the lack of the feature(<a href="https://msdn.microsoft.com/en-us/library/hh834675(v=vs.85).aspx">foreignObject</a>) support
	 *   - Every style applied to the chart & the basic CSS file(ex. billboard.css) should be at same domain as API call context to get correct styled export image.
	 * @function export
	 * @instance
	 * @memberof Chart
	 * @param {object} option Export option
	 * @param {string} [option.mimeType="image/png"] The desired output image format. (ex. 'image/png' for png, 'image/jpeg' for jpeg format)
	 * @param {number} [option.width={currentWidth}] width
	 * @param {number} [option.height={currentHeigth}] height
	 * @param {boolean} [option.preserveAspectRatio=true] Preserve aspect ratio on given size
	 * @param {boolean} [option.preserveFontStyle=false] Preserve font style(font-family).<br>
	 * **NOTE:**
	 *   - This option is useful when outlink web font style's `font-family` are applied to chart's text element.
	 *   - Text element's position(especially "transformed") can't be preserved correctly according the page's layout condition.
	 *   - If need to preserve accurate text position, embed the web font data within to the page and set `preserveFontStyle=false`.
	 *     - Checkout the embed example: <a href="https://stackblitz.com/edit/zfbya9-8nf9nn?file=index.html">https://stackblitz.com/edit/zfbya9-8nf9nn?file=index.html</a>
	 * @param {function(string): void} [callback] The callback to be invoked when export is ready.
	 * @returns {string} dataURI
	 * @example
	 *  chart.export();
	 *  // --> "data:image/svg+xml;base64,PHN..."
	 *
	 *  // Initialize the download automatically
	 *  chart.export({mimeType: "image/png"}, dataUrl => {
	 *     const link = document.createElement("a");
	 *
	 *     link.download = `${Date.now()}.png`;
	 *     link.href = dataUrl;
	 *     link.innerHTML = "Download chart as image";
	 *
	 *     document.body.appendChild(link);
	 *  });
	 *
	 *  // Resize the exported image
	 *  chart.export(
	 *    {
	 *      width: 800,
	 *      height: 600,
	 *      preserveAspectRatio: false,
	 *      preserveFontStyle: false,
	 *      mimeType: "image/png"
	 *    },
	 *    dataUrl => { ... }
	 *  );
	 */
	export(option?: TExportOption, callback?: (dataUrl: string) => void): string {
        throw new Error("STUB");
    }
};
