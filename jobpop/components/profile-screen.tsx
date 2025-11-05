"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Edit, Star, Shield, Award, MapPin, Calendar } from "lucide-react"

const mockProfile = {
  name: "Alex Johnson",
  avatar: "/placeholder.svg?height=100&width=100",
  location: "Downtown, City",
  joinDate: "January 2024",
  rating: 4.8,
  totalJobs: 23,
  badges: ["Reliable", "Fast", "Communicator"],
  skills: ["Delivery", "Customer Service", "Event Setup"],
  isVerified: true,
}

const mockJobHistory = [
  {
    id: "1",
    title: "Food Delivery Driver",
    company: "QuickEats",
    rating: 5,
    review: "Great job! Very punctual and professional.",
    date: "2025-01-15",
  },
  {
    id: "2",
    title: "Event Setup Assistant",
    company: "EventPro",
    rating: 5,
    review: "Excellent work ethic and attention to detail.",
    date: "2025-01-10",
  },
]

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState(mockProfile)

  const handleSave = () => {
    console.log("Saving profile:", editedProfile)
    setIsEditing(false)
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Button
          variant="outline"
          onClick={() => setIsEditing(!isEditing)}
          className="border-[#457B9D] text-[#457B9D] hover:bg-[#457B9D]/10"
        >
          <Edit className="w-4 h-4 mr-1" />
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </div>

      {/* Profile Header */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <img
                src={mockProfile.avatar || "/placeholder.svg"}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
              {mockProfile.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={editedProfile.name}
                  onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white mb-2"
                />
              ) : (
                <h2 className="text-xl font-bold text-white">{mockProfile.name}</h2>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{mockProfile.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {mockProfile.joinDate}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center space-x-1 text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-semibold">{mockProfile.rating}</span>
              </div>
              <p className="text-xs text-gray-400">Rating</p>
            </div>
            <div>
              <p className="font-semibold text-white">{mockProfile.totalJobs}</p>
              <p className="text-xs text-gray-400">Jobs Completed</p>
            </div>
            <div>
              <p className="font-semibold text-green-400">100%</p>
              <p className="text-xs text-gray-400">Success Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {mockProfile.badges.map((badge) => (
              <Badge key={badge} className="bg-[#457B9D]">
                {badge}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-2">
              {editedProfile.skills.map((skill, index) => (
                <Input
                  key={index}
                  value={skill}
                  onChange={(e) => {
                    const newSkills = [...editedProfile.skills]
                    newSkills[index] = e.target.value
                    setEditedProfile({ ...editedProfile, skills: newSkills })
                  }}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setEditedProfile({
                    ...editedProfile,
                    skills: [...editedProfile.skills, ""],
                  })
                }
                className="border-[#457B9D] text-[#457B9D]"
              >
                Add Skill
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {mockProfile.skills.map((skill) => (
                <Badge key={skill} variant="outline" className="border-gray-600 text-gray-300">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockJobHistory.map((job) => (
            <div key={job.id} className="border-b border-gray-700 pb-4 last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-white">{job.title}</h4>
                  <p className="text-sm text-gray-400">{job.company}</p>
                </div>
                <div className="flex items-center space-x-1 text-yellow-400">
                  {Array.from({ length: job.rating }, (_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-1">"{job.review}"</p>
              <p className="text-xs text-gray-400">{job.date}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {isEditing && (
        <Button onClick={handleSave} className="w-full bg-[#457B9D] hover:bg-[#457B9D]/80">
          Save Changes
        </Button>
      )}
    </div>
  )
}
