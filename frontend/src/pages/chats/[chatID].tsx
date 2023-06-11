import { App, Page, Navbar, Link, BlockTitle, Block, Tabbar } from 'konsta/react'
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
        <Navbar title="Chat" large transparent centerTitle />
        <BlockTitle large>{router.query.chatID}</BlockTitle>

        <Block>
          {messages.map((message, index) => (
            <div key={index} className={message.type === 'sent' ? 'sent' : 'received'}>
              <p>{message.text}</p>
            </div>
          ))}
          <div>
            <input type="text" value={message} onChange={e => setMessage(e.target.value)} />
            <button onClick={sendMessage}>Send</button>
          </div>
        </Block>
        <Tabbar className="fixed bottom-0 left-0"></Tabbar>
      </Page>
    </App>
  )
}
