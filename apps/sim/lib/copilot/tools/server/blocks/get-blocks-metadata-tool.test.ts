/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import { computeBlockLevelInputs } from '@/lib/copilot/tools/server/blocks/get-blocks-metadata-tool'
import { MothershipBlock } from '@/blocks/blocks/mothership'
import type { BlockConfig } from '@/blocks/types'

describe('get blocks metadata', () => {
  it('omits server-only Mothership policy inputs from block metadata definitions', () => {
    const definitions = computeBlockLevelInputs(MothershipBlock)

    expect(definitions).not.toHaveProperty('secretScope')
    expect(definitions).not.toHaveProperty('mountedSecrets')
  })

  it('omits Super User-only definitions unless the caller is effective', () => {
    const block = {
      type: 'agent',
      subBlocks: [
        { id: 'model', type: 'combobox' },
        { id: 'customModelConfig', type: 'code', superUserOnly: true },
      ],
      inputs: {
        model: { type: 'string' },
        customModelConfig: { type: 'json' },
      },
    } as unknown as BlockConfig

    expect(computeBlockLevelInputs(block)).toEqual({ model: { type: 'string' } })
    expect(computeBlockLevelInputs(block, true)).toEqual({
      model: { type: 'string' },
      customModelConfig: { type: 'json' },
    })
  })
})
