import Constants from 'expo-constants';
import brand from '../../brand.json';
export { brand };
export { navigation } from './navigation';

export const appVersion = Constants.expoConfig?.version ?? 'Development';
