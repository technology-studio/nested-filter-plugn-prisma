/**
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date: 2021-04-18T15:04:77+02:00
 * @Copyright: Technology Studio
**/

import { Plugin, PluginOptions, ResolverArguments } from '@txo-peer-dep/nested-filter-prisma'

type Options = {
  deletedDateTimeValue?: string | null,
  excludeDeleted?: boolean,
  whereNonEntityKeyList?: string[],
}

declare module '@txo-peer-dep/nested-filter-prisma' {
  interface PluginOptions {
    deletedDateTimeValue?: string | null,
    excludeDeleted?: boolean,
  }
}

const WHERE_NON_ENTITY_KEY_LIST = [
  'equals',
  'in',
  'notIn',
  'lt',
  'lte',
  'gt',
  'gte',
  'not',
  'every',
  'some',
  'none',
]

export class ExcludeDeletedNestedFilterPlugin implements Plugin {
  _defaultOptions?: Options
  constructor (defaultOptions?: Options) {
    this._defaultOptions = defaultOptions
  }

  _getWhereNonEntityKeyList = (): string[] => (
    this._defaultOptions?.whereNonEntityKeyList ?? WHERE_NON_ENTITY_KEY_LIST
  )

  _injectDeleted = (value: unknown, deletedDateTimeValue?: string | null): unknown => {
    if (value && Array.isArray(value)) {
      let modified = false
      const nextValue = value.map(subValue => {
        const nextSubValue = this._injectDeleted(subValue, deletedDateTimeValue)
        if (nextSubValue !== subValue) {
          modified = true
        }
        return nextSubValue
      })
      return modified ? nextValue : value
    }
    if (value && typeof value === 'object') {
      let nonEntity = false
      const nextValue = Object.keys(value).reduce(
        (nextValue: Record<string, unknown>, key) => {
          if (this._getWhereNonEntityKeyList().includes(key)) {
            nonEntity = true
          }
          nextValue[key] = this._injectDeleted((value as Record<string, unknown>)[key], deletedDateTimeValue)
          return nextValue
        }, {},
      )
      if (!(nonEntity || 'deletedDateTime' in nextValue)) {
        nextValue.deletedDateTime = deletedDateTimeValue
      }
      return nextValue
    }
    return value
  }

  processWhere <WHERE > (
    where: WHERE,
    resolverArguments: ResolverArguments,
    pluginOptions?: PluginOptions,
  ): WHERE {
    if (pluginOptions?.excludeDeleted ?? this._defaultOptions?.excludeDeleted) {
      const deletedDateTimeValue = (
        pluginOptions?.deletedDateTimeValue !== undefined
          ? pluginOptions?.deletedDateTimeValue
          : this._defaultOptions?.deletedDateTimeValue !== undefined
            ? this._defaultOptions?.deletedDateTimeValue
            : null
      )

      return this._injectDeleted(where, deletedDateTimeValue) as WHERE
    }
    return where
  }
}
