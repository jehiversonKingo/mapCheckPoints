import fs from 'fs';
import XLSX from 'xlsx';
import pg from 'pg';

const { Client } = pg; // Extraer Client de pg

// Configuración de la base de datos
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'kingoMaps',
    password: '123456',
    port: 5432,
});

// Conectar a la base de datos
client.connect();

// Leer el archivo XLSX
const filePath = '../data_markers/shopkeepers.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0]; // Asumiendo que estamos leyendo la primera hoja
const worksheet = workbook.Sheets[sheetName];

// Convertir a JSON
const data = XLSX.utils.sheet_to_json(worksheet);

async function insertData() {
    for (const row of data) {
        const insertQuery = `
            WITH newUbication AS (
                INSERT INTO ubication (idCategory, idPolygonDelimitedArea, lng, lat, country, department, city, direction, createAt, updateAt, state)
                VALUES (1, 1, $1, $2, 'Guatemala', $3, 'Ciudad', 'Dirección', NOW(), NOW(), 'active')
                ON CONFLICT (lng, lat)
                DO UPDATE SET
                idCategory = EXCLUDED.idCategory,
                idPolygonDelimitedArea = EXCLUDED.idPolygonDelimitedArea,
                country = EXCLUDED.country,
                department = EXCLUDED.department,
                city = EXCLUDED.city,
                direction = EXCLUDED.direction,
                updateAt = NOW(),
                state = EXCLUDED.state
                RETURNING idUbication
            )

            INSERT INTO marker (idUbication, markerTitle, markerDescription, markerCircleRadius, markerColor, createAt, updateAt, state)
            VALUES ((SELECT idUbication FROM newUbication), $4, 'Tendero', 0, '#111', NOW(), NOW(), 'active')
            ON CONFLICT (idUbication) 
            DO UPDATE SET 
                markerTitle = EXCLUDED.markerTitle,
                markerDescription = EXCLUDED.markerDescription,
                markerCircleRadius = EXCLUDED.markerCircleRadius,
                markerColor = EXCLUDED.markerColor,
                updateAt = NOW(),
                state = EXCLUDED.state;
        `;

        const values = [
            row.lng,
            row.lat,
            row.department,
            row.markerTitle
        ];

        try {
            await client.query(insertQuery, values);
        } catch (error) {
            console.error('Error al insertar/actualizar:', error);
        }
    }
}

// Ejecutar la inserción de datos
insertData()
    .then(() => {
        console.log('Datos insertados/actualizados exitosamente.');
        client.end();
    })
    .catch(err => {
        console.error('Error en la inserción:', err);
        client.end();
    });
