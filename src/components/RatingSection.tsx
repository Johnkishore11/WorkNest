import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Star } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface RatingSectionProps {
  freelancerId: string;
  currentUserId: string | null;
  userRole: string | null;
}

interface Rating {
  _id: string; // MongoDB _id
  rating: number;
  comment: string | null;
  createdAt: string; // MongoDB createdAt
  client: {
    _id: string;
    full_name: string;
    profile_image: string | null;
  };
}

export const RatingSection = ({ freelancerId, currentUserId, userRole }: RatingSectionProps) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState<number>(0);
  const [userComment, setUserComment] = useState("");
  const [existingRatingId, setExistingRatingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRatings();
  }, [freelancerId, currentUserId]);

  const loadRatings = async () => {
    try {
      // Load all ratings with client profile info
      const { data: ratingsData } = await api.get(`/ratings/${freelancerId}`);

      if (ratingsData) {
        setRatings(ratingsData);

        // Calculate average
        if (ratingsData.length > 0) {
          const avg = ratingsData.reduce((sum: number, r: Rating) => sum + r.rating, 0) / ratingsData.length;
          setAverageRating(avg);
        }

        // Check if current user has already rated
        if (currentUserId) {
          const userRatingData = ratingsData.find((r: Rating) => r.client._id === currentUserId);
          if (userRatingData) {
            setUserRating(userRatingData.rating);
            setUserComment(userRatingData.comment || "");
            setExistingRatingId(userRatingData._id);
          }
        }
      }
    } catch (error) {
      console.error("Error loading ratings:", error);
    }
  };

  const handleSubmitRating = async () => {
    if (!currentUserId || userRating === 0) return;

    setIsSubmitting(true);
    try {
      const ratingData = {
        freelancer_id: freelancerId,
        rating: userRating,
        comment: userComment.trim() || null,
      };

      // api.post('/ratings') handles both create and update logic based on existing rating check in backend
      await api.post('/ratings', ratingData);

      toast({ title: "Rating submitted successfully!" });
      await loadRatings();
    } catch (error: any) {
      toast({
        title: "Error submitting rating",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false, onStarClick?: (star: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-muted text-muted"
              } ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
            onClick={() => interactive && onStarClick?.(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Average Rating Display */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Ratings & Reviews</CardTitle>
          <CardDescription>
            {ratings.length > 0 ? (
              <div className="flex items-center gap-3 mt-2">
                <div className="text-3xl font-bold text-foreground">{averageRating.toFixed(1)}</div>
                {renderStars(Math.round(averageRating))}
                <span className="text-sm text-muted-foreground">({ratings.length} {ratings.length === 1 ? 'review' : 'reviews'})</span>
              </div>
            ) : (
              <span>No ratings yet</span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Rating Form (only for clients) */}
      {userRole === "client" && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle>{existingRatingId ? "Update Your Rating" : "Rate This Freelancer"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Rating</label>
              {renderStars(userRating, true, setUserRating)}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Comment (Optional)</label>
              <Textarea
                placeholder="Share your experience working with this freelancer..."
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                rows={3}
              />
            </div>
            <Button
              onClick={handleSubmitRating}
              disabled={isSubmitting || userRating === 0}
              className="w-full"
            >
              {isSubmitting ? "Submitting..." : existingRatingId ? "Update Rating" : "Submit Rating"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* List of Ratings */}
      {ratings.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Client Reviews</h3>
          {ratings.map((rating) => (
            <Card key={rating._id} className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={rating.client?.profile_image || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {rating.client?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-base">{rating.client?.full_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(rating.rating)}
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(rating.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                    {rating.comment && (
                      <p className="text-sm leading-relaxed text-foreground bg-muted/50 p-3 rounded-md">
                        {rating.comment}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
