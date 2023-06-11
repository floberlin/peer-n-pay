import { useCallback, useEffect, useState } from 'react'
import { Magic } from 'magic-sdk'
import { App, Page, Navbar, Button, Block, BlockTitle, List, ListItem, Toggle, Fab } from 'konsta/react'
import router from 'next/router'
import * as PushAPI from '@pushprotocol/restapi'
import { createWalletClient, custom } from 'viem'
import { mainnet, optimism, optimismGoerli } from 'viem/chains'
import { PlusIcon } from '@heroicons/react/24/solid'

function Main() {
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [magic, setMagic] = useState(null)
  const [address, setAddress] = useState(null)

  async function login() {
    setIsLoggingIn(true)

    const customNodeOptions = {
      rpcUrl: 'https://goerli.optimism.io',
      chainId: 420,

      // rpcUrl: 'https://filecoin.chainup.net/rpc/v1', // FileCoin testnet
      // chainId: 314, // FileCoin testnet
    }

    const magic =
      typeof window !== 'undefined' &&
      new Magic('pk_live_36461EAC7CC079EA', {
        network: customNodeOptions,
      })
    const accounts = await magic?.wallet?.connectWithUI()
    setAddress(accounts?.[0])
    const client = createWalletClient({
      chain: optimismGoerli,
      transport: custom(magic.rpcProvider),
    }) //getSigner

    const [address] = await client.getAddresses()
    console.log(address)

    // const user = await PushAPI.user.create({ signer: client as any, env: 'staging' as any })

    // console.log(user)
  }

  useEffect(() => {
    login()
  }, [])

  return (
    <App theme="ios">
      <Page>
        <Navbar title="Peer'n'Pay" large transparent centerTitle />

        {address ? (
          <>
            <BlockTitle large>Account</BlockTitle>
            <BlockTitle>{address}</BlockTitle>
            <BlockTitle large>Chats</BlockTitle>
            <List strong inset>
              <ListItem href="/chats/bla.eth" title="bla.eth" onClick={() => router.push('/chats/bla.eth')} />
              <ListItem href="/chats/ekjfnewng.eth" title="12345.eth" onClick={() => router.push('/chats/12345.eth')} />
              <ListItem
                href="/chats/0xdD3a4b2dB6fAc1917606e8C527D3293a0D33CE53"
                title="0xdD3a4b2dB6fAc1917606e8C527D3293a0D33CE53"
                onClick={() => router.push('/chats/0xdD3a4b2dB6fAc1917606e8C527D3293a0D33CE53')}
              />
            </List>
            <Fab className="fixed z-20 right-4-safe bottom-4-safe" icon={<PlusIcon />} />
          </>
        ) : (
          <div className="grid grid-cols-3">
            <div>
              <Button large rounded onClick={login}>
                Log In
              </Button>
            </div>
          </div>
        )}
      </Page>
    </App>
  )
}

export default Main
