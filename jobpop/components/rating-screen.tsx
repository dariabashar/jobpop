"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Star, ThumbsUp, ThumbsDown, Award, MessageCircle } from "lucide-react"

interface RatingData {
  overall: number
  punctuality: number
  communication: number
  quality: number
  professionalism: number
}

const mockJobData = {
  id: "1",
  title: "Food Delivery Driver",
  company: "QuickEats",
  workerName: "Alex Johnson",
  employerName: "Sarah Johnson",
  completedDate: "2025-01-20",
  duration: "3 hours",
  pay: 25,
  isWorkerRating: true, // true if worker is rating employer, false if employer is rating worker
}

const ratingCategories = [
  { key: "overall", label: "Overall Experience", icon: Star },
  { key: "punctuality", label: "Punctuality", icon: Award },
  { key: "communication", label: "Communication", icon: MessageCircle },
  { key: "quality", label: "Work Quality", icon: ThumbsUp },
  { key: "professionalism", label: "Professionalism", icon: Award },
]

export default function RatingScreen() {
  const [ratings, setRatings] = useState<RatingData>({
    overall: 0,
    punctuality: 0,
    communication: 0,
    quality: 0,
    professionalism: 0,
  })
  const [review, setReview] = useState("")
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const positiveTags = [
    "Professional",
    "On Time",
    "Great Communication",
    "High Quality Work",
    "Friendly",
    "Reliable",
    "Exceeded Expectations",
    "Would Hire Again",
  ]

  const negativeTags = [
    "Late",
    "Poor Communication",
    "Unprofessional",
    "Low Quality",
    "Unreliable",
    "Rude",
    "Did Not Meet Expectations",
    "Would Not Recommend",
  ]

  const handleRatingChange = (category: keyof RatingData, rating: number) => {
    setRatings((prev) => ({ ...prev, [category]: rating }))
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleSubmit = () => {
    const ratingData = {
      ratings,
      review,
      wouldRecommend,
      tags: selectedTags,
      jobId: mockJobData.id,
    }
    console.log("Submitting rating:", ratingData)
    // Navigate back or show success message
  }

  const isComplete = ratings.overall > 0 && wouldRecommend !== null

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1e3a5f] p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-[#457B9D] bg-clip-text text-transparent">
          Rate Your Experience
        </h1>
        <p className="text-gray-300">
          Help others by sharing your experience with{" "}
          {mockJobData.isWorkerRating ? mockJobData.employerName : mockJobData.workerName}
        </p>
      </div>

      {/* Job Summary */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-white">{mockJobData.title}</h3>
              <p className="text-gray-400 text-sm">{mockJobData.company}</p>
            </div>
            <Badge className="bg-green-500">Completed</Badge>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-300">
            <div>
              <span className="text-gray-400">Date:</span>
              <p className="font-semibold">{mockJobData.completedDate}</p>
            </div>
            <div>
              <span className="text-gray-400">Duration:</span>
              <p className="font-semibold">{mockJobData.duration}</p>
            </div>
            <div>
              <span className="text-gray-400">Pay:</span>
              <p className="font-semibold text-green-400">${mockJobData.pay}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating Categories */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Rate Each Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {ratingCategories.map((category) => {
            const Icon = category.icon
            return (
              <div key={category.key} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Icon className="w-5 h-5 text-[#457B9D]" />
                  <span className="text-white font-medium">{category.label}</span>
                </div>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingChange(category.key as keyof RatingData, star)}
                      className="transition-all duration-200 hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= ratings[category.key as keyof RatingData]
                            ? "text-yellow-400 fill-current"
                            : "text-gray-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Recommendation */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">
            Would you recommend {mockJobData.isWorkerRating ? "this employer" : "this worker"}?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button
              variant={wouldRecommend === true ? "default" : "outline"}
              onClick={() => setWouldRecommend(true)}
              className={`flex-1 ${
                wouldRecommend === true
                  ? "bg-green-500 hover:bg-green-600"
                  : "border-green-500 text-green-500 hover:bg-green-500/10"
              }`}
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Yes, Recommend
            </Button>
            <Button
              variant={wouldRecommend === false ? "default" : "outline"}
              onClick={() => setWouldRecommend(false)}
              className={`flex-1 ${
                wouldRecommend === false
                  ? "bg-red-500 hover:bg-red-600"
                  : "border-red-500 text-red-500 hover:bg-red-500/10"
              }`}
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              No, Don't Recommend
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Quick Tags (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">Positive aspects:</p>
            <div className="flex flex-wrap gap-2">
              {positiveTags.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTagToggle(tag)}
                  className={`text-xs ${
                    selectedTags.includes(tag)
                      ? "bg-green-500 hover:bg-green-600"
                      : "border-green-500 text-green-500 hover:bg-green-500/10"
                  }`}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-2">Areas for improvement:</p>
            <div className="flex flex-wrap gap-2">
              {negativeTags.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTagToggle(tag)}
                  className={`text-xs ${
                    selectedTags.includes(tag)
                      ? "bg-red-500 hover:bg-red-600"
                      : "border-red-500 text-red-500 hover:bg-red-500/10"
                  }`}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Written Review */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Written Review (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Share more details about your experience..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white min-h-[100px] resize-none"
            maxLength={500}
          />
          <p className="text-xs text-gray-400 mt-2">{review.length}/500 characters</p>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="sticky bottom-4">
        <Button
          onClick={handleSubmit}
          disabled={!isComplete}
          className={`w-full py-4 text-lg font-semibold ${
            isComplete
              ? "bg-gradient-to-r from-[#457B9D] to-[#5a9bd4] hover:from-[#5a9bd4] hover:to-[#457B9D]"
              : "bg-gray-600 cursor-not-allowed"
          }`}
        >
          {isComplete ? "Submit Rating" : "Please complete required fields"}
        </Button>
      </div>
    </div>
  )
}
