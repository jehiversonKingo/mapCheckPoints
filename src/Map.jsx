import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { removeAccessToken } from './Router';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import './index.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import logo from '/logo.png';
import PopupAddCategory from './popups/PopupAddCategory';
import PopupAddDelimitedArea from './popups/PopupAddDelimitedArea';
import PopupAddMarker from './popups/PopupAddMarker';
import PopupFilter from './popups/PopupFilter';
import PopupFilterAntennas from './popups/PopupFilterAntennas';
import PopupDeleteFilters from './popups/PopupDeleteFilters';
import CheckMessage from './messages/CheckMessage';
import ErrorMesssage from './messages/ErrorMessage'
import LoadingPage from './components/LoadingPage';
import PopupEditArea from './popups/PopupEditArea';

const MapComponent = () => {
  const mapContainerRef = useRef(); // Map Container
  const mapRef = useRef(); // Map Component
  const [cursorLng, setCursorLng] = useState(null); // Lng of cursor in real time
  const [cursorLat, setCursorLat] = useState(null); // Lat of cursor in real time
  const [popupAddMarker, setPopupAddMarker] = useState(false); // For add new marker
  const [popupAddDelimitedArea, setPopupAddDelimitedArea] = useState(false); // For add new area
  const [popupAddCategory, setPopupAddCategory] = useState(false); // For add new category
  const [popupFilter, setPopupFilter] = useState(false); // For filter markers
  const [popupFilterAntennas, setPopupFilterAntennas] = useState(false); // For filter antennas
  const [popupEditArea, setPopupEditArea] = useState(false); // For edit and delete delimited areas
  const [popupDeleteFilters, setPopupDeleteFilters] = useState(false); // For delete filters
  const [popupCoordinates, setPopupCoordinates] = useState({ lng: 0, lat: 0 }); // Coordinates for add marker 
  const [zoomLevel, setZoomLevel] = useState(3); // Map level zoom
  const [polygonCoordinates, setPolygonCoordinates] = useState([]); // Polygon set coordinates
  const [changeData, setChangeData] = useState(false); // Reload data when change
  const navigate = useNavigate(); // Navigate routes
  const [filterFields, setFilterFields] = useState([]); // Arrays with filters of markers
  const [filterAntennas, setFilterAntennas] = useState([]); // Arrays with filters of antennas
  const [polygonOpacityLow, setPolygonOpacityLow] = useState(false); // Change opacity of delimited areas
  const [showMessage, setShowMessage] = useState(false); // Confrim message
  const [showErrorMessage, setShowErrorMessage] = useState(false); // Error message
  const [showLoadingPage, setShowLoadingPage] = useState(true); // Loading page
  const [messageText, setMessageText] = useState(''); // Texts of message of confirmation and error

  // Redirect home after sign out
  const handleSignOut = () => {
    removeAccessToken();
    navigate('/');
  };

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiY3Jpc3RvcGhlci0xMjMiLCJhIjoiY20wNDY1aDh4MDR4ODJpcHVydmx6bGxhdyJ9.I2Na-YIude-grxDyLfqndA';

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current, // COntainer of map
      style: 'mapbox://styles/mapbox/streets-v12', // Style of map
      center: [-90.5138, 14.6390], // Inicial coordinates
      zoom: 12 // Inicial xoom of map
    });

    // Options for draw polygons
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true, // Draw tool
        trash: true // Delete tool
      }
    });

    // Add options of draw polygons to map
    mapRef.current.addControl(draw);

    // Charge elements to map
    mapRef.current.on('load', async () => {
      // Draw markers in map, only if have filters
      for (let index = 0; index < filterFields.length; index++) {
        const fieldIdCategory = filterFields[index][0]; // GET idCategory
        const fieldCountry = filterFields[index][1]; // GET country
        const fieldDepartment = filterFields[index][2]; // GET department
        const fieldCity = filterFields[index][3]; // GET city
        const fieldMarkerLimit = filterFields[index][4]; // GET limit of markers

        fetch(`http://localhost:3001/markers/${fieldIdCategory}/${fieldCountry}/${fieldDepartment}/${fieldCity}/${fieldMarkerLimit}`)
          .then(response => response.json())
          .then(data => {
            data.forEach(marker => {
              // Add radius layout to marker
              mapRef.current.addLayer({
                id: `circle-${marker.idmarker}`,
                type: 'circle',
                source: {
                  type: 'geojson',
                  data: {
                    type: 'Feature',
                    geometry: {
                      type: 'Point',
                      coordinates: [marker.lng, marker.lat]
                    }
                  }
                },
                paint: { // Draw radius in the marker
                  'circle-radius': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    9, 1,
                    10, (marker.markercircleradius * 0.5),
                    11, marker.markercircleradius,
                    12, (marker.markercircleradius * 2),
                    13, (marker.markercircleradius * 4),
                    14, (marker.markercircleradius * 8),
                    15, (marker.markercircleradius * 15),
                    16, (marker.markercircleradius * 30),
                    17, (marker.markercircleradius * 60),
                    18, (marker.markercircleradius * 120),
                    19, (marker.markercircleradius * 240),
                    20, (marker.markercircleradius * 480),
                    21, (marker.markercircleradius * 960),
                    22, (marker.markercircleradius * 1920),
                  ],
                  'circle-color': marker.markercolor,
                  'circle-opacity': 0.5,
                }
              });

              // Create marker in MapBoxGl
              const mapboxMarker = new mapboxgl.Marker({ color: marker.markercolor })
                .setLngLat([marker.lng, marker.lat])
                .addTo(mapRef.current);

              // Create html for popup
              const popupContent = document.createElement('div');
              // Popup in htmk
              popupContent.innerHTML = `
                  <span class="flex flex-row w-auto gap-2 mb-2">
                    <h3><b>Titulo:</b></h3>
                    <input class="bg-gray-300 w-full px-1" id="input-title-${marker.idmarker}" type="text" value="${marker.markertitle}" />
                  </span>
                  <span class="flex flex-row w-auto gap-2 mb-2">
                    <h3><b>Descripcion:</b></h3>
                    <input class="bg-gray-300 w-full px-1" id="input-description-${marker.idmarker}" type="text" value="${marker.markerdescription}" />
                  </span>
                  <span class="flex flex-row w-auto gap-2 mb-2">
                    <h3><b>Pais:</b></h3>
                    <input class="bg-gray-300 w-full px-1" id="input-pais-${marker.idmarker}" type="text" value="${marker.country}" />
                  </span>
                  <span class="flex flex-row w-auto gap-2 mb-2">
                    <h3><b>Departamento:</b></h3>
                    <input class="bg-gray-300 w-full px-1" id="input-departamento-${marker.idmarker}" type="text" value="${marker.department}" />
                  </span>
                  <span class="flex flex-row w-auto gap-2 mb-2">
                    <h3><b>Ciudad:</b></h3>
                    <input class="bg-gray-300 w-full px-1" id="input-ciudad-${marker.idmarker}" type="text" value="${marker.city}" />
                  </span>
                  <span class="flex flex-row w-auto gap-2 mb-2">
                    <h3><b>Direccion:</b></h3>
                    <input class="bg-gray-300 w-full px-1" id="input-ciudad-${marker.idmarker}" type="text" value="${marker.direction}" />
                  </span>
                  <span class="flex flex-row w-auto gap-2 mb-2">
                    <h3><b>Radio:</b></h3>
                    <input class="bg-gray-300 w-full px-1" id="input-networkType-${marker.idmarker}" type="text" value="${marker.markercircleradius}" />
                  </span>
                  <span class="flex flex-row w-auto gap-2 mb-2">
                    <h3><b>Color:</b></h3>
                    <input class="bg-gray-300 w-full px-1" id="input-color-${marker.idmarker}" type="text" value="${marker.markercolor}" />
                  </span>
                  <div class="flex flex-row gap-2">
                    <button class="bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded-sm w-1/2" data-update-id="${marker.idmarker}">Editar</button>
                    <button class="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded-sm w-1/2" data-id="${marker.idmarker}">Eliminar</button>
                  </div>
              `;

              // Create and config popup
              const popup = new mapboxgl.Popup({ offset: [0, -35] })
                .setDOMContent(popupContent)
                .setMaxWidth('none');

              // Variable for detect if cursor is in the popup
              let inMarker = false;
              mapboxMarker.getElement().addEventListener('mouseover', () => { // Event: mouse over element
                  popup.setLngLat([marker.lng, marker.lat]).addTo(mapRef.current);
                  popup.getElement().addEventListener('mouseenter', () => { // Event: mouse enter in the element
                    inMarker = true;
                  });
                  popup.getElement().addEventListener('mouseleave', () => { // Event: mouse leave the element
                    popup.remove();
                    inMarker = false;
                  });
              });

              // Event: mouse leave marker point
              mapboxMarker.getElement().addEventListener('mouseleave', () => {
                setTimeout(() => {
                  if (!inMarker) {
                    popup.remove();
                  }
                }, 700);
              });

              // Event click update
              popupContent.querySelector('button[data-update-id]').addEventListener('click', (event) => {
                
                // Get the marker ID from the button's data attribute
                const markerId = event.target.getAttribute('data-update-id');
                
                // Collect the updated values from the input fields
                const title = document.querySelector(`#input-title-${markerId}[type="text"]:nth-of-type(1)`).value;
                const description = document.querySelector(`#input-description-${markerId}[type="text"]:nth-of-type(1)`).value;
                const radius = document.querySelector(`#input-networkType-${markerId}[type="text"]:nth-of-type(1)`).value;
                const color = document.querySelector(`#input-color-${markerId}[type="text"]:nth-of-type(1)`).value;
                
                // Prepare the data to be sent to the server
                const updatedMarker = {
                    idMarker: markerId,
                    markerTitle: title,
                    markerDescription: description,
                    markerCircleRadius: parseFloat(radius),
                    markerColor: color
                };
                
                // Send updated data to the server
                fetch(`http://localhost:3001/updated-marker/${markerId}`, {
                    method: 'PUT', // or 'PATCH' depending on your API
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedMarker)
                })
                .catch(error => {
                    console.error('Error updating marker:', error);
                });

                setShowLoadingPage(true);
                setChangeData(!changeData);
            });

              // Event click delete
              popupContent.querySelector('button[data-id]').addEventListener('click', (event) => {
                const markerId = event.target.getAttribute('data-id');
                setMarkerInactive(markerId);
                popup.remove();
                setShowLoadingPage(true);
                setChangeData(!changeData);
              });
            });
        });
      }
    
      // Draw cellTowers
      for (let index = 0; index < filterAntennas.length; index++) {
        const fieldNetworkType = filterAntennas[index][0]; // GET networkType
        const markerLimitAntennas = filterAntennas[index][1]; // GET markerLimit

        // GET antennas
        fetch(`http://localhost:3001/cellTowers/${fieldNetworkType}/${markerLimitAntennas}`)
          .then(response => response.json())
          .then(data => {
          data.forEach(marker => {

            let radMetters = marker.kmrange;
            let radius = radMetters / 1000;

            // Add radius layout to marker
            mapRef.current.addLayer({
              id: `circle-${Math.random()}`,
              type: 'circle',
              source: {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [marker.lng, marker.lat]
                  }
                }
              },
              paint: {
                'circle-radius': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  9, 1,
                  12, (radius * 2),
                  13, (radius * 4),
                  14, (radius * 8),
                  15, (radius * 16),
                  16, (radius * 32),
                  17, (radius * 64),
                  18, (radius * 128),
                  19, (radius * 256),
                  20, (radius * 512),
                  21, (radius * 1024),
                  22, (radius * 2048),
                ],
                'circle-color': '#8fa5c7',
                'circle-opacity': 0.3,
              }
            });

            // Make marker in MapBoxGl
            const mapboxMarker = new mapboxgl.Marker({ color: '#8fa5c7' })
              .setLngLat([marker.lng, marker.lat])
              .addTo(mapRef.current);

            // Make html for popup
            const popupContent = document.createElement('div');
            popupContent.innerHTML = `
                <span class="block"><span class="font-bold">NetworkType: </span>${marker.networktype}</span>
                <span class="block"><span class="font-bold">MCC: </span>${marker.mobilecountrycode}</span>
                <span class="block"><span class="font-bold">NET: </span>${marker.mobilenetworkcode}</span>
                <span class="block"><span class="font-bold">Area: </span>${marker.area}</span>
                <span class="block"><span class="font-bold">Rango: </span>${marker.kmrange}</span>
            `;

            // Make and config popup
            const popup = new mapboxgl.Popup({ offset: [0, -35] })
              .setDOMContent(popupContent)
              .setMaxWidth('none');

            let inMarker = false;
            // Add mouseover and click to marker
            mapboxMarker.getElement().addEventListener('mouseover', () => {
                popup.setLngLat([marker.lng, marker.lat]).addTo(mapRef.current);
                popup.getElement().addEventListener('mouseenter', () => {
                  inMarker = true;
                });
                popup.getElement().addEventListener('mouseleave', () => {
                  popup.remove();
                  inMarker = false;
                });
            });

            mapboxMarker.getElement().addEventListener('mouseleave', () => {
              setTimeout(() => {
                if (!inMarker) {
                  popup.remove();
                }
              }, 1000);
            });
          });
        });
      }

      // Create polygons
      try {
        let coordinatesArray = [];
    
        const response = await fetch('http://localhost:3001/polygon-data-order-by-id');
        const repsonseIdCoor = await fetch('http://localhost:3001/coordinates-last-id');
        const repsonseIdArea = await fetch('http://localhost:3001/area-first-id');
        const data = await response.json();
        const dataIdCoor = await repsonseIdCoor.json();
        const dataIdArea = await repsonseIdArea.json();
        const coorLastId = dataIdCoor[0].idpolygoncoordinates;
        let previousId = dataIdArea[0].idpolygondelimitedarea;
        console.log(dataIdArea[0].idpolygondelimitedarea);
    
        data.forEach(polygonData => {
          if (polygonData.idpolygoncoordinates == coorLastId) {
            coordinatesArray.push([polygonData.lng, polygonData.lat]);
          }
          if (previousId != polygonData.idpolygondelimitedarea || polygonData.idpolygoncoordinates == coorLastId) {
            mapRef.current.addLayer({
              id: `polygonDelimitedArea-${previousId}`,
              type: 'fill',
              source: {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  geometry: {
                    type: 'Polygon',
                    coordinates: [coordinatesArray]
                  }
                }
              },
              layout: {},
              paint: {
                'fill-color': '#999999',
                'fill-opacity': polygonOpacityLow == false ? 0.4 : 0.2
              }
            });
            // Clear coordinates array
            coordinatesArray = [];
          }
    
          // Push new point coordinates
          coordinatesArray.push([polygonData.lng, polygonData.lat]);
    
          // Update previusId if is diferent to idPolygonDelimitedArea
          previousId = previousId != polygonData.idpolygondelimitedarea ? polygonData.idpolygondelimitedarea : previousId;
        });
      } catch (error) {
        console.error('Error loading polygon:', error);
      }

      setShowLoadingPage(false);
    });
    
    // Listener when end draw the polygon
    mapRef.current.on('draw.create', (e) => {
      const coordinates = e.features[0].geometry.coordinates[0].map(coord => ({
        lng: coord[0],
        lat: coord[1],
      }));
      setPolygonCoordinates(coordinates);
      setPopupAddDelimitedArea(true);
    });

    // Listener: onMouseMoveMap
    mapRef.current.on('mousemove', (e) => {
      setCursorLng(e.lngLat.lng);
      setCursorLat(e.lngLat.lat);
    });

    // Listener: onZoomMap
    mapRef.current.on('zoom', () => {
      setZoomLevel(mapRef.current.getZoom().toFixed(2));
    });

    // Listener: onClickMap
    mapRef.current.on('click', (e) => {
      const { lngLat } = e;
      setPopupCoordinates(lngLat);
    });

    // Change state of marker
    const setMarkerInactive = (id) => {
      fetch(`http://localhost:3001/markers/${id}`, {
        method: 'PUT'
      })
    };
  }, [changeData]);

  function removePolygons() {
    const existingLayers = mapRef.current.getStyle().layers;
    existingLayers.forEach(layer => {
        if (layer.id.startsWith('polygonDelimitedArea-')) {
            mapRef.current.removeLayer(layer.id);
        }
    });
  }

  // Don't show popups of filters and update map with new filters
  function filterData() {
    setShowLoadingPage(true);
    setPopupFilter(false);
    setPopupFilterAntennas(false);
    setChangeData(!changeData);
  }

  // Add new filter for markers
  const updateFilterFields = (idCategory, ubicationCountry, ubicationDepartment, ubicationCity, markerLimit) => {
    for (let index = 0; index < filterFields.length; index++) {
      const fieldIdCategory = filterFields[index][0];
      const fieldCountry = filterFields[index][1];
      const fieldDepartment = filterFields[index][2];
      const fieldCity = filterFields[index][3];
      const fieldMarkerLimit = filterFields[index][4];

      // Validate if the filter already exist
      if (fieldIdCategory == idCategory && fieldCountry == ubicationCountry && fieldDepartment == ubicationDepartment && fieldCity == ubicationCity && fieldMarkerLimit == markerLimit) {
        return handleShowErrorMessage('Estos marcadores ya existen en el mapa');
      }
    }
    
    const newData = [
      idCategory,
      ubicationCountry,
      ubicationDepartment,
      ubicationCity,
      markerLimit,
    ];

    console.log('DATA: ', newData);
    filterData();
    setFilterFields(prevData => [...prevData, newData]); // Update state with new data
  };

  const updateFilterAntennas = (networkType, markerLimit) => {
    for (let index = 0; index < filterAntennas.length; index++) {
      const fieldNetworkType = filterAntennas[index][0];
      const maxRows = filterAntennas[index][1];

      if (fieldNetworkType == networkType && maxRows == markerLimit) {
        return handleShowErrorMessage('Estas antenas ya existen en el mapa');
      }
    }

    const newData = [
      networkType,
      markerLimit
    ];
    console.log('DATA: ', newData);
    filterData();
    setFilterAntennas(prevData => [...prevData, newData]);
  };

  // Show message
  const handleShowMessage = (msg) => {
    setMessageText(msg);
    setShowMessage(true);
  };

  // Show error message
  const handleShowErrorMessage = (msg) => {
    setMessageText(msg);
    setShowErrorMessage(true);
  };

  // Close messages
  const handleCloseMessage = () => {
    setShowMessage(false);
    setShowErrorMessage(false);
  };

  // Validate inputs
  const validateInput = (e) => {
    const inputValue = e.target.value;
    const validateDoubleSpace = /\s{2,}/g; // Not permit double or more spaces
    const validateSpecialCharacters = /^[ñÑa-zA-Z0-9\s]+$/g; // Permit only this characters

    if (inputValue == '') {
      e.target.value = inputValue;
      return;
    }

    if (validateSpecialCharacters.test(inputValue)) {
      if (!validateDoubleSpace.test(inputValue)) {
        e.target.value = inputValue;
      } else {
        e.target.value = inputValue.slice(0, -1);
        return handleShowErrorMessage('No ingrese dos espacios seguidos');
      }
    } else {
      e.target.value = inputValue.slice(0, -1);
      return handleShowErrorMessage('No ingrese caracteres especiales');
    }
  };
  
  return (
    <div>
      {showLoadingPage && (
        <LoadingPage />
      )}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100vh' }} />
      <img className='absolute z-10 top-14 left-1/2 -translate-x-1/2' src={logo} width={200} alt='Not Found'></img>
      <div className="font-monospace flex flex-row bg-slate-700 text-white px-2 py-2 absolute z-10 top-0 left-0 m-3 rounded">
        <div className="dropdown pl-2 pr-3 pt-[1.5px]">
          <i className="bi bi-list hover:cursor-pointer"></i>
          <div className="dropdown-content bg-slate-700 flex flex-col absolute w-48 z-10">
            <span className='bg-slate-700 text-white flex flex-row gap-3 px-3 py-2 hover:bg-slate-800 hover:cursor-pointer' onClick={() => (setPopupAddMarker(true))}><i className="bi bi-check-circle text-blue-500"></i>Agregar Marcador</span>
            <span className='bg-slate-700 text-white flex flex-row gap-3 px-3 py-2 hover:bg-slate-800 hover:cursor-pointer' onClick={() => (setPopupAddCategory(true))}><i className="bi bi-tags text-blue-500"></i>Agregar Categoria</span>
            <span className='bg-slate-700 text-white flex flex-row gap-3 px-3 py-2 hover:bg-slate-800 hover:cursor-pointer' onClick={() => (setPolygonOpacityLow(!polygonOpacityLow), setChangeData(!changeData))}><i className="bi bi-palette text-blue-500"></i>Atenuar Color</span>
            <span className='bg-slate-700 text-white flex flex-row gap-3 px-3 py-2 hover:bg-slate-800 hover:cursor-pointer' onClick={() => (setPopupEditArea(true))}><i className="bi bi-crosshair text-blue-500"></i>Editar Area</span>
            <span className='bg-slate-700 text-white flex flex-row gap-3 px-3 py-2 hover:bg-slate-800 hover:cursor-pointer' onClick={() => (setPopupFilter(true))}><i className="bi bi-filter text-blue-500"></i>Filtrar Marcas</span>
            <span className='bg-slate-700 text-white flex flex-row gap-3 px-3 py-2 hover:bg-slate-800 hover:cursor-pointer' onClick={() => (setPopupFilterAntennas(true))}><i className="bi bi-wifi text-blue-500"></i>Filtrar Antenas</span>
            <span className='bg-slate-700 text-white flex flex-row gap-3 px-3 py-2 hover:bg-slate-800 hover:cursor-pointer' onClick={() => (setPopupDeleteFilters(true))}><i className="bi bi-filter text-red-500"></i>Quitar Filtros</span>
            <Link to='/'><span className='bg-slate-700 text-white flex flex-row gap-3 px-3 py-2 hover:bg-slate-800 hover:cursor-pointer' onClick={handleSignOut}><i className="bi bi-person text-red-500"></i>Cerrar Sesión</span></Link>
          </div>
        </div>
        <span>
          Longitud: {cursorLng !== null ? cursorLng.toFixed(4) : 'N/A'} | 
          Latitud: {cursorLat !== null ? cursorLat.toFixed(4) : 'N/A'} | 
          Zoom: {zoomLevel}
        </span>
      </div>
      {showMessage && (
        <CheckMessage message={messageText} onClose={handleCloseMessage} />
      )}
      {showErrorMessage && (
        <ErrorMesssage message={messageText} onClose={handleCloseMessage} />
      )}
      <PopupAddMarker 
        isOpen={popupAddMarker}
        lng={popupCoordinates.lng.toFixed(4)}
        lat={popupCoordinates.lat.toFixed(4)}
        onClose={() => setPopupAddMarker(false)}
        validateInput={validateInput}
        checkMessage={handleShowMessage}
        errorMessage={handleShowErrorMessage}
      />
      <PopupAddDelimitedArea
        isOpen={popupAddDelimitedArea}
        onClose={() => setPopupAddDelimitedArea(false)}
        checkMessage={handleShowMessage}
        errorMessage={handleShowErrorMessage}
        validateInput={validateInput}
        polygonCoordinates={polygonCoordinates}
      />
      <PopupAddCategory
        isOpen={popupAddCategory}
        onClose={() => setPopupAddCategory(false)}
        checkMessage={handleShowMessage}
        errorMessage={handleShowErrorMessage}
        validateInput={validateInput}
      />
      <PopupFilter
        isOpen={popupFilter}
        onClose={() => setPopupFilter(false)}
        updateFilterFields={updateFilterFields}
        errorMessage={handleShowErrorMessage}
      />
      <PopupFilterAntennas
        isOpen={popupFilterAntennas}
        onClose={() => setPopupFilterAntennas(false)}
        updateFilterAntennas={updateFilterAntennas}
        filterData={filterData}
      />
      <PopupDeleteFilters 
        isOpen={popupDeleteFilters}
        onClose={() => setPopupDeleteFilters(false)}
        filtersMarkers={filterFields}
        filtersAntennas={filterAntennas}
        setFiltersAntennas={setFilterAntennas}
        setFiltersMarkers={setFilterFields}
        filterData={filterData}
      />
      <PopupEditArea
        isOpen={popupEditArea}
        onClose={() => setPopupEditArea(false)}
        checkMessage={handleShowMessage}
        errorMessage={handleShowErrorMessage}
        filterData={filterData}
        removePolygons={removePolygons}
      />
    </div>
  );
};

export default MapComponent;
