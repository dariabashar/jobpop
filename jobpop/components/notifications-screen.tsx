"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, BriefcaseIcon, DollarSign, MessageCircle, Settings, Trash2 } from "lucide-react"

const mockNotifications = [
  {
    id: "1",
    type: "job_match",
    title: "New Job Near You!",
    message: "Food delivery job available 0.5km away - $25/hour",
    time: "5 min ago",
    isRead: false,
    icon: BriefcaseIcon,
  },
  {
    id: "2",
    type: "payment",
    title: "Payment Received",
    message: "You received $40 for Event Setup Assistant job",
    time: "2 hours ago",
    isRead: false,
    icon: DollarSign,
  },
  {
    id: "3",
    type: "message",
    title: "New Message",
    message: "QuickEats Manager: Thanks for the great work!",
    time: "4 hours ago",
    isRead: true,
    icon: MessageCircle,
  },
  {
    id: "4",
    type: "job_update",
    title: "Job Status Update",
    message: "Your barista job has been confirmed for tomorrow",
    time: "1 day ago",
    isRead: true,
    icon: BriefcaseIcon,
  },
  {
    id: "5",
    type: "admin",
    title: "Account Verified",
    message: "Your identity verification has been approved",
    time: "2 days ago",
    isRead: true,
    icon: Bell,
  },
]

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(mockNotifications)

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif)))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((notif) => notif.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, isRead: true })))
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "job_match":
        return "text-[#457B9D]"
      case "payment":
        return "text-green-400"
      case "message":
        return "text-blue-400"
      case "job_update":
        return "text-yellow-400"
      case "admin":
        return "text-purple-400"
      default:
        return "text-gray-400"
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && <Badge className="bg-red-500">{unreadCount}</Badge>}
        </div>
        <div className="flex space-x-2">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-[#457B9D]">
              Mark all read
            </Button>
          )}
          <Button variant="ghost" size="sm" className="text-gray-400">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No notifications</h3>
              <p className="text-gray-400">You're all caught up!</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => {
            const Icon = notification.icon
            return (
              <Card
                key={notification.id}
                className={`bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-700/50 ${
                  !notification.isRead ? "ring-1 ring-[#457B9D]/30" : ""
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full bg-gray-700 ${getNotificationColor(notification.type)}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold ${!notification.isRead ? "text-white" : "text-gray-300"}`}>
                          {notification.title}
                        </h3>
                        {!notification.isRead && <div className="w-2 h-2 bg-[#457B9D] rounded-full" />}
                      </div>

                      <p className={`text-sm ${!notification.isRead ? "text-gray-300" : "text-gray-400"} mb-2`}>
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{notification.time}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
