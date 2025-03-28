import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel
} from "@/components/ui/alert-dialog";
import { API_BASE_URL } from "../lib/api";

export default function ShareFile({ fileId, userId }) {
  const [duration, setDuration] = useState("1d");
  const [shareLink, setShareLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleGenerateLink = () => {
    setLoading(true);
    setError("");
    
    fetch(`${API_BASE_URL}/user/${userId}/folders/Files/share/${fileId}?duration=${duration}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to generate share link");
        }
        return response.json();
      })
      .then(data => {
        setShareLink(data.shareLink);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink)
      .then(() => {
        alert("Link copied to clipboard!");
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
      });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="cursor-pointer">
          Share
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Share File</AlertDialogTitle>
          <AlertDialogDescription>
            Generate a link to share this file. Specify how long the link should be valid.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="flex flex-col gap-4 my-4">
          <div className="flex gap-2 items-center">
            <label htmlFor="duration" className="w-24">Link Duration:</label>
            <input
              id="duration"
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 1d, 7d, 30d"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <Button onClick={handleGenerateLink} disabled={loading}>
              {loading ? "Generating..." : "Generate"}
            </Button>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          
          {shareLink && (
            <div className="mt-4 p-4 border rounded-md bg-muted">
              <p className="font-semibold mb-2">Share this link:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <Button onClick={copyToClipboard}>Copy</Button>
              </div>
            </div>
          )}
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}