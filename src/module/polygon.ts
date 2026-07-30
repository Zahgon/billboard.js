/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */

type Point = [number, number];

/**
 * Compute the signed area of a polygon using the Shoelace formula.
 * @param {Array} polygon Array of [x, y] coordinates
 * @returns {number} Signed area of the polygon
 * @see https://en.wikipedia.org/wiki/Shoelace_formula
 */
export function polygonArea(polygon: Point[]): number {
    throw new Error("STUB");
}

/**
 * Compute the centroid of a polygon.
 * @param {Array} polygon Array of [x, y] coordinates
 * @returns {Array} Centroid [x, y] of the polygon
 */
export function polygonCentroid(polygon: Point[]): Point {
    throw new Error("STUB");
}
