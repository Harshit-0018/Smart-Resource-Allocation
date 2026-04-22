import { GoogleMap, HeatmapLayer, useJsApiLoader } from '@react-google-maps/api';
import { buildHeatmapData, DEFAULT_CENTER, DEFAULT_ZOOM } from '../services/maps';

const LIBRARIES = ['visualization'];

/**
 * TaskHeatMap — Google Maps heatmap visualising task urgency by location.
 * Heat intensity is driven by task urgency score (1–5).
 *
 * @param {{ tasks: object[] }} props
 */
export default function TaskHeatMap({ tasks = [] }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  if (!isLoaded) return <div className="h-[500px] bg-gray-100 animate-pulse rounded-lg" />;

  const heatmapData = buildHeatmapData(tasks);

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '500px', borderRadius: '0.5rem' }}
      zoom={DEFAULT_ZOOM}
      center={DEFAULT_CENTER}
    >
      {heatmapData.length > 0 && (
        <HeatmapLayer data={heatmapData} options={{ radius: 30, opacity: 0.7 }} />
      )}
    </GoogleMap>
  );
}
