const PRESERVED_LOCAL_STORAGE_KEYS = new Set([
    'expense_tracker_token',
    'demo_mode',
    'demo_expenses',
    'demo_categories',
    'demo_profile',
]);

function removeLegacyLocalCache() {
    try {
        const keysToRemove: string[] = [];

        for (let index = 0; index < localStorage.length; index += 1) {
            const key = localStorage.key(index);
            if (!key) {
                continue;
            }

            if (
                key === 'expense_tracker_user' ||
                key === 'theme' ||
                key.startsWith('expenses_cache_') ||
                key.startsWith('transactions_') ||
                key.startsWith('categories_')
            ) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
        console.error('Failed to clear legacy local cache:', error);
    }
}

function removeSessionStorageCache() {
    try {
        sessionStorage.clear();
    } catch (error) {
        console.error('Failed to clear session storage cache:', error);
    }
}

async function unregisterServiceWorkers() {
    if (!('serviceWorker' in navigator)) {
        return;
    }

    try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
    } catch (error) {
        console.error('Failed to unregister service workers:', error);
    }
}

async function deleteCacheStorage() {
    if (!('caches' in window)) {
        return;
    }

    try {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
    } catch (error) {
        console.error('Failed to clear Cache Storage:', error);
    }
}

async function deleteIndexedDbCaches() {
    if (!('indexedDB' in window) || typeof indexedDB.databases !== 'function') {
        return;
    }

    try {
        const databases = await indexedDB.databases();
        await Promise.all(
            databases
                .map((database) => database.name)
                .filter((name): name is string => Boolean(name))
                .map((name) => new Promise<void>((resolve) => {
                    const request = indexedDB.deleteDatabase(name);
                    request.onsuccess = () => resolve();
                    request.onerror = () => resolve();
                    request.onblocked = () => resolve();
                })),
        );
    } catch (error) {
        console.error('Failed to clear IndexedDB caches:', error);
    }
}

function stripNonEssentialLocalStorage() {
    try {
        const keysToRemove: string[] = [];

        for (let index = 0; index < localStorage.length; index += 1) {
            const key = localStorage.key(index);
            if (!key) {
                continue;
            }

            if (!PRESERVED_LOCAL_STORAGE_KEYS.has(key)) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
        console.error('Failed to strip non-essential localStorage keys:', error);
    }
}

export async function purgeClientCaches() {
    removeLegacyLocalCache();
    removeSessionStorageCache();
    stripNonEssentialLocalStorage();

    await Promise.all([
        unregisterServiceWorkers(),
        deleteCacheStorage(),
        deleteIndexedDbCaches(),
    ]);
}
