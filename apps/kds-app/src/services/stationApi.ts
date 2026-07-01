import api from './api';
import type { IStation } from '../types/kds.types';

type StationsResponseShape =
  | { stations?: IStation[] }
  | { data?: IStation[] }
  | IStation[];

export const getStations = async (restaurantId: string): Promise<IStation[]> => {
  const res = await api.get<StationsResponseShape>(
    `/stations?restaurantId=${restaurantId}`
  );

  const payload = res.data;

  console.log('STATIONS API RAW RESPONSE:', payload);

  let stations: IStation[] = [];

  if (Array.isArray(payload)) {
    stations = payload;
  } else if ('stations' in payload && Array.isArray(payload.stations)) {
    stations = payload.stations;
  } else if ('data' in payload && Array.isArray(payload.data)) {
    stations = payload.data;
  }

  console.log('STATIONS BEFORE FILTER:', stations);

  const activeStations = stations.filter((station: IStation) => {
    const extendedStation = station as IStation & { active?: boolean };
    return (
      station.isActive === true ||
      extendedStation.active === true ||
      typeof station.isActive === 'undefined'
    );
  });

  console.log('STATIONS AFTER FILTER:', activeStations);

  return activeStations;
};