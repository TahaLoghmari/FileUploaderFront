import React, { useContext, useState, useEffect, useCallback } from "react";
import { States } from "../App";
import {
  ChevronRight,
  FilePlus,
  FolderPlus,
  Share2,
  Trash2,
} from "lucide-react";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import AddFolder from "./AddFolder";
import AddFile from "./AddFile";
import { API_BASE_URL } from "../lib/api";
import ShareFolder from "./ShareFolder";
import DeleteFolder from "./DeleteFolder";

export default function RootFolder() {
  const { rootFolder, Auth } = useContext(States);
  const [FolderDialogOpen, setFolderDialogOpen] = useState(false);
  const [FileDialogOpen, setFileDialogOpen] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [activeFolder, setActiveFolder] = useState(rootFolder.id);
  const token = localStorage.getItem("token");
  const [folderHiearchy, setFolderHiearchy] = useState({
    [rootFolder.id]: {
      name: rootFolder.name,
      parentId: null,
      childIds: [],
      isExpanded: false,
      childrenLoaded: false,
      Path: `${rootFolder.name}`,
    },
  });
  const handleArrowState = (folderId) => {
    setFolderHiearchy((prevState) => {
      const newState = { ...prevState };
      newState[folderId] = {
        ...newState[folderId],
        isExpanded: !newState[folderId].isExpanded,
      };
      return newState;
    });
  };
  const LoadChildren = useCallback(
    (folderId) => {
      if (!folderId || !Auth?.userId) return;
      if (folderHiearchy[folderId]?.childrenLoaded) return;
      console.log(folderId);
      setLoadingFolders(true);
      fetch(`${API_BASE_URL}/user/${Auth.userId}/Folders/${folderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok)
            throw new Error("Error occurred while getting subfolders");
          return res.json();
        })
        .then((data) => {
          setLoadingFolders(false);
          setFolderHiearchy((prevState) => {
            const newState = { ...prevState };
            newState[folderId].childIds = data.childFolders.map(
              (child) => child.id
            );
            newState[folderId].childrenLoaded = true;
            data.childFolders.forEach((child) => {
              newState[child.id] = {
                name: child.name,
                parentId: folderId,
                childIds: [],
                isExpanded: false,
                childrenLoaded: false,
                Path: newState[folderId].Path + " > " + child.name,
              };
            });
            return newState;
          });
        })
        .catch((error) => console.error(error));
    },
    [Auth?.userId, token, folderHiearchy]
  );
  const showChildren = (folderId) => {
    if (!folderHiearchy[folderId] || !folderHiearchy[folderId].childIds) {
      return null;
    }

    return (
      <>
        {folderHiearchy[folderId].childIds.map((childId) => (
          <div key={childId} className="flex-col border-l ml-4 pr-0 w-auto">
            {" "}
            <div
              className={`flex text-xs gap-2 mt-2 items-center p-1 cursor-pointer transition-all duration-100 truncate ${
                activeFolder == childId
                  ? `border-l-4 bg-secondary border-l-[#52b2f9]`
                  : ""
              }`}
              onClick={() => setActiveFolder(childId)}
            >
              <div
                className={`transform transition-transform duration-300 min-w-4 ${
                  folderHiearchy[childId]?.isExpanded ? "rotate-90" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleArrowState(childId);
                  if (!folderHiearchy[childId]?.childrenLoaded) {
                    LoadChildren(childId);
                  }
                }}
              >
                <ChevronRight className="h-3 w-3" />
              </div>
              <p className="hover:text-[#52b2f9] truncate text-ellipsis overflow-hidden">
                {folderHiearchy[childId]?.name}
              </p>
            </div>
            {folderHiearchy[childId]?.isExpanded &&
              folderHiearchy[childId]?.childrenLoaded &&
              showChildren(childId)}
          </div>
        ))}
      </>
    );
  };

  useEffect(() => {
    if (rootFolder?.id && Auth?.userId) {
      LoadChildren(rootFolder.id);
    }
  }, [rootFolder?.id, Auth?.userId, LoadChildren]);
  if (loadingFolders) {
    return (
      <div className="flex w-full h-full flex-col">
        <div className="w-[15%] border-r h-full p-6 flex flex-col gap-2">
          <AlertDialog
            open={FolderDialogOpen}
            onOpenChange={setFolderDialogOpen}
          ></AlertDialog>
          <AlertDialog
            open={FileDialogOpen}
            onOpenChange={setFileDialogOpen}
          ></AlertDialog>
          <div className="flex items-center justify-center mt-4">
            <p>Loading folders...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex w-full h-full ">
      <div className="w-[15%] border-r h-full p-6 flex flex-col gap-2">
        <AlertDialog open={FolderDialogOpen} onOpenChange={setFolderDialogOpen}>
          <AlertDialogTrigger asChild className="text-xs">
            <button className="flex gap-3 text-sm items-center p-2 border rounded-sm bg-secondary hover:bg-[#1f3c56] cursor-pointer hover:border-[#2d6090] hover:text-[#52b2f9] w-full">
              <FolderPlus className="h-4 w-4" />
              <p>New Folder</p>
            </button>
          </AlertDialogTrigger>
          <AddFolder
            onClose={() => setFolderDialogOpen(false)}
            id={activeFolder}
            setFolderHiearchy={setFolderHiearchy}
          />
        </AlertDialog>
        <AlertDialog open={FileDialogOpen} onOpenChange={setFileDialogOpen}>
          <AlertDialogTrigger asChild className="text-xs">
            <button className="flex gap-3 text-sm items-center p-2 border rounded-sm bg-secondary hover:bg-[#1f3c56] cursor-pointer hover:border-[#2d6090] hover:text-[#52b2f9] w-full">
              <FolderPlus className="h-4 w-4" />
              <p>New File</p>
            </button>
          </AlertDialogTrigger>
          <AddFile onClose={() => setFileDialogOpen(false)} />
        </AlertDialog>
        {activeFolder != rootFolder.id ? (
          <AlertDialog
            open={FolderDialogOpen}
            onOpenChange={setFolderDialogOpen}
          >
            <AlertDialogTrigger asChild className="text-xs">
              <button className="flex gap-3 text-sm items-center p-2 border rounded-sm bg-secondary hover:bg-[#1f3c56] cursor-pointer hover:border-[#2d6090] hover:text-[#52b2f9] w-full">
                <Share2 className="h-4 w-4" />
                <p>Share Folder</p>
              </button>
            </AlertDialogTrigger>
            <ShareFolder onClose={() => setFolderDialogOpen(false)} />
          </AlertDialog>
        ) : (
          ""
        )}
        {activeFolder != rootFolder.id ? (
          <AlertDialog
            open={FolderDialogOpen}
            onOpenChange={setFolderDialogOpen}
          >
            <AlertDialogTrigger asChild className="text-xs">
              <button className="flex gap-3 text-sm items-center p-2 border rounded-sm bg-secondary hover:bg-[#1f3c56] cursor-pointer hover:border-[#2d6090] hover:text-[#52b2f9] w-full">
                <Trash2 className="h-4 w-4" />
                <p>Delete Folder</p>
              </button>
            </AlertDialogTrigger>
            <DeleteFolder onClose={() => setFolderDialogOpen(false)} />
          </AlertDialog>
        ) : (
          ""
        )}
        <div className="flex-col w-full max-w-full ">
          <div
            className={`flex text-xs gap-3 mt-4 items-center  p-2  cursor-pointer transition-all duration-100 w-full max-w-full ${
              activeFolder == rootFolder.id
                ? ` border-l-5 bg-secondary border-l-[#52b2f9]`
                : ""
            }`}
          >
            <div
              className={`transform transition-transform duration-300 max-w-full ${
                folderHiearchy[rootFolder.id].isExpanded ? "rotate-90" : ""
              }`}
              onClick={() => handleArrowState(rootFolder.id)}
            >
              <ChevronRight className="h-4 w-4" />
            </div>
            <p
              className="hover:text-[#52b2f9] "
              onClick={() => setActiveFolder(rootFolder.id)}
            >
              {rootFolder.name}
            </p>
          </div>
          {folderHiearchy[rootFolder.id].isExpanded
            ? showChildren(rootFolder.id)
            : ""}
        </div>
      </div>
      <div className="p-6">
        <p className="text-sm text-[#52b2f9]">
          {folderHiearchy[activeFolder].Path.split(" > ").map(
            (segment, index, array) => (
              <React.Fragment key={index}>
                <span className="text-[#52b2f9]">{segment}</span>
                {index < array.length - 1 && (
                  <span className="text-primary"> &gt; </span>
                )}
              </React.Fragment>
            )
          )}
        </p>
      </div>
    </div>
  );
}
