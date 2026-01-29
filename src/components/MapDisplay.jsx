import {Map, Source, Layer, Popup} from 'react-map-gl/maplibre';
import { plaqueData } from '../data/open-plaques-london-2023-11-10-filtered';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useState } from 'react';

function MapDisplay(props) {

  const [selectedPlaque, setSelectedPlaque] = useState(null);

  const plaqueLayerStyle = {
       id: 'plaques-layer',
       type: 'circle',
       source: 'plaques-data',
       paint: {
           'circle-radius': 8,
           'circle-color': '#5baf65ff',
           'circle-stroke-width': 2,
           'circle-stroke-color': '#e36868ff'
       },
   }

  const handleMapClick = (event) => {
    const features = event.features;
    if (features && features.length > 0) {
      const clickedFeature = features[0];
      console.log('Clicked feature:', clickedFeature);
      setSelectedPlaque({
        geometry: clickedFeature.geometry,
        properties: clickedFeature.properties,
      })
      // setSelectedPlaque(clickedFeature);
    }
  }

  return (
    <Map
      initialViewState={{
        longitude: props.longitude || -122.4,
        latitude: props.latitude || 37.8,
        zoom: props.zoom || 10
      }}
      style={{width: '100%', height: '100vh'}}
      className="w-full h-full"
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      onClick={handleMapClick}
      interactiveLayerIds={['plaques-layer']}
    >
      <Source id="plaques-data" type="geojson" data={plaqueData}>
        <Layer {...plaqueLayerStyle} />
      </Source>

      {selectedPlaque && (
        <Popup
            anchor="bottom"
            longitude={selectedPlaque.geometry.coordinates[0]}
            latitude={selectedPlaque.geometry.coordinates[1]}
            onClose={() => setSelectedPlaque(null)}
        >
            <div>
                <h2 className="text-xl font-semibold mb-2">{selectedPlaque.properties.lead_subject_name}</h2>
                <p className="text-xs text-blue-500 my-2"><a href={`https://openplaques.org/plaques/${selectedPlaque.properties.id1}`}>OpenPlaques</a></p>
                <p className="text-xs text-blue-500 my-2"><a href={selectedPlaque.lead_subject_wikipedia}>Wikipedia</a></p>
                <button 
                    className={"rounded-l-sm border border-gray-200 px-3 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white focus:outline-none disabled:pointer-events-auto disabled:opacity-50"}
                    onClick={() => console.log('Fetch recommended reading for', selectedPlaque.lead_subject_name)}
                >Recommended Reading</button>
            </div>        
        </Popup>
    )}




    </Map>
  );
}

export default MapDisplay;