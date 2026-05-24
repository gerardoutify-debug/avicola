# Spec: Guardado Automático de Lotes con Métricas en Google Sheets

Este documento define la implementación para que todos los campos de entrada y los resultados calculados de la gestión de lotes se guarden automáticamente en una hoja específica de Google Sheets, proporcionando visibilidad completa de los datos.

## Objetivo
*   Migrar el almacenamiento de lotes a la hoja "Base de Datos Lotes".
*   Incluir no solo los datos de entrada, sino también todos los cálculos matemáticos realizados por la calculadora.
*   Mantener la funcionalidad de la calculadora intacta y transparente para el usuario.
*   Asegurar que el buscador y la lista de lotes sigan funcionando correctamente con el nuevo origen de datos.

## Arquitectura de Datos

Se pasarán de 18 columnas a 33 columnas en total para cubrir toda la "visibilidad" solicitada.

### Campos de Entrada (17)
1.  `fechaIngreso`
2.  `nroFactura`
3.  `placaCamion`
4.  `precioKg`
5.  `totalJabas`
6.  `fleteTotal`
7.  `pollosMuertos`
8.  `porcentajeHembra`
9.  `pesoMinHembra`
10. `pesoMaxHembra`
11. `pollosxJabaHembra`
12. `porcentajeMacho`
13. `pesoMinMacho`
14. `pesoMaxMacho`
15. `pollosxJabaMacho`
16. `proveedor`
17. `origen`

### Campos Calculados / Métricas (16)
18. `codigoLote`
19. `promPesoHembra`
20. `promPesoMacho`
21. `promPesoPolloPonderado`
22. `promPolloJabaPonderado`
23. `cantidadPollosEstimada`
24. `kilosTotalesEstimados`
25. `montoPagarProveedor`
26. `mermaKilos`
27. `mermaValorizada`
28. `valorizadoPollosMuertos`
29. `valorizadoPollos`
30. `costoTotalPolloVivoAQP`
31. `cantidadPollosVendibles`
32. `costoPolloPorUnidad`
33. `precioKgPuestoAQP`

---

## Cambios Técnicos

### 1. Frontend: `src/services/googleSheets.ts`
*   Modificar `syncLote(lote: Lote)`:
    *   Importar `calcularMétricasLote`.
    *   Ejecutar el cálculo antes de enviar la petición POST.
    *   Enviar un objeto combinado `{ lote, metrics }` a la API.

### 2. API Backend: `api/lotes.ts`
*   **POST Handler:**
    *   Cambiar el nombre de la hoja de `Registro_Lotes` a `Base de Datos Lotes`.
    *   Actualizar la lista de `headers` para incluir las 33 columnas.
    *   Extraer los datos del nuevo cuerpo del mensaje (lote + metrics).
    *   Mapear todos los valores al array `rowValues` en el orden correcto.
*   **GET Handler:**
    *   Cambiar la lectura a la hoja `Base de Datos Lotes`.
    *   Asegurar que el mapeo de retorno (`rows.map`) coincida con las nuevas posiciones de las columnas para no romper la interfaz de "Lotes Guardados".

### 3. Sincronización
*   El sistema intentará crear automáticamente la hoja "Base de Datos Lotes" si no existe la primera vez que se guarde un lote.

---

## Verificación
1.  **Guardado:** Crear un lote nuevo y verificar que aparezca en la hoja de Google Sheets con las 33 columnas llenas.
2.  **Carga:** Verificar que los lotes existentes se sigan listando en la aplicación.
3.  **Integridad:** Confirmar que los cálculos mostrados en la UI coinciden con los guardados en el Excel.

## Entrega
*   Commit de los cambios.
*   Push a la rama principal (GitHub).
