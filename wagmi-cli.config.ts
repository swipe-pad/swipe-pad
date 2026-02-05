import { defineConfig } from '@wagmi/cli'
import { foundry } from '@wagmi/cli/plugins'

export default defineConfig({
    out: 'src/types/contracts.ts',
    plugins: [
        foundry({
            project: 'contracts',
            include: ['*.sol/*.json'],
        }),
    ],
})
