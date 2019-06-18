/*
 * Some utilities for use with OpenFin.
 */

import "openfin";

// ---------------------------------------------------------------------------------------------------------------------------------

/** Awaitable function to wait for OpenFin desktop to be ready. */
export function desktopReady() {
    return new Promise((resolve) => fin.desktop.main(resolve));
}

// ---------------------------------------------------------------------------------------------------------------------------------

/**
 * Awaitable function to create an OpenFin child window.
 *
 * @param   option fin.WindowOptions
 *
 * @returns { Window, promise }
 */
export function createChildWindow(options: fin.WindowOption) {
    let window!: fin.OpenFinWindow;

    const promise = new Promise<fin.OpenFinWindow>((resolve, reject) => {
        window = new fin.desktop.Window(
            options,
            () => /* successObj: { httpResponseCode: number } */ resolve(window),
            (reason: string, errorObj: fin.NetworkErrorInfo) => reject({ reason, errorObj })
        );
    });

    return { window, promise };
}

// ---------------------------------------------------------------------------------------------------------------------------------

/** Awaitable function to get the current options for a window. */
export function getWindowOptions(window: fin.OpenFinWindow) {
    return new Promise<fin.WindowOption>((resolve, reject) => window.getOptions(resolve, reject));
}
