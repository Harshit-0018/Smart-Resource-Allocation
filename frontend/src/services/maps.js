/**
 * Google Maps helper utilities.
 * Wraps common Maps JS API operations used across portals.
 */

/**
 * Convert a Firestore GeoPoint-like object to Google Maps LatLng literal.
 */
export function toLatLng(geoPoint) {
  if (!geoPoint) return null;
  return {
    lat: geoPoint._lat ?? geoPoint.latitude,
    lng: geoPoint._long ?? geoPoint.longitude,
  };
}

/**
 * Default map center — can be overridden per deployment.
 */
export const DEFAULT_CENTER = { lat: 11.85, lng: 75.77 };

/**
 * Default map zoom level.
 */
export const DEFAULT_ZOOM = 10;

/**
 * Build heatmap data array from tasks.
 */
export function buildHeatmapData(tasks) {
  if (!window.google) return [];
  return tasks
    .filter((t) => t.location)
    .map((t) => ({
      location: new window.google.maps.LatLng(
        t.location._lat ?? t.location.latitude,
        t.location._long ?? t.location.longitude
      ),
      weight: t.urgency || 1,
    }));
}
