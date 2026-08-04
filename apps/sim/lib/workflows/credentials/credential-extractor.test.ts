/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest'
import { sanitizeWorkflowForSharing } from '@/lib/workflows/credentials/credential-extractor'

function workflowWithCustomKey(apiKey: string) {
  return {
    blocks: {
      agent1: {
        id: 'agent1',
        type: 'agent',
        name: 'Agent',
        enabled: true,
        subBlocks: {
          model: { id: 'model', type: 'combobox', value: 'sim-custom' },
          customModelConfig: {
            id: 'customModelConfig',
            type: 'code',
            value: JSON.stringify({
              provider: 'openai',
              model: 'gpt-future',
              credentials: { mode: 'explicit', apiKey },
            }),
          },
        },
      },
    },
  } as any
}

describe('custom model credential sharing sanitization', () => {
  it('removes a literal nested API key', () => {
    const sanitized = sanitizeWorkflowForSharing(workflowWithCustomKey('sk-secret')) as any
    const config = JSON.parse(sanitized.blocks.agent1.subBlocks.customModelConfig.value)

    expect(config.credentials.apiKey).toBeUndefined()
    expect(config.model).toBe('gpt-future')
  })

  it('preserves an environment reference only for explicit exports', () => {
    const exported = sanitizeWorkflowForSharing(workflowWithCustomKey('{{OPENAI_API_KEY}}'), {
      preserveEnvVars: true,
    }) as any
    const shared = sanitizeWorkflowForSharing(workflowWithCustomKey('{{OPENAI_API_KEY}}')) as any

    expect(
      JSON.parse(exported.blocks.agent1.subBlocks.customModelConfig.value).credentials.apiKey
    ).toBe('{{OPENAI_API_KEY}}')
    expect(
      JSON.parse(shared.blocks.agent1.subBlocks.customModelConfig.value).credentials.apiKey
    ).toBeUndefined()
  })
})
