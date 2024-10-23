const BACKEND_URL =
  import.meta.env.VITE_APP_PROD_ENV === "production"
    ? import.meta.env.VITE_APP_BACKEND_PROD
    : import.meta.env.VITE_APP_BACKEND_DEV;

export const url = BACKEND_URL;
console.log("Backend URL:", url);
