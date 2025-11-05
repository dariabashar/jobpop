"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Flag, Phone, MoreVertical } from "lucide-react"

const mockChats = [
  {
    id: "1",
    name: "QuickEats Manager",
    lastMessage: "Thanks for accepting the delivery job!",
    time: "2 min ago",
    unread: 2,
    jobTitle: "Food Delivery Driver",
  },
  {
    id: "2",
    name: "EventPro Team",
    lastMessage: "Event starts at 9 AM sharp",
    time: "1 hour ago",
    unread: 0,
    jobTitle: "Event Setup Assistant",
  },
]

const mockMessages = [
  {
    id: "1",
    sender: "employer",
    message: "Hi! Thanks for accepting the food delivery job.",
    time: "10:30 AM",
  },
  {
    id: "2",
    sender: "user",
    message: "Hi! Happy to help. What time should I start?",
    time: "10:32 AM",
  },
  {
    id: "3",
    sender: "employer",
    message: "Please arrive at 2 PM. The restaurant address is 123 Main St.",
    time: "10:35 AM",
  },
  {
    id: "4",
    sender: "user",
    message: "Perfect! I'll be there at 2 PM.",
    time: "10:36 AM",
  },
]

const quickReplies = ["On my way!", "Running 5 minutes late", "Job completed", "Need help"]

export default function ChatScreen() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log("Sending message:", newMessage)
      setNewMessage("")
    }
  }

  if (!selectedChat) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">Messages</h1>

        {mockChats.map((chat) => (
          <Card
            key={chat.id}
            className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-700/50"
            onClick={() => setSelectedChat(chat.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#457B9D] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{chat.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{chat.name}</h3>
                    <p className="text-xs text-gray-400">{chat.jobTitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{chat.time}</p>
                  {chat.unread > 0 && <Badge className="bg-red-500 text-xs mt-1">{chat.unread}</Badge>}
                </div>
              </div>
              <p className="text-gray-300 text-sm truncate">{chat.lastMessage}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const currentChat = mockChats.find((chat) => chat.id === selectedChat)

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => setSelectedChat(null)} className="text-[#457B9D]">
              ← Back
            </Button>
            <div>
              <h2 className="font-semibold text-white">{currentChat?.name}</h2>
              <p className="text-xs text-gray-400">{currentChat?.jobTitle}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="text-gray-400">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {mockMessages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.sender === "user" ? "bg-[#457B9D] text-white" : "bg-gray-700 text-white"
              }`}
            >
              <p className="text-sm">{message.message}</p>
              <p className="text-xs opacity-70 mt-1">{message.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Replies */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex space-x-2 mb-3 overflow-x-auto">
          {quickReplies.map((reply) => (
            <Button
              key={reply}
              variant="outline"
              size="sm"
              onClick={() => setNewMessage(reply)}
              className="whitespace-nowrap border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              {reply}
            </Button>
          ))}
        </div>

        {/* Message Input */}
        <div className="flex space-x-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="bg-gray-700 border-gray-600 text-white"
          />
          <Button onClick={handleSendMessage} className="bg-[#457B9D] hover:bg-[#457B9D]/80">
            <Send className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10 bg-transparent">
            <Flag className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
