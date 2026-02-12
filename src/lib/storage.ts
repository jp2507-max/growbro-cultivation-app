import { createMMKV } from 'react-native-mmkv';

// App-wide MMKV storage instance for local preferences (age-gate, theme, etc.)
export const storage = createMMKV({ id: 'growbro-app' });
