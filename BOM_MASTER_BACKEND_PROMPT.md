# BOM Master - Complete Backend Implementation

## Technologies
- Node.js + Express.js
- PostgreSQL (pg library with Pool)
- JWT Authentication (Bearer token, middleware already exists)
- Port: 5000, Prefix: /api

---

## DATABASE SCHEMA

```sql
CREATE TABLE IF NOT EXISTS bom_master (
    bom_id SERIAL PRIMARY KEY,

    material_code VARCHAR(50) NOT NULL,
    material_desc TEXT,

    component_material_code VARCHAR(50) NOT NULL
        REFERENCES material_master(material_code),

    component_material_desc TEXT,

    consume_qty_per_km DECIMAL(10,3) NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(material_code, component_material_code)
);
```

---

## PREREQUISITE

The `material_master` table must already exist with at least these columns:
- `material_code` (VARCHAR, PRIMARY KEY)
- `material_description` (TEXT)
- `material_category` (VARCHAR) — values include `'SEMI_FINISHED'`, `'CONSUMABLE'`, etc.
- `is_active` (BOOLEAN)

---

## API ENDPOINTS

### Base Path: `/api/admin/bom`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/bom` | Get all BOMs grouped by product material code |
| GET | `/api/admin/bom/:materialCode` | Get BOM details (all components) for a product |
| POST | `/api/admin/bom` | Create a new BOM (product + all components) |
| PUT | `/api/admin/bom/:materialCode` | Update BOM (replace all components for product) |
| PATCH | `/api/admin/bom/:materialCode/status` | Toggle BOM active/inactive status |

### Supporting Endpoint (already exists, may need category filter):

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/materials?category=SEMI_FINISHED` | Get materials filtered by category |
| GET | `/api/admin/materials?category=CONSUMABLE` | Get consumable materials |

---

## ROUTE FILE

### File: routes/bomMaster.routes.js

```javascript
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

/**
 * GET /api/admin/bom
 * Returns all BOMs grouped by product material code.
 * Each row represents one unique product with total component count.
 */
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                material_code,
                material_desc,
                COUNT(*) AS total_components,
                BOOL_AND(is_active) AS is_active,
                MIN(created_at) AS created_at,
                MAX(updated_at) AS updated_at
            FROM bom_master
            GROUP BY material_code, material_desc
            ORDER BY material_code
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('[BOM] GET all error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /api/admin/bom/:materialCode
 * Returns full BOM detail for a product - material info + all component rows.
 */
router.get('/:materialCode', async (req, res) => {
    try {
        const { materialCode } = req.params;
        const result = await pool.query(
            'SELECT * FROM bom_master WHERE material_code = $1 ORDER BY bom_id',
            [materialCode]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'BOM not found' });
        }

        const firstRow = result.rows[0];
        const response = {
            material_code: firstRow.material_code,
            material_desc: firstRow.material_desc,
            is_active: firstRow.is_active,
            components: result.rows.map(row => ({
                bom_id: row.bom_id,
                component_material_code: row.component_material_code,
                component_material_desc: row.component_material_desc,
                consume_qty_per_km: parseFloat(row.consume_qty_per_km),
            })),
        };

        res.json({ success: true, data: response });
    } catch (error) {
        console.error('[BOM] GET by code error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /api/admin/bom
 * Creates a new BOM - inserts one row per component for the given product.
 * 
 * Request Body:
 * {
 *   material_code: "DTG652D250",
 *   material_desc: "G652D 250 NAT FIBER SPOOL",
 *   components: [
 *     { component_material_code: "1000000356", component_material_desc: "SINGLE-MODE FIBER PREFORM G652D", consume_qty_per_km: 0.028 },
 *     { component_material_code: "1000000342", component_material_desc: "Pri. Fiber Coating", consume_qty_per_km: 0.020 },
 *   ]
 * }
 */
router.post('/', async (req, res) => {
    const client = await pool.connect();
    try {
        const { material_code, material_desc, components } = req.body;

        // Validation
        if (!material_code) {
            return res.status(400).json({ success: false, message: 'Product Material Code is required' });
        }
        if (!components || components.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one component is required' });
        }

        // Check for duplicate components in request
        const codes = components.map(c => c.component_material_code);
        const uniqueCodes = new Set(codes);
        if (codes.length !== uniqueCodes.size) {
            return res.status(400).json({ success: false, message: 'Duplicate component material codes found' });
        }

        // Check if BOM already exists for this product
        const existing = await client.query(
            'SELECT COUNT(*) FROM bom_master WHERE material_code = $1',
            [material_code]
        );
        if (parseInt(existing.rows[0].count) > 0) {
            return res.status(409).json({ success: false, message: 'BOM already exists for this product. Use Edit instead.' });
        }

        await client.query('BEGIN');

        for (const comp of components) {
            if (!comp.component_material_code || !comp.consume_qty_per_km || comp.consume_qty_per_km <= 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ success: false, message: 'Each component must have a valid code and qty > 0' });
            }

            await client.query(`
                INSERT INTO bom_master (material_code, material_desc, component_material_code, component_material_desc, consume_qty_per_km)
                VALUES ($1, $2, $3, $4, $5)
            `, [material_code, material_desc, comp.component_material_code, comp.component_material_desc, comp.consume_qty_per_km]);
        }

        await client.query('COMMIT');
        res.json({ success: true, message: 'BOM created successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('[BOM] POST error:', error.message);

        if (error.code === '23505') { // unique violation
            return res.status(409).json({ success: false, message: 'Duplicate component found for this product' });
        }
        res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
});

/**
 * PUT /api/admin/bom/:materialCode
 * Updates BOM - deletes all existing components and re-inserts.
 * This is a "replace all" strategy for simplicity.
 * 
 * Request Body: same as POST
 */
router.put('/:materialCode', async (req, res) => {
    const client = await pool.connect();
    try {
        const { materialCode } = req.params;
        const { material_code, material_desc, components } = req.body;

        // Validation
        if (!components || components.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one component is required' });
        }

        // Check for duplicate components in request
        const codes = components.map(c => c.component_material_code);
        const uniqueCodes = new Set(codes);
        if (codes.length !== uniqueCodes.size) {
            return res.status(400).json({ success: false, message: 'Duplicate component material codes found' });
        }

        // Check BOM exists
        const existing = await client.query(
            'SELECT COUNT(*) FROM bom_master WHERE material_code = $1',
            [materialCode]
        );
        if (parseInt(existing.rows[0].count) === 0) {
            return res.status(404).json({ success: false, message: 'BOM not found for this product' });
        }

        await client.query('BEGIN');

        // Delete all existing components for this product
        await client.query('DELETE FROM bom_master WHERE material_code = $1', [materialCode]);

        // Re-insert all components
        for (const comp of components) {
            if (!comp.component_material_code || !comp.consume_qty_per_km || comp.consume_qty_per_km <= 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ success: false, message: 'Each component must have a valid code and qty > 0' });
            }

            await client.query(`
                INSERT INTO bom_master (material_code, material_desc, component_material_code, component_material_desc, consume_qty_per_km)
                VALUES ($1, $2, $3, $4, $5)
            `, [materialCode, material_desc, comp.component_material_code, comp.component_material_desc, comp.consume_qty_per_km]);
        }

        await client.query('COMMIT');
        res.json({ success: true, message: 'BOM updated successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('[BOM] PUT error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
});

/**
 * PATCH /api/admin/bom/:materialCode/status
 * Toggle is_active status for all component rows of a product.
 * 
 * Request Body: { is_active: true/false }
 */
router.patch('/:materialCode/status', async (req, res) => {
    try {
        const { materialCode } = req.params;
        const { is_active } = req.body;

        const result = await pool.query(
            'UPDATE bom_master SET is_active = $1, updated_at = NOW() WHERE material_code = $2',
            [is_active, materialCode]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'BOM not found' });
        }

        res.json({ success: true, message: `BOM ${is_active ? 'activated' : 'deactivated'} successfully` });
    } catch (error) {
        console.error('[BOM] PATCH status error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
```

---

## ROUTE REGISTRATION (server.js)

Add this line in your server.js where other routes are registered:

```javascript
const bomMasterRoutes = require('./routes/bomMaster.routes');

// Register with auth middleware
app.use('/api/admin/bom', authMiddleware, bomMasterRoutes);
```

---

## MATERIALS ENDPOINT (Category Filter Support)

The existing `GET /api/admin/materials` endpoint needs to support a `category` query parameter.

If not already implemented, update the materials route to support filtering:

```javascript
// GET /api/admin/materials?category=SEMI_FINISHED
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        let query = 'SELECT * FROM material_master WHERE is_active = true';
        const params = [];

        if (category) {
            params.push(category);
            query += ` AND material_category = $${params.length}`;
        }

        query += ' ORDER BY material_code';
        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
```

---

## RESPONSE FORMATS

### GET /api/admin/bom (List - Grouped)

```json
{
    "success": true,
    "data": [
        {
            "material_code": "DTG652D250",
            "material_desc": "G652D 250 NAT FIBER SPOOL",
            "total_components": 4,
            "is_active": true,
            "created_at": "2026-07-28T10:00:00.000Z",
            "updated_at": "2026-07-28T10:00:00.000Z"
        }
    ]
}
```

### GET /api/admin/bom/:materialCode (Detail)

```json
{
    "success": true,
    "data": {
        "material_code": "DTG652D250",
        "material_desc": "G652D 250 NAT FIBER SPOOL",
        "is_active": true,
        "components": [
            {
                "bom_id": 1,
                "component_material_code": "1000000356",
                "component_material_desc": "SINGLE-MODE FIBER PREFORM G652D",
                "consume_qty_per_km": 0.028
            },
            {
                "bom_id": 2,
                "component_material_code": "1000000342",
                "component_material_desc": "Pri. Fiber Coating",
                "consume_qty_per_km": 0.020
            },
            {
                "bom_id": 3,
                "component_material_code": "1000000343",
                "component_material_desc": "Sec. Fiber Coating",
                "consume_qty_per_km": 0.024
            },
            {
                "bom_id": 4,
                "component_material_code": "1000000244",
                "component_material_desc": "LIQUID NITROGEN",
                "consume_qty_per_km": 0.060
            }
        ]
    }
}
```

### POST /api/admin/bom (Create) - Request Body

```json
{
    "material_code": "DTG652D250",
    "material_desc": "G652D 250 NAT FIBER SPOOL",
    "components": [
        {
            "component_material_code": "1000000356",
            "component_material_desc": "SINGLE-MODE FIBER PREFORM G652D",
            "consume_qty_per_km": 0.028
        },
        {
            "component_material_code": "1000000342",
            "component_material_desc": "Pri. Fiber Coating",
            "consume_qty_per_km": 0.020
        }
    ]
}
```

### Success Response

```json
{
    "success": true,
    "message": "BOM created successfully"
}
```

### Error Response

```json
{
    "success": false,
    "message": "Duplicate component material codes found"
}
```

---

## IMPORTANT NOTES

1. **Transaction Safety**: CREATE and UPDATE operations use database transactions (`BEGIN`/`COMMIT`/`ROLLBACK`). If any component fails validation or insert, the entire operation is rolled back.

2. **Update Strategy**: The PUT endpoint uses "delete all + re-insert" strategy. This is simpler and avoids complex diffing logic. The UNIQUE constraint ensures data integrity.

3. **UNIQUE Constraint**: The table has `UNIQUE(material_code, component_material_code)` — the same component cannot be mapped to the same product twice.

4. **Status Toggle**: When toggling status, ALL component rows for that product are updated (they share the same `is_active` value).

5. **List Grouping**: The GET all endpoint uses `GROUP BY material_code` so the frontend sees one row per product even though the database has multiple rows (one per component).

6. **Decimal Handling**: `consume_qty_per_km` is `DECIMAL(10,3)` — PostgreSQL returns it as a string. Use `parseFloat()` when sending to frontend.

---

## FUTURE: Production Consumption Calculation

During production booking, load BOM for the produced product:

```javascript
// When booking production for product material_code with produced_km
const bomResult = await pool.query(
    'SELECT * FROM bom_master WHERE material_code = $1 AND is_active = true',
    [product_material_code]
);

const consumptions = bomResult.rows.map(row => ({
    component_material_code: row.component_material_code,
    component_material_desc: row.component_material_desc,
    required_qty: produced_km * parseFloat(row.consume_qty_per_km),
}));

// Use 'consumptions' array to create material consumption entries
```

Formula: `Required Quantity = Produced KM × consume_qty_per_km`

---

## TESTING CHECKLIST

1. ✅ Run CREATE TABLE migration
2. ✅ Create BOM with multiple components → verify all rows inserted
3. ✅ List BOMs → verify grouped response with correct `total_components`
4. ✅ Get BOM detail → verify all components returned with correct decimal values
5. ✅ Edit BOM (add/remove/modify components) → verify old rows deleted, new rows inserted
6. ✅ Toggle status → verify all rows updated
7. ✅ Attempt duplicate product BOM → expect 409 conflict
8. ✅ Attempt duplicate component in same BOM → expect validation error
9. ✅ Attempt `consume_qty_per_km = 0` or negative → expect validation error
10. ✅ GET /api/admin/materials?category=SEMI_FINISHED → returns filtered list
11. ✅ GET /api/admin/materials?category=CONSUMABLE → returns filtered list
