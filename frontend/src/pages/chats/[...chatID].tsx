import {
  App,
  Page,
  Navbar,
  Link,
  BlockTitle,
  Block,
  Tabbar,
  Card,
  List,
  ListInput,
  Button,
  NavbarBackLink,
  Chip,
} from 'konsta/react'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { Magic } from 'magic-sdk'
import Web3 from 'web3'
import { useBalance } from 'wagmi'
import { createSocketConnection, EVENTS } from '@pushprotocol/socket'
import { AvatarResolver, utils as avtUtils } from '@ensdomains/ens-avatar'
import { StaticJsonRpcProvider } from '@ethersproject/providers'

const provider = new StaticJsonRpcProvider('https://eth.llamarpc.com')

export default function Chat() {
  const [avatar, setAvatar] = useState('https://i.ibb.co/pWV8kfr/Screenshot-2023-06-14-at-00-17-05.png')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    { type: 'received', text: 'Hello!' },
    { type: 'sent', text: 'Hi, how are you?' },
    { type: 'received', text: 'I am good. How about you?' },
    { type: 'sent', text: 'I am fine. Thanks for asking!' },
  ]) // just some dummy messages

  function sendMessage() {
    setMessages([...messages, { type: 'sent', text: message }])
    setMessage('')
  }

  const router = useRouter()
  const chatID = router.query.chatID

  async function getAvatar() {
    try {
      const customNodeOptions = {
        rpcUrl: 'https://rpc2.sepolia.org/', // Sepolia Testnet RPC URL
        chainId: 11155111, // Sepolia Testnet Chain id

        // rpcUrl: 'https://filecoin.chainup.net/rpc/v1', // FileCoin testnet
        // chainId: 314, // FileCoin testnet
      }
      const magic = new Magic('pk_live_36461EAC7CC079EA', {
        network: customNodeOptions,
      })
      const magicProvider = await magic.wallet.getProvider()
      const avt = new AvatarResolver(provider)
      const avatarURI = await avt.getAvatar(chatID?.[1], {
        /* jsdomWindow: jsdom (on nodejs) */
      })
      if (avatarURI) setAvatar(avatarURI)
    } catch (e) {
      console.log(e)
    }
  }

  async function sendEther() {

    console.log("test2", chatID?.[1])
    const customNodeOptions = {
      rpcUrl: 'https://rpc2.sepolia.org/', // Sepolia Testnet RPC URL
      chainId: 11155111, // Sepolia Testnet Chain id

      // rpcUrl: 'https://filecoin.chainup.net/rpc/v1', // FileCoin testnet
      // chainId: 314, // FileCoin testnet
    }
    const magic = new Magic('pk_live_36461EAC7CC079EA', {
      network: customNodeOptions,
    })
    const magicProvider = await magic.wallet.getProvider()
    const web3 = new Web3(magicProvider)
    const accounts = await magic.wallet.connectWithUI()

    // ⭐️ After user is successfully authenticated
    const destination = chatID?.[1].includes('.eth')
      ? await provider.resolveName(chatID?.[1])
      : chatID?.[1]

      console.log("test", destination)

    const amount = Number(message)

    //Submit transaction to the blockchain
    const tx = web3.eth.sendTransaction({
      from: accounts[0],
      to: destination as any,
      value: amount * 1e18,
    })

    // Wait for transaction to be mined
    const receipt = await tx
    console.log(receipt)
  }

  const pushSDKSocket = createSocketConnection({
    user: `eip155:${chatID?.[0]}`, // Not CAIP-10 format
    env: 'staging' as any,
    socketType: 'chat',
    socketOptions: { autoConnect: true, reconnectionAttempts: 3 },
  })

  pushSDKSocket?.on(EVENTS.CHAT_RECEIVED_MESSAGE, message =>
    setMessages([...messages, { type: 'received', text: message }])
  )

  // const { data:balanceWallet } = useBalance(accounts[0]])
  return (
    <App theme="ios">
      <Page>
        <Navbar
          title="Chat"
          large
          transparent
          centerTitle
          left={<NavbarBackLink text="" onClick={() => router.push('/')} />}
        />
        <BlockTitle large className="pb-4">
          {chatID?.[1]}
        </BlockTitle>

        {/* <Block> */}
        {messages.map((message, index) => (
          <Card raised key={index} className={message.type === 'sent' && 'grid content-end'}>
            {message.type === 'received' ? (
              <Chip
                className="m-0.5"
                media={
                  <img
                    alt="avatar"
                    className="rounded-full material:h-6 ios:h-7"
                    src={getAvatar() && avatar}
                    width={40}
                    height={40}
                  />
                }
              >
                {chatID?.[1]}
              </Chip>
            ) : (
              <Chip>Me</Chip>
            )}
            <p className="pt-4"> {message.text}</p>
          </Card>
        ))}
        {/* </Block> */}
        <Block>
          <List strongIos insetIos>
            <ListInput
              outline
              label="Write your Message"
              floatingLabel
              type="textarea"
              placeholder=""
              value={message}
              onChange={e => setMessage((e as any).target.value)}
            />
            <br />

            <Button onClick={sendMessage}>Send Message</Button>
            <br />
            <Button onClick={sendEther}>Send Ether</Button>
          </List>
        </Block>

        <Tabbar className="fixed bottom-0 left-0"></Tabbar>
      </Page>
    </App>
  )
}
