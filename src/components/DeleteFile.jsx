import { API_BASE_URL } from "@/lib/api";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DeleteFile({
  onClose,
  fileId,
  setFolderHiearchy,
  userId,
}) {
  const [loading, setLoading] = useState(false);
  const handleDelete = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/user/${userId}/folders/Files/deleteFile/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        setLoading(false);
        if (!res.ok) throw new Error("Error Occured While Deleting File");
        return res.json();
      })
      .then((data) => {
        setLoading(false);
        console.log(data);
        setFolderHiearchy((prevState) => {
          const parentId = prevState.byFileId[fileId].parentId;
          const newState = { ...prevState };
          newState.byFolderId = {
            ...newState.byFolderId,
            [parentId]: {
              ...newState.byFolderId[parentId],
              isExpanded: false,
              childrenLoaded: false,
              fileChildIds: newState.byFolderId[parentId].fileChildIds.filter(
                (id) => id !== fileId
              ),
            },
          };
          const updatedFiles = { ...newState.byFileId };
          delete updatedFiles[fileId];
          newState.byFileId = updatedFiles;
          return newState;
        });
        onClose();
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
      });
  };
  if (loading)
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-card p-6 rounded-lg shadow-lg text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full inline-block mb-4"></div>
          <p className="text-lg font-medium">Deleting File...</p>
        </div>
      </div>
    );
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete your File
          and remove its data from our servers.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
