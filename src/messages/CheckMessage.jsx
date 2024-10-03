import React from 'react';

const CheckMessage = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-80 h-72 flex flex-col items-center justify-center">
        <div className="text-9xl mb-5"><i className="bi bi-check2-circle text-green-500"></i></div>
        <div className="text-white text-center mb-4">{message}</div>
        <button className="mt-auto bg-blue-500 text-white px-5 py-1 rounded hover:bg-blue-600" onClick={onClose} autoFocus>Cerrar</button>
      </div>
    </div>
  );
};

export default CheckMessage;
