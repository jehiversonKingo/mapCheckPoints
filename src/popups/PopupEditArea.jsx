import React, { useEffect, useState } from 'react';

const PopupEditArea = ({ isOpen, onClose, checkMessage, errorMessage, filterData, removePolygons }) => {
  const [polygonDelimitedArea, setPolygonDelimitedArea] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentArea, setCurrentArea] = useState(null);
  const [updatedName, setUpdatedName] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchPolygonDelimitedArea = async () => {
      try {
        const response = await fetch('http://localhost:3001/polygon-delimited-area');
        const data = await response.json();
        setPolygonDelimitedArea(data);
      } catch (error) {
        console.error('Error fetching areas:', error);
      }
    };

    setDataLoaded(true);

    fetchPolygonDelimitedArea();
  }, [isOpen]);

  const handleEditClick = (area) => {
    setCurrentArea(area);
    setUpdatedName(area.areaname);
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    if (!currentArea) return;

    try {
      const response = await fetch(`http://localhost:3001/update-areaName/${currentArea.idpolygondelimitedarea}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ areaName: updatedName }),
      });

      if (response.ok) {
        onClose();
        setIsEditing(false);
        checkMessage('Area editada exitosamente!');
      } else {
        console.error('Failed to update area');
      }
    } catch (error) {
      console.error('Error updating area:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      filterData();
      const response = await fetch(`http://localhost:3001/area/${id}`, {
        method: 'PUT'
      });

      if (response.ok) {
        onClose();
      } else {
        console.error('Failed to delete area');
      }
    } catch (error) {
      console.error('Error deleting area:', error);
    }
  };

  if (!isOpen || !dataLoaded) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-800 rounded-lg p-6 h-72 flex flex-col gap-3 items-center justify-center">
        <span className='text-white font-semibold'>Áreas Delimitadas</span>
        <table className="border-2 border-gray-500 mt-2 w-full">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-2 text-left text-white">Nombre</th>
              <th className="px-2 text-left text-white"></th>
              <th className="px-2 text-left text-white"></th>
            </tr>
          </thead>
          <tbody>
            {polygonDelimitedArea.map((area) => (
              <tr key={area.idpolygondelimitedarea} className="border-b border-gray-600">
                <td className="px-2 text-white">{area.areaname}</td>
                <td className="px-2 text-white">
                  <button className='bg-blue-500 hover:bg-blue-600 px-4 text-white' onClick={() => handleEditClick(area)}>Editar</button>
                </td>
                <td className="px-2 text-white">
                  <button className='bg-red-500 hover:bg-red-600 px-4 text-white' onClick={() => handleDelete(area.idpolygondelimitedarea)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isEditing && (
          <div className="bg-gray-700 p-4 mt-[75vh] flex flow-row gap-3 items-center rounded absolute">
            <span className="text-white">Editar Área</span>
            <input type="text" value={updatedName} onChange={(e) => setUpdatedName(e.target.value)} className="mt-2 px-2 py-1 rounded"/>
            <button onClick={handleUpdate} className="mt-2 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">Actualizar</button>
            <button onClick={() => setIsEditing(false)} className="mt-2 bg-gray-500 text-white px-4 py-1 rounded hover:bg-gray-600">Cancelar</button>
          </div>
        )}
        <button className="mt-auto bg-blue-500 text-white px-5 py-1 rounded hover:bg-blue-600" onClick={onClose} autoFocus>Cerrar</button>
      </div>
    </div>
  );
};

export default PopupEditArea;
