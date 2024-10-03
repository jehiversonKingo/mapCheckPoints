-- Make ENUM for view state of rows in the data base
CREATE TYPE stateRow AS ENUM ('active', 'inactive');

-- CREATE TABLE polygonDelimitedArea
CREATE TABLE polygonDelimitedArea (
    idPolygonDelimitedArea SERIAL PRIMARY KEY,
    areaName VARCHAR,
    createAt TIMESTAMP,
    updateAt TIMESTAMP,
    state stateRow
);

-- CREATE TABLE category
CREATE TABLE category (
    idCategory SERIAL PRIMARY KEY,
    category VARCHAR,
    createAt TIMESTAMP,
    updateAt TIMESTAMP,
    state stateRow
);

-- CREATE TABLE polygonCoordinates
CREATE TABLE polygonCoordinates (
    idPolygonCoordinates SERIAL PRIMARY KEY,
    idPolygonDelimitedArea INTEGER REFERENCES polygonDelimitedArea(idPolygonDelimitedArea),
    lng DOUBLE PRECISION,
    lat DOUBLE PRECISION,
    createAt TIMESTAMP,
    updateAt TIMESTAMP,
    state stateRow
);

-- CREATE TABLE ubication
CREATE TABLE ubication (
    idUbication SERIAL PRIMARY KEY,
    idCategory INTEGER REFERENCES category(idCategory),
    idPolygonDelimitedArea INTEGER REFERENCES polygonDelimitedArea(idPolygonDelimitedArea),
    lng DOUBLE PRECISION,
    lat DOUBLE PRECISION,
    country VARCHAR,
    department VARCHAR,
    city VARCHAR,
    direction VARCHAR,
    createAt TIMESTAMP,
    updateAt TIMESTAMP,
    state stateRow,
    UNIQUE (lng, lat)
);

-- CREATE TABLE marker
CREATE TABLE marker (
    idMarker SERIAL PRIMARY KEY,
    idUbication INTEGER REFERENCES ubication(idUbication) UNIQUE,
    markerTitle VARCHAR,
    markerDescription VARCHAR,
    markerCircleRadius INTEGER,
    markerColor VARCHAR,
    createAt TIMESTAMP,
    updateAt TIMESTAMP,
    state stateRow
);

-- CREATE TABLE roll
CREATE TABLE roll (
    idRoll SERIAL PRIMARY KEY,
    rollName VARCHAR,
    createAt TIMESTAMP,
    updateAt TIMESTAMP,
    state stateRow
);

-- CREATE TABLE users
CREATE TABLE users (
    idUser SERIAL PRIMARY KEY,
    idRoll INTEGER REFERENCES roll(idRoll),
    userName VARCHAR,
    userPassword VARCHAR,
    createAt TIMESTAMP,
    updateAt TIMESTAMP,
    state stateRow
);

-- CREATE TABLE cellTowers
CREATE TABLE cellTowers (
    idCellTower SERIAL PRIMARY KEY,
    idUbication INT REFERENCES ubication(idUbication) UNIQUE,
    networkType VARCHAR,
    mobileCountryCode INT,
    mobileNetworkCode INT,
    samples INT,
    area VARCHAR,
    cell VARCHAR,
    kmRange INT,
    createAt TIMESTAMP,
    updateAt TIMESTAMP,
    state stateRow
);
