```markdown
Este documento contiene los datos técnicos extraídos de la documentación oficial de Unsplash para las funcionalidades de búsqueda de su API `https://unsplash.com/documentation`.

## 1. Visión General del Motor de Búsqueda

- **Capacidad:** Es considerado uno de los motores de búsqueda de imágenes más potentes del mundo.
- **Tecnología:** Impulsado por decenas de millones de etiquetas generadas por la comunidad y reconocimiento avanzado de imágenes.
- **Soporte Multi-idioma (Beta):** Actualmente se prueba el soporte para idiomas no ingleses (como el español) mediante el parámetro `lang`. Para acceder a esta beta, se requiere contactar por correo electrónico con el ID de la aplicación.

## 2. Configuración Base

- **Host de la API:** `https://api.unsplash.com/`.
- **Versión:** Se recomienda usar el encabezado `Accept-Version: v1`.
- **Autenticación Pública:** La búsqueda es una acción pública. Se debe pasar la Access Key en el encabezado `Authorization: Client-ID YOUR_ACCESS_KEY` o como parámetro de consulta `client_id`.

## 3. Endpoints de Búsqueda

### A. Buscar Fotos (`GET /search/photos`)

Obtiene una página de resultados de fotos para una consulta específica.

| Parámetro        | Descripción          | Valores Válidos / Notas                                                                                       |
| :--------------- | :------------------- | :------------------------------------------------------------------------------------------------------------ |
| `query`          | Términos de búsqueda | **Requerido**.                                                                                                |
| `page`           | Número de página     | Opcional (Default: 1).                                                                                        |
| `per_page`       | Ítems por página     | Opcional (Default: 10, Máx: 30).                                                                              |
| `order_by`       | Orden de resultados  | `relevant` (default), `latest`.                                                                               |
| `collections`    | IDs de colecciones   | Para limitar la búsqueda a colecciones específicas.                                                           |
| `content_filter` | Filtro de seguridad  | `low` (default), `high`.                                                                                      |
| `color`          | Filtro por color     | `black_and_white`, `black`, `white`, `yellow`, `orange`, `red`, `purple`, `magenta`, `green`, `teal`, `blue`. |
| `orientation`    | Orientación          | `landscape`, `portrait`, `squarish`.                                                                          |
| `lang` (Beta)    | Idioma de consulta   | Código ISO 639-1 (ej. `es`, `fr`).                                                                            |

**Nota Importante:** Los objetos de foto devueltos son **abreviados** (summary objects). Para obtener detalles completos (como datos EXIF), se debe usar `GET /photos/:id`.

### B. Buscar Colecciones (`GET /search/collections`)

Obtiene una página de resultados de colecciones para una consulta.

| Parámetro  | Descripción                     |
| :--------- | :------------------------------ |
| `query`    | Términos de búsqueda.           |
| `page`     | Número de página (Default: 1).  |
| `per_page` | Ítems por página (Default: 10). |

### C. Buscar Usuarios (`GET /search/users`)

Obtiene una página de resultados de usuarios para una consulta.

| Parámetro  | Descripción                     |
| :--------- | :------------------------------ |
| `query`    | Términos de búsqueda.           |
| `page`     | Número de página (Default: 1).  |
| `per_page` | Ítems por página (Default: 10). |

## 4. Consideraciones Técnicas Transversales

- **Paginación:** La información de paginación (total de elementos y enlaces a páginas siguiente/anterior) se devuelve en los encabezados de respuesta `X-Total` y `Link`.
- **Hotlinking:** Es **obligatorio** usar las URLs de imagen devueltas por la API directamente (hotlinking) para permitir el rastreo de vistas por parte de Unsplash.
- **Rate Limiting:** Las aplicaciones en modo Demo están limitadas a 50 solicitudes por hora. En Producción, el límite aumenta a 5,000 solicitudes por hora.
- **Seguridad de Contenido:** Por defecto (`low`), no se devuelve contenido que viole las guías de sumisión (como desnudez o violencia).
```
