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
} from 'konsta/react'
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Chat() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    { type: 'received', text: 'Hello!' },
    { type: 'sent', text: 'Hi, how are you?' },
    { type: 'received', text: 'I am good. How about you?' },
    { type: 'sent', text: 'I am fine. Thanks for asking!' },
  ])

  const router = useRouter()

  function sendMessage() {
    setMessages([...messages, { type: 'sent', text: message }])
    setMessage('')
  }

  return (
    <App theme="ios">
      <Page>
        <Navbar
          title="Chat"
          large
          transparent
          centerTitle
          left={<NavbarBackLink text="" onClick={() => router.push("/")} />}
        />
        <BlockTitle large>{router.query.chatID}</BlockTitle>

        <Block>
          {messages.map((message, index) => (
            <Card raised key={index}>
              {message.text}
            </Card>
          ))}
        </Block>
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
            <Button onClick={sendMessage}>Send Ether</Button>
          </List>
        </Block>

        <Tabbar className="fixed bottom-0 left-0"></Tabbar>
      </Page>
    </App>
  )
}
