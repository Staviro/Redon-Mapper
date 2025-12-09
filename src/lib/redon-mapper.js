export const RedonMapper = {
  /**
   * Safely retrieves a value from an object using a dot-separated path.
   * @param {Object} obj The source object.
   * @param {string} path The dot-separated path (e.g., 'profile.details.id').
   * @returns {any} The value at the path, or undefined if the path is not found/broken.
   */
  getValueByPath: (obj, path) => {
    if (!obj || typeof obj !== "object" || !path) return undefined;

    const keys = path.split(".");

    let current = obj;
    for (const key of keys) {
      if (
        current &&
        typeof current === "object" &&
        current.hasOwnProperty(key)
      ) {
        current = current[key];
      } else {
        return undefined;
      }
    }
    return current;
  },

  /**
   * Maps a single source object based on a defined template.
   * @param {Object} sourceData The incoming object.
   * @param {Object<string, {sourceKeys: string[], defaultValue?: any, transform?: function}>} mappingTemplate
   * The template defining the mapping rules.
   * @returns {Object} The resulting normalized object.
   */
  mapOne: (sourceData, mappingTemplate) => {
    const source =
      sourceData && typeof sourceData === "object" && !Array.isArray(sourceData)
        ? sourceData
        : {};
    const template =
      mappingTemplate &&
      typeof mappingTemplate === "object" &&
      !Array.isArray(mappingTemplate)
        ? mappingTemplate
        : {};

    if (Object.keys(source).length === 0 && sourceData !== null) {
      console.warn(
        "RedonMapper.mapOne: Source data provided is invalid or empty. Returning empty object."
      );
      return {};
    }
    if (Object.keys(template).length === 0) {
      console.warn(
        "RedonMapper.mapOne: Mapping template provided is invalid or empty. Returning empty object."
      );
      return {};
    }

    const mappedResult = {};

    for (const targetKey in template) {
      if (!template.hasOwnProperty(targetKey)) {
        continue;
      }

      const templateItem = template[targetKey];
      const possibleSourceKeys = templateItem.sourceKeys;
      const defaultValue = templateItem.defaultValue;
      const transform = templateItem.transform;

      if (!Array.isArray(possibleSourceKeys)) {
        console.warn(
          `RedonMapper: Template item for "${targetKey}" is missing the 'sourceKeys' array. Skipping.`
        );
        continue;
      }

      let isMatchFound = false;
      let matchedValue;

      for (const sourceKey of possibleSourceKeys) {
        const value = RedonMapper.getValueByPath(source, sourceKey);

        if (typeof value !== "undefined") {
          matchedValue = value;
          isMatchFound = true;
          break;
        }
      }

      if (isMatchFound || defaultValue) {
        let finalValue = matchedValue;
        let useValue = matchedValue ?? defaultValue;
        if (typeof transform === "function") {
          try {
            finalValue = transform(useValue, source);
          } catch (e) {
            console.error(
              `RedonMapper: Transform failed for key "${targetKey}" with value "${useValue}". Error:`,
              e
            );
          }
        }
        mappedResult[targetKey] = finalValue;
      } else if (typeof defaultValue !== "undefined") {
        mappedResult[targetKey] = defaultValue;
      }
    }

    return mappedResult;
  },

  /**
   * Maps an array of source objects using the given template.
   * @param {Array<Object>} sourceArray The array of incoming objects.
   * @param {Object<string, {sourceKeys: string[], defaultValue?: any, transform?: function}>} mappingTemplate The mapping template.
   * @returns {Array<Object>} A new array containing all the mapped objects.
   */
  mapAll: (sourceArray, mappingTemplate) => {
    if (!Array.isArray(sourceArray)) {
      console.error(
        "RedonMapper.mapAll: The source must be an array. Returning empty array."
      );
      return [];
    }

    const cleanArray = sourceArray.filter(
      (item) => item !== null && typeof item === "object"
    );

    return cleanArray.map((sourceItem) =>
      RedonMapper.mapOne(sourceItem, mappingTemplate)
    );
  },

  /**
   * Public entry point for RedonMapper. Determines whether to map a single object or an array.
   * @param {Object | Array<Object>} source The incoming data.
   * @param {Object} template The mapping template.
   * @returns {Object | Array<Object>} The resulting mapped data.
   */
  map: (source, template) => {
    if (Array.isArray(source)) {
      return RedonMapper.mapAll(source, template);
    } else if (source !== null && typeof source === "object") {
      return RedonMapper.mapOne(source, template);
    } else {
      console.error(
        "RedonMapper.map: Invalid input type. Must be an object or an array of objects. Returning original source."
      );
      return source;
    }
  },
};
