/*
 * Various utilities.
 */

import { $enum } from "ts-enum-util";

// ---------------------------------------------------------------------------------------------------------------------------------

/** Format number padded with leading 0s. */
export function padNumber(number: number, length: number): string {
    // This is much faster than toLocaleString() with minimumIntegerDigits, and browser support
    // overlaps OK with wasm support.
    return number.toString().padStart(length, "0");
}

// ---------------------------------------------------------------------------------------------------------------------------------

type StringKeyOf<T> = Extract<keyof T, string>;

interface GetEnumValueFromKeyOrIntegerOptions {
    /** Whether to allow any integer in str that isn't a value in the enum. */
    allowAnyInteger?: boolean;

    /** Optional prefix to prefix to add to string if the string isn't found as-is. */
    prefix?: string;

    /** Try uppercasing the provided string? */
    tryUpperCase?: boolean;
}

/**
 * Get an enum value from an enum by string that could be either the key or the value.
 *
 * @param str an arbitrary string, e.g. from user input.
 * @param enumObject an enum type, e.g. RelationshipId.
 * @param defaultValue a value from the enum to return if the string isn't a key or value.
 * @param options
 */
export function getEnumValueFromKeyOrInteger<T extends Record<StringKeyOf<T>, number>, D = T[StringKeyOf<T>]>(
    str: string,
    enumObject: T,
    defaultValue: D,
    options: GetEnumValueFromKeyOrIntegerOptions = {}
): D {
    // TODO do better here. Rely on ts-enum-util to parse the int. Get rid of the as unknown as D unpleasantness.
    const enumWrapper = $enum(enumObject);
    let value: D;

    try {
        // Simple case. str is a key in the enum.
        return (enumWrapper.getValueOrThrow(str) as unknown) as D;
    } catch (e) {}

    try {
        // Add the prefix if it's not there and try again.
        if (options.prefix != null && !str.startsWith(options.prefix)) {
            return (enumWrapper.getValueOrThrow(`${options.prefix}${str}`) as unknown) as D;
        }
    } catch (e) {}

    if (options.tryUpperCase) {
        const upperStr = str.toUpperCase();

        if (upperStr !== str) {
            return getEnumValueFromKeyOrInteger(upperStr, enumObject, defaultValue, options);
        }
    }

    let intKey: number;

    try {
        // Try the str as an int.
        intKey = parseInt(str);
        if (isNaN(intKey)) {
            value = defaultValue;
        } else {
            const key = enumWrapper.getKeyOrThrow(intKey);

            // TODO fix this!
            value = (enumWrapper.getValueOrThrow(key) as unknown) as D;
        }
    } catch (e) {
        // Integer entered but not a value in the enum. Allow it anyway?
        if (options.allowAnyInteger) {
            value = (intKey! as unknown) as D;
        } else {
            value = defaultValue;
        }
    }

    return value;
}
