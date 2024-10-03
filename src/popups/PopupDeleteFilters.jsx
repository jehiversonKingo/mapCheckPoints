import React from 'react';

const PopupDeleteFilters = ({ isOpen, onClose, filtersMarkers, filtersAntennas, setFiltersMarkers, setFiltersAntennas, filterData }) => {
  if (!isOpen) return null;

  // Delete a marker filter
  const handleRemoveMarkerFilter = (index) => {
    setFiltersMarkers((prevFilters) => prevFilters.filter((_, i) => i !== index));
    filterData();
    onClose();
  };

  // Delete a antenna filter
  const handleRemoveAntennaFilter = (index) => {
    setFiltersAntennas((prevFilters) => prevFilters.filter((_, i) => i !== index));
    filterData();
    onClose();
  };

  // Delete all filters
  const handleRemoveAllFilters = () => {
    setFiltersMarkers([]);
    setFiltersAntennas([]);
    filterData();
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-800 rounded-lg px-5 py-4 h-auto flex flex-col gap-3 items-center">
        <h2 className="text-white text-lg font-semibold">FILTROS</h2>
        {filtersMarkers.length === 0 && filtersAntennas.length === 0 ? (
          <p className="text-gray-400">No hay filtros</p>
        ) : (
          <div className="flex flex-col gap-3">
            {filtersMarkers.length > 0 && (
              <div>
                <h3 className="text-white">Filtros de Marcadores:</h3>
                <table className="border-2 border-gray-500 mt-2 w-full">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="px-2 text-left text-white">Categoria</th>
                      <th className="px-2 text-left text-white">Pais</th>
                      <th className="px-2 text-left text-white">Departamento</th>
                      <th className="px-2 text-left text-white">Ciudad</th>
                      <th className="px-2 text-left text-white">Cantidad</th>
                      <th className="px-2 text-left text-white"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtersMarkers.map((filter, index) => (
                      <tr key={index} className="border-t border-gray-600">
                        <td className="px-2 text-gray-300">{filter[0]}</td>
                        <td className="px-2 text-gray-300">{filter[1]}</td>
                        <td className="px-2 text-gray-300">{filter[2]}</td>
                        <td className="px-2 text-gray-300">{filter[3]}</td>
                        <td className="px-2 text-gray-300">{filter[4]}</td>
                        <td className='bg-red-500 hover:bg-red-600 px-4 text-white text-center cursor-pointer' onClick={() => handleRemoveMarkerFilter(index)}>X</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {filtersAntennas.length > 0 && (
              <div>
                <h3 className="text-white">Filtros de Antenas:</h3>
                <table className="border-2 border-gray-500 mt-2 w-full">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="px-2 text-left text-white">Tipo de Red</th>
                      <th className="px-2 text-left text-white">Cantidad</th>
                      <th className="px-2 text-left text-white"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtersAntennas.map((filter, index) => (
                      <tr key={index} className="border-t border-gray-600">
                        <td className="px-2 text-gray-300">{filter[0]}</td>
                        <td className="px-2 text-gray-300">{filter[1]}</td>
                        <td className='bg-red-500 hover:bg-red-600 text-white text-center cursor-pointer' onClick={() => handleRemoveAntennaFilter(index)}>X</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        <div className='flex flex-row gap-3'>
            {filtersMarkers.length !== 0 && filtersAntennas.length !== 0 && (
                <button className="mt-auto bg-red-500 text-white px-5 py-1 rounded hover:bg-red-600" onClick={handleRemoveAllFilters} autoFocus>Quitar todos</button>
            )}
            <button className="mt-auto bg-blue-500 text-white px-5 py-1 rounded hover:bg-blue-600" onClick={onClose} autoFocus>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default PopupDeleteFilters;
