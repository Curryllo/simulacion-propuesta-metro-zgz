import { useEffect, useState, useRef, useMemo } from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";
import * as turf from "@turf/turf";

const createTrainIcon = (color: string) => L.divIcon({
    className: "custom-train-icon",
    html: `
    <div style="background-color: ${color}; width: 30px; height: 30px; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200">
  <!-- Círculo rojo de fondo -->
  <circle cx="50" cy="50" r="48" fill=${color} />
  
  <!-- Cuerpo del tren (estilo moderno/tranvía) -->
  <path d="M 20 40 Q 20 30 30 30 L 70 30 Q 80 30 82 40 L 85 56 Q 85 62 78 62 L 20 62 Z" fill="#ffffff" />
  
  <!-- Ventanas -->
  <rect x="25" y="35" width="14" height="12" rx="2" fill=${color} />
  <rect x="43" y="35" width="14" height="12" rx="2" fill=${color} />
  <rect x="61" y="35" width="18" height="12" rx="2" fill=${color} />
  
  <!-- Faros -->
  <circle cx="81" cy="55" r="2" fill="#FFC107" />
  
  <!-- Ruedas -->
  <circle cx="32" cy="64" r="5" fill="#ffffff" />
  <circle cx="50" cy="64" r="5" fill="#ffffff" />
  <circle cx="68" cy="64" r="5" fill="#ffffff" />
  
  <!-- Vía -->
  <rect x="12" y="73" width="76" height="3" rx="1.5" fill="#ffffff" />
</svg>

    </div>
  `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
});

export default function Train({ routeCoordinates, stationCoordinates, color, startDistance = 0, initialDirection = 1 }: any) {
    const [currentDistance, setCurrentDistance] = useState(startDistance);
    const direction = useRef(initialDirection);
    const isPaused = useRef(false);

    const line = useMemo(() => turf.lineString(routeCoordinates), [routeCoordinates]);
    const totalLength = useMemo(() => turf.length(line, { units: 'kilometers' }), [line]);

    const stationDistances = useMemo(() => {
        return stationCoordinates.map((st: number[]) => {
            const pt = turf.point(st);
            const snapped = turf.nearestPointOnLine(line, pt, { units: 'kilometers' });
            return snapped.properties.location;
        }).filter((dist: number | undefined) => dist !== undefined);
    }, [line, stationCoordinates]);

    useEffect(() => {
        const step = 0.02; // El tren avanza 20 metros (0.02 km) por cada ciclo

        const interval = setInterval(() => {
            if (isPaused.current) return;

            setCurrentDistance((prev: number) => {
                let next = prev + (step * direction.current);

                // Rebotar en los extremos
                if (next >= totalLength) {
                    next = totalLength;
                    direction.current = -1;
                } else if (next <= 0) {
                    next = 0;
                    direction.current = 1;
                }

                // Comprobar si al avanzar acabamos de cruzar el punto kilométrico de una estación
                const crossedStation = stationDistances.some((stDist: number) => {
                    const movingForward = direction.current === 1 && prev < stDist && next >= stDist;
                    const movingBackward = direction.current === -1 && prev > stDist && next <= stDist;
                    return movingForward || movingBackward;
                });

                if (crossedStation) {
                    isPaused.current = true;
                    setTimeout(() => { isPaused.current = false; }, 2000); // Parada de 5 segundos
                }

                return next;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [totalLength, stationDistances]);

    // Obtener las coordenadas reales en base a la distancia actual en la línea
    const currentPt = turf.along(line, currentDistance, { units: 'kilometers' });
    const [lng, lat] = currentPt.geometry.coordinates;

    return <Marker position={[lat, lng]} icon={createTrainIcon(color)} />;
}