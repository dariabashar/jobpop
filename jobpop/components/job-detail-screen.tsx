"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Users,
  Zap,
  Shield,
  Calendar,
  MessageCircle,
  Heart,
  Share2,
  CheckCircle,
  Building,
  Award,
} from "lucide-react"

const mockJobDetail = {
  id: "1",
  title: "Food Delivery Driver",
  company: "QuickEats",
  companyLogo: "/placeholder.svg?height=60&width=60",
  pay: 25,
  location: "Downtown",
  fullAddress: "123 Main Street, Downtown District",
  duration: "3 hours",
  category: "Delivery",
  description:
    "Join our team of delivery drivers and help bring delicious food to customers across the downtown area. This is a flexible opportunity perfect for students and part-time workers looking to earn extra income.",
  fullDescription:
    "We're looking for reliable delivery drivers to join our growing team. You'll be responsible for picking up orders from restaurants and delivering them to customers in a timely and professional manner. This role offers flexible scheduling and competitive pay, making it perfect for students, part-time workers, or anyone looking to supplement their income.",
  image: "/placeholder.svg?height=300&width=400",
  distance: "0.5 km",
  rating: 4.8,
  totalReviews: 156,
  applicants: 12,
  urgency: "high" as const,
  requirements: [
    "Own vehicle (car, motorcycle, or bicycle)",
    "Valid driver's license",
    "Smartphone with GPS",
    "Good communication skills",
    "Reliable and punctual",
    "Customer service experience (preferred)",
  ],
  responsibilities: [
    "Pick up food orders from partner restaurants",
    "Deliver orders to customers safely and on time",
    "Handle cash and card payments when required",
    "Maintain professional appearance and attitude",
    "Follow all traffic laws and safety protocols",
    "Communicate with customers about delivery status",
  ],
  benefits: [
    "Flexible scheduling",
    "Competitive hourly rate + tips",
    "Fuel allowance provided",
    "Performance bonuses available",
    "Insurance coverage during work hours",
    "Career advancement opportunities",
  ],
  schedule: {
    date: "Tomorrow, Jan 21",
    startTime: "2:00 PM",
    endTime: "5:00 PM",
    timezone: "EST",
  },
  employer: {
    name: "Sarah Johnson",
    title: "Operations Manager",
    rating: 4.9,
    jobsPosted: 45,
    responseTime: "Usually responds within 1 hour",
    verified: true,
  },
  tags: ["Flexible", "Tips Included", "Same Day Pay", "Beginner Friendly"],
}

export default function JobDetailScreen() {
  const [isSaved, setIsSaved] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-500 text-white"
      case "medium":
        return "bg-yellow-500 text-white"
      case "low":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1e3a5f]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0D1B2A]/95 backdrop-blur-sm border-b border-gray-700">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" className="text-white">
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </Button>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setIsSaved(!isSaved)} className="text-white">
              <Heart className={`w-5 h-5 ${isSaved ? "fill-current text-red-500" : ""}`} />
            </Button>
            <Button variant="ghost" size="sm" className="text-white">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Hero Image */}
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src={mockJobDetail.image || "/placeholder.svg"}
            alt={mockJobDetail.title}
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Overlays */}
          <Badge className={`absolute top-4 left-4 ${getUrgencyColor(mockJobDetail.urgency)} font-semibold`}>
            <Zap className="w-3 h-3 mr-1" />
            {mockJobDetail.urgency.toUpperCase()} PRIORITY
          </Badge>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={mockJobDetail.companyLogo || "/placeholder.svg"}
                  alt={mockJobDetail.company}
                  className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                />
                <div>
                  <h1 className="text-2xl font-bold text-white">{mockJobDetail.title}</h1>
                  <p className="text-[#457B9D] font-semibold">{mockJobDetail.company}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Info Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-400">${mockJobDetail.pay}</div>
              <p className="text-green-300 text-sm">per job</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-blue-400">{mockJobDetail.duration}</div>
              <p className="text-blue-300 text-sm">duration</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center space-x-1 text-yellow-400 mb-1">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold">{mockJobDetail.rating}</span>
                </div>
                <p className="text-xs text-gray-400">{mockJobDetail.totalReviews} reviews</p>
              </div>
              <div>
                <div className="flex items-center justify-center space-x-1 text-[#457B9D] mb-1">
                  <Users className="w-4 h-4" />
                  <span className="font-bold">{mockJobDetail.applicants}</span>
                </div>
                <p className="text-xs text-gray-400">applicants</p>
              </div>
              <div>
                <div className="flex items-center justify-center space-x-1 text-purple-400 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="font-bold">{mockJobDetail.distance}</span>
                </div>
                <p className="text-xs text-gray-400">away</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Calendar className="w-5 h-5 mr-2 text-[#457B9D]" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Date</span>
              <span className="text-white font-semibold">{mockJobDetail.schedule.date}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Time</span>
              <span className="text-white font-semibold">
                {mockJobDetail.schedule.startTime} - {mockJobDetail.schedule.endTime}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Location</span>
              <span className="text-white font-semibold">{mockJobDetail.location}</span>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Job Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300 leading-relaxed">
              {showFullDescription ? mockJobDetail.fullDescription : mockJobDetail.description}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-[#457B9D] hover:bg-[#457B9D]/10 p-0"
            >
              {showFullDescription ? "Show Less" : "Read More"}
            </Button>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
              Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockJobDetail.requirements.map((req, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#457B9D] rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-300">{req}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Award className="w-5 h-5 mr-2 text-yellow-400" />
              Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {mockJobDetail.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Employer Info */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Building className="w-5 h-5 mr-2 text-[#457B9D]" />
              About the Employer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#457B9D] rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{mockJobDetail.employer.name.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-white">{mockJobDetail.employer.name}</h4>
                  {mockJobDetail.employer.verified && <Shield className="w-4 h-4 text-green-400" />}
                </div>
                <p className="text-gray-400 text-sm">{mockJobDetail.employer.title}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex items-center space-x-1 text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-semibold">{mockJobDetail.employer.rating}</span>
                </div>
                <p className="text-gray-400">Employer rating</p>
              </div>
              <div>
                <p className="text-white font-semibold">{mockJobDetail.employer.jobsPosted}</p>
                <p className="text-gray-400">Jobs posted</p>
              </div>
            </div>

            <p className="text-gray-300 text-sm">{mockJobDetail.employer.responseTime}</p>
          </CardContent>
        </Card>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {mockJobDetail.tags.map((tag, index) => (
            <Badge key={index} className="bg-[#457B9D]/20 text-[#457B9D] border-[#457B9D]/30">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-0 bg-[#0D1B2A]/95 backdrop-blur-sm border-t border-gray-700 p-4">
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex-1 border-[#457B9D] text-[#457B9D] hover:bg-[#457B9D]/10 bg-transparent"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
          <Button className="flex-1 bg-gradient-to-r from-[#457B9D] to-[#5a9bd4] hover:from-[#5a9bd4] hover:to-[#457B9D]">
            Apply Now
          </Button>
        </div>
      </div>
    </div>
  )
}
