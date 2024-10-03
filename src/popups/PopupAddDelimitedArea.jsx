import React from 'react';

const PopupAddDelimitedArea = ({ isOpen, onClose, checkMessage, errorMessage, validateInput, polygonCoordinates }) => {
  if (!isOpen) return null;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const areaName = e.target.elements.areaName.value.trim();

    if (areaName) {
      try {
        // Save area name of polygon
        const areaResponse = await fetch('http://localhost:3001/polygon-area', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ areaName }),
        });

        const { idPolygonDelimitedArea } = await areaResponse.json();

        // Save polygon coordinates
        const coordResponse = await fetch('http://localhost:3001/polygon-coordinates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idPolygonDelimitedArea, coordinates: polygonCoordinates }),
        });

        if (!coordResponse.ok) throw new Error('Error al guardar las coordenadas');

        onClose();
        e.target.elements.areaName.value = '';
        checkMessage('Area agregada correctamente!');
      } catch (error) {
        errorMessage('Error al guardar el poligono:', error);
      }
    } else {
      errorMessage('Ingrese un valor');
    }
  };

  return (
    <form onSubmit={handleSubmit} className='popup absolute p-4 top-[70vh] left-[10px] bg-slate-600 flex flex-row gap-5 text-white'>
        <div className="bg-slate-700 h-[150px] p-2 rounded-sm w-[400px]">
          <h4 className='mb-2'>Ingrese el nombre del área</h4>
          <input name='areaName' className='w-full p-1 text-black' type="text" placeholder='Nombre del área' onChange={validateInput} required autoFocus/>
          <div className='flex flex-row w-full gap-2 mt-4'>
              <button type='submit' className='bg-orange-500 px-2 py-1 rounded-sm hover:bg-orange-600 shadow-md w-3/4'>Guardar Área</button>
              <button type='button' className='bg-slate-400 px-2 py-1 rounded-sm hover:bg-slate-600 shadow-md w-1/4' onClick={onClose}>Cancelar</button>
          </div>
        </div>
    </form>
  );
};

export default PopupAddDelimitedArea;
