// Example: converting a small CSV snippet into GeoJSON using csv2geojson
// This is used in the sidebar demo and is also a reference for the CASA0028 report.

import csv2geojson from 'csv2geojson'
import sampleCsv from '../data/sample-plaques.csv?raw'

export function convertSampleCsvToGeoJSON() {
  return new Promise((resolve, reject) => {
    csv2geojson.csv2geojson(
      sampleCsv,
      {
        latfield: 'latitude',
        lonfield: 'longitude',
        delimiter: ','
      },
      (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      }
    )
  })
}

