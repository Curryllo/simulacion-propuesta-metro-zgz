"use client";

import { Circle, LayerGroup, MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import lineaAzulData from "../app/data/linea_azul.json";
import lineaRojaData from "../app/data/linea_roja.json";
import lineatran from "../app/data/LineaTranvia.json";
import paradasData from "../app/data/paradas.json";
import Train from "./Train";
import L from "leaflet";
import * as turf from "@turf/turf";

export default function Map() {
    const coordsAzul = lineaAzulData.features[0].geometry.coordinates;
    const coordsRoja = lineaRojaData.features[0].geometry.coordinates;

    
    const coordsParadas = paradasData.features.map((feature: any) => feature.geometry.coordinates);

    const renderTrains = (coords: number[][], color: string, numTrains: number) => {
        
        const line = turf.lineString(coords);
        const length = turf.length(line, { units: 'kilometers' });

        // Separamos los trenes equitativamente en kilómetros
        const spacing = length / numTrains;

        return Array.from({ length: numTrains }).map((_, index) => {
            const startDist = index * spacing;
            const initialDirection = index % 2 === 0 ? 1 : -1;

            return (
                <Train
                    key={`${color}-train-${index}`}
                    routeCoordinates={coords}
                    stationCoordinates={coordsParadas}
                    color={color}
                    startDistance={startDist}
                    initialDirection={initialDirection}
                />
            );
        });
    };

    return (
        <MapContainer center={[41.66, -0.89]} zoom={13} style={{ height: "550px", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <GeoJSON data={lineaAzulData as any} style={{ color: "blue", weight: 5, opacity: 0.8 }} />
            <GeoJSON data={lineaRojaData as any} style={{ color: "red", weight: 5, opacity: 0.8 }} />
            <GeoJSON data={lineatran as any} style={{ color: "green", weight: 5, opacity: 0.8 }} />

            
            <GeoJSON
                data={paradasData as any}
                pointToLayer={(feature, latlng) => {
                    return L.circleMarker(latlng, {
                        radius: 6,
                        fillColor: "white",
                        color: "#333",
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 1
                    });
                }}
            />

            {renderTrains(coordsAzul, "blue", 6)}
            {renderTrains(coordsRoja, "red", 2)}

            
            {coordsParadas.map((coord: number[], index: number) => {
                const center: [number, number] = [coord[1], coord[0]];

                return (
                    <LayerGroup key={`radios-${index}`}>
                        <Circle
                            center={center}
                            radius={800}
                            pathOptions={{
                                color: "#cb7223",
                                fillColor: "#cb7223",
                                fillOpacity: 0.1,
                                weight: 1,
                                dashArray: "5, 5"
                            }}
                        />
                        <Circle
                            center={center}
                            radius={400}
                            pathOptions={{
                                color: "#cb7223",
                                fillColor: "#cb7223",
                                fillOpacity: 0.15,
                                weight: 1.5
                            }}
                        />
                    </LayerGroup>
                );
            })}
        </MapContainer>
    );
}