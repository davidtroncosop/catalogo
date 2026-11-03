// Generated from inputs/c17/*.xlsx. See scripts/build-catalog-xlsx.py and docs/catalog-audit.json.
import type { Product } from '../types';
import catalog from './catalog.json';

export const PRODUCTS = catalog as Product[];
