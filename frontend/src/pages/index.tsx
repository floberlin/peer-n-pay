import { useCallback, useEffect, useState } from 'react'
import { Magic } from 'magic-sdk'
import { App, Page, Navbar, Button, Block, BlockTitle, List, ListItem, Toggle, Fab, ListInput } from 'konsta/react'
import router from 'next/router'
import * as PushAPI from '@pushprotocol/restapi'
import { createWalletClient, custom } from 'viem'
import { mainnet, optimism, optimismGoerli, sepolia } from 'viem/chains'
import { PlusIcon } from '@heroicons/react/24/solid'
import { Input } from 'postcss'

function Main() {
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [magic, setMagic] = useState(null)
  const [address, setAddress] = useState(null)

  const [recipient, setRecipient] = useState('')
  const [recipients, setRecipients] = useState([
    { rec: 'vitalik.eth' },
    { rec: 'tanrikulu.eth' },
    { rec: '0xd7bF9A6e3b1702C14cF4f2638688a772f97d150f' },
    { rec: '0xd7bF9A6e3b1702C14cF4f2638688a772f97d150f' },
    { rec: '0x9C838949427022610ab4D4fbe6EDC9e6dD83b2D8' },
  ])

  function newRecipient() {
    setRecipients([...recipients, { rec: recipient }])
    setRecipient('')
  }

  async function login() {
    setIsLoggingIn(true)

    const customNodeOptions = {
      rpcUrl: 'https://rpc2.sepolia.org/', // Sepolia Testnet RPC URL
      chainId: 11155111, // Sepolia Testnet Chain id

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
      chain: sepolia,
      transport: custom(magic.rpcProvider),
    }) //getSigner

    const [address] = await client.getAddresses()
    console.log(address)

    //! Need to figure out how to do the user onboaring stuff and also check weather the user is already registered or not
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
            {/* maybe add balance and ENS name/avatar if any is used */}
            <BlockTitle large>Chats</BlockTitle>
            <List strong inset>
              {recipients.map((recipient, index) => (
                <ListItem
                  href={`/chats/${address}/${recipient.rec}`}
                  key={index}
                  title={recipient.rec as string}
                  onClick={() => router.push(`/chats/${address}/${recipient.rec}`)} //! workaround for ios native routing
                />
              ))}
            </List>
            <Block>
              <ListInput
                outline
                label="Add new recipient"
                floatingLabel
                type="text"
                value={recipient}
                onChange={e => setRecipient((e as any).target.value)}
              />
              <Fab
                className="fixed left-1/2 z-20 -translate-x-1/2 transform bottom-4-safe"
                icon={<PlusIcon />}
                onClick={() => newRecipient()}
              />
            </Block>
          </>
        ) : (
          <div className="grid grid-cols-3">
            <div>
              <Block className="mt-28">
                <Button large rounded onClick={login} className="mb-28">
                  Log In
                </Button>
              </Block>
            </div>
          </div>
        )}
      </Page>
    </App>
  )
}

export default Main
