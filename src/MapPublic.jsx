import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { removeAccessToken } from './Router';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import './index.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import logo from '/logo.png';
import { SliderPicker } from 'react-color';

const MapComponent = () => {
  const mapContainerRef = useRef(); // Map Container
  const mapRef = useRef(); // Map Component
  const [cursorLng, setCursorLng] = useState(null); // Lng of cursor in real time
  const [cursorLat, setCursorLat] = useState(null); // Lat of cursor in real time
  const [popupAddMarker, setPopupAddMarker] = useState(false);
  const [popupAddDelimitedArea, setPopupAddDelimitedArea] = useState(false);
  const [popupAddCategory, setPopupAddCategory] = useState(false);
  const [popupFilter, setPopupFilter] = useState(false);
  const [popupFilterAntennas, setPopupFilterAntennas] = useState(false);
  const [popupCoordinates, setPopupCoordinates] = useState({ lng: 0, lat: 0 });
  const [circleRadius, setCircleRadius] = useState(0); // Marker circle radius
  const [zoomLevel, setZoomLevel] = useState(3); // Map level zoom
  const [markerColor, setMarkerColor] = useState('#93c5fd'); // Marker set color
  const [title, setTitle] = useState(''); // Marker set title
  const [description, setDescription] = useState(''); // Marker set description
  const [polygonCoordinates, setPolygonCoordinates] = useState([]); // Polygon set coordinates
  const [areaName, setAreaName] = useState(''); // Delimited area set name
  const [categories, setCategories] = useState([]); // List of categories of the markers
  const [polygonDelimitedArea, setPolygonDelimitedArea] = useState([]); // Polygons delimited area
  const [cellTowers, setCellTowers] = useState([]); // cell_tower data
  const [cellTowerNetworkType, setCellTowerNetworkType] = useState([]); // cel_tower field networkType
  const [idCategory, setIdCategory] = useState(null); // idCategory field for ubication table
  const [idPolygonDelimitedArea, setIdPolygonDelimitedArea] = useState(null); // idPolygonDelimitedArea field for table polygonCoordinates
  const [ubicationCountryField, setUbicationCountryField] = useState(null);
  const [ubicationCountry, setUbicationCountry] = useState(null);
  const [ubicationDepartmentField, setUbicationDepartmentField] = useState(null);
  const [ubicationDepartment, setUbicationDepartment] = useState(null);
  const [ubicationCityField, setUbicationCityField] = useState(null);
  const [ubicationCity, setUbicationCity] = useState(null);
  const [category, setCategory] = useState(''); // Table category data
  const [changeData, setChangeData] = useState(false); // Reload data when change
  const [markerLimit, setMarkerLimit] = useState(50); // Limit of markers render in map
  const [showMarkers, setShowMarkers] = useState(false); // Show markers
  const [showAntennas, setShowAntennas] = useState(false); // Show antennas
  const navigate = useNavigate(); // Navigate routes

  // Redirect home after sign out
  const handleSignOut = () => {
    removeAccessToken();
    navigate('/');
  };

  // SliderPicker change color
  const handleChangeComplete = (markerColor) => {
    setMarkerColor(markerColor.hex);
  };

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiY3Jpc3RvcGhlci0xMjMiLCJhIjoiY20wNDY1aDh4MDR4ODJpcHVydmx6bGxhdyJ9.I2Na-YIude-grxDyLfqndA';

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-90.5138, 14.6390],
      zoom: 12
    });

    // Options for draw polygons
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true, // Draw tool
        trash: true // Delete tool
      }
    });

    mapRef.current.addControl(draw);
    
    // Fetchs: Start get data
    fetch('http://localhost:3001/categories')
      .then(response => response.json())
      .then(data => setCategories(data))
      .catch(error => console.error('Error fetching categories:', error));
      
    // GET polygon delimited area data
    fetch('http://localhost:3001/polygon-delimited-area')
      .then(response => response.json())
      .then(data => setPolygonDelimitedArea(data))
      .catch(error => console.error('Error fetching polygon delimited area:', error));

    // GET country FROM ubication
    fetch('http://localhost:3001/ubication-country')
      .then(response => response.json())
      .then(data => {
        setUbicationCountryField(data);
        setUbicationCountry(data[0].country);
      })
      .catch(error => console.error('Error fetching country field from ubication:', error));

    // GET department FROM ubication
    fetch('http://localhost:3001/ubication-department')
      .then(response => response.json())
      .then(data => {
        setUbicationDepartmentField(data);
        setUbicationDepartment(data[0].department);
      })
      .catch(error => console.error('Error fetching country field from ubication:', error));

    // GET department FROM ubication
    fetch('http://localhost:3001/ubication-city')
      .then(response => response.json())
      .then(data => {
        setUbicationCityField(data);
        setUbicationCity(data[0].city);
      })
      .catch(error => console.error('Error fetching country field from ubication:', error));

    // GET networks from cellTowers
      fetch('http://localhost:3001/cellTowers-type-networkType')
      .then(response => response.json())
      .then(data => setCellTowers(data))
      .catch(error => console.error('Error fetching polygon delimited area:', error));

    // GET categories
    fetch('http://localhost:3001/categories')
      .then(response => response.json())
      .then(data => {
        setCategories(data);
        // Set idCategory with the first ID if categories are not empty
        if (data.length > 0) {
          setIdCategory(data[0].idcategory);
        }
      })
      .catch(error => console.error('Error fetching categories:', error));

    // GET 
    fetch('http://localhost:3001/polygon-delimited-area')
      .then(response => response.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0) {
          setIdPolygonDelimitedArea(data[0].idpolygondelimitedarea);
        }
      })
      .catch(error => console.error('Error fetching delimited area:', error));

      fetch('http://localhost:3001/cellTowers-type-networkType')
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          setCellTowerNetworkType(data[0].networktype);
        }
      })
      .catch(error => console.error('Error fetching delimited area:', error));

    mapRef.current.on('load', async () => {
      try {
        let previousId = null;
        let coordinatesArray = [];
    
        const response = await fetch('http://localhost:3001/polygon-data-order-by-id');
        const data = await response.json();
    
        data.forEach(polygonData => {
          if (previousId != null && previousId != polygonData.idpolygondelimitedarea) {
            mapRef.current.addLayer({
              id: `polygonDelimitedArea-${Math.random()}`,
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
                'fill-opacity': 0.4
              }
            });
            // Clear coordinates array
            coordinatesArray = [];
          }
    
          // Push new point coordinates
          coordinatesArray.push([polygonData.lng, polygonData.lat]);
    
          // Update previusId
          previousId = polygonData.idpolygondelimitedarea;
        });
    
        // Make last polygon after of the iteration
        if (coordinatesArray.length > 0) {
          mapRef.current.addLayer({
            id: `polygonDelimitedArea-${Math.random()}`,
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
              'fill-color': '#999999', // marker radius color
              'fill-opacity': 0.4 // marker opacity level
            }
          });
        }
      } catch (error) {
        console.error('Error loading polygon:', error);
      }

      // Get markers and draw in map
      if (showMarkers) {
        fetch(`http://localhost:3001/markers/${idCategory}/${ubicationCountry}/${ubicationDepartment}/${ubicationCity}/${markerLimit}`)
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

            // Make marker in MapBoxGl
            const mapboxMarker = new mapboxgl.Marker({ color: marker.markercolor })
              .setLngLat([marker.lng, marker.lat])
              .addTo(mapRef.current);

            // Make html for popup
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
                  <h3><b>NetworkType:</b></h3>
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

            // Make and config popup
            const popup = new mapboxgl.Popup({ offset: [0, -35] })
              .setDOMContent(popupContent)
              .setMaxWidth('none');

            // Var detect in marker
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

              setChangeData(!changeData);
          });

            // Event click delete
            popupContent.querySelector('button[data-id]').addEventListener('click', (event) => {
              const markerId = event.target.getAttribute('data-id');
              setMarkerInactive(markerId);
              popup.remove();
              setChangeData(!changeData);
            });
          });
        });
      }

      if (showAntennas) {
        // GET antennas
        fetch(`http://localhost:3001/cellTowers/${cellTowerNetworkType}/${markerLimit}`)
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
                    coordinates: [marker.lon, marker.lat]
                  }
                }
              },
              paint: {
                'circle-radius': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  9, 1,
                  10, (radius * 0.5),
                  11, radius,
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

    // Listener: onEndDrawPolygonMap
    mapRef.current.on('draw.create', async (e) => {
      const features = e.features;

      features.forEach(async (feature) => {
        if (feature.geometry.type === 'Polygon') {
          // View Coordinates in start: console.log('Polygon coordinates:', feature.geometry.coordinates);
        }
      });
    });

    // No show inactive markers
    const setMarkerInactive = (id) => {
      fetch(`http://localhost:3001/markers/${id}`, {
        method: 'PUT'
      })
    };
  }, [changeData]);

  // Save categories
  const handleAddCategory = async () => {
    try {
      const categoryInsert = await fetch('http://localhost:3001/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      });
  
      if (!categoryInsert.ok) throw new Error('Error al guardar la nueva categoria');
  
      const returnData = await categoryInsert.json();
  
      setPopupAddCategory(false);
      setCategory('');
    } catch (error) {
      console.error('Error al guardar la nueva categoria:', error);
    }
  };

  // Save polygon area and coordinates
  const handleSavePolygon = async () => {
    if (!areaName || polygonCoordinates.length === 0) return;

    try {
      // Save area name of polygon
      const areaResponse = await fetch('http://localhost:3001/polygon-area', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ areaName }),
      });

      if (!areaResponse.ok) throw new Error('Error al guardar el nombre del área');

      const { idPolygonDelimitedArea } = await areaResponse.json();

      // Save polygon coordinates
      const coordResponse = await fetch('http://localhost:3001/polygon-coordinates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idPolygonDelimitedArea, coordinates: polygonCoordinates }),
      });

      if (!coordResponse.ok) throw new Error('Error al guardar las coordenadas');

      setPopupAddDelimitedArea(false);
      setPolygonCoordinates([]); // Clear coordinates
      setAreaName(''); // Clear input
    } catch (error) {
      console.error('Error al guardar el polígono:', error);
    }
  };

  // Funcion: Get categories
  const fetchCategoryData = () => {
    fetch('http://localhost:3001/categories')
      .then(response => response.json())
      .then(data => setCategories(data))
      .catch(error => console.error('Error fetching categories:', error));
  }

  // Funcion: Get categories
  const fetchPolygonData = () => {
    fetch('http://localhost:3001/polygon-delimited-area')
      .then(response => response.json())
      .then(data => setPolygonDelimitedArea(data))
      .catch(error => console.error('Error fetching polygon delimited area:', error));
  }

  const fetchCountry = () => {
    fetch('http://localhost:3001/ubication-country')
      .then(response => response.json())
      .then(data => setUbicationCountryField(data))
      .catch(error => console.error('Error fetching country field from ubication:', error));
  }

  const fetchDepartment = () => {
    fetch('http://localhost:3001/ubication-department')
      .then(response => response.json())
      .then(data => setUbicationDepartmentField(data))
      .catch(error => console.error('Error fetching country field from ubication:', error));
  }

  const fetchCity = () => {
    fetch('http://localhost:3001/ubication-city')
      .then(response => response.json())
      .then(data => setUbicationCityField(data))
      .catch(error => console.error('Error fetching country field from ubication:', error));
  }

  // Updated re-ender polygons for change color
  const fetchPolygons = async () => {
    try {
      const layers = mapRef.current.getStyle().layers;
    layers.forEach((layer) => {
      if (layer.id.startsWith('polygonDelimitedArea-')) {
        mapRef.current.removeLayer(layer.id);
        mapRef.current.removeSource(layer.id);
      }
    });

      let previousId = null;
      let coordinatesArray = [];
  
      // fetch polygon only carged data order by Id
      const response = await fetch('http://localhost:3001/polygon-data-order-by-id');
      const data = await response.json();
  
      // Draw the polygon
      data.forEach(polygonData => {
        if (previousId != null && previousId != polygonData.idpolygondelimitedarea) {
          mapRef.current.addLayer({
            id: `polygonDelimitedArea-${Math.random()}`,
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
              'fill-opacity': 0.2
            }
          });
          // Clear coordinates array
          coordinatesArray = [];
        }
  
        // Push new point coordinates
        coordinatesArray.push([polygonData.lng, polygonData.lat]);
  
        // Update previusId
        previousId = polygonData.idpolygondelimitedarea;
      });
  
      // Make last polygon after of the iteration
      if (coordinatesArray.length > 0) {
        mapRef.current.addLayer({
          id: `polygonDelimitedArea-${Math.random()}`,
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
            'fill-opacity': 0.2
          }
        });
      }
    } catch (error) {
      console.error('Error loading polygon:', error);
    }
  }

  // Add a new marker
  const handleAddMarker = async () => {
    if (!popupCoordinates) return;
  
    const { lng, lat } = popupCoordinates;
  
    try {
      const locationResponse = await fetch('http://localhost:3001/ubication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lng, lat,
          idCategory: idCategory,
          idPolygonDelimitedArea: idPolygonDelimitedArea,
          country: 'Country',
          department: 'Department',
          city: 'City',
          direction: 'Direction'
        }),
      });
  
      if (!locationResponse.ok) throw new Error('Failed to create location');
  
      const locationData = await locationResponse.json();
      const idUbication = locationData.idUbication;
  
      const markerResponse = await fetch('http://localhost:3001/markers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idUbication,
          markerTitle: title,
          markerDescription: description,
          markerCircleRadius: circleRadius,
          markerColor
        }),
      });
  
      if (!markerResponse.ok) throw new Error('Failed to create marker');
  
      const markerData = await markerResponse.json();
  
      new mapboxgl.Marker({ color: `${markerColor}` })
        .setLngLat(popupCoordinates)
        .addTo(mapRef.current);
  
      mapRef.current.addLayer({
        id: `circle-${lng}-${lat}`,
        type: 'circle',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            }
          }
        },
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12, 1,
            14, (circleRadius * 8),
            15, (circleRadius * 15),
            16, (circleRadius * 30),
            17, (circleRadius * 60),
            18, (circleRadius * 120),
            19, (circleRadius * 240),
            20, (circleRadius * 480),
            21, (circleRadius * 960),
            22, (circleRadius * 1920),
          ],
          'circle-color': markerColor,
          'circle-opacity': 0.5,
        }
      });
  
      setPopupAddMarker(false);
    } catch (error) {
      console.error('Error al agregar el marcador:', error);
    }
  };

  function filterData() {
    setPopupFilter(false);
    setChangeData(!changeData);
  }
  
  return (
    <div>
      <div className="font-monospace flex flex-row bg-slate-700 text-white px-2 py-2 absolute z-10 top-0 left-0 m-3 rounded">
        <div className="dropdown pl-2 pr-3 pt-[1.5px]">
          <i className="bi bi-list hover:cursor-pointer"></i>
          <div className="dropdown-content bg-slate-700 flex flex-col absolute w-48 z-10">
            <span className='bg-slate-700 text-white flex flex-row gap-3 px-3 py-2 hover:bg-slate-800 hover:cursor-pointer' onClick={() => (fetchPolygons())}><i className="bi bi-palette text-blue-500"></i>Atenuar Color</span>
            <span className='bg-slate-700 text-white flex flex-row gap-3 px-3 py-2 hover:bg-slate-800 hover:cursor-pointer' onClick={() => (setPopupFilter(true), fetchCategoryData(), fetchPolygonData())}><i className="bi bi-filter text-blue-500"></i>Filtrar Marcas</span>
            <span className='bg-slate-700 text-white flex flex-row gap-3 px-3 py-2 hover:bg-slate-800 hover:cursor-pointer' onClick={() => (setPopupFilterAntennas(true), fetchCategoryData(), fetchPolygonData())}><i className="bi bi-wifi text-blue-500"></i>Filtrar Antenas</span>
            <span className='bg-slate-700 text-white flex flex-row gap-3 px-3 py-2 hover:bg-slate-800 hover:cursor-pointer' onClick={() => (setShowMarkers(false), setShowAntennas(false), setChangeData(!changeData))}><i className="bi bi-filter text-red-500"></i>Quitar Filtros</span>
            <Link to='/'><span className='bg-slate-700 text-white flex flex-row gap-3 px-3 py-2 hover:bg-slate-800 hover:cursor-pointer' onClick={handleSignOut}><i className="bi bi-person text-red-500"></i>Cerrar Sesión</span></Link>
          </div>
        </div>
        <span>
          Longitud: {cursorLng !== null ? cursorLng.toFixed(4) : 'N/A'} | 
          Latitud: {cursorLat !== null ? cursorLat.toFixed(4) : 'N/A'} | 
          Zoom: {zoomLevel}
        </span>
      </div>
      <img className='absolute z-10 top-14 left-1/2 -translate-x-1/2' src={logo} width={200} alt='Not Found'></img>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100vh' }} />
    </div>
  );
};

export default MapComponent;
