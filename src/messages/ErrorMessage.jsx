import React from 'react';

const ErrorMessage = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" autoFocus>
      <div className="bg-gray-800 rounded-lg p-6 w-80 flex flex-col items-center justify-center">
        <div className="text-9xl mb-5"><i className="bi bi-x-circle text-red-500"></i></div>
        <div className="text-white text-center mb-4">{message}</div>
        <button className="mt-auto bg-blue-500 hover:bg-blue-700 text-white px-5 py-1 rounded" onClick={onClose} autoFocus>Cerrar</button>
      </div>
    </div>
  );
};

export default ErrorMessage;
