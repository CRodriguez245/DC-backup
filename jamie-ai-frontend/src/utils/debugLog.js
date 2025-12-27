const isDev = process.env.NODE_ENV !== 'production';

export const debugLog = (...args) => {
  if (isDev) {
    console.log(...args);
  }
};




