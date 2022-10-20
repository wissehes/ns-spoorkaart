// export default getD
export interface Coordinate {
  lat: number;
  lon: number;
}

type Point = {
  x: number;
  y: number;
  z: number;
  radius: number;
};

type Coordinates = {
  location1: Coordinate;
  location2: Coordinate;
};

const getDistanceFromGPS = (coordinates: Coordinates) => {
  const pointA = LocationToPoint(coordinates.location1);
  const pointB = LocationToPoint(coordinates.location2);

  return Math.round(Distance(pointA, pointB));
};

// Source: https://github.com/cosinekitty/geocalc/blob/master/compass.html

function Distance(ap: Point, bp: Point) {
  var dx = ap.x - bp.x;
  var dy = ap.y - bp.y;
  var dz = ap.z - bp.z;

  return Math.sqrt(dx * dx + dy * dy + dz * dz) * 0.001;
}

function LocationToPoint(c: Coordinate): Point {
  // Convert (lat, lon, elv) to (x, y, z).
  var lat = (c.lat * Math.PI) / 180.0;
  var lon = (c.lon * Math.PI) / 180.0;
  var radius = EarthRadiusInMeters(lat);
  var clat = GeocentricLatitude(lat);

  var cosLon = Math.cos(lon);
  var sinLon = Math.sin(lon);
  var cosLat = Math.cos(clat);
  var sinLat = Math.sin(clat);
  var x = radius * cosLon * cosLat;
  var y = radius * sinLon * cosLat;
  var z = radius * sinLat;

  // We used geocentric latitude to calculate (x,y,z) on the Earth's ellipsoid.
  // Now we use geodetic latitude to calculate normal vector from the surface, to correct for elevation.
  // var cosGlat = Math.cos(lat);
  // var sinGlat = Math.sin(lat);

  // var nx = cosGlat * cosLon;
  // var ny = cosGlat * sinLon;
  // var nz = sinGlat;

  // x += c.elv * nx;
  // y += c.elv * ny;
  // z += c.elv * nz;

  return { x: x, y: y, z: z, radius: radius /*, nx:nx, ny:ny, nz:nz*/ };
}

function GeocentricLatitude(lat: number) {
  // Convert geodetic latitude 'lat' to a geocentric latitude 'clat'.
  // Geodetic latitude is the latitude as given by GPS.
  // Geocentric latitude is the angle measured from center of Earth between a point and the equator.
  // https://en.wikipedia.org/wiki/Latitude#Geocentric_latitude
  var e2 = 0.00669437999014;
  var clat = Math.atan((1.0 - e2) * Math.tan(lat));
  return clat;
}

function EarthRadiusInMeters(latitudeRadians: number) {
  // latitudeRadians is geodetic, i.e. that reported by GPS.
  // http://en.wikipedia.org/wiki/Earth_radius
  // source: https://javascript.plainenglish.io/calculating-azimuth-distance-and-altitude-from-a-pair-of-gps-locations-36b4325d8ab0

  var a = 6378137.0; // equatorial radius in meters
  var b = 6356752.3; // polar radius in meters
  var cos = Math.cos(latitudeRadians);
  var sin = Math.sin(latitudeRadians);
  var t1 = a * a * cos;
  var t2 = b * b * sin;
  var t3 = a * cos;
  var t4 = b * sin;
  return Math.sqrt((t1 * t1 + t2 * t2) / (t3 * t3 + t4 * t4));
}

export default getDistanceFromGPS;
