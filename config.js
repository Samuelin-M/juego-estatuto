/* ==========================================================================
   CONFIGURACIÓN DEL MODO EN VIVO

   Para que los celulares se conecten con la pantalla del presentador hace
   falta un servidor en tiempo real. Usamos Supabase Realtime (solo canales
   de "broadcast": no se crean tablas ni se guardan datos).

   Cómo llenarlo:
     1. En supabase.com abre el proyecto → Project Settings → API.
     2. Copia la "Project URL" en supabaseUrl.
     3. Copia la clave pública "anon" / "publishable" en supabaseClave.
        (Es una clave pública por diseño; NUNCA pongas aquí la "service_role".)

   Mientras esté vacío, el modo en vivo funciona en "modo prueba": el
   presentador y los jugadores tienen que ser pestañas del mismo navegador.
   ========================================================================== */

const CONFIG_EN_VIVO = {
  supabaseUrl: "https://fugtqyoubsborrzhqeos.supabase.co",
  supabaseClave: "sb_publishable_nJ4FSGWvUvv0bnoI9x1Q-w_9ofiGZg4"
};
