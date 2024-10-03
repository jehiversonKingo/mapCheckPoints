import React from 'react';

const PopupAddCategory = ({ isOpen, onClose, checkMessage, errorMessage, validateInput }) => {
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const category = e.target.elements.category.value.trim();

    if (category) {
      try {
        const categoryInsert = await fetch('http://localhost:3001/category', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category }),
        });
        console.log(category);

        if (!categoryInsert.ok) throw new Error('Error al guardar la nueva categoria');
    
        onClose();
        checkMessage('Categoria agregada correctamente!');
      } catch (error) {
        console.error('Error al guardar la nueva categoria:', error);
      }
    } else {
      errorMessage('Ingrese un valor');
    }
  };

  return (
    <form onSubmit={handleSubmit} className='popup absolute p-4 flex flex-col gap-3 top-[70vh] left-[10px] bg-slate-700 text-white'>
        <h4><b>Nueva Categoría</b></h4>
        <input name="category" className='px-2 text-black' type="text" onChange={validateInput} required autoFocus/>
        <div className='flex flex-row w-full gap-2'>
          <button className='bg-blue-500 hover:bg-blue-700 px-2 py-1 rounded-sm w-1/2' type='submit'>Agregar</button>
          <button className='bg-slate-500 hover:bg-slate-600 px-2 py-1 rounded-sm w-1/2' onClick={onClose} type='button'>Cancelar</button>          
        </div>
    </form>
  );
};

export default PopupAddCategory;
