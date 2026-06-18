# Gym Registro

Aplicación web responsive para registrar entrenamientos de gimnasio con portal de usuario, Firebase Auth, Firestore y deploy pensado para Vercel.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Firebase Authentication + Cloud Firestore
- React Hook Form + Zod
- Recharts
- Vitest + Playwright

## Configuración

1. Crear un proyecto Firebase.
2. Activar Authentication con email/password.
3. Crear Cloud Firestore.
4. Copiar `.env.example` a `.env.local` y completar:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

5. Publicar reglas:

```bash
firebase deploy --only firestore:rules
```

## Desarrollo

```bash
npm run dev
npm run lint
npm run test
npm run build
npm run e2e
```

## Deploy en Vercel

- Importar el repo desde Vercel.
- Agregar las variables `NEXT_PUBLIC_FIREBASE_*`.
- Deploy automático con `npm run build`.

## Funciones incluidas

- Login, registro y recuperación de contraseña.
- Onboarding de perfil.
- Dashboard con volumen, racha, progreso semanal y mejores marcas.
- Registro de sesiones con sets, reps, peso, RPE, descanso y timer.
- Historial con búsqueda, edición y borrado.
- Biblioteca de ejercicios propios.
- Rutinas base y rutinas personalizadas.
- Exportación/importación JSON.
