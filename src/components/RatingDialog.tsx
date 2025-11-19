import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface RatingDialogProps {
  freelancerId: string;
  currentUserId: string | null;
  existingRating?: number;
  existingComment?: string;
  existingRatingId?: string;
  onRatingSubmitted: () => void;
  trigger?: React.ReactNode;
}

export function RatingDialog({
  freelancerId,
  currentUserId,
  existingRating = 0,
  existingComment = "",
  existingRatingId,
  onRatingSubmitted,
  trigger,
}: RatingDialogProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(existingRating);
  const [comment, setComment] = useState(existingComment);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!currentUserId || rating === 0) {
      toast({
        title: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const ratingData = {
        freelancer_id: freelancerId,
        client_id: currentUserId,
        rating: rating,
        comment: comment.trim() || null,
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

      setOpen(false);
      onRatingSubmitted();
    } catch (error: any) {
      toast({
        title: "Failed to submit rating",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (currentRating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-8 w-8 cursor-pointer transition-all hover:scale-110 ${
              star <= currentRating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-muted text-muted hover:fill-yellow-200 hover:text-yellow-200"
            }`}
            onClick={() => setRating(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="lg">
            <Star className="h-4 w-4 mr-2" />
            {existingRatingId ? "Update Rating" : "Rate Freelancer"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {existingRatingId ? "Update Your Rating" : "Rate This Freelancer"}
          </DialogTitle>
          <DialogDescription>
            Share your experience working with this freelancer
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Rating</label>
            <div className="flex items-center gap-3">
              {renderStars(rating)}
              {rating > 0 && (
                <span className="text-sm text-muted-foreground">
                  {rating} {rating === 1 ? 'star' : 'stars'}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Comment <span className="text-muted-foreground">(Optional)</span>
            </label>
            <Textarea
              placeholder="Share your experience working with this freelancer..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/1000
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? "Submitting..." : existingRatingId ? "Update Rating" : "Submit Rating"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
