import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  client_id: string;
  profiles: {
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
    // Load all ratings with client profile info
    const { data: ratingsData } = await supabase
      .from("ratings")
      .select(`
        *,
        client:profiles!ratings_client_id_fkey (
          full_name,
          profile_image
        )
      `)
      .eq("freelancer_id", freelancerId)
      .order("created_at", { ascending: false });

    if (ratingsData) {
      const formattedRatings = ratingsData.map((r: any) => ({
        ...r,
        profiles: r.client
      }));
      
      setRatings(formattedRatings as any);
      
      // Calculate average
      if (ratingsData.length > 0) {
        const avg = ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length;
        setAverageRating(avg);
      }

      // Check if current user has already rated
      if (currentUserId) {
        const userRatingData = ratingsData.find((r) => r.client_id === currentUserId);
        if (userRatingData) {
          setUserRating(userRatingData.rating);
          setUserComment(userRatingData.comment || "");
          setExistingRatingId(userRatingData.id);
        }
      }
    }
  };

  const handleSubmitRating = async () => {
    if (!currentUserId || userRating === 0) return;

    setIsSubmitting(true);
    try {
      const ratingData = {
        freelancer_id: freelancerId,
        client_id: currentUserId,
        rating: userRating,
        comment: userComment.trim() || null,
      };

      if (existingRatingId) {
        // Update existing rating
        const { error } = await supabase
          .from("ratings")
          .update(ratingData)
          .eq("id", existingRatingId);

        if (error) throw error;
        toast({ title: "Rating updated successfully!" });
      } else {
        // Insert new rating
        const { error } = await supabase
          .from("ratings")
          .insert([ratingData]);

        if (error) throw error;
        toast({ title: "Rating submitted successfully!" });
      }

      await loadRatings();
    } catch (error: any) {
      toast({
        title: "Error submitting rating",
        description: error.message,
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
            className={`h-5 w-5 ${
              star <= rating
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
          <h3 className="text-lg font-semibold">Reviews</h3>
          {ratings.map((rating) => (
            <Card key={rating.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={rating.profiles?.profile_image || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {rating.profiles?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{rating.profiles?.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(rating.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                      {renderStars(rating.rating)}
                    </div>
                    {rating.comment && (
                      <p className="text-sm text-muted-foreground">{rating.comment}</p>
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
