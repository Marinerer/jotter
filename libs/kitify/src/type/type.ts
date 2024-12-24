import isType from './isType'
export const isString = (value: any) => typeof value === 'string'
export const isNumber = (value: any) => typeof value === 'number'
export const isBoolean = (value: any) => typeof value === 'boolean'
export const isArray = (value: any) => Array.isArray(value)
export const isFunction = (value: any) => typeof value === 'function'
export const isUndefined = (value: any) => value === void 0
export const isNull = (value: any) => value === null
export const isSymbol = (value: any) => typeof value === 'symbol'
export const isBigInt = (value: any) => typeof value === 'bigint'
export const isObject = (value: any) => isType(value, 'object') as boolean

export const isNil = (value: any) => value === null || value === void 0

export const isEmpty = (value: any) => {
	if (isNil(value)) {
		return true
	}
	if (typeof value === 'string') {
		return value.trim() === ''
	}
	if (Array.isArray(value)) {
		return value.length === 0
	}
	if (typeof value === 'object') {
		return Object.keys(value).length === 0
	}
	return false
}

export const isInvalid = (value: any) => isNil(value) || Number.isNaN(value)

export { isType }
