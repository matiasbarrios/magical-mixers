// Requirements
import { busIsOfType } from '../options.js';


// Exported
export const toHas = busId => !busIsOfType(busId, 'monitor');
