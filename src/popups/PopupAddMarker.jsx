import React, { useEffect, useState } from 'react';
import { SliderPicker } from 'react-color';

const PopupAddMarker = ({ isOpen, onClose, checkMessage, errorMessage, validateInput, lng, lat }) => {
  const [categories, setCategories] = useState([]);
  const [idCategory, setIdCategory] = useState([]);
  const [polygonDelimitedArea, setPolygonDelimitedArea] = useState([]);
  const [idArea, setIdArea] = useState([]);
  const [markerLimit, setMarkerLimit] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [markerColor, setMarkerColor] = useState('#93c5fd');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3001/categories');
        const data = await response.json();
        setCategories(data);
        setIdCategory(data[0].idcategory);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchPolygonDelimitedArea = async () => {
      try {
        const response = await fetch('http://localhost:3001/polygon-delimited-area');
        const data = await response.json();
        setPolygonDelimitedArea(data);
        setIdArea(data[0].idpolygondelimitedarea);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    setDataLoaded(true);

    const fetchData = async () => {
      await fetchCategories();
      await fetchPolygonDelimitedArea();
    };

    fetchData();
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const title = e.target.elements.title.value.trim();
    const country = e.target.elements.country.value.trim();
    const department = e.target.elements.department.value.trim();
    const city = e.target.elements.city.value.trim();
    const direction = e.target.elements.direction.value.trim();
    const description = e.target.elements.description.value.trim();

    if (lng == 0 || lat == 0) {
      errorMessage('Ingrese las coordenadas dando click a un lugar del mapa');
      return;
    }

    const fetchCoordinates = async () => {
      try {
        const response = await fetch('http://localhost:3001/validate-coordinates');
        const data = await response.json();
        data.forEach(coordinates => {
          if (coordinates.lng === lng && coordinates.lat === lat) {
            errorMessage('Las coordenadas ya existen');
            return;
          }
        });
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchData = async () => {
      await fetchCoordinates();
    };

    fetchData();

    if (title) {
      try {
        const ubicationResponse = await fetch('http://localhost:3001/ubication', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lng, lat,
            idCategory: idCategory,
            idPolygonDelimitedArea: idArea,
            country: country,
            department: department,
            city: city,
            direction: direction,
          }),
        });
    
        const ubicationData = await ubicationResponse.json();
        const idUbication = ubicationData.idUbication;
    
        const markerResponse = await fetch('http://localhost:3001/markers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idUbication,
            markerTitle: title,
            markerDescription: description,
            markerCircleRadius: markerLimit,
            markerColor
          }),
        });
        onClose();
        e.target.elements.title.value = '';
        checkMessage('Marcador agregado correctamente!');
      } catch (error) {
        console.error('Error al agregar el marcador:', error);
      }
    } else {
      errorMessage('No dejar campos vacios');
    }
  };

  const handleIdCategoryChange = (e) => {
    setIdCategory(e.target.value);
    console.log('Selected: ', e.target.value);
  };

  const handleIdAreaChange = (e) => {
    setIdArea(e.target.value);
    console.log('Selected: ', e.target.value);
  };

  const handleChangeComplete = (markerColor) => {
    setMarkerColor(markerColor.hex);
  };

  if (!isOpen || !dataLoaded) return null;

  return (
    <form onSubmit={handleSubmit} className='popup absolute p-4 top-[55vh] left-[10px] bg-slate-600 flex flex-row gap-5 text-white'>
      <div className="bg-slate-700 p-2 rounded-sm w-[400px]">
        <span className='flex flex-row'><h4 className='mr-10'>Ubicación: Long: {lng} | Lat: {lat}</h4></span>
        <div className='flex flex-col gap-1 w-full mb-3'>
          <div className='flex flex-row gap-1 mt-2 w-full'>
            <input name='title' className='w-1/2 p-1 text-black' type="text" placeholder='Titulo' onChange={validateInput} required autoFocus/>
            <input name='description' className='w-1/2 p-1 text-black' type="text" placeholder='Descripción' onChange={validateInput} />
          </div>
          <div className='flex flex-row gap-3 mt-2 w-full'>
            <input name='markerLimit' className='w-1/3 p-1 text-black' type="number" placeholder='Radio' value={markerLimit} onChange={(e) => setMarkerLimit(e.target.value)}/>
            <select className='w-1/3 text-black p-1' onChange={handleIdCategoryChange}>
              {categories.map(category => (
                <option key={category.idcategory} value={category.idcategory}>
                  {category.category}
                </option>
              ))}
            </select>
            <select className='w-1/3 text-black p-1' onChange={handleIdAreaChange}>
              {polygonDelimitedArea.map(polygon => (
                <option key={polygon.idpolygondelimitedarea} value={polygon.idpolygondelimitedarea}>
                  {polygon.areaname}
                </option>
              ))}
            </select>
          </div>
          <div className='flex flex-row gap-1 mt-2 w-full'>
            <input name='country' className='w-1/2 p-1 text-black' type="text" placeholder='País' onChange={validateInput}/>
            <input name='department' className='w-1/2 p-1 text-black' type="text" placeholder='Departamento' onChange={validateInput}/>
          </div>
          <div className='flex flex-row gap-1 mt-2 w-full'>
            <input name='city' className='w-1/2 p-1 text-black' type="text" placeholder='Ciudad' onChange={validateInput}/>
            <input name='direction' className='w-1/2 p-1 text-black' type="text" placeholder='Dirección' onChange={validateInput}/>
          </div>
        </div>
        <div className='flex flex-row w-full gap-2'>
          <button type='submit' className='bg-orange-500 px-2 py-1 rounded-sm hover:bg-orange-600 shadow-md w-3/4'>Crear Marcador</button>
          <button type='button' className='bg-slate-500 px-2 py-1 rounded-sm hover:bg-slate-600 shadow-md w-1/4' onClick={onClose}>Cancelar</button>
        </div>
      </div>
      <div>
        <SliderPicker
          color={markerColor}
          onChangeComplete={handleChangeComplete}
        />
        <div className='text-white mt-5'>Color Actual: <strong>{markerColor}</strong></div>
          <div className='mt-3 w-full h-28' style={{backgroundColor: markerColor }} />
      </div>
    </form>
  );
};

export default PopupAddMarker;
