import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2, MessageSquare } from "lucide-react";

export default function Comments({ snippetId }) {
  const { token, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [snippetId]);

  const fetchComments = async () => {
    try {
      const res = await api.getComments(snippetId);
      if (res.success) {
        setComments(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch comments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.addComment(token, snippetId, newComment);
      if (res.success) {
        setComments([...comments, res.data]);
        setNewComment("");
      }
    } catch (err) {
      console.error("Failed to add comment", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      const res = await api.deleteComment(token, snippetId, commentId);
      if (res.success) {
        setComments(comments.filter(c => c.id !== commentId));
      }
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  if (loading) {
    return <div className="py-4 text-center text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin inline mr-2"/>Loading comments...</div>;
  }

  return (
    <div className="space-y-6 mt-8 border-t border-border pt-8">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Discussions ({comments.length})
      </h3>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No comments yet. Start the discussion!</p>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="bg-card/50 border-border">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {comment.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{comment.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {user && user.username === comment.username && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-400 hover:text-red-500 hover:bg-red-400/10"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {user ? (
        <div className="space-y-3 mt-4">
          <Textarea
            placeholder="Add to the discussion..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="bg-card border-border resize-none h-24"
          />
          <Button 
            onClick={handleAddComment} 
            disabled={submitting || !newComment.trim()}
            className="w-full sm:w-auto"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Post Comment
          </Button>
        </div>
      ) : (
        <div className="p-4 bg-muted/30 rounded-md border border-border text-center text-sm text-muted-foreground">
          Please log in to participate in the discussion.
        </div>
      )}
    </div>
  );
}
