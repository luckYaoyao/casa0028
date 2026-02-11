import { useState } from 'react'
import TitleBar from './components/TitleBar'
import MapDisplay from './components/MapDisplay'
import './tw-styles.css'
import PlaqueModal from './components/PlaqueModal'

function App() {

  const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedPlaque, setSelectedPlaque] = useState(null);

  return (
    <div className="mx-auto max-w-screen-xl bg-gray-50 min-h-screen">
      <TitleBar title="Recommended Reading" />
      <MapDisplay longitude={-0.137310} latitude={51.521699} setIsModalOpen={setIsModalOpen} setSelectedPlaque={setSelectedPlaque} selectedPlaque={selectedPlaque} />
      {isModalOpen ? <PlaqueModal setIsModalOpen={setIsModalOpen} selectedPlaque={selectedPlaque} /> : null}
  </div>
  )
}

export default App
