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
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { API_BASE_URL } from "../lib/api";

export default function ShareFile({ fileId, userId, onClose }) {
  const [duration, setDuration] = useState("");
  const [shareLink, setShareLink] = useState("");

  const handleSubmit = () => {
    fetch(
      `${API_BASE_URL}/user/${userId}/folders/Files/share/${fileId}?duration=${duration}`,
      {
        method: "POST",
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to generate share link");
        return res.json();
      })
      .then((data) => {
        setShareLink(data.shareLink);
      })
      .catch((error) => console.error(error));
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
            Enter the duration the share link should remain active (e.g. "1d"
            for one day, "10d" for ten days).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Duration (e.g. 1d)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="border rounded p-2"
          />
          <Button onClick={handleSubmit}>Generate Link</Button>
          {shareLink && (
            <div className="pt-2">
              <p>Share this link:</p>
              <a
                href={shareLink}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline"
              >
                {shareLink}
              </a>
            </div>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
