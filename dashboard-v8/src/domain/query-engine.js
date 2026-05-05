/**
 * Filter + aggregate engine. Pure function, zero side-effects.
 *
 * @param {Object} input
 * @param {any[]} input.data — array of objects
 * @param {Object} [input.filters={}] — { field: <value>|<array>|{op,value}> }
 * @param {string} [input.groupBy] — field name to group by; if omitted, totals contains all aggregates
 * @param {Array<{field:string, op:string, as?:string}>} [input.aggregates=[]]
 * @returns {{ rows: any[], totals: Object }}
 */
export function query({ data, filters = {}, groupBy, aggregates = [] }) {
  // Basic input normalization
  const rows = Array.isArray(data) ? data : [];

  // Helper: get value for a given row field (undefined if missing)
  const get = (row, field) => (row && Object.prototype.hasOwnProperty.call(row, field) ? row[field] : undefined);

  // Build filter predicate per-row
  const filterPred = (row) => {
    for (const [field, spec] of Object.entries(filters || {})) {
      const value = get(row, field);
      // Determine operator and target value
      let op = 'eq';
      let target = spec;
      if (Array.isArray(spec)) {
        op = 'in';
        target = spec;
      } else if (spec && typeof spec === 'object' && spec.op) {
        op = spec.op;
        target = spec.value;
      }

      // Evaluate operator
      const rv = value;
      switch (op) {
        case 'eq':
          if (rv !== target) return false;
          break;
        case 'ne':
          if (rv === target) return false;
          break;
        case 'gt': {
          const a = Number(rv); const b = Number(target);
          if (Number.isNaN(a) || Number.isNaN(b)) return false;
          if (!(a > b)) return false;
          break;
        }
        case 'gte': {
          const a = Number(rv); const b = Number(target);
          if (Number.isNaN(a) || Number.isNaN(b)) return false;
          if (!(a >= b)) return false;
          break;
        }
        case 'lt': {
          const a = Number(rv); const b = Number(target);
          if (Number.isNaN(a) || Number.isNaN(b)) return false;
          if (!(a < b)) return false;
          break;
        }
        case 'lte': {
          const a = Number(rv); const b = Number(target);
          if (Number.isNaN(a) || Number.isNaN(b)) return false;
          if (!(a <= b)) return false;
          break;
        }
        case 'in': {
          if (!Array.isArray(target)) return false;
          if (!target.includes(rv)) return false;
          break;
        }
        case 'between': {
          if (!Array.isArray(target) || target.length !== 2) {
            throw new Error("between operator requires value to be [min, max]");
          }
          const min = Number(target[0]);
          const max = Number(target[1]);
          const v = Number(rv);
          if (Number.isNaN(min) || Number.isNaN(max) || Number.isNaN(v)) return false;
          if (!(v >= min && v <= max)) return false;
          break;
        }
        default:
          // Unknown operator: fail safe by filtering out
          return false;
      }
    }
    return true;
  };

  // Apply filters
  const filtered = rows.filter((r) => filterPred(r));

  // Helpers to compute aggregates per-set
  const toAlias = (field, op, as) => (as && as.length ? as : `${field}_${op}`);
  const computeAggregatesFor = (rowsSubset) => {
    const result = {};
    for (const agg of aggregates) {
      const field = agg.field;
      const op = agg.op;
      const as = agg.as;
      const key = toAlias(field, op, as);
      // Gather values
      if (op === 'sum' || op === 'avg' || op === 'min' || op === 'max') {
        let sum = 0;
        let count = 0;
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;
        for (const row of rowsSubset) {
          const v = row[field];
          const n = typeof v === 'number' && !Number.isNaN(v) ? v : undefined;
          if (typeof n === 'number') {
            sum += n;
            count++;
            if (n < min) min = n;
            if (n > max) max = n;
          }
        }
        if (op === 'sum') result[key] = sum;
        if (op === 'avg') result[key] = count > 0 ? sum / count : NaN;
        if (op === 'min') result[key] = count > 0 ? min : NaN;
        if (op === 'max') result[key] = count > 0 ? max : NaN;
      } else if (op === 'count') {
        result[key] = rowsSubset.length;
      } else {
        // Unsupported op – skip gracefully
        result[key] = undefined;
      }
    }
    return result;
  };

  // If there is grouping, generate one row per group
  if (groupBy) {
    const groups = new Map(); // groupKey -> array
    for (const r of filtered) {
      const raw = r[groupBy];
      const key = (raw === undefined) ? 'undefined' : String(raw);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(r);
    }

    const rowsOut = [];
    for (const [gKey, groupRows] of groups.entries()) {
      // Build a representative row for the group
      // Show the string label as the group value for the groupBy field
      const label = gKey; // 'undefined' string when undefined
      const aggValues = computeAggregatesFor(groupRows);
      const row = { [groupBy]: label, ...(aggValues) };
      rowsOut.push(row);
    }
    return { rows: rowsOut, totals: {} };
  }

  // No grouping: compute aggregates across all filtered rows and attach to totals
  const totals = computeAggregatesFor(filtered);
  // Ensure totals is an object even if no aggregates provided
  return { rows: filtered, totals: Object.keys(totals).length ? totals : {} };
}
