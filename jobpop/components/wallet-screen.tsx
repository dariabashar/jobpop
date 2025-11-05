"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, Plus, Eye, EyeOff } from "lucide-react"

const mockTransactions = [
  {
    id: "1",
    type: "earned",
    amount: 25,
    description: "Food Delivery - QuickEats",
    date: "2025-01-20",
    status: "completed",
  },
  {
    id: "2",
    type: "earned",
    amount: 40,
    description: "Event Setup - EventPro",
    date: "2025-01-18",
    status: "completed",
  },
  {
    id: "3",
    type: "withdrawal",
    amount: -50,
    description: "Withdrawal to Kaspi Card",
    date: "2025-01-15",
    status: "processing",
  },
  {
    id: "4",
    type: "earned",
    amount: 18,
    description: "Barista - Bean There",
    date: "2025-01-12",
    status: "completed",
  },
]

const mockCards = [
  {
    id: "1",
    type: "Kaspi Card",
    last4: "4321",
    isDefault: true,
  },
  {
    id: "2",
    type: "Mastercard",
    last4: "8765",
    isDefault: false,
  },
]

export default function WalletScreen() {
  const [balance, setBalance] = useState(133)
  const [showBalance, setShowBalance] = useState(true)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [showWithdrawForm, setShowWithdrawForm] = useState(false)

  const handleWithdraw = () => {
    if (withdrawAmount && Number.parseFloat(withdrawAmount) <= balance) {
      console.log("Withdrawing:", withdrawAmount)
      setShowWithdrawForm(false)
      setWithdrawAmount("")
    }
  }

  const getTransactionIcon = (type: string) => {
    return type === "earned" ? ArrowDownLeft : ArrowUpRight
  }

  const getTransactionColor = (type: string) => {
    return type === "earned" ? "text-green-400" : "text-red-400"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "processing":
        return "bg-yellow-500"
      case "failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Wallet</h1>

      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-[#457B9D] to-[#0D1B2A] border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Wallet className="w-6 h-6 text-white" />
              <span className="text-white font-medium">Current Balance</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
              className="text-white hover:bg-white/10"
            >
              {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>

          <div className="text-3xl font-bold text-white mb-4">{showBalance ? `$${balance}` : "****"}</div>

          <div className="flex space-x-3">
            <Button
              onClick={() => setShowWithdrawForm(true)}
              className="flex-1 bg-white text-[#0D1B2A] hover:bg-gray-100"
            >
              <ArrowUpRight className="w-4 h-4 mr-1" />
              Withdraw
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
              <Plus className="w-4 h-4 mr-1" />
              Add Funds
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Withdraw Form */}
      {showWithdrawForm && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Withdraw Funds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                max={balance}
              />
              <p className="text-xs text-gray-400 mt-1">Available: ${balance}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Withdraw to</label>
              <div className="space-y-2">
                {mockCards.map((card) => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600"
                  >
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-white font-medium">{card.type}</p>
                        <p className="text-gray-400 text-sm">**** {card.last4}</p>
                      </div>
                    </div>
                    {card.isDefault && <Badge className="bg-[#457B9D]">Default</Badge>}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleWithdraw}
                className="flex-1 bg-[#457B9D] hover:bg-[#457B9D]/80"
                disabled={!withdrawAmount || Number.parseFloat(withdrawAmount) > balance}
              >
                Withdraw ${withdrawAmount || "0"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowWithdrawForm(false)}
                className="border-gray-600 text-gray-400"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Linked Cards */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Linked Cards</span>
            <Button variant="ghost" size="sm" className="text-[#457B9D]">
              <Plus className="w-4 h-4 mr-1" />
              Add Card
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockCards.map((card) => (
            <div key={card.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-white font-medium">{card.type}</p>
                  <p className="text-gray-400 text-sm">**** {card.last4}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {card.isDefault && <Badge className="bg-[#457B9D]">Default</Badge>}
                <Button variant="ghost" size="sm" className="text-gray-400">
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockTransactions.map((transaction) => {
            const Icon = getTransactionIcon(transaction.type)
            return (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-full ${transaction.type === "earned" ? "bg-green-500/20" : "bg-red-500/20"}`}
                  >
                    <Icon className={`w-4 h-4 ${getTransactionColor(transaction.type)}`} />
                  </div>
                  <div>
                    <p className="text-white font-medium">{transaction.description}</p>
                    <p className="text-gray-400 text-sm">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                    {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount)}
                  </p>
                  <Badge className={`text-xs ${getStatusColor(transaction.status)}`}>{transaction.status}</Badge>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
