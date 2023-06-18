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
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Magic } from 'magic-sdk'
import Web3 from 'web3'
import { createSocketConnection, EVENTS } from '@pushprotocol/socket'
import { AvatarResolver, utils as avtUtils } from '@ensdomains/ens-avatar'
import { StaticJsonRpcProvider } from '@ethersproject/providers'
import * as PushAPI from '@pushprotocol/restapi'
import { ethers } from 'ethers'

const provider = new StaticJsonRpcProvider('https://eth.llamarpc.com')

export default function Chat() {
  const [avatar, setAvatar] = useState('https://i.ibb.co/pWV8kfr/Screenshot-2023-06-14-at-00-17-05.png')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    // { type: 'received', text: 'Hello!' },
    // { type: 'sent', text: 'Hi, how are you?' },
    // { type: 'received', text: 'I am good. How about you?' },
    // { type: 'sent', text: 'I am fine. Thanks for asking!' },
  ]) // just some dummy messages

  async function sendMessage() {
    // pre-requisite API calls that should be made before
    // need to get user and through that encryptedPvtKey of the user
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

    const signer = new ethers.providers.Web3Provider(magicProvider).getSigner()

    const user = await PushAPI.user.get({
      account: `eip155:${chatID?.[0]}`, // Not CAIP-10 format
    })

    setMessages([...messages, { type: 'sent', text: message }])
    setMessage('')

    if (!user?.encryptedPrivateKey) return

    // need to decrypt the encryptedPvtKey to pass in the api using helper function
    const pgpDecryptedPvtKey = await PushAPI.chat.decryptPGPKey({
      encryptedPGPPrivateKey: user.encryptedPrivateKey,
      signer,
    })

    // actual api
    const response = await PushAPI.chat.send({
      messageContent: message,
      messageType: 'Text', // can be "Text" | "Image" | "File" | "GIF"
      receiverAddress: 'eip155:0x0F1AAC847B5720DDf01BFa07B7a8Ee641690816d',
      signer,
      pgpPrivateKey: pgpDecryptedPvtKey,
    })
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
    const destination = chatID?.[1].includes('.eth') ? await provider.resolveName(chatID?.[1]) : chatID?.[1]

    console.log('test', destination)

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

  async function fetchMessages() {
    // pre-requisite API calls that should be made before
    // need to get user and through that encryptedPvtKey of the user
    const user = await PushAPI.user.get({
      account: `eip155:${chatID?.[0]}`, // Not CAIP-10 format
    })

    const customNodeOptions = {
      rpcUrl: 'https://rpc2.sepolia.org/', // Sepolia Testnet RPC URL
      chainId: 11155111, // Sepolia Testnet Chain id
    }

    const magic = new Magic('pk_live_36461EAC7CC079EA', {
      network: customNodeOptions,
    })

    const magicProvider = await magic.wallet.getProvider()

    const signer = new ethers.providers.Web3Provider(magicProvider).getSigner()

    console.log('user', user)

    if (!user?.encryptedPrivateKey) return

    // need to decrypt the encryptedPvtKey to pass in the api using helper function
    const pgpDecryptedPvtKey = await PushAPI.chat.decryptPGPKey({
      encryptedPGPPrivateKey: user.encryptedPrivateKey,
      signer,
    })

    // get threadhash, this will fetch the latest conversation hash
    // you can also use older conversation hash (called link) by iterating over to fetch more historical messages
    // conversation hash are also called link inside chat messages
    const conversationHash = await PushAPI.chat.conversationHash({
      account: `eip155:${chatID?.[0]}`, // Not CAIP-10 format
      conversationId: 'eip155:0x0F1AAC847B5720DDf01BFa07B7a8Ee641690816d', // receiver's address or chatId of a group
    })

    // actual api
    const chatHistory = await PushAPI.chat.history({
      threadhash: conversationHash.threadHash,
      account: `eip155:${chatID?.[0]}`, // Not CAIP-10 format
      limit: 2,
      toDecrypt: true,
      pgpPrivateKey: pgpDecryptedPvtKey,
    })
  }

  useEffect(() => {
    fetchMessages()
  }, [])

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
