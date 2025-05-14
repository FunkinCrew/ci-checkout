import * as core from '@actions/core'
import * as coreCommand from '@actions/core/lib/command'
import * as gitSourceProvider from './git-source-provider'
import * as inputHelper from './input-helper'
import * as path from 'path'
import * as stateHelper from './state-helper'
import type {IGitSourceSettings} from './git-source-settings'

async function run(sourceSettings: IGitSourceSettings): Promise<void> {
  try {
    try {
      // Register problem matcher
      coreCommand.issueCommand(
        'add-matcher',
        {},
        path.join(__dirname, 'problem-matcher.json')
      )

      // Get sources
      await gitSourceProvider.getSource(sourceSettings)
      core.setOutput('ref', sourceSettings.ref)
    } finally {
      // Unregister problem matcher
      coreCommand.issueCommand('remove-matcher', {owner: 'checkout-git'}, '')
    }
  } catch (error) {
    core.setFailed(`${(error as Error)?.message ?? error}`)
  }
}

async function cleanup(sourceSettings: IGitSourceSettings): Promise<void> {
  try {
    await gitSourceProvider.cleanup(sourceSettings, stateHelper.RepositoryPath)
  } catch (error) {
    core.warning(`${(error as Error)?.message ?? error}`)
  }
}

const main = async (): Promise<void> => {
  const sourceSettings = await inputHelper.getInputs()

  // Actual action run
  if (!stateHelper.IsPost) {
    void run(sourceSettings)
  }
  // Post-action cleanup
  else {
    void cleanup(sourceSettings)
  }
}

void main()
