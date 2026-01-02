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

# Circuit Breaker + Retry + Persistencia (Diseño Final)

Este documento explica el **diseño final correcto** del ejemplo de Circuit Breaker aplicado a pagos,
incluyendo persistencia en base de datos y reprocesamiento automático.

---

## Problema inicial

Cuando el servicio externo de pagos se caía:

- Los requests fallaban correctamente
- El Circuit Breaker abría
- Los pagos quedaban en estado `PENDING`

Pero al **volver a levantar el servicio**, los pagos **no se procesaban solos**.

---

## Por qué NO se procesaban automáticamente

El sistema original dependía de un `EventEmitter`:

- El evento `payment.deferred` se emitía **solo en el momento del fallo**
- Cuando el servicio externo volvía:
  - No se emitía ningún evento nuevo
  - Nadie reintentaba los pagos pendientes

Conclusión:  
👉 **el sistema no sabía que el servicio había vuelto**

---

## Principio clave de arquitectura

> **Circuit Breaker ≠ Reintentos**

- Circuit Breaker:
  - Protege el sistema
  - Evita fallos en cascada
- Reintentos:
  - Son asincrónicos
  - Deben ser independientes del request original
  - Normalmente usan jobs, colas o workers

---

## Diseño final correcto

El diseño se apoya en un principio fundamental:

> **La base de datos es la fuente de verdad**

### Estados del pago

| Estado   | Significado |
|--------|-------------|
| PENDING | Pago creado pero no confirmado |
| PAID   | Pago confirmado correctamente |

---

## Flujo completo

```
Request
  ↓
Crear Payment (PENDING)
  ↓
Intentar cobrar (Circuit Breaker)
  ↓
Si falla → queda PENDING
  ↓
Job periódico reintenta
  ↓
Pago pasa a PAID
```

---

## Rol real del Circuit Breaker

El Circuit Breaker **solo** se usa para:

- Proteger el servicio de pagos
- Cortar intentos cuando el servicio externo está caído
- Evitar timeouts y sobrecarga

No:
- Maneja reintentos
- Garantiza ejecución
- Recupera estados

---

## Reprocesamiento automático (Retry)

Se implementa un **job programado** que:

- Corre cada X segundos
- Busca pagos con estado `PENDING`
- Intenta cobrarlos nuevamente
- Actualiza el estado a `PAID` si tiene éxito

Esto permite:

- Recuperación automática
- Consistencia eventual
- Observabilidad en tiempo real desde la DB

Este "job" no es un mas que una configuracion de schedule con @nest/schedule, usado como simil de un orquestador de pub/sub para poder replicar este funcionamiento basico de forma simple y en local. 

---

## Conclusión

Este diseño final logra:

- Circuit Breaker real
- Persistencia consistente
- Reintentos automáticos
- Sin duplicados
- Sin dependencia de eventos efímeros
- Comportamiento observable desde la base de datos

No es un demo:  
👉 **es un patrón de backend real usado en producción**.

## Librerías utilizadas

- NestJS
- TypeORM
- PostgreSQL
- opossum

---