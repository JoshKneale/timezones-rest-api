export interface Timezone {
  name: string;
  cityName: string;
  localTime: string;
  timeDifferenceToGMT: string;
}

export interface cityTimezonesObj {
  city: string;
  city_ascii: string;
  lat: number;
  lng: number;
  pop: number;
  country: string;
  iso2: string;
  iso3: string;
  province: string;
  timezone: string;
}
