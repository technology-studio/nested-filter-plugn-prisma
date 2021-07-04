/**
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date: 2021-07-04T11:07:33+02:00
 * @Copyright: Technology Studio
**/

import { ResolverArguments } from '@txo-peer-dep/nested-filter-prisma'
import { ExcludeDeletedNestedFilterPlugin } from '@txo/nested-filter-plugin-prisma/src'

describe('ExcludeDeletedNenstedFilterPlugin', () => {
  const plugin = new ExcludeDeletedNestedFilterPlugin({
    excludeDeleted: true,
    deletedDateTimeValue: null,
  })

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const resolveArguments = {} as ResolverArguments<unknown, unknown, unknown>

  test('processWhere - single entity', () => {
    expect(plugin.processWhere({
      id: 1,
    }, resolveArguments)).toEqual({
      id: 1,
      deletedDateTime: null,
    })
  })

  test('processWhere - nested entities', () => {
    expect(plugin.processWhere({
      id: 1,
      nested: {
        id: 1,
      },
    }, resolveArguments)).toEqual({
      id: 1,
      deletedDateTime: null,
      nested: {
        id: 1,
        deletedDateTime: null,
      },
    })
  })

  test('processWhere - single entity with expresion', () => {
    expect(plugin.processWhere({
      id: {
        notIn: [1, 2, 3],
      },
    }, resolveArguments)).toEqual({
      id: {
        notIn: [1, 2, 3],
      },
      deletedDateTime: null,
    })
  })

  test('processWhere - single entity do not override existing deletedDateTime', () => {
    expect(plugin.processWhere({
      id: 1,
      deletedDateTime: '2020-02-10T12:20:30.300Z',
    }, resolveArguments)).toEqual({
      id: 1,
      deletedDateTime: '2020-02-10T12:20:30.300Z',
    })
  })
})
