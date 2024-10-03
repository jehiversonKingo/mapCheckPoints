import React from 'react';

const LoadingPage = () => {
  return (
    <div className="bg-gray-800 fixed inset-0 z-50 h-[100vh] w-full">
      <div className='mt-[33vh] flex flex-col gap-2 items-center'>
        <img className='bg-white p-2 rounded-3xl ' src='https://www.seaf.com/wp-content/uploads/2020/09/Kingo-1.png' width={200} alt='Not Found'></img>
        <span className='text-white font-semibold'>Cargando Mapa...</span>
        <img className='max-h-10 min-w-96' src="https://i.pinimg.com/originals/49/23/29/492329d446c422b0483677d0318ab4fa.gif" alt="Loading..." />
      </div>
    </div>
  );
};

export default LoadingPage;
