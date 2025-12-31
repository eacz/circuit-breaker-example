# Circuit Breaker en NestJS – Ejemplos prácticos

Este proyecto demuestra el uso del **patrón Circuit Breaker en NestJS** aplicado a **dos escenarios reales**:

1. Servicio externo inestable (simulado)
2. Base de datos PostgreSQL real usando Docker

El objetivo es observar claramente el ciclo del circuito:

CLOSED → OPEN → HALF-OPEN → CLOSED

---

## ¿Qué es el Circuit Breaker?

El Circuit Breaker evita que una aplicación siga intentando acceder a un recurso que está fallando (API externa, base de datos, microservicio), previniendo:

- Timeouts acumulados
- Saturación de recursos
- Fallos en cascada

### Estados del circuito

- **CLOSED**: las llamadas pasan normalmente
- **OPEN**: las llamadas se bloquean inmediatamente
- **HALF-OPEN**: se permite una llamada de prueba

---

## Caso 1: Servicio externo inestable (simulado)

### Descripción

Se simula un servicio externo que falla de manera aleatoria.
El acceso a este servicio está protegido por un Circuit Breaker usando la librería **opossum**.

### Endpoint

GET /demo

---

### Cómo probar

1. Levantar la aplicación:

```bash
npm run start:dev
```

2. Disparar múltiples requests seguidas:

#### Linux / macOS

```bash
for i in {1..50}; do
  curl -s http://localhost:3000/demo
  echo
done
```

#### Windows (PowerShell)

```powershell
1..50 | ForEach-Object {
  Invoke-RestMethod http://localhost:3000/demo
}
```

---

### Qué observar

En la consola del servidor:

```
🟢 Circuit CLOSED
🔴 Circuit OPEN
🟡 Circuit HALF-OPEN
🟢 Circuit CLOSED
```

Cuando el circuito está **OPEN**:
- Las respuestas fallan inmediatamente
- No se ejecuta el servicio externo
- La app no se bloquea

---

## Caso 2: Circuit Breaker con PostgreSQL real (Docker)

Este ejemplo utiliza una base de datos PostgreSQL real levantada con Docker.
La base se baja y se vuelve a levantar para forzar fallos reales.

---

### Levantar PostgreSQL
Levantar la base:

```bash
docker compose up -d
```

---

### Endpoint

GET /items

---

## Cómo probar el Circuit Breaker con la base de datos

### 1. Con la DB levantada

```bash
curl http://localhost:3000/items
```

Logs esperados:

```
🟢 DB Circuit CLOSED
```

---

### 2. Bajar la DB

```bash
docker stop cb_postgres
```

Disparar requests:

```bash
for i in {1..20}; do
  curl -s http://localhost:3000/items
  echo
done
```

Logs:

```
🔴 DB Circuit OPEN
```

Las respuestas son inmediatas y devuelven el fallback.

---

### 3. Volver a levantar la DB

```bash
docker start cb_postgres
```

Esperar el resetTimeout y ejecutar:

```bash
curl http://localhost:3000/items
```

Logs:

```
🟡 DB Circuit HALF-OPEN
🟢 DB Circuit CLOSED
```

---

## Qué demuestra este proyecto

- El Circuit Breaker protege la aplicación
- Evita saturación cuando una API o DB cae
- Permite recuperación automática
- No requiere reiniciar la app

---

## Librerías utilizadas

- NestJS
- TypeORM
- PostgreSQL
- opossum

---