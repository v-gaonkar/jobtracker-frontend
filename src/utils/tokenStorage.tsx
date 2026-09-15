const STORAGE_TYPE_KEY = 'authStorageType'; 
function getActiveStorage(): Storage {
    const type = localStorage.getItem(STORAGE_TYPE_KEY);
    return type === 'session' ? sessionStorage : localStorage;
}

export const tokenStorage = {
    setTokens(accessToken: string, refreshToken: string, rememberMe: boolean) {
        const storage = rememberMe ? localStorage : sessionStorage;
        localStorage.setItem(STORAGE_TYPE_KEY, rememberMe ? 'local' : 'session');
        storage.setItem('accessToken', accessToken);
        storage.setItem('refreshToken', refreshToken);
    },
    getAccessToken(): string | null {
        return getActiveStorage().getItem('accessToken');
    },
    getRefreshToken(): string | null {
        return getActiveStorage().getItem('refreshToken');
    },
    setAccessToken(token: string) {
        getActiveStorage().setItem('accessToken', token);
    },
    clear() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        localStorage.removeItem(STORAGE_TYPE_KEY);
    },
};