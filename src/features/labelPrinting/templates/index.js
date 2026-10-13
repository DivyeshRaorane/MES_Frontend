/*
 * Importing this module registers every built-in template as a side effect.
 * To add a new template in the future:
 *   1. create ./myNewTemplate.jsx that calls registerTemplate({...})
 *   2. add one import line below
 * Nothing else needs to change — it appears in the playground and printLabel().
 */
import './fiberLabelTemplate';
import './spoolLabelTemplate';
import './cartonLabelTemplate';
import './bobbinLabelTemplate';
