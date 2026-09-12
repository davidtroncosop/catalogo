// Generated from inputs/*.pdf. See scripts/build-catalog.py and docs/catalog-audit.json.
import type { Product } from '../types';
import catalog from './catalog.json';

export const PRODUCTS = catalog as Product[];
