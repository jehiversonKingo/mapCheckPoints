import React, { useEffect, useState } from 'react';

const PopupFilterAntennas = ({ isOpen, onClose, updateFilterAntennas }) => {
  const [cellTowers, setCellTowers] = useState([]);
  const [networkType, setNetworkType] = useState([]);
  const [antennasLimit, setAntennasLimit] = useState(50);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchCellTowers = async () => {
      try {
        const response = await fetch('http://localhost:3001/cellTowers-type-networkType');
        const data = await response.json();
        setCellTowers(data);
        setNetworkType(data[0].networktype);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    setDataLoaded(true);

    const fetchData = async () => {
      await fetchCellTowers();
    };

    fetchData();
  }, [isOpen]);

  const handleNetworkTypeChange = (e) => {
    setNetworkType(e.target.value);
    console.log('Selected: ', e.target.value);
  };

  const handleSubmit = () => {
    updateFilterAntennas(networkType, antennasLimit);
  };

  if (!isOpen || !dataLoaded) return null;

  return (
    <div className='popup absolute px-4 py-4 flex flex-col gap-3 top-[52vh] left-[10px] bg-slate-700 text-white'>
      <span className='font-semibold'><b>Antenas</b></span>
      <div className='flex flex-row gap-5 w-full'>
        <div className='flex flex-row gap-2 w-1/2'>
          <span className='w-1/2'>Pais:</span>
          <span className='w-1/2'>
            <select className='w-full text-black p-1'>
              <option key={Math.random()} value={'Antenas'}>Guatemala</option>
              <option key={Math.random()} value={'Shockeepers'}>Honduras</option>
              <option key={Math.random()} value={'Comunidades'}>Nicaragua</option>
            </select>
          </span>
        </div>
        <div className='flex flex-row gap-2 w-1/2'>
          <span className='w-2/3'>Departamento:</span>
          <span className='w-1/3'>
          <select className='w-full text-black p-1'>
              <option key={Math.random()} value={'Antenas'}>Alta Verapaz</option>
              <option key={Math.random()} value={'Shockeepers'}>Baja Verapaz</option>
              <option key={Math.random()} value={'Comunidades'}>Izabal</option>
            </select>
          </span>
        </div>
      </div>
      <div className='flex flex-row gap-5 w-full'>
        <div className='flex flex-row gap-2 w-1/2'>
          <span className='w-1/2'>Red:</span>
          <span className='w-1/2'>
            <select className='w-full text-black p-1' onChange={handleNetworkTypeChange}>
              {cellTowers.map(cellTower => (
                <option key={cellTower.networktype} value={cellTower.networktype}>
                  {cellTower.networktype}
                </option>
              ))}
            </select>
          </span>
        </div>
        <div className='flex flex-row gap-2 w-1/2'>
          <span className='w-1/2'>Marcadores:</span>
          <span className='w-1/2'>
            <select className='w-full text-black p-1'>
              <option key={Math.random()} value={'Antenas'}>Antenas</option>
              <option key={Math.random()} value={'Shockeepers'}>ShopKeepers</option>
              <option key={Math.random()} value={'Comunidades'}>Comunidades</option>
            </select>
          </span>
        </div>
      </div>
      <div className='flex flex-row gap-1 w-full'>
        <span className='w-1/2'>Cantidad de marcadores:</span>
        <input className='text-black pl-1 w-1/2' type="number" value={antennasLimit} onChange={(e) => setAntennasLimit(e.target.value)} required autoFocus/>
        <button className='bg-blue-500 px-1 py-1 hover:bg-blue-700' onClick={() => setAntennasLimit(0)}>Todos</button>
      </div>
      <div className='flex flex-row gap-2'>
        <button className='bg-blue-500 px-1 py-1 hover:bg-blue-700 w-3/4' onClick={handleSubmit}>Filtrar</button>
        <button className='bg-slate-500 px-1 py-1 hover:bg-slate-600 w-1/4' onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
};

export default PopupFilterAntennas;
