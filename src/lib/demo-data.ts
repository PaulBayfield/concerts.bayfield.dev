import type { Venue } from "@/app/api/venues/route"
import type { Concert } from "@/app/api/concerts/route"

export const demoVenues: Venue[] = [
  { id: -1, name: "Stade de France", address: null, city: "Saint-Denis", state: null, country: "France", latitude: 48.9244, longitude: 2.3601, concertCount: 2 },
  { id: -2, name: "Accor Arena", address: null, city: "Paris", state: null, country: "France", latitude: 48.8389, longitude: 2.3786, concertCount: 1 },
  { id: -3, name: "The O2 Arena", address: null, city: "London", state: null, country: "United Kingdom", latitude: 51.5030, longitude: 0.0032, concertCount: 1 },
  { id: -4, name: "Madison Square Garden", address: null, city: "New York", state: "NY", country: "United States", latitude: 40.7505, longitude: -73.9934, concertCount: 1 },
  { id: -5, name: "Sydney Opera House", address: null, city: "Sydney", state: null, country: "Australia", latitude: -33.8568, longitude: 151.2153, concertCount: 1 },
]

export const demoConcerts: Concert[] = [
  { id: -1, date: "2025-06-14", artist_id: -1, artist_name: "Neon Skyline", venue_id: -1, venue_name: "Stade de France", venue_city: "Saint-Denis", venue_country: "France" },
  { id: -2, date: "2024-09-02", artist_id: -2, artist_name: "The Wanderers", venue_id: -1, venue_name: "Stade de France", venue_city: "Saint-Denis", venue_country: "France" },
  { id: -3, date: "2024-11-20", artist_id: -3, artist_name: "Echo Valley", venue_id: -2, venue_name: "Accor Arena", venue_city: "Paris", venue_country: "France" },
  { id: -4, date: "2023-05-08", artist_id: -4, artist_name: "Crimson Tide Collective", venue_id: -3, venue_name: "The O2 Arena", venue_city: "London", venue_country: "United Kingdom" },
  { id: -5, date: "2023-10-31", artist_id: -5, artist_name: "Nova Wave", venue_id: -4, venue_name: "Madison Square Garden", venue_city: "New York", venue_country: "United States" },
  { id: -6, date: "2022-03-17", artist_id: -6, artist_name: "Paper Moon", venue_id: -5, venue_name: "Sydney Opera House", venue_city: "Sydney", venue_country: "Australia" },
]
