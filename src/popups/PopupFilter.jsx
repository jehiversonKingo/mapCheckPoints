import React, { useEffect, useState } from 'react';

const PopupFilter = ({ isOpen, onClose, errorMessage, updateFilterFields }) => {
  const [categories, setCategories] = useState([]);
  const [idCategory, setIdCategory] = useState([]);
  const [polygonDelimitedArea, setPolygonDelimitedArea] = useState([]);
  const [areaName, setAreaName] = useState([]);
  const [ubicationCountry, setUbicationCountry] = useState([]);
  const [country, setCountry] = useState([]);
  const [ubicationDepartment, setUbicationDepartment] = useState([]);
  const [department, setDepartment] = useState([]);
  const [ubicationCity, setUbicationCity] = useState([]);
  const [city, setCity] = useState([]);
  const [markerLimit, setMarkerLimit] = useState(50);
  const [dataLoaded, setDataLoaded] = useState(false);
      
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
        setAreaName(data[0].areaName);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchUbicationCountry = async () => {
      try {
        const response = await fetch('http://localhost:3001/ubication-country');
        const data = await response.json();
        setUbicationCountry(data);
        setCountry(data[0].country);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchUbicationDepartment = async () => {
      try {
        const response = await fetch('http://localhost:3001/ubication-department');
        const data = await response.json();
        setUbicationDepartment(data);
        setDepartment(data[0].department);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchUbicationCity = async () => {
      try {
        const response = await fetch('http://localhost:3001/ubication-city');
        const data = await response.json();
        setUbicationCity(data);
        setCity(data[0].city);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    setDataLoaded(true);

    const fetchData = async () => {
      await fetchCategories();
      await fetchPolygonDelimitedArea();
      await fetchUbicationCountry();
      await fetchUbicationDepartment();
      await fetchUbicationCity();
    };

    fetchData();
  }, [isOpen]);

  const handleCategoryChange = (e) => {
    setIdCategory(e.target.value);
    console.log('Selected: ', e.target.value);
  };

  const handleAreaNameChange = (e) => {
    setAreaName(e.target.value);
    console.log('Selected: ', e.target.value);
  };

  const handleCountryChange = (e) => {
    setCountry(e.target.value);
    console.log('Selected: ', e.target.value);
  };

  const handleDepartmentChange = (e) => {
    setDepartment(e.target.value);
    console.log('Selected: ', e.target.value);
  };

  const handleCityChange = (e) => {
    setCity(e.target.value);
    console.log('Selected: ', e.target.value);
  };

  const handleSubmit = () => {
    const fetchCellTowers = async () => {
      try {
        const response = await fetch(`http://localhost:3001/markers/${idCategory}/${country}/${department}/${city}/${markerLimit}`);
        const data = await response.json();
        if (data.length == 0) {
          errorMessage('No hubo coincidencias');
          return;
        } else {
          updateFilterFields(idCategory, country, department, city, markerLimit);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchData = async () => {
      await fetchCellTowers();
    };

    fetchData();
  };

  if (!isOpen || !dataLoaded) return null;

  return (
    <div className='popup absolute px-4 py-4 flex flex-col gap-3 top-[52vh] left-[10px] bg-slate-700 text-white'>
      <span className='font-semibold'><b>Filtros</b></span>
      <div className='flex flex-row gap-[14px] w-full'>
        <span className='w-auto'>Marcadores:</span>
        <span className='w-full'>
          <select className='w-full text-black p-1' onChange={handleCategoryChange}>
            {categories.map(category => (
              <option key={category.idcategory} value={category.idcategory}>
                {category.category}
              </option>
            ))}
          </select>
        </span>
      </div>
      <div className='flex flex-row gap-5 w-full'>
        <div className='flex flex-row gap-2 w-1/2'>
          <span className='w-1/2'>Area:</span>
          <span className='w-1/2'>
            <select className='w-full text-black p-1' onChange={handleAreaNameChange}>
              {polygonDelimitedArea.map(polygon => (
                <option key={polygon.idpolygondelimitedarea} value={polygon.idpolygondelimitedarea}>
                  {polygon.areaname}
                </option>
              ))}
            </select>
          </span>
        </div>
        <div className='flex flex-row gap-2 w-1/2'>
          <span className='w-1/2'>Pais:</span>
          <span className='w-1/2'>
            <select className='w-full text-black p-1' onChange={handleCountryChange}>
              {ubicationCountry.map(ubication => (
                <option key={ubication.country} value={ubication.country}>
                  {ubication.country}
                </option>
              ))}
            </select>
          </span>
        </div>
      </div>
      <div className='flex flex-row gap-5 w-full'>
        <div className='flex flex-row gap-2 w-1/2'>
          <span className='w-2/3'>Departamento:</span>
          <span className='w-1/3'>
            <select className='w-full text-black p-1' onChange={handleDepartmentChange}>
              {ubicationDepartment.map(ubication => (
                <option key={ubication.department} value={ubication.department}>
                  {ubication.department}
                </option>
              ))}
            </select>
          </span>
        </div>
        <div className='flex flex-row gap-2 w-1/2'>
          <span className='w-1/2'>Ciudad:</span>
          <span className='w-1/2'>
            <select className='w-full text-black p-1' onChange={handleCityChange}>
              {ubicationCity.map(ubication => (
                <option key={ubication.city} value={ubication.city}>
                  {ubication.city}
                </option>
              ))}
            </select>
          </span>
        </div>
      </div>
      <div className='flex flex-row gap-1 w-full'>
        <span className=''>Cantidad de marcadores:</span>
        <input className='text-black pl-1' type="number" min={0} step={10} value={markerLimit} onChange={(e) => setMarkerLimit(e.target.value)} required autoFocus/>
        <button className='bg-blue-500 px-1 py-1 hover:bg-blue-700' onClick={() => setMarkerLimit(0)}>Todos</button>
      </div>
      <div className='flex flex-row gap-2'>
        <button className='bg-blue-500 px-1 py-1 hover:bg-blue-700 w-3/4' onClick={handleSubmit}>Filtrar</button>
        <button className='bg-slate-500 px-1 py-1 hover:bg-slate-600 w-1/4' onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
};

export default PopupFilter;
