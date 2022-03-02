import { AbstractConnector } from '@web3-react/abstract-connector'
import { ConnectorUpdate } from '@web3-react/types'

interface TorusConnectorArguments {
  chainId: string | number
  initOptions: any
  constructorOptions?: any
  loginOptions?: any
}

export class TorusConnector extends AbstractConnector {
  private readonly chainId: string | number
  private readonly initOptions: any
  private readonly constructorOptions: any
  private readonly loginOptions: any

  public torus: any

  constructor({ chainId, initOptions = {}, constructorOptions = {}, loginOptions = {} }: TorusConnectorArguments) {
    super({ supportedChainIds: [Number(chainId)] })

    this.chainId = chainId
    this.initOptions = initOptions
    this.constructorOptions = constructorOptions
    this.loginOptions = loginOptions
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (!this.torus) {
      const Torus = await import('@toruslabs/casper-embed').then(m => m?.default ?? m)
      this.torus = new Torus(this.constructorOptions)
      await this.torus.init(this.initOptions)
    }

    const account = await this.torus.login(this.loginOptions).then((accounts: string[]): string => accounts[0])

    return { provider: this.torus.provider, account }
  }

  public async getProvider(): Promise<any> {
    return this.torus.provider
  }

  public async getChainId(): Promise<number | string> {
    return this.chainId
  }

  public async getAccount(): Promise<null | string> {
    return this.torus.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]): string => accounts[0])
  }

  public async deactivate() {}

  public async close() {
    await this.torus.cleanUp()
    this.torus = undefined
    this.emitDeactivate()
  }
}
