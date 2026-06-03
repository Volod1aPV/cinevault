import { z } from 'zod';

export const movieSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, { message: 'Název filmu musí mít alespoň 2 znaky' })
    .max(100, { message: 'Název filmu může mít maximálně 100 znaků' }),
  director: z
    .string()
    .trim()
    .min(2, { message: 'Jméno režiséra musí mít alespoň 2 znaky' })
    .max(100, { message: 'Jméno režiséra může mít maximálně 100 znaků' }),
  year: z
    .coerce // Coerces string inputs from HTML forms to number
    .number({ invalid_type_error: 'Rok musí být číslo' })
    .int({ message: 'Rok musí být celé číslo' })
    .min(1888, { message: 'Rok musí být od roku 1888 (zrození kinematografie)' })
    .max(new Date().getFullYear() + 5, { message: 'Rok nemůže být příliš v budoucnu' }),
  genre: z
    .string()
    .trim()
    .min(1, { message: 'Vyberte prosím žánr' }),
  rating: z
    .coerce
    .number({ invalid_type_error: 'Hodnocení musí být číslo' })
    .min(0, { message: 'Hodnocení musí být alespoň 0' })
    .max(10, { message: 'Hodnocení může být maximálně 10' }),
  description: z
    .string()
    .trim()
    .max(1000, { message: 'Popis může mít maximálně 1000 znaků' })
    .optional()
    .or(z.literal('')),
  poster_url: z
    .string()
    .trim()
    .url({ message: 'Neplatný formát URL pro plakát' })
    .optional()
    .or(z.literal(''))
});

// Seznam podporovaných žánrů v aplikaci CineVault
export const GENRES = [
  'Sci-Fi',
  'Action',
  'Drama',
  'Comedy',
  'Thriller',
  'Horror',
  'Romance',
  'Adventure',
  'Fantasy',
  'Mystery',
  'Crime',
  'Animation'
];
