const DEBUG = import.meta.env.DEV;

export function log(message, ...args) {
  if (DEBUG) console.log(`[PhysicsSim] ${message}`, ...args);
}

export function warn(message, ...args) {
  console.warn(`[PhysicsSim] ${message}`, ...args);
}

export function error(message, ...args) {
  console.error(`[PhysicsSim] ${message}`, ...args);
}
