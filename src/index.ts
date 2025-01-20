import { EventHandler } from './event-handler'
import { TonApiClient } from '@ton-api/client'
import { Address } from '@ton/core'

const main = async () => {
  const eventHandler = new EventHandler(
    new TonApiClient({ baseUrl: 'https://testnet.tonapi.io' }),
    Address.parse('kQAFQ5LvZ9Saj0y6Xx2WVhXuMsyFMBBG3ez33g37nENWzlRL'),
  )
  eventHandler.start()
}

main()
