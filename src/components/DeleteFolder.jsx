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
import { API_BASE_URL } from "@/lib/api";
import { useState } from "react";

export default function DeleteFolder({
  activeFolder,
  onClose,
  userId,
  setFolderHiearchy,
  setActiveFolder,
}) {
  const [loading, setLoading] = useState(false);
  const handleDelete = () => {
    setLoading(true);
    fetch(
      `${API_BASE_URL}/user/${userId}/Folders/deleteFolder/${activeFolder}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
      .then((res) => {
        setLoading(false);
        if (!res.ok)
          throw new Error("Error Occured while deleting the selected folder");
        return res.json();
      })
      .then((data) => {
        setLoading(false);
        setFolderHiearchy((prevState) => {
          const newState = { ...prevState };
          const parentId = newState.byFolderId[activeFolder].parentId;
          newState.byFolderId = {
            ...newState.byFolderId,
            [parentId]: {
              ...newState.byFolderId[parentId],
              isExpanded: false,
              childIds: newState.byFolderId[parentId].childIds.filter(
                (id) => id !== activeFolder
              ),
            },
          };
          const updatedFolders = { ...newState.byFolderId };
          delete updatedFolders[activeFolder];
          newState.byFolderId = updatedFolders;
          setActiveFolder(parentId);
          return newState;
        });
        console.log(data);
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
          <p className="text-lg font-medium">Deleting folder...</p>
        </div>
      </div>
    );
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete your Folder
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
