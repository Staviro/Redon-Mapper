
/**
 * Redon Mapper V1.2.0
 * (c) 2026 Joseph Morukhuladi. All rights reserved.
 * Released under the MIT License.
 */

/**
 * RedonMapper
 *
 * A lightweight utility for mapping, transforming and normalizing
 * structured data.
 *
 * ================================================================
 * TRANSFORM SYNTAX
 * ================================================================
 *
 * SOURCE ALIASES
 *
 * sources: {
 *     first_name: ["first_name", "name"],
 *     last_name: ["last_name", "surname"]
 * }
 *
 * Each logical source key resolves to the first matching
 * source field for the current row.
 *
 * Example:
 *
 * {
 *     username: {
 *         sources: {
 *             first_name: ["first_name", "name"],
 *             last_name: ["last_name", "surname"]
 *         },
 *         transform: "combine|"
 *     }
 * }
 *
 * COMBINE
 *
 * combine
 * combine| 
 * combine|-
 *
 * The combine transformation joins resolved source values in
 * the order defined by the sources object.
 *
 *
 * STRING
 *
 * string
 * string|trim
 * string|lowercase
 * string|uppercase
 * string|trim|uppercase
 *
 *
 * REGEX
 *
 * string|regex:[^A-Z0-9]|
 *
 * Removes matching characters.
 *
 * string|regex:[^A-Z0-9]|-
 *
 * Replaces matching characters with "-".
 *
 * string|regex:INV-([0-9]+)|$1
 *
 * Extracts a capture group.
 *
 *
 * NUMBERS
 *
 * number
 *
 * integer
 * integer|round
 * integer|floor
 * integer|ceil
 *
 * float|2
 * float|3
 * float|5
 *
 *
 * BOOLEAN
 *
 * boolean
 *
 *
 * DATES
 *
 * date|YYYY-MM-DD
 * date|DD-MM-YYYY
 * date|DD/MM/YYYY
 * date|YYYY-MM-DD HH:mm:ss
 *
 *
 * CURRENCY
 *
 * currency|ZAR|en-ZA
 * currency|ZAR|en-ZA|0
 * currency|ZAR|en-ZA|2
 * currency|USD|en-US|2
 * currency|EUR|de-DE|2
 *
 * Currency is a standalone formatting transformation.
 *
 * The locale determines:
 *
 * - Currency symbol
 * - Currency position
 * - Thousands separator
 * - Decimal separator
 * - Locale-specific formatting
 *
 * The optional decimal argument controls the number
 * of decimal places.
 *
 *
 * NULL / EMPTY
 *
 * null
 *
 * empty:null
 * empty:Unknown
 * empty:0
 *
 * ================================================================
 */

export const RedonMapper = {

    /**
     * Safely retrieves a value from an object using
     * a dot-separated path.
     *
     * Example:
     *
     * getValueByPath(
     *     {
     *         user: {
     *             profile: {
     *                 id: 123
     *             }
     *         }
     *     },
     *     "user.profile.id"
     * )
     *
     * Returns:
     *
     * 123
     *
     * @param {Object} obj
     * @param {string} path
     * @returns {*}
     */
    getValueByPath: (obj, path) => {

        try {

            if (
                !obj ||
                typeof obj !== "object" ||
                !path
            ) {
                return undefined;
            }

            return path
                .split(".")
                .reduce(
                    (acc, key) => {

                        if (
                            acc &&
                            typeof acc === "object" &&
                            Object.prototype.hasOwnProperty.call(
                                acc,
                                key
                            )
                        ) {
                            return acc[key];
                        }

                        return undefined;
                    },
                    obj
                );

        } catch (err) {

            console.error(
                `RedonMapper.getValueByPath: unexpected error for path "${path}"`,
                err
            );

            return undefined;
        }
    },


    /**
     * Safely sets a value on an object based on
     * a dot-separated path.
     *
     * Intermediate objects are automatically created.
     *
     * @param {Object} obj
     * @param {string} path
     * @param {*} value
     */
    setNestedValue(obj, path, value) {

        try {

            if (
                !obj ||
                typeof obj !== "object"
            ) {
                throw new Error(
                    "Target must be an object"
                );
            }

            if (!path) {
                throw new Error(
                    "Path is required"
                );
            }

            const parts =
                path.split(".");

            let current = obj;

            parts.forEach(
                (part, index) => {

                    if (
                        index ===
                        parts.length - 1
                    ) {

                        current[part] =
                            value;

                    } else {

                        if (
                            !current[part] ||
                            typeof current[part] !==
                                "object"
                        ) {

                            current[part] = {};
                        }

                        current =
                            current[part];
                    }
                }
            );

        } catch (err) {

            console.error(
                `RedonMapper.setNestedValue: failed to set path "${path}"`,
                err
            );
        }
    },


    /**
     * Determines whether a value is a plain object.
     *
     * @private
     * @param {*} val
     * @returns {boolean}
     */
    _isPlainObject: (val) =>
        val !== null &&
        typeof val === "object" &&
        !Array.isArray(val),


    /**
     * Converts a value into a Date.
     *
     * Redon intentionally relies on JavaScript's
     * native Date parsing.
     *
     * Example:
     *
     * new Date("13 Jul 2026")
     *
     * @private
     * @param {*} value
     * @returns {Date|null}
     */
    _toDate: (value) => {

        if (
            value instanceof Date
        ) {

            return isNaN(
                value.getTime()
            )
                ? null
                : value;
        }

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return null;
        }

        const date =
            new Date(value);

        if (
            isNaN(
                date.getTime()
            )
        ) {

            return null;
        }

        return date;
    },


    /**
     * Pads a number with a leading zero.
     *
     * @private
     */
    _padNumber: (value) =>
        String(value).padStart(2, "0"),


    /**
     * Formats a Date using Redon's date tokens.
     *
     * Supported:
     *
     * YYYY
     * MM
     * DD
     * HH
     * mm
     * ss
     *
     * @private
     * @param {Date} date
     * @param {string} format
     * @returns {string}
     */
    _formatDate: (date, format) => {

        const replacements = {

            YYYY:
                date.getFullYear(),

            MM:
                RedonMapper._padNumber(
                    date.getMonth() + 1
                ),

            DD:
                RedonMapper._padNumber(
                    date.getDate()
                ),

            HH:
                RedonMapper._padNumber(
                    date.getHours()
                ),

            mm:
                RedonMapper._padNumber(
                    date.getMinutes()
                ),

            ss:
                RedonMapper._padNumber(
                    date.getSeconds()
                )
        };

        return format.replace(
            /YYYY|MM|DD|HH|mm|ss/g,
            token =>
                replacements[token]
        );
    },


    /**
     * Applies a single string operation.
     *
     * @private
     *
     * @param {*} value
     * @param {string} operation
     * @returns {*}
     */
    _applyStringOperation: (
        value,
        operation
    ) => {

        let result =
            value === null ||
            value === undefined
                ? ""
                : String(value);


        /*
         * --------------------------------------------------------
         * TRIM
         * --------------------------------------------------------
         */

        if (
            operation === "trim"
        ) {

            return result.trim();
        }


        /*
         * --------------------------------------------------------
         * LOWERCASE
         * --------------------------------------------------------
         */

        if (
            operation === "lowercase"
        ) {

            return result.toLowerCase();
        }


        /*
         * --------------------------------------------------------
         * UPPERCASE
         * --------------------------------------------------------
         */

        if (
            operation === "uppercase"
        ) {

            return result.toUpperCase();
        }


        /*
         * --------------------------------------------------------
         * REMOVE
         *
         * Example:
         *
         * string|remove:-
         *
         * "INV-001"
         *
         * becomes:
         *
         * "INV001"
         * --------------------------------------------------------
         */

        if (
            operation.startsWith(
                "remove:"
            )
        ) {

            const character =
                operation.substring(
                    "remove:".length
                );

            if (
                character
            ) {

                return result
                    .split(character)
                    .join("");
            }

            return result;
        }


        /*
         * --------------------------------------------------------
         * REGEX
         *
         * Syntax:
         *
         * regex:pattern|replacement
         *
         * Example:
         *
         * regex:[^A-Z0-9]|
         *
         * Removes all characters that are
         * not A-Z or 0-9.
         *
         *
         * Example:
         *
         * regex:[^A-Z0-9]|-
         *
         * Replaces matching characters with "-".
         *
         *
         * Example:
         *
         * regex:INV-([0-9]+)|$1
         *
         * Extracts the captured number.
         * --------------------------------------------------------
         */

        if (
            operation.startsWith(
                "regex:"
            )
        ) {

            const regexDefinition =
                operation.substring(
                    "regex:".length
                );

            const separatorIndex =
                regexDefinition.indexOf(
                    "|"
                );

            let pattern;
            let replacement;


            if (
                separatorIndex === -1
            ) {

                pattern =
                    regexDefinition;

                replacement = "";

            } else {

                pattern =
                    regexDefinition.substring(
                        0,
                        separatorIndex
                    );

                replacement =
                    regexDefinition.substring(
                        separatorIndex + 1
                    );
            }


            if (
                !pattern
            ) {

                return result;
            }


            try {

                /*
                 * Global matching is automatically
                 * enabled so all matches are processed.
                 */
                const regex =
                    new RegExp(
                        pattern,
                        "g"
                    );


                return result.replace(
                    regex,
                    replacement
                );

            } catch (
                regexError
            ) {

                console.error(
                    `RedonMapper: Invalid regex "${pattern}"`,
                    regexError
                );

                return result;
            }
        }


        /*
         * Unknown string operation.
         */
        console.warn(
            `RedonMapper: Unknown string operation "${operation}"`
        );

        return result;
    },


    /**
     * Formats a number as currency.
     *
     * Currency is intentionally implemented as a
     * standalone transformation.
     *
     * Syntax:
     *
     * currency|ZAR|en-ZA
     *
     * currency|ZAR|en-ZA|2
     *
     * currency|USD|en-US|2
     *
     * currency|EUR|de-DE|2
     *
     * Parameters:
     *
     * [0] currency
     * [1] locale
     * [2] decimals (optional)
     *
     * Intl.NumberFormat is responsible for:
     *
     * - Currency symbol
     * - Currency position
     * - Thousands separators
     * - Decimal separators
     * - Locale conventions
     *
     * @private
     * @param {*} value
     * @param {Array} parts
     * @returns {string|null}
     */
    _formatCurrency: (
        value,
        parts
    ) => {

        const currencyCode =
            parts[1]
                ?.trim()
                .toUpperCase();

        const locale =
            parts[2]
                ?.trim();


        /*
         * Currency code is required.
         */
        if (
            !currencyCode
        ) {

            console.error(
                "RedonMapper: Currency transformation requires a currency code."
            );

            return value;
        }


        /*
         * Locale is required because locale
         * determines currency placement and
         * formatting conventions.
         */
        if (
            !locale
        ) {

            console.error(
                "RedonMapper: Currency transformation requires a locale."
            );

            return value;
        }


        /*
         * Convert the incoming value to a number.
         */
        const number =
            Number(value);


        if (
            Number.isNaN(number)
        ) {

            console.warn(
                `RedonMapper: Unable to convert "${value}" to a number for currency formatting.`
            );

            return null;
        }


        /*
         * Optional decimal precision.
         *
         * If omitted, Intl.NumberFormat uses
         * the currency's normal decimal rules.
         */
        const decimalsValue =
            parts[3] !== undefined
                ? parts[3].trim()
                : null;


        const options = {

            style:
                "currency",

            currency:
                currencyCode
        };


        /*
         * Explicit decimal precision.
         *
         * Example:
         *
         * currency|ZAR|en-ZA|2
         *
         * forces exactly two decimal places.
         */
        if (
            decimalsValue !== null &&
            decimalsValue !== ""
        ) {

            const decimals =
                Number(
                    decimalsValue
                );


            if (
                !Number.isInteger(
                    decimals
                ) ||
                decimals < 0
            ) {

                console.warn(
                    `RedonMapper: Invalid currency decimal precision "${decimalsValue}".`
                );

            } else {

                options.minimumFractionDigits =
                    decimals;

                options.maximumFractionDigits =
                    decimals;
            }
        }


        try {

            return new Intl.NumberFormat(
                locale,
                options
            ).format(number);

        } catch (
            currencyError
        ) {

            console.error(
                `RedonMapper: Currency formatting failed for "${currencyCode}" with locale "${locale}".`,
                currencyError
            );

            return value;
        }
    },


    /**
     * Applies a transformation pipeline.
     *
     * Supported transformation types:
     *
     * string
     * number
     * integer
     * float
     * boolean
     * date
     * currency
     * null
     * empty
     *
     * @private
     *
     * @param {*} value
     * @param {string} transform
     * @returns {*}
     */
    _transformValue: (
        value,
        transform
    ) => {

        if (
            typeof transform !== "string" ||
            !transform.trim()
        ) {

            return value;
        }


        const parts =
            transform.split("|");


        const type =
            parts[0]
                ?.trim()
                .toLowerCase();


        /*
         * --------------------------------------------------------
         * COMBINE
         *
         * Combines multiple resolved source values.
         *
         * Syntax:
         *
         * combine
         * combine|-
         * combine| 
         *
         * When no separator is supplied, values are joined
         * without a separator.
         * --------------------------------------------------------
         */

        if (
            type === "combine"
        ) {

            if (
                !RedonMapper._isPlainObject(value)
            ) {

                return value;
            }

            const separator =
                parts.length > 1
                    ? parts.slice(1).join("|")
                    : "";

            return Object.values(value)
                .filter(
                    item =>
                        item !== undefined &&
                        item !== null
                )
                .map(
                    item =>
                        String(item)
                )
                .join(separator);
        }


        /*
         * --------------------------------------------------------
         * STRING
         * --------------------------------------------------------
         */

        if (
            type === "string"
        ) {

            let result =
                value === null ||
                value === undefined
                    ? ""
                    : String(value);


            let index = 1;


            while (
                index <
                parts.length
            ) {

                const operation =
                    parts[index]
                        ?.trim();


                /*
                 * Regex consumes the next
                 * section as its replacement.
                 */
                if (
                    operation.startsWith(
                        "regex:"
                    )
                ) {

                    let regexOperation =
                        operation;


                    if (
                        index + 1 <
                        parts.length
                    ) {

                        regexOperation +=
                            "|" +
                            parts[index + 1];

                        index += 2;

                    } else {

                        index++;
                    }


                    result =
                        RedonMapper._applyStringOperation(
                            result,
                            regexOperation
                        );

                    continue;
                }


                result =
                    RedonMapper._applyStringOperation(
                        result,
                        operation
                    );

                index++;
            }


            return result;
        }


        /*
         * --------------------------------------------------------
         * NUMBER
         * --------------------------------------------------------
         */

        if (
            type === "number"
        ) {

            const number =
                Number(value);


            return Number.isNaN(
                number
            )
                ? null
                : number;
        }


        /*
         * --------------------------------------------------------
         * INTEGER
         * --------------------------------------------------------
         */

        if (
            type === "integer"
        ) {

            const number =
                Number(value);


            if (
                Number.isNaN(number)
            ) {

                return null;
            }


            const operation =
                parts[1]
                    ?.trim()
                    .toLowerCase();


            if (
                operation === "floor"
            ) {

                return Math.floor(
                    number
                );
            }


            if (
                operation === "ceil"
            ) {

                return Math.ceil(
                    number
                );
            }


            /*
             * Default integer behaviour.
             */
            return Math.round(
                number
            );
        }


        /*
         * --------------------------------------------------------
         * FLOAT
         *
         * float
         * float|2
         * float|3
         * float|5
         * --------------------------------------------------------
         */

        if (
            type === "float"
        ) {

            const number =
                Number(value);


            if (
                Number.isNaN(number)
            ) {

                return null;
            }


            const decimals =
                parts[1] !== undefined
                    ? Number(
                        parts[1]
                    )
                    : 2;


            if (
                Number.isNaN(
                    decimals
                )
            ) {

                return number;
            }


            const factor =
                Math.pow(
                    10,
                    decimals
                );


            return (
                Math.round(
                    number * factor
                ) / factor
            );
        }


        /*
         * --------------------------------------------------------
         * BOOLEAN
         * --------------------------------------------------------
         *
         * Supported:
         *
         * true / false
         * yes / no
         * y / n
         * 1 / 0
         * on / off
         * --------------------------------------------------------
         */

        if (
            type === "boolean"
        ) {

            if (
                typeof value ===
                "boolean"
            ) {

                return value;
            }


            const normalized =
                String(value)
                    .trim()
                    .toLowerCase();


            if (
                [
                    "true",
                    "yes",
                    "y",
                    "1",
                    "on"
                ].includes(
                    normalized
                )
            ) {

                return true;
            }


            if (
                [
                    "false",
                    "no",
                    "n",
                    "0",
                    "off"
                ].includes(
                    normalized
                )
            ) {

                return false;
            }


            return null;
        }


        /*
         * --------------------------------------------------------
         * DATE
         *
         * The input is always converted using:
         *
         * new Date(value)
         *
         * and then formatted.
         * --------------------------------------------------------
         */

        if (
            type === "date"
        ) {

            const format =
                parts
                    .slice(1)
                    .join("|")
                    .trim();


            const date =
                RedonMapper._toDate(
                    value
                );


            if (
                !date
            ) {

                return null;
            }


            return RedonMapper._formatDate(
                date,
                format ||
                    "YYYY-MM-DD"
            );
        }


        /*
         * --------------------------------------------------------
         * CURRENCY
         *
         * IMPORTANT:
         *
         * Currency is a standalone transformation.
         *
         * Syntax:
         *
         * currency|ZAR|en-ZA
         *
         * currency|ZAR|en-ZA|2
         *
         * currency|USD|en-US|0
         *
         * --------------------------------------------------------
         */

        if (
            type === "currency"
        ) {

            return RedonMapper._formatCurrency(
                value,
                parts
            );
        }


        /*
         * --------------------------------------------------------
         * NULL
         * --------------------------------------------------------
         */

        if (
            type === "null"
        ) {

            return null;
        }


        /*
         * --------------------------------------------------------
         * EMPTY
         *
         * empty:null
         * empty:Unknown
         * empty:0
         * --------------------------------------------------------
         */

        if (
            type === "empty"
        ) {

            const replacement =
                parts
                    .slice(1)
                    .join("|");


            const isEmpty =
                value === null ||
                value === undefined ||
                String(value)
                    .trim() === "";


            if (
                isEmpty
            ) {

                if (
                    replacement ===
                    "null"
                ) {

                    return null;
                }


                return replacement;
            }


            return value;
        }


        /*
         * Unknown transformation.
         */
        console.warn(
            `RedonMapper: Unknown transform type "${type}"`
        );


        return value;
    },


    /**
     * Maps a single source object based on
     * a mapping template.
     *
     * @param {Object} sourceData
     * @param {Object} mappingTemplate
     * @returns {Object}
     */
    mapOne: (
        sourceData,
        mappingTemplate
    ) => {

        if (
            !RedonMapper._isPlainObject(
                mappingTemplate
            )
        ) {

            console.error(
                "RedonMapper.mapOne: Invalid mapping template provided."
            );

            return {};
        }


        const source =
            RedonMapper._isPlainObject(
                sourceData
            )
                ? sourceData
                : {};


        const mappedResult = {};


        for (
            const [
                targetKey,
                rule
            ] of Object.entries(
                mappingTemplate
            )
        ) {

            try {

                if (
                    !RedonMapper._isPlainObject(
                        rule
                    )
                ) {

                    console.warn(
                        `RedonMapper: Invalid rule for "${targetKey}".`
                    );

                    continue;
                }


                const {
                    sourceKeys,
                    sources,
                    defaultValue,
                    transform
                } = rule;


                /*
                 * ------------------------------------------------
                 * SOURCE ALIASES
                 * ------------------------------------------------
                 *
                 * sources maps logical source names to one or
                 * more possible input field names.
                 *
                 * Example:
                 *
                 * sources: {
                 *     first_name: ["first_name", "name"],
                 *     last_name: ["last_name", "surname"]
                 * }
                 *
                 * The first matching field is selected for each
                 * logical source.
                 */
                if (
                    RedonMapper._isPlainObject(
                        sources
                    )
                ) {

                    const resolvedSources = {};
                    let foundSource = false;


                    for (
                        const [
                            logicalKey,
                            aliases
                        ] of Object.entries(
                            sources
                        )
                    ) {

                        const sourceCandidates =
                            Array.isArray(aliases)
                                ? aliases
                                : [aliases];


                        let resolvedValue;
                        let resolved = false;


                        for (
                            const key of sourceCandidates
                        ) {

                            if (
                                typeof key !== "string" ||
                                !key
                            ) {

                                continue;
                            }


                            const val =
                                RedonMapper.getValueByPath(
                                    source,
                                    key
                                );


                            if (
                                val !== undefined &&
                                val !== null
                            ) {

                                resolvedValue =
                                    val;

                                resolved =
                                    true;

                                break;
                            }
                        }


                        if (resolved) {

                            resolvedSources[
                                logicalKey
                            ] = resolvedValue;

                            foundSource = true;

                        } else {

                            resolvedSources[
                                logicalKey
                            ] = undefined;
                        }
                    }


                    /*
                     * The resolved source object is passed to
                     * function transforms and can be consumed by
                     * the "combine" transformation.
                     */
                    if (
                        foundSource ||
                        defaultValue !== undefined
                    ) {

                        let finalValue =
                            foundSource
                                ? resolvedSources
                                : defaultValue;


                        /*
                         * ------------------------------------------------
                         * FUNCTION TRANSFORM
                         * ------------------------------------------------
                         */
                        if (
                            typeof transform ===
                            "function"
                        ) {

                            try {

                                finalValue =
                                    transform(
                                        finalValue,
                                        source
                                    );

                            } catch (
                                transformError
                            ) {

                                console.error(
                                    `RedonMapper: Transform failed for "${targetKey}"`,
                                    transformError
                                );
                            }
                        }


                        /*
                         * ------------------------------------------------
                         * STRING TRANSFORM
                         * ------------------------------------------------
                         */
                        else if (
                            typeof transform ===
                            "string"
                        ) {

                            try {

                                finalValue =
                                    RedonMapper._transformValue(
                                        finalValue,
                                        transform
                                    );

                            } catch (
                                transformError
                            ) {

                                console.error(
                                    `RedonMapper: String transform failed for "${targetKey}"`,
                                    transformError
                                );
                            }
                        }


                        RedonMapper.setNestedValue(
                            mappedResult,
                            targetKey,
                            finalValue
                        );
                    }


                    /*
                     * sources is the complete source definition for
                     * this rule, so do not also process sourceKeys.
                     */
                    continue;
                }


                /*
                 * ------------------------------------------------
                 * LEGACY SOURCE KEYS
                 * ------------------------------------------------
                 *
                 * Existing sourceKeys behaviour remains unchanged.
                 */
                if (
                    !Array.isArray(
                        sourceKeys
                    )
                ) {

                    console.warn(
                        `RedonMapper: "${targetKey}" is missing 'sourceKeys' array. Skipping.`
                    );

                    continue;
                }


                /*
                 * Find the first valid source value.
                 */
                let matchedValue;


                const found =
                    sourceKeys.some(
                        key => {

                            const val =
                                RedonMapper.getValueByPath(
                                    source,
                                    key
                                );


                            if (
                                val !==
                                    undefined &&
                                val !== null
                            ) {

                                matchedValue =
                                    val;

                                return true;
                            }


                            return false;
                        }
                    );


                /*
                 * Process the field when either:
                 *
                 * - A source value was found
                 * - A default value exists
                 */
                if (
                    found ||
                    defaultValue !==
                        undefined
                ) {

                    let finalValue =
                        found
                            ? matchedValue
                            : defaultValue;


                    /*
                     * ------------------------------------------------
                     * FUNCTION TRANSFORM
                     * ------------------------------------------------
                     *
                     * Existing JavaScript function transforms
                     * remain fully supported.
                     */
                    if (
                        typeof transform ===
                        "function"
                    ) {

                        try {

                            finalValue =
                                transform(
                                    finalValue,
                                    source
                                );

                        } catch (
                            transformError
                        ) {

                            console.error(
                                `RedonMapper: Transform failed for "${targetKey}"`,
                                transformError
                            );

                            /*
                             * Keep original value
                             * if function transform fails.
                             */
                        }
                    }


                    /*
                     * ------------------------------------------------
                     * STRING TRANSFORM
                     * ------------------------------------------------
                     *
                     * Example:
                     *
                     * transform:
                     * "string|trim|uppercase"
                     *
                     * or:
                     *
                     * "currency|ZAR|en-ZA|2"
                     */
                    else if (
                        typeof transform ===
                        "string"
                    ) {

                        try {

                            finalValue =
                                RedonMapper._transformValue(
                                    finalValue,
                                    transform
                                );

                        } catch (
                            transformError
                        ) {

                            console.error(
                                `RedonMapper: String transform failed for "${targetKey}"`,
                                transformError
                            );

                            /*
                             * Keep original value
                             * if string transform fails.
                             */
                        }
                    }


                    /*
                     * Set the transformed value
                     * on the target object.
                     */
                    RedonMapper.setNestedValue(
                        mappedResult,
                        targetKey,
                        finalValue
                    );
                }

            } catch (
                ruleError
            ) {

                console.error(
                    `RedonMapper: Critical error processing rule for "${targetKey}"`,
                    ruleError
                );
            }
        }


        return mappedResult;
    },


    /**
     * Maps an array of source objects.
     *
     * @param {Array} sourceArray
     * @param {Object} mappingTemplate
     * @returns {Array}
     */
    mapAll: (
        sourceArray,
        mappingTemplate
    ) => {

        if (
            !Array.isArray(
                sourceArray
            )
        ) {

            console.error(
                "RedonMapper.mapAll: Input must be an array."
            );

            return [];
        }


        return sourceArray
            .filter(
                item =>
                    RedonMapper._isPlainObject(
                        item
                    )
            )
            .map(
                item =>
                    RedonMapper.mapOne(
                        item,
                        mappingTemplate
                    )
            );
    },


    /**
     * Main entry point.
     *
     * Automatically handles:
     *
     * - Single objects
     * - Arrays
     *
     * @param {Object|Array} source
     * @param {Object} template
     * @returns {Object|Array}
     */
    map: (
        source,
        template
    ) => {

        try {

            if (
                Array.isArray(source)
            ) {

                return RedonMapper.mapAll(
                    source,
                    template
                );
            }


            return RedonMapper.mapOne(
                source,
                template
            );

        } catch (err) {

            console.error(
                "RedonMapper.map: Critical failure in mapping process",
                err
            );


            return Array.isArray(source)
                ? []
                : {};
        }
    }
};


/*
 * ================================================================
 * EXPORT
 * ================================================================
 *
 * Browser:
 *
 * RedonMapper is available globally.
 *
 * CommonJS:
 *
 * module.exports = RedonMapper
 *
 * ================================================================
 */

if (
    typeof module !== "undefined" &&
    module.exports
) {

    module.exports =
        RedonMapper;
}