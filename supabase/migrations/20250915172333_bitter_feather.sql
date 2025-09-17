/*
  # Create find_nearby_places RPC function
  
  This function enables PostGIS-based distance queries for the places table
*/

CREATE OR REPLACE FUNCTION find_nearby_places(
  search_lat double precision,
  search_lng double precision,
  search_radius_km double precision DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  name text,
  kind text,
  rating numeric,
  distance_km double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.kind,
    p.rating,
    (ST_Distance(p.geom, ST_Point(search_lng, search_lat)::geography) / 1000.0) as distance_km
  FROM places p
  WHERE ST_DWithin(
    p.geom, 
    ST_Point(search_lng, search_lat)::geography, 
    search_radius_km * 1000
  )
  ORDER BY ST_Distance(p.geom, ST_Point(search_lng, search_lat)::geography)
  LIMIT 20;
END;
$$;