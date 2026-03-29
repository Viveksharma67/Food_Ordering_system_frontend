// src/utils/getImageUrl.js
export const getImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path   // placehold.co jese external URLs
  return path                                 // /uploads/... — Vite proxy handle karega
}