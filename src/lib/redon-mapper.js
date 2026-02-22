/**
 * Redon Mapper V1.0.0
 * (c) 2026 Joseph Morukhuladi. All rights reserved.
 * Released under the MIT License.
 */
/**
 * RedonMapper: A robust utility for data transformation and normalization.
 * @namespace
 */
export const RedonMapper = {
	/**
	 * Safely retrieves a value from an object using a dot-separated path.
	 * Uses a reducer for clean, modern path drilling.
	 * * @param {Object} obj - The source object.
	 * @param {string} path - Dot-separated path (e.g., 'user.profile.id').
	 * @returns {*} The value at the path, or undefined.
	 */
	getValueByPath: (obj, path) => {
		try {
			if (!obj || typeof obj !== "object" || !path) return undefined

			return path.split(".").reduce((acc, key) => {
				if (
					acc &&
					typeof acc === "object" &&
					Object.prototype.hasOwnProperty.call(acc, key)
				) {
					return acc[key]
				}
				return undefined
			}, obj)
		} catch (err) {
			console.error(
				`RedonMapper.getValueByPath: unexpected error for path "${path}"`,
				err
			)
			return undefined
		}
	},

	/**
	 * Safely sets a value on an object based on a dot-separated path.
	 * If intermediate objects don't exist, they are created.
	 * * @param {Object} obj - The target object.
	 * @param {string} path - Dot-separated path to set.
	 * @param {*} value - The value to assign.
	 */
	setNestedValue(obj, path, value) {
		try {
			if (!obj || typeof obj !== "object")
				throw new Error("Target must be an object")

			const parts = path.split(".")
			let current = obj

			parts.forEach((part, i) => {
				if (i === parts.length - 1) {
					current[part] = value
				} else {
					if (!current[part] || typeof current[part] !== "object") {
						current[part] = {}
					}
					current = current[part]
				}
			})
		} catch (err) {
			console.error(
				`RedonMapper.setNestedValue: failed to set path "${path}"`,
				err
			)
		}
	},

	/**
	 * Internal helper to validate if an input is a non-null, non-array object.
	 * @private
	 */
	_isPlainObject: (val) =>
		val !== null && typeof val === "object" && !Array.isArray(val),

	/**
	 * Maps a single source object based on a defined template.
	 * * @param {Object} sourceData - The raw input data.
	 * @param {MappingTemplate} mappingTemplate - The rules for transformation.
	 * @returns {Object} The mapped/normalized object.
	 */
	mapOne: (sourceData, mappingTemplate) => {
		if (!RedonMapper._isPlainObject(mappingTemplate)) {
			console.error("RedonMapper.mapOne: Invalid mapping template provided.")
			return {}
		}

		const source = RedonMapper._isPlainObject(sourceData) ? sourceData : {}
		const mappedResult = {}

		// Use Object.entries for cleaner iteration over template rules
		for (const [targetKey, rule] of Object.entries(mappingTemplate)) {
			try {
				const {sourceKeys, defaultValue, transform} = rule

				if (!Array.isArray(sourceKeys)) {
					console.warn(
						`RedonMapper: "${targetKey}" is missing 'sourceKeys' array. Skipping.`
					)
					continue
				}

				// Search for the first valid value in sourceKeys
				let matchedValue
				const found = sourceKeys.some((key) => {
					const val = RedonMapper.getValueByPath(source, key)
					if (val !== undefined && val !== null) {
						matchedValue = val
						return true
					}
					return false
				})

				// Determine the raw value (match vs default)
				if (found || defaultValue !== undefined) {
					let finalValue = found ? matchedValue : defaultValue

					// Apply transformation if exists
					if (typeof transform === "function") {
						try {
							finalValue = transform(finalValue, source)
						} catch (transformError) {
							console.error(
								`RedonMapper: Transform failed for "${targetKey}"`,
								transformError
							)
							// We keep the original value as fallback if transform fails
						}
					}

					RedonMapper.setNestedValue(mappedResult, targetKey, finalValue)
				}
			} catch (ruleError) {
				console.error(
					`RedonMapper: Critical error processing rule for "${targetKey}"`,
					ruleError
				)
			}
		}

		return mappedResult
	},

	/**
	 * Maps an array of source objects.
	 * * @param {Array<Object>} sourceArray - Array of raw data.
	 * @param {MappingTemplate} mappingTemplate - The rules for transformation.
	 * @returns {Array<Object>}
	 */
	mapAll: (sourceArray, mappingTemplate) => {
		if (!Array.isArray(sourceArray)) {
			console.error("RedonMapper.mapAll: Input must be an array.")
			return []
		}

		return sourceArray
			.filter((item) => RedonMapper._isPlainObject(item))
			.map((item) => RedonMapper.mapOne(item, mappingTemplate))
	},

	/**
	 * Entry point: Automatically handles single objects or arrays.
	 * * @param {Object|Array<Object>} source - The data to map.
	 * @param {MappingTemplate} template - The mapping rules.
	 * @returns {Object|Array<Object>}
	 */
	map: (source, template) => {
		try {
			if (Array.isArray(source)) {
				return RedonMapper.mapAll(source, template)
			}
			return RedonMapper.mapOne(source, template)
		} catch (err) {
			console.error("RedonMapper.map: Critical failure in mapping process", err)
			return Array.isArray(source) ? [] : {}
		}
	}
}
